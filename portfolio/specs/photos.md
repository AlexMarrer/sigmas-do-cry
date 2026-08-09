# Shared · Image pipeline — `scripts/photos.mjs`

**Purpose.** Turn originals into the AVIF variants the site ships, and into manifests nobody maintains by hand. One command, `npm run photos`, two passes over one encoder. Feeds [06-gallery.md](06-gallery.md), [lightbox.md](lightbox.md), [cursor-preview.md](cursor-preview.md) and [04-project-detail.md](04-project-detail.md).

| | source | output | manifest | widths | quality |
|---|---|---|---|---|---|
| Gallery | `photos/<trip>/` | `public/images/gallery/<trip>/` | `trips.generated.ts` | 400 / 900 / 1800 | 55 |
| Projects | `project-images/<slug>/` | `public/images/project/<slug>/` | `projects.generated.ts` | 700 / 1400 | 78 |

The passes share everything mechanical — no upscaling, incremental encode, orphan reporting, ⚠ F4 — and differ only where the content does. Photographs get a `tone` and an EXIF capture date and are sorted by it; project images get neither and stay in filename order, because a screenshot sequence is curated rather than chronological. Quality 78 vs 55 is the same reasoning: small UI text smears where a photograph would not.

The project pass reserves exactly one filename: `cover.*` becomes `ProjectImages.cover`, everything else is a shot. `Project` carries **no image field at all** — the folder name is the only link, so a hand-written path cannot drift from a folder (it already had: `the-rising-sigmas/` against slug `rising-sigmas`). A project with no folder or no cover falls back to its `hue` gradient, which is a supported state.

## Storage decision — the repo, not object storage

Target scale: **15–20 trips × 6–30 photos ≈ 350 realistic, 600 worst case.**

Measured on the first real trip (`korea-2025`: 46 photos, 136 variants, 8.4 MB): **~187 KB per photo** across its AVIF variants. That extrapolates to ~65 MB for 350 photos and ~112 MB at 600, across 1050–1800 files. (The original estimate was 345 KB/photo — AVIF at quality 55 does better on real photographs than the guess allowed for.)

Cloudflare Pages allows **20 000 files per deployment** and 25 MiB per file; GitHub starts warning around 1 GB. Both are far away — headroom to roughly 6 500 photos. So: **no R2, no image CDN, no Git LFS.** They would all be pure moving parts at this scale. Revisit only if the repo crosses ~1 GB or full-resolution originals ever need to be public.

The one way this breaks is committing originals: 600 × ~6 MB = 3.6 GB, and git keeps every version forever. Hence ⚠ F3.

## Layout

```
photos/gallery/<trip-slug>/<anything>.jpg   gitignored, staging only, NOT a backup
photos/work/<project-slug>/cover.png        same
photos/work/<project-slug>/01-<name>.png

public/images/gallery/<trip-slug>/<id>-<width>.avif    committed, shipped
public/images/project/<project-slug>/<id>-<width>.avif committed, shipped

src/app/data/trips.generated.ts            committed, generated, never hand-edited
src/app/data/shots.generated.ts            same
```

`<trip-slug>` is the folder name and is load-bearing three times over: manifest key, image path segment, and the future `/gallery/<slug>` route. The script refuses folders that aren't already slugs rather than silently normalising them. `<project-slug>` carries the same weight against `projects.ts`.

The `gallery/` and `work/` level exists because **every directory under `photos/` used to be a trip**. Dropping `photos/roamnote/` in beside `photos/korea-2025/` would have made it a trip, encoded it into `public/images/gallery/roamnote/`, and left the cross-check complaining about a missing `trips.ts` entry. Moving the existing trips one level down changes no output path and no id, so it orphans nothing — `photos/` is gitignored, it is a local `mv`.

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

`npm run photos` cross-checks both halves and reports a group that has images but no data entry, or an entry whose folder is missing. These print as notes and deliberately do **not** set a failing exit code: encoding first and writing the entry second is the normal order of work.

The check **scrapes the slugs out of the source text** rather than importing the module. Importing worked while the data files had only `import type` (Node strips those), but `projects.ts` now imports its own generated manifest, and Node cannot resolve the extensionless specifier the rest of the codebase uses — the check silently stopped running the moment that import was added. A regex over a flat literal array cannot break that way.

## Frontend consumption

URL template: `/images/gallery/{tripSlug}/{id}-{width}.avif`.

AVIF-only is deliberate. The browserslist (last 2 Chrome/Firefox/Safari/Edge) covers it everywhere, and a single format is what makes `ngSrc` usable at all — NgOptimizedImage emits one `<img>` with a `srcset`, it cannot emit `<picture>`. Adding a WebP fallback means hand-rolling `<picture>` and losing the directive.

That requires a custom image loader (⚠ F5). There is **no `provideImageLoader` function** — the token is provided directly: `{ provide: IMAGE_LOADER, useValue: ({ src, width }: ImageLoaderConfig) => … }` in `app.config.ts`, mapping `<tripSlug>/<id>` + width onto the template above. `IMAGE_LOADER` is a value export from `@angular/common`; `ImageLoaderConfig` comes from the separate `export type { … }` line in its `.d.ts`.

