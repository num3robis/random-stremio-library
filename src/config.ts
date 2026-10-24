import type { UserData } from "stremio-addon-sdk";

export interface UserConfig {
  authKey: string;
  count: number;
}

export const COUNT_OPTIONS = [1, 3, 5, 10];
export const DEFAULT_COUNT = 3;

export function parseUserConfig(data: UserData): UserConfig | null {
  if (!data || typeof data.authKey !== "string" || data.authKey === "") return null;
  const count = Number(data.count);
  return { authKey: data.authKey, count: COUNT_OPTIONS.includes(count) ? count : DEFAULT_COUNT };
}

// The SDK expects the config path segment to be URL-encoded JSON.
export function configToPathSegment(config: UserConfig): string {
  return encodeURIComponent(JSON.stringify(config));
}
