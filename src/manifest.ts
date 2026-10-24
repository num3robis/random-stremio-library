import { Manifest } from "stremio-addon-sdk";
import { COUNT_OPTIONS, DEFAULT_COUNT } from "./config";
import { DURATION_OPTIONS, PERIOD_OPTIONS, WATCHED_OPTIONS } from "./filters";

export const manifest: Manifest = {
  id: "com.pierreleclaire.random-library",
  version: "0.1.0",
  name: "Random Library",
  description: "Tire au hasard des films et séries de ta bibliothèque Stremio.",
  resources: ["catalog"],
  types: ["movie", "series"],
  catalogs: [
    {
      type: "movie",
      id: "random_movie",
      name: "Films au hasard",
      extra: [
        { name: "duration", options: DURATION_OPTIONS.movie, isRequired: false },
        { name: "period", options: PERIOD_OPTIONS, isRequired: false },
        { name: "watched", options: WATCHED_OPTIONS, isRequired: false },
        { name: "count", options: COUNT_OPTIONS.map(String), isRequired: false },
      ],
    },
    {
      type: "series",
      id: "random_series",
      name: "Séries au hasard",
      extra: [
        { name: "duration", options: DURATION_OPTIONS.series, isRequired: false },
        { name: "period", options: PERIOD_OPTIONS, isRequired: false },
        { name: "watched", options: WATCHED_OPTIONS, isRequired: false },
        { name: "count", options: COUNT_OPTIONS.map(String), isRequired: false },
      ],
    },
  ],
  config: [
    { key: "authKey", type: "password", title: "authKey Stremio", required: true },
    { key: "count", type: "select", title: "Nombre d'éléments", options: COUNT_OPTIONS.map(String), default: String(DEFAULT_COUNT) },
  ],
  behaviorHints: { configurable: true, configurationRequired: true },
};
