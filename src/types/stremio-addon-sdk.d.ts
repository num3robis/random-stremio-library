declare module "stremio-addon-sdk" {
  export interface ExtraProperty {
    name: string;
    isRequired?: boolean;
    options?: string[];
    optionsLimit?: number;
  }

  export interface CatalogDefinition {
    type: string;
    id: string;
    name: string;
    extra?: ExtraProperty[];
  }

  export interface ConfigProperty {
    key: string;
    type: "text" | "number" | "password" | "checkbox" | "select";
    title?: string;
    default?: string;
    options?: string[];
    required?: boolean;
  }

  export interface Manifest {
    id: string;
    version: string;
    name: string;
    description: string;
    resources: string[];
    types: string[];
    idPrefixes?: string[];
    catalogs: CatalogDefinition[];
    config?: ConfigProperty[];
    behaviorHints?: { configurable?: boolean; configurationRequired?: boolean };
  }

  export interface MetaPreview {
    id: string;
    type: string;
    name: string;
    poster?: string;
    posterShape?: "square" | "regular" | "landscape";
    releaseInfo?: string;
  }

  export type UserData = Record<string, unknown> | false;

  export interface CatalogRequest {
    type: string;
    id: string;
    extra: Record<string, string>;
    config: UserData;
  }

  export interface CatalogResponse {
    metas: MetaPreview[];
    cacheMaxAge?: number;
  }

  export interface AddonInterface {
    manifest: Manifest;
    get(args: { resource: string; type: string; id: string; extra: Record<string, string>; config: UserData }): Promise<unknown>;
  }

  export class addonBuilder {
    constructor(manifest: Manifest);
    defineCatalogHandler(handler: (args: CatalogRequest) => Promise<CatalogResponse>): void;
    getInterface(): AddonInterface;
  }

  export function getRouter(addonInterface: AddonInterface): import("express").RequestHandler;
}