`[ngSrcset]` is bound from `photo.widths`. The available widths reach the loader through the `widthsBySrc` lookup in `gallery.ts`, **not** through `loaderParams` — that input sits in NgOptimizedImage's post-init guard, so an object literal in the template (a new identity every change-detection pass) throws on the second render.

`sizes` is `(max-width: 660px) 100vw, (max-width: 1080px) 46vw, min(31vw, 460px)`. The old `320px` came from the masonry `column-width`, but columns *stretch*: measured tile width is 367px at a 1280px viewport and up to ~455px at full content width, so `320px` understated the slot by 40% and picked a 400w file for it on 1× displays (⚠ F1). Angular also prepends `sizes="auto"` for lazy images, which makes the browser use the real rendered width where supported — the list above is the fallback.

## Filtering & scale

Place is a property of the **trip**, not the photo (`Trip.country`). A place filter therefore hides whole trip groups and the grouped masonry layout survives untouched; per-photo places would force a second, flat layout for a distinction not worth its cost at 20 trips.

Filter state is page-local signals, matching the lightbox-state decision in [06-gallery.md](06-gallery.md). Mirror it to the query params so a filtered view is shareable, without stacking up the back history.

*Built 2026-08-09, with two amendments to the above.* The second axis is **`year`, not `order`**: trips already sort newest-first and 3–8 of them make a sort toggle a control with nothing to do, while the year is the other thing a trip is remembered by. And the mirror is `Location.replaceState`, not `router.navigate({replaceUrl: true})` — a query-param change is not a navigation, and routing it fires a view transition per chip click. The scale cap below arrived in the same pass as a 9-tile cap per trip, which is what keeps a 46-photo trip from owning the page before any of this splits.

