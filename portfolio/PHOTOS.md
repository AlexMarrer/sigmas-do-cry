# Maintaining the gallery photos

How to get photos from a trip onto the site. The *why* — storage decision, data contract, landmines — is in [`specs/photos.md`](specs/photos.md); this is the runbook.

```bash
npm run photos
```

That one command reads `photos/`, writes the AVIF variants and the manifest. Everything below is detail around it.

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

**5 · Add the trip's metadata by hand** in `src/app/data/trips.ts` — display name, country, year, cover photo, captions. The script never writes this file; it only ever writes `trips.generated.ts`.

> **Not wired yet.** `trips.ts` still holds the placeholder data from the prototype. The rework to `slug`/`country`/`year`/`cover`/`captions` is checklist item §3 "Gallery on real photos". Until that lands, `npm run photos` produces a correct manifest that nothing reads yet.

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

## What happens to the metadata

The published AVIFs carry **no EXIF**: no GPS coordinates, no camera model or serial, no exposure data, no timestamps. That's deliberate — travel photos are geotagged, and the gallery is public.

Two things are kept anyway:

- The **colour profile** stays embedded, so Display P3 (the iPhone default) and AdobeRGB exports keep their colours instead of being flattened into sRGB.
- The **capture date** is read out before stripping and stored as `takenAt` in the manifest — that's what sorts each trip chronologically. It's on the site as data, just not inside the image file.

Your originals in `photos/` are never modified, only read. Everything is still in them.

## Two things that are easy to get wrong

**Don't put originals in `public/`.** Anything in that folder is copied verbatim into the build and shipped — originals would end up publicly downloadable and break Cloudflare's 25 MiB per-file limit. `.gitignore` doesn't stop that; it's a different mechanism. Originals go in `photos/`, which is outside `public/` for exactly this reason.

**Don't hand-edit `trips.generated.ts`.** Every run overwrites it. Captions, names, and anything else you decide belong in `trips.ts`.

## Roughly how much space this takes

Three AVIF variants per photo (400 / 900 / 1800 px wide) come to about 350 KB total. At the planned scale — 15–20 trips, 6–30 photos each — that's ~120 MB for 350 photos and ~210 MB at 600. Comfortable for both git and Cloudflare Pages, which allows 20 000 files per deployment (you'd be at roughly 1 800). No CDN or external storage needed; the reasoning is in [`specs/photos.md`](specs/photos.md).
