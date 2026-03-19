import path from "path";

/**
 * Returns the directory where uploaded images are stored.
 *
 * - Railway (production): /data/images  — lives on the persistent volume so
 *   files survive container rebuilds.
 * - Local dev: <cwd>/public/images — served as static assets by Next.js.
 *
 * Detection: if DATABASE_URL is a file: path inside /data we're on Railway.
 */
export function getImagesDir(): string {
  const dbUrl = process.env.DATABASE_URL ?? "";
  if (dbUrl.startsWith("file:/data/")) {
    return "/data/images";
  }
  return path.join(process.cwd(), "public", "images");
}

/**
 * Returns the public URL for a given image filename.
 * Always uses the API route so both dev and production work identically.
 */
export function getImageUrl(filename: string): string {
  return `/api/images/${encodeURIComponent(filename)}`;
}
