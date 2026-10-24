export type ContentType = "movie" | "series";

type Predicate = (value: number) => boolean;

const DURATIONS: Record<ContentType, Record<string, Predicate>> = {
  movie: {
    "< 90 min": (m) => m < 90,
    "< 2h": (m) => m < 120,
    "90-120 min": (m) => m >= 90 && m <= 120,
    "> 120 min": (m) => m > 120,
    "> 2h30": (m) => m > 150,
  },
  series: {
    "< 30 min": (m) => m < 30,
    "30-60 min": (m) => m >= 30 && m <= 60,
    "> 60 min": (m) => m > 60,
  },
};

const PERIODS: Record<string, Predicate> = {
  "Avant 1980": (y) => y < 1980,
  "1980-1999": (y) => y >= 1980 && y <= 1999,
  "2000-2009": (y) => y >= 2000 && y <= 2009,
  "2010-2019": (y) => y >= 2010 && y <= 2019,
  "2020 et après": (y) => y >= 2020,
};

export const DURATION_OPTIONS: Record<ContentType, string[]> = {
  movie: Object.keys(DURATIONS.movie),
  series: Object.keys(DURATIONS.series),
};

export const PERIOD_OPTIONS = Object.keys(PERIODS);

export const WATCHED_OPTIONS = ["Vu", "Pas vu"];

export function matchesWatched(filter: string | undefined, watched: boolean): boolean {
  if (filter === "Vu") return watched;
  if (filter === "Pas vu") return !watched;
  return true;
}

export interface Filters {
  duration?: string;
  period?: string;
}

export interface ItemDetails {
  runtimeMinutes?: number;
  year?: number;
}

export function hasFilters(filters: Filters): boolean {
  return Boolean(filters.duration || filters.period);
}

export function matchesFilters(type: ContentType, filters: Filters, details: ItemDetails): boolean {
  const durationPredicate = filters.duration ? DURATIONS[type][filters.duration] : undefined;
  if (durationPredicate && (details.runtimeMinutes === undefined || !durationPredicate(details.runtimeMinutes))) {
    return false;
  }

  const periodPredicate = filters.period ? PERIODS[filters.period] : undefined;
  if (periodPredicate && (details.year === undefined || !periodPredicate(details.year))) {
    return false;
  }

  return true;
}
