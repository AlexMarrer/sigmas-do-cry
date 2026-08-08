// Gallery photo pipeline — `npm run photos`.
//
//   photos/<trip-slug>/<anything>.jpg          (gitignored originals, you drop them in)
//     → public/images/gallery/<trip-slug>/<id>-<width>.avif   (committed, shipped)
//     → src/app/data/trips.generated.ts                       (committed, never hand-edited)
//
// Flags:
//   --force   re-encode everything, ignoring the mtime freshness check
//   --prune   delete derivatives whose original is gone (default: only report them)

import { existsSync } from 'node:fs';
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import exifReader from 'exif-reader';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'photos');
const OUT = join(ROOT, 'public', 'images', 'gallery');
const MANIFEST = join(ROOT, 'src', 'app', 'data', 'trips.generated.ts');

/** Masonry tiles are 320px wide (06-gallery.md), the lightbox stage goes to ~1800. */
const WIDTHS = [400, 900, 1800];
const QUALITY = 55;
const CONCURRENCY = 4;
const SOURCES = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp']);

const force = process.argv.includes('--force');
const prune = process.argv.includes('--prune');

const warnings = [];
const warn = (msg) => warnings.push(msg);

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

function captureDate(meta, srcStat) {
  if (meta.exif) {
    try {
      const exif = exifReader(meta.exif);
      const d = exif?.Photo?.DateTimeOriginal ?? exif?.Image?.DateTime;
      if (d instanceof Date && !Number.isNaN(d.getTime())) return d;
    } catch {
      // Unparseable EXIF block — mtime is a good enough sort key.
    }
  }
  return srcStat.mtime;
}

async function isFresh(outPath, srcMtimeMs) {
  if (force || !existsSync(outPath)) return false;
  return (await stat(outPath)).mtimeMs >= srcMtimeMs;
}

