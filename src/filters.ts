export type ContentType = "movie" | "series";

type Predicate = (value: number) => boolean;

const DURATIONS: Record<string, Predicate> = {
  "< 90 min": (m) => m < 90,
  "< 2h": (m) => m < 120,
  "90-120 min": (m) => m >= 90 && m <= 120,
  "> 120 min": (m) => m > 120,
  "> 2h30": (m) => m > 150,
};

const PERIODS: Record<string, Predicate> = {
  "Avant 1980": (y) => y < 1980,
  "1980-1999": (y) => y >= 1980 && y <= 1999,
  "2000-2009": (y) => y >= 2000 && y <= 2009,
  "2010-2019": (y) => y >= 2010 && y <= 2019,
  "2020 et après": (y) => y >= 2020,
};

const SEASONS: Record<string, Predicate> = {
  "1 saison": (s) => s === 1,
  "2 saisons max": (s) => s <= 2,
  "3 saisons max": (s) => s <= 3,
  "5 saisons max": (s) => s <= 5,
  "10 saisons max": (s) => s <= 10,
};

export const DURATION_OPTIONS = Object.keys(DURATIONS);

export const PERIOD_OPTIONS = Object.keys(PERIODS);

export const SEASON_OPTIONS = Object.keys(SEASONS);

const MOVIE_GENRES = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Documentary", "Drama",
  "Family", "Fantasy", "History", "Horror", "Mystery", "Romance", "Sci-Fi", "Sport", "Thriller", "War", "Western",
];

export const GENRE_OPTIONS: Record<ContentType, string[]> = {
  movie: MOVIE_GENRES,
  series: [...MOVIE_GENRES, "Reality-TV", "Talk-Show", "Game-Show"],
};

export const WATCHED_OPTIONS = ["Pas vu", "Vu"];

export const DEFAULT_WATCHED = "Pas vu";

export function matchesWatched(filter: string | undefined, watched: boolean): boolean {
  if (filter === "Vu") return watched;
  return !watched;
}

export interface Filters {
  duration?: string;
  period?: string;
  genre?: string;
  seasons?: string;
}

export interface ItemDetails {
  runtimeMinutes?: number;
  year?: number;
  genres?: string[];
  seasonCount?: number;
}

export function hasFilters(filters: Filters): boolean {
  return Boolean(filters.duration || filters.period || filters.genre || filters.seasons);
}

export function matchesFilters(type: ContentType, filters: Filters, details: ItemDetails): boolean {
  const durationPredicate = type === "movie" && filters.duration ? DURATIONS[filters.duration] : undefined;
  if (durationPredicate && (details.runtimeMinutes === undefined || !durationPredicate(details.runtimeMinutes))) {
    return false;
  }

  const seasonsPredicate = type === "series" && filters.seasons ? SEASONS[filters.seasons] : undefined;
  if (seasonsPredicate && (details.seasonCount === undefined || !seasonsPredicate(details.seasonCount))) {
    return false;
  }

  const periodPredicate = filters.period ? PERIODS[filters.period] : undefined;
  if (periodPredicate && (details.year === undefined || !periodPredicate(details.year))) {
    return false;
  }

  if (filters.genre && !details.genres?.includes(filters.genre)) {
    return false;
  }

  return true;
}
