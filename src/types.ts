export interface LinkOptions {
  cacheDirectory?: string;
}
export type LinkCallback = (err?: Error, installedAt?: string) => void;

export interface UnLinkOptions {
  cacheDirectory?: string;
}
export type UnlinkCallback = (err?: Error, installedAt?: string) => void;
