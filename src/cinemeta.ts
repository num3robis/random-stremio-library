import { ContentType, ItemDetails } from "./filters";

const CINEMETA_URL = "https://v3-cinemeta.strem.io/meta";
const TTL_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 4000;

interface CinemetaMeta {
  runtime?: string;
  year?: string;
  releaseInfo?: string;
  genres?: string[];
  videos?: { season?: number }[];
}

const cache = new Map<string, { details: ItemDetails; expires: number }>();

export async function getDetails(type: ContentType, id: string): Promise<ItemDetails> {
  const key = `${type}:${id}`;
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.details;

  try {
    const res = await fetch(`${CINEMETA_URL}/${type}/${encodeURIComponent(id)}.json`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (res.status === 404) {
      cache.set(key, { details: {}, expires: Date.now() + TTL_MS });
      return {};
    }
    if (!res.ok) return {};

    const body = (await res.json()) as { meta?: CinemetaMeta };
    const details = parseMeta(body.meta);
    cache.set(key, { details, expires: Date.now() + TTL_MS });
    return details;
  } catch (error) {
    console.warn(`Cinemeta indisponible pour ${id}:`, error);
    return {};
  }
}

function parseMeta(meta: CinemetaMeta | undefined): ItemDetails {
  if (!meta) return {};
  return {
    runtimeMinutes: parseRuntime(meta.runtime),
    year: parseYear(meta.year ?? meta.releaseInfo),
    genres: meta.genres,
    seasonCount: countSeasons(meta.videos),
  };
}

// Season 0 holds specials and is not counted.
function countSeasons(videos: { season?: number }[] | undefined): number | undefined {
  if (!videos) return undefined;
  const seasons = new Set(videos.map((video) => video.season).filter((season) => season !== undefined && season > 0));
  return seasons.size > 0 ? seasons.size : undefined;
}

export function parseRuntime(runtime: string | undefined): number | undefined {
  if (!runtime) return undefined;
  const hours = /(\d+)\s*h/.exec(runtime);
  const minutes = /(\d+)\s*min/.exec(runtime);
  if (!hours && !minutes) return undefined;
  return (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0);
}

// Series ranges such as "2008–2013" resolve to their start year.
function parseYear(value: string | undefined): number | undefined {
  const match = value ? /\d{4}/.exec(value) : null;
  return match ? Number(match[0]) : undefined;
}
