// The seam between the two halves of the gallery data: what you maintain by hand
// in `trips.ts` and what `npm run photos` measures into `trips.generated.ts`.
// Components import from HERE — nothing else should touch `galleryPhotos`, or the
// join rules (cover fallback, caption fallback, meta string) end up copy-pasted.
// FRAMEWORK-FREE (see types.ts · landmine C1).

import { trips } from './trips';
import { galleryPhotos } from './trips.generated';
import type { GalleryPhoto, GalleryTrip, Trip } from './types';

/**
 * Tile caption and `alt` text in one. Never returns an empty string: the tile is a
 * `<button>` whose accessible name comes from the image alt, so a captionless photo
 * would leave it unnamed (⚠ E1).
 */
export function captionFor(trip: Trip, photo: GalleryPhoto): string {
  return trip.captions?.[photo.id] ?? `${trip.name}, ${trip.country}`;
}

/** `/images/gallery/korea-2025/alu00463-900.avif` — the loader in app.config.ts builds this. */
export function photoSrc(trip: Trip, photo: GalleryPhoto): string {
  return `${trip.slug}/${photo.id}`;
}

const widthsBySrc = new Map<string, number[]>(
  Object.entries(galleryPhotos).flatMap(([slug, photos]) =>
    photos.map((p) => [`${slug}/${p.id}`, p.widths] as [string, number[]]),
  ),
);

/**
 * Variants available for a `photoSrc()` value. The image loader needs this to pick
 * a fallback for the plain `src`, which Angular requests without a width.
 * Deliberately NOT passed through `loaderParams`: that input sits in
 * NgOptimizedImage's post-init guard, so an object literal in the template throws
 * on the second change-detection pass.
 */
export function widthsFor(src: string): number[] {
  return widthsBySrc.get(src) ?? [];
}

function resolve(trip: Trip): GalleryTrip {
  const photos = galleryPhotos[trip.slug] ?? [];
  return {
    ...trip,
    photos,
    coverPhoto: photos.find((p) => p.id === trip.cover) ?? photos[0],
    meta: `${trip.country} · ${trip.year} · ${photos.length} photo${photos.length === 1 ? '' : 's'}`,
  };
}

/**
 * All trips, newest first. A trip whose photos aren't encoded yet still comes
 * through with an empty list rather than blowing up — `npm run photos` is what
 * tells you about the mismatch.
 */
export const galleryTrips: GalleryTrip[] = trips
  .map(resolve)
  .sort((a, b) => b.year - a.year || b.slug.localeCompare(a.slug));
