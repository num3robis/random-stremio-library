import { addonBuilder, AddonInterface, CatalogRequest, CatalogResponse, MetaPreview } from "stremio-addon-sdk";
import { getDetails } from "./cinemeta";
import { COUNT_OPTIONS, parseUserConfig } from "./config";
import { ContentType, DEFAULT_WATCHED, Filters, hasFilters, ItemDetails, matchesFilters, matchesWatched } from "./filters";
import { manifest } from "./manifest";
import { getLibrary, LibraryItem } from "./stremioApi";

const CATALOG_TYPES: Record<string, ContentType> = {
  random_movie: "movie",
  random_series: "series",
};

const MAX_LOOKUPS = 80;
const LOOKUP_CONCURRENCY = 8;
const LOOKUP_BUDGET_MS = 5000;

interface Selection {
  item: LibraryItem;
  details: ItemDetails;
}

export function createAddonInterface(): AddonInterface {
  const builder = new addonBuilder(manifest);
  builder.defineCatalogHandler(handleCatalog);
  return builder.getInterface();
}

async function handleCatalog({ type, id, extra, config }: CatalogRequest): Promise<CatalogResponse> {
  const userConfig = parseUserConfig(config);
  const catalogType = CATALOG_TYPES[id];
  if (!userConfig || !catalogType || catalogType !== type) return { metas: [] };
  if (extra.skip && Number(extra.skip) > 0) return { metas: [] };

  try {
    const library = await getLibrary(userConfig.authKey);
    const candidates = library.filter(
      (item) => item.type === catalogType && matchesWatched(extra.watched ?? DEFAULT_WATCHED, item.watched),
    );
    const filters: Filters = { duration: extra.duration, period: extra.period, genre: extra.genre, seasons: extra.seasons };
    const requested = Number(extra.count);
    const count = COUNT_OPTIONS.includes(requested) ? requested : userConfig.count;
    const selections = await pickRandom(candidates, catalogType, filters, count);
    return { metas: selections.map(toMeta), cacheMaxAge: 0 };
  } catch (error) {
    console.error("Catalogue indisponible:", error);
    return { metas: [] };
  }
}

async function pickRandom(
  candidates: LibraryItem[],
  type: ContentType,
  filters: Filters,
  count: number,
): Promise<Selection[]> {
  const shuffled = shuffle(candidates);
  if (!hasFilters(filters)) {
    return shuffled.slice(0, count).map((item) => ({ item, details: {} }));
  }

  const deadline = Date.now() + LOOKUP_BUDGET_MS;
  const limit = Math.min(shuffled.length, MAX_LOOKUPS);
  const selections: Selection[] = [];
  let next = 0;

  const worker = async (): Promise<void> => {
    while (selections.length < count && next < limit && Date.now() < deadline) {
      const item = shuffled[next++];
      const details = await getDetails(type, item.id);
      if (selections.length < count && matchesFilters(type, filters, details)) {
        selections.push({ item, details });
      }
    }
  };

  await Promise.all(Array.from({ length: LOOKUP_CONCURRENCY }, worker));
  console.log(`Filtres ${type}: ${next} verifies, ${selections.length} retenus`);
  return selections;
}

function shuffle<T>(values: T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function toMeta({ item, details }: Selection): MetaPreview {
  return {
    id: item.id,
    type: item.type,
    name: item.name,
    poster: item.poster,
    releaseInfo: details.year !== undefined ? String(details.year) : undefined,
  };
}