**The single gallery page does not scale to the full trip count.** At 20 trips it carries 400+ tiles; lazy loading keeps the initial hit small but a full scroll pulls ~28 MB, and the chip row passes readable width somewhere around 8 countries. It stays comfortable to roughly **6–8 trips / ~120 photos**. Past that, split it the way `/work` already splits: `/gallery` becomes one cover card per trip (that's what `Trip.cover` is for) plus the filter, and `/gallery/[slug]` renders one trip's photos — enumerated for prerender from the trip data exactly like the project slugs (⚠ C1). Keying the photo data by trip slug from day one is what keeps that split a layout change instead of a data migration.

## Second collection — project images

One script, one `npm run photos`, two collections. The alternative — a `shots.mjs` beside `photos.mjs` — duplicates the freshness check, the concurrency pool, the orphan logic and the EXIF handling, and the copy rots the first time only one of them gets a fix.

`SRC` / `OUT` / `WIDTHS` / `QUALITY` stop being module constants and become fields on a collection record: `{ name, src, out, widths, quality, manifest, sort, type }`. `main()` loops over the list; `collectTrip()` becomes `collectFolder(collection, folder)`. `pool`, `slugify`, `isFresh`, the encode core, the tone sample and the prune reporting are reused verbatim.

**Widths: `[700, 1400, 2100]`.** Read off the design, not guessed. Content width is `$max-width: 87.5rem` = 1400px. The cover (`aspect-ratio: 16 / 8.5`) and the first shot (`16 / 9`, `grid-column: 1 / -1`) fill it; every further shot is `4 / 3` inside `repeat(auto-fit, minmax(min(360px, 100%), 1fr))`, which is ~450px at three columns and ~680px when the grid collapses to one. 2100 covers the full-width pair at 1.5×; 2800 would be the honest 2× but doubles the two heaviest files for a difference that flat UI screenshots barely show. Revisit only if the cover looks soft.

**Ordering is the filename, not the capture date.** Screenshots carry no EXIF, so `captureDate()` falls through to `mtime` and the order becomes "whenever I last touched the file". `usable.sort()` already gives filename order; this collection just skips the `takenAt` re-sort. Prefix with `01-`, `02-` — the prefix stays in the id, which is fine because these ids are not deeplink targets the way gallery ids are.

**`cover` is a reserved basename.** `photos/work/<slug>/cover.png` produces id `cover`; everything else is a shot in filename order. That keeps `Project.cover` out of `projects.ts` entirely — a path in the hand-written half is a second source of truth, exactly what `Trip.cover` avoids by holding a photo id instead. `coverBackground()` prefers the generated cover and falls back to the hue gradient, unchanged at the call sites.

**Data contract:** `ProjectShot` in `types.ts` — `{ id, width, height, widths[], tone }`. `GalleryPhoto` minus `takenAt`, which is meaningless here and would be a field nobody can trust. `shots.generated.ts` is keyed by project slug, and `render()` takes the type name and field list as parameters instead of hard-coding `GalleryPhoto`. The cross-check runs against `projects.ts` the same way it runs against `trips.ts`, and stays advisory.

The five committed `public/images/project/<slug>/cover.png` files become dead weight the moment the pipeline produces AVIFs for the same slots. Prune only ever deletes inside its own collection's `out` and only what the manifest didn't claim — these are hand-placed, so they need a hand-written `git rm`.

## ⚠ LANDMINES

- **A cover is a `background`, so it cannot carry a srcset.** `coverBackground(project, width)` picks the file itself — 700 for the cursor-preview card (330 CSS px, covered even at 2×), 1400 for the detail cover. Passing a width the source was too small for falls back to the largest that exists, which is why `widths[]` is in the manifest here too.
- **A broken cover is invisible.** The hue gradient is the bottom of the three layers, so a missing or misnamed image degrades into exactly the design's own fallback — you cannot tell it apart from a project that never had a screenshot. The script's cross-check is the only thing that surfaces it.
- **F3 — originals never live under `public/`.** Vite copies that folder verbatim into the build output, so originals placed there ship publicly *and* blow the 25 MiB per-file limit; `.gitignore` is a different layer and does not stop it. They belong in `photos/`, outside `public/`, ignored. And `photos/` is a staging area, not a backup — it does not survive a fresh clone, so the masters have to live somewhere else that does.
- **F4 — `.rotate()` before resize, `.keepIccProfile()`, never `.withMetadata()`.** sharp drops all metadata on re-encode, and that one default causes three separate things. (a) The EXIF orientation tag goes with it, so without a no-arg `.rotate()` first every portrait phone shot lands sideways — and the *displayed* dimensions are the transpose of the stored ones for orientations 5–8, which sharp 0.33 won't derive for you (no `autoOrient`). (b) The ICC colour profile goes too, while the pixel values stay put: untagged output is read as sRGB by every browser, so a Display P3 iPhone shot or an AdobeRGB export renders with a visible shift. `.keepIccProfile()` keeps the profile and nothing else — ~500 bytes a file, under 1 MB across the whole library. (c) EXIF stripping is the part that *is* wanted: GPS coordinates and camera serials stay out of the build, which is why `.withMetadata()` (which would keep all of it) must never appear here.
- **F5 — the loader is global, and `ngSrcset` fails quietly without it.** Two halves. (a) An `IMAGE_LOADER` provider replaces the loader for *every* `NgOptimizedImage` in the app, and `getRewrittenSrc()` routes the plain `ngSrc` through it as well, not just the srcset entries — so a gallery-shaped loader rewrites `/images/hero-cutout.png` too unless it passes through anything that isn't a gallery src. (b) With the default noop loader, `ngSrcset` does not error: Angular logs NG02963 as a `console.warn` in dev builds only, and emits *the same URL for every width descriptor*. The srcset looks correct in the DOM while serving one size at all of them. (Automatic srcset generation is skipped entirely under the noop loader, and `placeholder="true"` is the one case that actually throws.) Verified against @angular/common 22.0.5.
- **F6 — the prune guard is per collection, not global.** Today's hard-guard refuses any path outside the single `OUT`. With two collections the naive refactors both break: leave it pointed at `public/images/gallery/` and project orphans can never be deleted; widen it to `public/images/` and one bad prune reaches `hero-cutout.png` and the footer portrait, which are hand-placed and unrecoverable from the pipeline. The guard has to be evaluated against the *current* collection's `out`, and every collection's `out` has to be a real subfolder of `public/images/` — never `public/images/` itself.
- **F7 — quality 55 is a photograph setting.** Tuned on `korea-2025`, where it holds up. Screenshots are the opposite input: hard edges, flat fills, small text, and AVIF at 55 puts visible ringing along UI borders and mush into 12px labels. Project images want 65–75. This is why `quality` moves onto the collection record rather than staying a module constant — and why re-encoding after the change needs `--force`, since the freshness check compares timestamps and knows nothing about settings.
- **A partial run must not write a partial manifest.** Skipping one trip and writing anyway replaces `galleryPhotos` with `{}` and takes every *other* trip's photos down with it — this bit during testing. The script now leaves the manifest untouched whenever a trip was skipped and says which one to fix.
- **Id collisions overwrite photos silently.** `DSC_4821.jpg` and `dsc 4821.jpg` both slugify to `dsc-4821`. Checked before any encoding, because the second file would otherwise just win.
- **`track shot.id`, never `$index`** (⚠ B5). Filtering makes Angular reuse tile DOM nodes; index tracking swaps image sources inside nodes whose lazy load is still in flight, so wrong photos flash into place.
- **Orphan pruning is keyed off the source folders, not the manifest.** A trip skipped over a naming warning still has perfectly good derivatives on disk; keying off the manifest would delete them the moment a filename went wrong.
- **HEIC and RAW are not supported inputs** — libvips ships without libheif here. The script warns and skips rather than failing the run; convert to JPEG before dropping files in.
- **sharp installs on every Cloudflare build** as a devDependency the build itself never calls. A few seconds of install time, not worth engineering around.
