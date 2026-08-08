# Shared · Photo pipeline — `scripts/photos.mjs` → `data/trips.generated.ts`

**Purpose.** Turn hand-picked travel originals into the AVIF variants the gallery ships, and into a manifest nobody maintains by hand. One command: `npm run photos`. Feeds [06-gallery.md](06-gallery.md) and [lightbox.md](lightbox.md).

## Storage decision — the repo, not object storage

Target scale: **15–20 trips × 6–30 photos ≈ 350 realistic, 600 worst case.**

Measured on the first real trip (`korea-2025`: 46 photos, 136 variants, 8.4 MB): **~187 KB per photo** across its AVIF variants. That extrapolates to ~65 MB for 350 photos and ~112 MB at 600, across 1050–1800 files. (The original estimate was 345 KB/photo — AVIF at quality 55 does better on real photographs than the guess allowed for.)

Cloudflare Pages allows **20 000 files per deployment** and 25 MiB per file; GitHub starts warning around 1 GB. Both are far away — headroom to roughly 6 500 photos. So: **no R2, no image CDN, no Git LFS.** They would all be pure moving parts at this scale. Revisit only if the repo crosses ~1 GB or full-resolution originals ever need to be public.

The one way this breaks is committing originals: 600 × ~6 MB = 3.6 GB, and git keeps every version forever. Hence ⚠ F3.

## Layout

```
photos/<trip-slug>/<anything>.jpg          gitignored, staging only, NOT a backup
public/images/gallery/<trip-slug>/<id>-<width>.avif   committed, shipped
src/app/data/trips.generated.ts            committed, generated, never hand-edited
```

`<trip-slug>` is the folder name and is load-bearing three times over: manifest key, image path segment, and the future `/gallery/<slug>` route. The script refuses folders that aren't already slugs rather than silently normalising them.

## `npm run photos`

Per source file: read metadata → derive display dimensions from EXIF orientation → encode each target width ≤ the source width → sample the average colour → read the capture date. Trips are sorted by that date. Output is `<id>-<width>.avif` at quality 55, `effort: 4`.

- `id` = slugified original basename (`DSC_4821.jpg` → `dsc-4821`). **Permanent** — the lightbox deeplinks key on it, so no renumbering, ever. Renaming a source file orphans its derivatives instead of moving them.
- **Never upscales.** A source narrower than a target width simply doesn't get that variant, which is why `widths[]` exists in the manifest and why nothing may assume all three are present. A source under 400px gets exactly one variant at its own width.
- **Incremental.** A variant is re-encoded only when the output is missing or older than the source; AVIF at this volume is minutes, not seconds, and a full rebuild of 1800 variants is not something to trigger by accident. `--force` overrides.
- **Orphans** (derivatives whose original is gone, or whole output folders whose source folder is gone) are reported by default and deleted with `--prune`. Pruning is hard-guarded to paths under `public/images/gallery/` — `public/images/` also holds `hero-cutout.png` and the footer portrait.
- Exit code 1 whenever anything was skipped or reported, so it can gate a commit hook later.

Verified on fixtures (sharp 0.33.5 / libvips 8.15.3): a stored 2400×1600 with EXIF orientation 6 comes out 900×1350 portrait; every output has `exif: false` and a retained ICC profile; a 300×200 source yields one 300px variant; a second run encodes nothing; the emitted manifest typechecks against `types.ts` under `--strict`.

## Data contract

Generated per photo — see `GalleryPhoto` in `data/types.ts`:

```ts
{ id, width, height, widths[], tone, takenAt }
```

`width`/`height` are the **largest generated variant**, which is what reserves the aspect box (⚠ D6) and satisfies NgOptimizedImage. `tone` is the photo's average colour, the flat placeholder behind the lazy load — it replaces the hand-picked `TripShot.tone` placeholders. `takenAt` is EXIF `DateTimeOriginal` with file mtime as fallback.

Everything a human decides stays in `trips.ts`, which the script never touches: `slug`, display `name` (the *place*, not the country — the caption fallback reads `${name}, ${country}`), `country`, `year`, plus optional `cover` (photo id) and a sparse `captions` map keyed by photo id. Four required fields per trip is the entire maintenance cost; captions are opt-in per photo, because 46 hand-written strings per trip is how a gallery stops getting updated.

`data/gallery.ts` is the seam and the only place allowed to touch `galleryPhotos`. It exports `galleryTrips` (joined, newest first), `captionFor()` and `photoSrc()`. Components import from there — otherwise the cover fallback, the caption fallback and the meta string get copy-pasted into every view that renders a trip.

Captions double as `alt` (already true in [06-gallery.md](06-gallery.md)), which is why `captionFor()` never returns an empty string: the tile is a `<button>` taking its accessible name from the image alt, so an uncaptioned photo would leave it unnamed (⚠ E1).

`TripShot` is gone. Its `aspect`/`ratio` are derived from `width`/`height`, and the old hand-written `Trip.meta` (`'Switzerland · 2025 · 6 photos'`) is now computed — both were second sources of truth that went stale the first time a photo was added.

`npm run photos` cross-checks the two halves and reports a trip that has photos but no `trips.ts` entry, or an entry whose folder is missing. These print as notes and deliberately do **not** set a failing exit code: encoding first and writing the entry second is the normal order of work.

## Frontend consumption

URL template: `/images/gallery/{tripSlug}/{id}-{width}.avif`.

AVIF-only is deliberate. The browserslist (last 2 Chrome/Firefox/Safari/Edge) covers it everywhere, and a single format is what makes `ngSrc` usable at all — NgOptimizedImage emits one `<img>` with a `srcset`, it cannot emit `<picture>`. Adding a WebP fallback means hand-rolling `<picture>` and losing the directive.

