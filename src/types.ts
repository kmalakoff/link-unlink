export interface LinkOptions {
  cacheDirectory?: string;
}
export type LinkCallback = (err?: Error, installedAt?: string) => void;

export interface UnlinkOptions {
  cacheDirectory?: string;
}
export type UnlinkCallback = (err?: Error, installedAt?: string) => void;
