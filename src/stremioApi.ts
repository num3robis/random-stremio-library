import { ContentType } from "./filters";

const API_URL = "https://api.strem.io/api";
const LIBRARY_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 15000;

export interface LibraryItem {
  id: string;
  type: ContentType;
  name: string;
  poster?: string;
  watched: boolean;
}

interface RawLibraryItem {
  _id: string;
  type: string;
  name: string;
  poster?: string;
  removed?: boolean;
  temp?: boolean;
  state?: { timesWatched?: number; flaggedWatched?: number };
}

interface StremioResponse<T> {
  result?: T;
  error?: { code: number; message: string };
}

const libraryCache = new Map<string, { items: LibraryItem[]; expires: number }>();

async function call<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_URL}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const json = (await res.json()) as StremioResponse<T>;
  if (json.error) throw new Error(json.error.message);
  if (json.result === undefined) throw new Error(`Réponse Stremio invalide (HTTP ${res.status})`);
  return json.result;
}

export async function login(email: string, password: string): Promise<string> {
  const result = await call<{ authKey: string }>("login", { email, password, facebook: false });
  return result.authKey;
}

export async function getLibrary(authKey: string): Promise<LibraryItem[]> {
  const cached = libraryCache.get(authKey);
  if (cached && cached.expires > Date.now()) return cached.items;

  const raw = await call<RawLibraryItem[] | null>("datastoreGet", {
    authKey,
    collection: "libraryItem",
    all: true,
  });

  const items = (raw ?? []).filter(isActiveMovieOrSeries).map((item) => ({
    id: item._id,
    type: item.type as ContentType,
    name: item.name,
    poster: item.poster,
    watched: item.state?.flaggedWatched === 1 || (item.state?.timesWatched ?? 0) > 0,
  }));

  libraryCache.set(authKey, { items, expires: Date.now() + LIBRARY_TTL_MS });
  return items;
}

function isActiveMovieOrSeries(item: RawLibraryItem): boolean {
  return !item.removed && !item.temp && (item.type === "movie" || item.type === "series");
}