That requires a custom image loader (⚠ F5). There is **no `provideImageLoader` function** — the token is provided directly: `{ provide: IMAGE_LOADER, useValue: ({ src, width }: ImageLoaderConfig) => … }` in `app.config.ts`, mapping `<tripSlug>/<id>` + width onto the template above. `IMAGE_LOADER` is a value export from `@angular/common`; `ImageLoaderConfig` comes from the separate `export type { … }` line in its `.d.ts`.

`[ngSrcset]` is bound from `photo.widths`. The available widths reach the loader through the `widthsBySrc` lookup in `gallery.ts`, **not** through `loaderParams` — that input sits in NgOptimizedImage's post-init guard, so an object literal in the template (a new identity every change-detection pass) throws on the second render.

`sizes` is `(max-width: 660px) 100vw, (max-width: 1080px) 46vw, min(31vw, 460px)`. The old `320px` came from the masonry `column-width`, but columns *stretch*: measured tile width is 367px at a 1280px viewport and up to ~455px at full content width, so `320px` understated the slot by 40% and picked a 400w file for it on 1× displays (⚠ F1). Angular also prepends `sizes="auto"` for lazy images, which makes the browser use the real rendered width where supported — the list above is the fallback.

## Filtering & scale

Place is a property of the **trip**, not the photo (`Trip.country`). A place filter therefore hides whole trip groups and the grouped masonry layout survives untouched; per-photo places would force a second, flat layout for a distinction not worth its cost at 20 trips.

Filter state is page-local signals — `place`, `order`, and a `visible` computed — matching the lightbox-state decision in [06-gallery.md](06-gallery.md). Mirror it to `?place=…` so a filtered view is shareable, with `replaceUrl: true` so chip clicks don't stack up in the back history.

**The single gallery page does not scale to the full trip count.** At 20 trips it carries 400+ tiles; lazy loading keeps the initial hit small but a full scroll pulls ~28 MB, and the chip row passes readable width somewhere around 8 countries. It stays comfortable to roughly **6–8 trips / ~120 photos**. Past that, split it the way `/work` already splits: `/gallery` becomes one cover card per trip (that's what `Trip.cover` is for) plus the filter, and `/gallery/[slug]` renders one trip's photos — enumerated for prerender from the trip data exactly like the project slugs (⚠ C1). Keying the photo data by trip slug from day one is what keeps that split a layout change instead of a data migration.

## ⚠ LANDMINES

- **F3 — originals never live under `public/`.** Vite copies that folder verbatim into the build output, so originals placed there ship publicly *and* blow the 25 MiB per-file limit; `.gitignore` is a different layer and does not stop it. They belong in `photos/`, outside `public/`, ignored. And `photos/` is a staging area, not a backup — it does not survive a fresh clone, so the masters have to live somewhere else that does.
- **F4 — `.rotate()` before resize, `.keepIccProfile()`, never `.withMetadata()`.** sharp drops all metadata on re-encode, and that one default causes three separate things. (a) The EXIF orientation tag goes with it, so without a no-arg `.rotate()` first every portrait phone shot lands sideways — and the *displayed* dimensions are the transpose of the stored ones for orientations 5–8, which sharp 0.33 won't derive for you (no `autoOrient`). (b) The ICC colour profile goes too, while the pixel values stay put: untagged output is read as sRGB by every browser, so a Display P3 iPhone shot or an AdobeRGB export renders with a visible shift. `.keepIccProfile()` keeps the profile and nothing else — ~500 bytes a file, under 1 MB across the whole library. (c) EXIF stripping is the part that *is* wanted: GPS coordinates and camera serials stay out of the build, which is why `.withMetadata()` (which would keep all of it) must never appear here.
- **F5 — the loader is global, and `ngSrcset` fails quietly without it.** Two halves. (a) An `IMAGE_LOADER` provider replaces the loader for *every* `NgOptimizedImage` in the app, and `getRewrittenSrc()` routes the plain `ngSrc` through it as well, not just the srcset entries — so a gallery-shaped loader rewrites `/images/hero-cutout.png` too unless it passes through anything that isn't a gallery src. (b) With the default noop loader, `ngSrcset` does not error: Angular logs NG02963 as a `console.warn` in dev builds only, and emits *the same URL for every width descriptor*. The srcset looks correct in the DOM while serving one size at all of them. (Automatic srcset generation is skipped entirely under the noop loader, and `placeholder="true"` is the one case that actually throws.) Verified against @angular/common 22.0.5.
- **A partial run must not write a partial manifest.** Skipping one trip and writing anyway replaces `galleryPhotos` with `{}` and takes every *other* trip's photos down with it — this bit during testing. The script now leaves the manifest untouched whenever a trip was skipped and says which one to fix.
- **Id collisions overwrite photos silently.** `DSC_4821.jpg` and `dsc 4821.jpg` both slugify to `dsc-4821`. Checked before any encoding, because the second file would otherwise just win.
- **`track shot.id`, never `$index`** (⚠ B5). Filtering makes Angular reuse tile DOM nodes; index tracking swaps image sources inside nodes whose lazy load is still in flight, so wrong photos flash into place.
- **Orphan pruning is keyed off the source folders, not the manifest.** A trip skipped over a naming warning still has perfectly good derivatives on disk; keying off the manifest would delete them the moment a filename went wrong.
- **HEIC and RAW are not supported inputs** — libvips ships without libheif here. The script warns and skips rather than failing the run; convert to JPEG before dropping files in.
- **sharp installs on every Cloudflare build** as a devDependency the build itself never calls. A few seconds of install time, not worth engineering around.
