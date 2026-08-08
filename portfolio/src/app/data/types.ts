// Data model for the whole site. FRAMEWORK-FREE ZONE:
// vite.config.ts imports the data files at config-eval time (Node, no Angular)
// to enumerate the prerender routes — never import Angular here.
// See specs/00-checklist.md · landmine C1.

export interface Project {
  slug: string;
  title: string;
  category: string;
  year: string;
  role: string;
  stack: string[];
  /** One-liner shown in the expanded row + project-detail header. */
  description: string;
  /** OKLCH hue driving cover gradient + screenshot tints (see gradient helpers). */
  hue: number;
  /**
   * Optional cover image under public/, e.g. '/images/work/roamnote.jpg'. When
   * set it replaces the hue gradient on the cursor-preview card and the detail
   * cover; without it the gradient stays the fallback — which is why `hue` is
   * required and this is not. Always read it through `coverBackground()`, never
   * branch on it at the call site.
   */
  cover?: string;
  /** Present only if the project has a live site / public repo. */
  liveUrl?: string;
  gitUrl?: string;
  /** Featured projects appear in "Selected work" on Home (4 of 9). */
  featured: boolean;
  /** Case-study paragraphs (3). */
  body: string[];
  /** Screenshot placeholder labels (3) — first one renders full-width 16/9. */
  shots: string[];
}

/**
 * One gallery photo. GENERATED into `trips.generated.ts` by `npm run photos` —
 * every field here comes from the file itself, so none of it is hand-maintained.
 * URL: `/images/gallery/{tripSlug}/{id}-{width}.avif`.
 */
export interface GalleryPhoto {
  /** Slugified original filename. Permanent — lightbox deeplinks key on it, so
   *  never renumber; renaming a source file orphans its derivatives. */
  id: string;
  /** Intrinsic size of the LARGEST generated variant — drives the aspect-ratio
   *  box (⚠ D6, no CLS) and satisfies NgOptimizedImage's width/height. */
  width: number;
  height: number;
  /** Which variants actually exist, ascending — feeds `ngSrcset`. Small sources
   *  get fewer than the full [400, 900, 1800]; never assume all three. */
  widths: number[];
  /** Average colour of the photo — the flat placeholder behind the lazy image. */
  tone: string;
  /** EXIF DateTimeOriginal (mtime fallback), ISO. Sort key within a trip. */
  takenAt: string;
}

/**
 * One trip, HAND-MAINTAINED in `trips.ts`. Holds only what a person decides —
 * everything measurable lives in GalleryPhoto and is generated. Four required
 * fields per trip is the whole maintenance cost; join the two halves through
 * `gallery.ts`, never by reaching into `galleryPhotos` directly.
 */
export interface Trip {
  /** Folder name under `photos/`, key into `galleryPhotos`, future `/gallery/{slug}` route. */
  slug: string;
  /** Display name — the place, not the country: 'Seoul', 'Bernese Oberland'. */
  name: string;
  country: string;
  year: number;
  /** Photo id for the index card. Falls back to the first photo when unset. */
  cover?: string;
  /** Photo id → caption. Sparse on purpose: caption the few that earn one, the
   *  rest fall back to name + country via `captionFor()`. */
  captions?: Record<string, string>;
}

/** A Trip with its generated photos joined in. Built by `gallery.ts`, never written by hand. */
export interface GalleryTrip extends Trip {
  /** Capture-date ascending. Empty until `npm run photos` has encoded this trip. */
  photos: GalleryPhoto[];
  /** Resolved `cover`, falling back to the first photo. Undefined only when `photos` is empty. */
  coverPhoto: GalleryPhoto | undefined;
  /** e.g. 'South Korea · 2025 · 46 photos' — derived, so the count can't go stale. */
  meta: string;
}

export interface SkillGroup {
  name: string;
  items: string[];
}