async function processPhoto(trip, id, file) {
  const inPath = join(SRC, trip, file);
  const srcStat = await stat(inPath);
  const meta = await sharp(inPath).metadata();

  // EXIF orientations 5–8 include a 90° turn, so the *displayed* box is the
  // transpose of the stored one. sharp 0.33 has no autoOrient, so derive it.
  const turned = (meta.orientation ?? 1) >= 5;
  const srcW = turned ? meta.height : meta.width;
  const srcH = turned ? meta.width : meta.height;

  const targets = WIDTHS.filter((w) => w <= srcW);
  if (targets.length === 0) targets.push(srcW);

  let encoded = 0;
  for (const w of targets) {
    const outPath = join(OUT, trip, `${id}-${w}.avif`);
    if (await isFresh(outPath, srcStat.mtimeMs)) continue;
    // .rotate() with no args bakes EXIF orientation into the pixels before the
    // metadata is dropped. Without it every portrait phone shot lands sideways.
    // .keepIccProfile() keeps ONLY the colour profile — sharp otherwise strips it
    // along with everything else, and untagged P3/AdobeRGB pixels get read as sRGB.
    // Never .withMetadata(): that would keep EXIF, i.e. GPS, in the build.
    await sharp(inPath)
      .rotate()
      .keepIccProfile()
      .resize({ width: w, withoutEnlargement: true })
      .avif({ quality: QUALITY, effort: 4 })
      .toFile(outPath);
    encoded++;
  }

  // Average colour = the flat placeholder behind the lazy image.
  const { data } = await sharp(inPath)
    .rotate()
    .resize(1, 1, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const tone =
    '#' +
    [...data.subarray(0, 3)].map((v) => v.toString(16).padStart(2, '0')).join('');

  const largest = targets[targets.length - 1];
  return {
    photo: {
      id,
      width: largest,
      height: Math.round((largest * srcH) / srcW),
      widths: targets,
      tone,
      takenAt: captureDate(meta, srcStat).toISOString(),
    },
    encoded,
    files: targets.map((w) => `${id}-${w}.avif`),
  };
}

async function collectTrip(trip) {
  const entries = await readdir(join(SRC, trip), { withFileTypes: true });
  const files = entries.filter((e) => e.isFile()).map((e) => e.name);

  for (const f of files) {
    if (!SOURCES.has(extname(f).toLowerCase())) {
      warn(`${trip}/${f} — unsupported format, skipped (convert HEIC/RAW to JPEG first)`);
    }
  }
  const usable = files.filter((f) => SOURCES.has(extname(f).toLowerCase())).sort();
  if (usable.length === 0) return null;

  // Ids are permanent (lightbox deeplinks key on them), so a collision would
  // silently overwrite one photo with another. Catch it before encoding.
  const ids = new Map();
  for (const f of usable) {
    const id = slugify(basename(f, extname(f)));
    if (ids.has(id)) {
      warn(`${trip} — "${ids.get(id)}" and "${f}" both become id "${id}"; rename one. Trip skipped.`);
      return { skipped: true };
    }
    ids.set(id, f);
  }

  await mkdir(join(OUT, trip), { recursive: true });
  const results = await pool([...ids], CONCURRENCY, ([id, file]) =>
    processPhoto(trip, id, file),
  );

  const photos = results.map((r) => r.photo).sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  return {
    photos,
    encoded: results.reduce((n, r) => n + r.encoded, 0),
    expected: new Set(results.flatMap((r) => r.files)),
  };
}

function render(manifest) {
  const trips = Object.keys(manifest).sort();
  const body = trips
    .map((t) => {
      const rows = manifest[t]
        .map(
          (p) =>
            `    { id: '${p.id}', width: ${p.width}, height: ${p.height}, ` +
            `widths: [${p.widths.join(', ')}], tone: '${p.tone}', takenAt: '${p.takenAt}' },`,
        )
        .join('\n');
      return `  '${t}': [\n${rows}\n  ],`;
    })
    .join('\n');

  return `// GENERATED by \`npm run photos\` — do not edit by hand, your changes will be lost.
// Source: photos/<trip>/… · output: public/images/gallery/<trip>/<id>-<width>.avif
// FRAMEWORK-FREE (see types.ts · landmine C1) — vite.config.ts may read this in Node.

import type { GalleryPhoto } from './types';

/** Keyed by trip slug = the folder name under photos/. Each list sorted by capture date. */
export const galleryPhotos: Record<string, GalleryPhoto[]> = ${
    trips.length === 0 ? '{}' : `{\n${body}\n}`
  };
`;
}

async function dirSize(dir) {
  if (!existsSync(dir)) return 0;
  let total = 0;
  for (const e of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (e.isFile()) total += (await stat(join(e.parentPath, e.name))).size;
  }
  return total;
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

async function main() {
  await mkdir(SRC, { recursive: true });
  await mkdir(OUT, { recursive: true });

  const tripDirs = (await readdir(SRC, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const manifest = {};
  const orphans = [];
  let totalPhotos = 0;
  let totalEncoded = 0;
  let skipped = 0;

  for (const trip of tripDirs) {
    // The folder name is the manifest key and a future URL segment (/gallery/<slug>).
    if (slugify(trip) !== trip) {
      warn(`photos/${trip} — not a slug, rename it to "${slugify(trip)}". Trip skipped.`);
      skipped++;
      continue;
    }

    const result = await collectTrip(trip);
    if (result?.skipped) skipped++;
    if (!result || result.skipped) continue;

    manifest[trip] = result.photos;
    totalPhotos += result.photos.length;
    totalEncoded += result.encoded;

    for (const f of await readdir(join(OUT, trip))) {
      if (!result.expected.has(f)) orphans.push(join(OUT, trip, f));
    }

    const cached = result.photos.reduce((n, p) => n + p.widths.length, 0) - result.encoded;
    console.log(
      `  ${trip.padEnd(24)} ${String(result.photos.length).padStart(3)} photos · ` +
        `${result.encoded} encoded, ${cached} cached`,
    );
  }

  // Keyed off the source folders, NOT the manifest: a trip skipped over a naming
  // warning still has valid derivatives and must not be pruned out from under you.
  for (const e of await readdir(OUT, { withFileTypes: true })) {
    if (e.isDirectory() && !tripDirs.includes(e.name)) orphans.push(join(OUT, e.name));
  }

  // A partial run must never write a partial manifest — one bad filename in one
  // trip would otherwise wipe the photo data for every other trip.
  if (skipped === 0) {
    await writeFile(MANIFEST, render(manifest), 'utf8');
  }

  if (orphans.length > 0) {
    console.log('');
    for (const p of orphans) {
      // Belt and braces: only ever touch things under public/images/gallery/.
      if (relative(OUT, p).startsWith('..')) throw new Error(`refusing to prune outside ${OUT}: ${p}`);
      if (prune) await rm(p, { recursive: true, force: true });
      console.log(`  ${prune ? 'pruned ' : 'orphan '} ${relative(ROOT, p)}`);
    }
    if (!prune) console.log(`\n  ${orphans.length} orphan(s) — re-run with --prune to delete.`);
  }

  if (warnings.length > 0) {
    console.log('');
    for (const w of warnings) console.log(`  ! ${w}`);
    process.exitCode = 1;
  }

  console.log(
    `\n  ${totalPhotos} photos in ${Object.keys(manifest).length} trips · ` +
      `${totalEncoded} variants encoded · ${mb(await dirSize(OUT))} in public/images/gallery\n` +
      (skipped === 0
        ? `  → ${relative(ROOT, MANIFEST)}\n`
        : `  → ${relative(ROOT, MANIFEST)} NOT written — fix the ${skipped} skipped trip(s) above first.\n`),
  );
}

main().catch((err) => {
  console.error(`\n  photos failed: ${err.message}\n`);
  process.exitCode = 1;
});
