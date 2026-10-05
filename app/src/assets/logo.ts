/**
 * ResQGraph AI — Application Logo & Asset Definitions
 * High-resolution vector emblem with ECG location pin, mountains, and rescue waterways.
 */

export const APP_LOGOS = {
  favicon: 'assets/favicon.ico',
  icon16: 'assets/logo-16.png',
  icon32: 'assets/logo-32.png',
  icon48: 'assets/logo-48.png',
  icon64: 'assets/logo-64.png',
  icon96: 'assets/logo-96.png',
  icon128: 'assets/logo-128.png',
  icon192: 'assets/logo-192.png',
  icon256: 'assets/logo-256.png',
  icon512: 'assets/logo-512.png',
  master: 'assets/logo.png',
} as const;

export type AppLogoKey = keyof typeof APP_LOGOS;

export function getLogoByPixelSize(pixelSize: number): string {
  if (pixelSize <= 16) return APP_LOGOS.icon16;
  if (pixelSize <= 32) return APP_LOGOS.icon32;
  if (pixelSize <= 48) return APP_LOGOS.icon48;
  if (pixelSize <= 64) return APP_LOGOS.icon64;
  if (pixelSize <= 96) return APP_LOGOS.icon96;
  if (pixelSize <= 128) return APP_LOGOS.icon128;
  if (pixelSize <= 192) return APP_LOGOS.icon192;
  if (pixelSize <= 256) return APP_LOGOS.icon256;
  return APP_LOGOS.icon512;
}
