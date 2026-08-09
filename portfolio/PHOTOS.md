# Maintaining the images

How to get images onto the site — gallery photos and project screenshots. The *why* — storage decision, data contract, landmines — is in [`specs/photos.md`](specs/photos.md); this is the runbook.

```bash
npm run photos
```

One command, two passes over the same encoder:

| | source (gitignored) | output | data file |
|---|---|---|---|
| Gallery | `photos/<trip-slug>/` | `public/images/gallery/<trip>/` | `trips.generated.ts` |
| Projects | `project-images/<project-slug>/` | `public/images/project/<slug>/` | `projects.generated.ts` |

Gallery photos get 400/900/1800 at quality 55; project images get 700/1400 at quality 78, because screenshots carry small UI text that smears at photo quality. Everything else — no upscaling, incremental re-encode, orphan reporting, EXIF stripped, colour profile kept — works the same in both.

Project images are covered in [their own section](#project-images) further down. Everything until then is the gallery.

## Adding a new trip

**1 · Name the folder.** One folder per trip under `photos/`, named as a slug — lowercase, digits, hyphens, nothing else:

```
photos/japan-2023/
photos/bernese-oberland-2025/
```

This name is permanent-ish: it's the image path, the manifest key, and eventually the URL at `/gallery/japan-2023`. `photos/Japan 2023/` is rejected with the corrected name in the message.

**2 · Drop in the originals.** Full-resolution JPEG/PNG/TIFF/WebP straight off the camera is fine — they never get committed, and the script only ever reads them.

> **HEIC and RAW don't work.** Convert to JPEG first (iPhone: Settings → Camera → Formats → Most Compatible, or export as JPEG). The script warns and skips them.

**3 · Decide the filenames now, not later.** The filename becomes the photo's permanent id: `DSC_4821.jpg` → `dsc-4821`. Two options, both fine:

- Leave the camera names. Zero work, ids are meaningless.
- Rename to something descriptive (`shinjuku-after-rain.jpg` → `shinjuku-after-rain`). Costs a few minutes per trip, but the captions map in `trips.ts` becomes readable instead of a wall of `dsc-48xx`.

Pick one and stick with it. **Renaming a file after it's been processed doesn't rename anything — it creates a new photo and orphans the old one.**

**4 · Run it.**

```bash
npm run photos
```

```
  japan-2023                18 photos · 54 encoded, 0 cached

  18 photos in 1 trips · 54 variants encoded · 6.1 MB in public/images/gallery
  → src\app\data\trips.generated.ts
```

First run on a trip encodes everything, which takes a while — AVIF is slow, budget roughly a second or two per variant. Later runs only touch what changed.

**5 · Add the trip to `src/app/data/trips.ts`.** Four fields, same slug as the folder:

```ts
{ slug: 'korea-2025', name: 'Seoul', country: 'South Korea', year: 2025 },
```

`name` is the **place**, not the country — uncaptioned photos fall back to `"{name}, {country}"` as their alt text, and `"Korea, South Korea"` reads like a bug.

Optional, add whenever you feel like it:

```ts
cover: 'alu00463',                              // defaults to the first photo
captions: { 'alu00463': 'Bukchon at dusk' },    // sparse — only what earns one
```

The script never writes this file, and you never write `trips.generated.ts`. If the two drift apart — photos with no entry, or an entry with no folder — the next `npm run photos` says so.

> **The gallery page doesn't render yet.** The data layer is complete and joined (`data/gallery.ts`), but the view is still a stub. That's checklist item §3 "Gallery on real photos".

**6 · Commit.** These are the outputs:

```
public/images/gallery/<trip>/**     the AVIF variants
src/app/data/trips.generated.ts     the manifest
src/app/data/trips.ts               your captions and metadata
```

`photos/` is gitignored and stays on your machine.

> **`photos/` is not a backup.** It doesn't survive a fresh clone, and the committed AVIFs are lossy derivatives you can't reverse. Your originals need to live somewhere that actually backs up.

## Everyday operations

| You want to | Do this |
|---|---|
| Add photos to an existing trip | Drop them in the folder, `npm run photos`. Existing photos are cached, only the new ones encode. |
| Remove a photo | Delete the original, then `npm run photos -- --prune`. Without the flag the derivatives are only reported. |
| Re-edit a photo | Overwrite the original keeping the same filename. The newer mtime re-encodes it; the id and any caption survive. |
| Rename a trip | Rename the folder, then `npm run photos -- --prune`. Photo ids survive but the whole trip re-encodes from scratch, and any `/gallery/<old-slug>` links break. |
| Re-encode everything | `npm run photos -- --force`, e.g. after changing quality or the width list in `scripts/photos.mjs`. Slow — it's the whole library. |
| Check how big the library is | The summary line prints the total under `public/images/gallery`. |

> **The `--` is not optional.** `npm run photos --prune` silently does nothing — npm eats the flag as its own config instead of passing it on. It has to be `npm run photos -- --prune`. Flags combine: `npm run photos -- --force --prune`.

## When it complains

The script exits with code 1 if anything was skipped or reported, so nothing fails silently.

| Message | What happened |
|---|---|
| `not a slug, rename it to "…"` | Folder name has spaces/capitals/umlauts. It tells you the correct name. Trip skipped. |
| `unsupported format, skipped` | HEIC or RAW. Convert to JPEG. The rest of the trip still processes. |
| `both become id "…"; rename one` | Two files collapse to the same id (`DSC_4821.jpg` and `dsc 4821.jpg`). Rename one. Trip skipped. |
| `orphan  public\images\gallery\…` | A derivative whose original is gone. Re-run with `-- --prune` to delete, or restore the original. |
| `trips.generated.ts NOT written — fix the N skipped trip(s)` | Something above was skipped. The manifest is deliberately left alone so a single bad filename can't wipe every other trip's data. Fix and re-run. |

## Project images

One folder per project, named exactly like the project's `slug` in `projects.ts`:

```
project-images/portfolio/cover.png      ← the cover, reserved filename
project-images/portfolio/01-home.png    ← shots, in filename order
project-images/portfolio/02-detail.png
```

**`cover.*` is the only reserved name.** It becomes the image behind the project title — on the hover card on `/work`, and on the cover of the project's detail page. Everything else in the folder is a shot and renders at the end of that detail page, in filename order. Prefix them `01-`, `02-` when the order matters; unlike travel photos there is no capture date to sort by.

A project with no folder, or a folder with no `cover.*`, falls back to its `hue` gradient. That is a supported state, not a broken one — five of the nine projects are there right now, and `npm run photos` lists them so you know which.

There is **no path to type anywhere.** The folder name is the link, which is why it has to match the slug; the script tells you when it doesn't. `projects.ts` never mentions images at all.

Sizes: 700px covers the hover card even on a retina display (the card is at most 330 CSS px wide); 1400 is for the detail page's full-width cover and its first shot. A source narrower than 1400 simply doesn't get that variant.

> **A missing cover looks exactly like a project that never had one.** The hue gradient sits underneath the screenshot as the bottom layer, so a failed image degrades silently into the intended fallback. If a cover you added isn't showing, check the run output — the script reports folders it doesn't recognise.

## What happens to the metadata

The published AVIFs carry **no EXIF**: no GPS coordinates, no camera model or serial, no exposure data, no timestamps. That's deliberate — travel photos are geotagged, and the gallery is public.

Two things are kept anyway:

- The **colour profile** stays embedded, so Display P3 (the iPhone default) and AdobeRGB exports keep their colours instead of being flattened into sRGB.
- The **capture date** is read out before stripping and stored as `takenAt` in the manifest — that's what sorts each trip chronologically. It's on the site as data, just not inside the image file.

Your originals in `photos/` are never modified, only read. Everything is still in them.

## Two things that are easy to get wrong

**Don't put originals in `public/`.** Anything in that folder is copied verbatim into the build and shipped — originals would end up publicly downloadable and break Cloudflare's 25 MiB per-file limit. `.gitignore` doesn't stop that; it's a different mechanism. Originals go in `photos/` and `project-images/`, both outside `public/` for exactly this reason.

**Don't hand-edit the `*.generated.ts` files.** Every run overwrites them. Captions, names, and anything else you decide belong in `trips.ts` / `projects.ts`.

## Roughly how much space this takes

Measured on `korea-2025` — 46 photos, 136 variants, 8.4 MB — that's about **187 KB per photo** across its three AVIF sizes. At the planned scale of 15–20 trips you land around 65 MB for 350 photos, ~112 MB at 600, across at most 1 800 files.

Comfortable for both git and Cloudflare Pages, which allows 20 000 files per deployment. No CDN or external storage needed; the reasoning is in [`specs/photos.md`](specs/photos.md).
