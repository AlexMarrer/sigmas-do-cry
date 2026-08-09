// Image pipeline — `npm run photos`. Two passes over one encoder.
//
//   GALLERY   photos/<trip-slug>/*.jpg            (gitignored originals)
//     → public/images/gallery/<trip>/<id>-<w>.avif
//     → src/app/data/trips.generated.ts
//
//   PROJECTS  project-images/<project-slug>/*.png (gitignored originals)
//     → public/images/project/<slug>/<id>-<w>.avif
//     → src/app/data/projects.generated.ts
//     `cover.*` becomes the cover; every other file is a shot, in filename order.
//
// Flags:
//   --force   re-encode everything, ignoring the mtime freshness check
//   --prune   delete derivatives whose original is gone (default: only report them)

import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import exifReader from 'exif-reader';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Masonry tiles are 320px wide (06-gallery.md), the lightbox stage goes to ~1800. */
const GALLERY = {
  label: 'gallery',
  src: join(ROOT, 'photos'),
  out: join(ROOT, 'public', 'images', 'gallery'),
  manifest: join(ROOT, 'src', 'app', 'data', 'trips.generated.ts'),
  widths: [400, 900, 1800],
  // Tuned for photographs.
  quality: 55,
};

/** 700 covers the hover card at 2× (330 CSS px); 1400 is the detail cover / first shot. */
const PROJECTS = {
  label: 'project',
  src: join(ROOT, 'project-images'),
  out: join(ROOT, 'public', 'images', 'project'),
  manifest: join(ROOT, 'src', 'app', 'data', 'projects.generated.ts'),
  widths: [700, 1400],
  // Higher than the gallery on purpose: screenshots carry small UI text, which
  // smears badly at photo quality.
  quality: 78,
};

const CONCURRENCY = 4;
const SOURCES = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp']);

const force = process.argv.includes('--force');
const prune = process.argv.includes('--prune');

const warnings = [];
const warn = (msg) => warnings.push(msg);

// Notes are next-steps, not errors — they must not colour the exit code, because
// "encode the images, then write the data entry" is the normal order of work.
const notes = [];
const note = (msg) => notes.push(msg);

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
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

async function isFresh(outPath, srcMtimeMs) {
  if (force || !existsSync(outPath)) return false;
  return (await stat(outPath)).mtimeMs >= srcMtimeMs;
}

/**
 * The shared encoder. Returns the manifest fields both passes need plus the
 * source handles the gallery pass uses for its extra work (tone, capture date).
 */
async function encode(kind, group, id, file) {
  const inPath = join(kind.src, group, file);
  const srcStat = await stat(inPath);
  const meta = await sharp(inPath).metadata();

  // EXIF orientations 5–8 include a 90° turn, so the *displayed* box is the
  // transpose of the stored one. sharp 0.33 has no autoOrient, so derive it.
  const turned = (meta.orientation ?? 1) >= 5;
  const srcW = turned ? meta.height : meta.width;
  const srcH = turned ? meta.width : meta.height;

  const targets = kind.widths.filter((w) => w <= srcW);
  if (targets.length === 0) targets.push(srcW);

  let encoded = 0;
  for (const w of targets) {
    const outPath = join(kind.out, group, `${id}-${w}.avif`);
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
      .avif({ quality: kind.quality, effort: 4 })
      .toFile(outPath);
    encoded++;
  }

  const largest = targets[targets.length - 1];
  return {
    inPath,
    meta,
    srcStat,
    image: {
      id,
      width: largest,
      height: Math.round((largest * srcH) / srcW),
      widths: targets,
    },
    encoded,
    files: targets.map((w) => `${id}-${w}.avif`),
  };
}

/** Ids come from filenames and are permanent, so a collision would silently overwrite. */
function idMap(kind, group, files) {
  const ids = new Map();
  for (const f of files) {
    const id = slugify(basename(f, extname(f)));
    if (ids.has(id)) {
      warn(`${group} — "${ids.get(id)}" and "${f}" both become id "${id}"; rename one. Skipped.`);
      return null;
    }
    ids.set(id, f);
  }
  return ids;
}

function usableFiles(kind, group, entries) {
  const files = entries.filter((e) => e.isFile()).map((e) => e.name);
  for (const f of files) {
    if (!SOURCES.has(extname(f).toLowerCase())) {
      warn(`${group}/${f} — unsupported format, skipped (convert HEIC/RAW to JPEG first)`);
    }
  }
  return files.filter((f) => SOURCES.has(extname(f).toLowerCase())).sort();
}

// ── Gallery pass ─────────────────────────────────────────────────────────────

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

async function collectTrip(trip) {
  const usable = usableFiles(GALLERY, trip, await readdir(join(GALLERY.src, trip), { withFileTypes: true }));
  if (usable.length === 0) return null;
  const ids = idMap(GALLERY, trip, usable);
  if (!ids) return { skipped: true };

  await mkdir(join(GALLERY.out, trip), { recursive: true });
  const results = await pool([...ids], CONCURRENCY, async ([id, file]) => {
    const r = await encode(GALLERY, trip, id, file);
    // Average colour = the flat placeholder behind the lazy image.
    const { data } = await sharp(r.inPath)
      .rotate()
      .resize(1, 1, { fit: 'fill' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const tone = '#' + [...data.subarray(0, 3)].map((v) => v.toString(16).padStart(2, '0')).join('');
    return {
      ...r,
      image: { ...r.image, tone, takenAt: captureDate(r.meta, r.srcStat).toISOString() },
    };
  });

  return {
    entry: results.map((r) => r.image).sort((a, b) => a.takenAt.localeCompare(b.takenAt)),
    encoded: results.reduce((n, r) => n + r.encoded, 0),
    expected: new Set(results.flatMap((r) => r.files)),
    count: results.length,
  };
}

function renderGallery(manifest) {
  const groups = Object.keys(manifest).sort();
  const body = groups
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
    groups.length === 0 ? '{}' : `{\n${body}\n}`
  };
`;
}

// ── Project pass ─────────────────────────────────────────────────────────────

async function collectProject(slug) {
  const usable = usableFiles(PROJECTS, slug, await readdir(join(PROJECTS.src, slug), { withFileTypes: true }));
  if (usable.length === 0) return null;
  const ids = idMap(PROJECTS, slug, usable);
  if (!ids) return { skipped: true };

  await mkdir(join(PROJECTS.out, slug), { recursive: true });
  const results = await pool([...ids], CONCURRENCY, ([id, file]) => encode(PROJECTS, slug, id, file));

  // `cover.*` is the one reserved filename. Everything else is a shot, kept in
  // filename order — these are curated sequences, not chronological like photos,
  // so prefix them 01-, 02-… when the order matters.
  const cover = results.find((r) => r.image.id === 'cover')?.image;
  const shots = results.filter((r) => r.image.id !== 'cover').map((r) => r.image);
  if (!cover) note(`${slug} has images but no cover.* — the hover card falls back to the hue gradient`);

  return {
    entry: { cover, shots },
    encoded: results.reduce((n, r) => n + r.encoded, 0),
    expected: new Set(results.flatMap((r) => r.files)),
    count: results.length,
  };
}

function renderProjects(manifest) {
  const slugs = Object.keys(manifest).sort();
  const img = (i) =>
    `{ id: '${i.id}', width: ${i.width}, height: ${i.height}, widths: [${i.widths.join(', ')}] }`;
  const body = slugs
    .map((s) => {
      const { cover, shots } = manifest[s];
      const lines = [];
      if (cover) lines.push(`    cover: ${img(cover)},`);
      lines.push(
        shots.length === 0
          ? '    shots: [],'
          : `    shots: [\n${shots.map((i) => `      ${img(i)},`).join('\n')}\n    ],`,
      );
      return `  '${s}': {\n${lines.join('\n')}\n  },`;
    })
    .join('\n');

  return `// GENERATED by \`npm run photos\` — do not edit by hand, your changes will be lost.
// Source: project-images/<slug>/… · output: public/images/project/<slug>/<id>-<width>.avif
// FRAMEWORK-FREE (see types.ts · landmine C1) — vite.config.ts may read this in Node.

import type { ProjectImages } from './types';

/** Keyed by project slug = the folder name under project-images/. Shots in filename order. */
export const projectImages: Record<string, ProjectImages> = ${
    slugs.length === 0 ? '{}' : `{\n${body}\n}`
  };
`;
}

// ── Driver ───────────────────────────────────────────────────────────────────

async function runPass(kind, collect, render) {
  await mkdir(kind.src, { recursive: true });
  await mkdir(kind.out, { recursive: true });

  const groups = (await readdir(kind.src, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const manifest = {};
  const orphans = [];
  let total = 0;
  let encoded = 0;
  let skipped = 0;

  for (const group of groups) {
    // The folder name is the manifest key and a URL segment (/gallery/<slug>, /work/<slug>).
    if (slugify(group) !== group) {
      warn(`${relative(ROOT, kind.src)}/${group} — not a slug, rename it to "${slugify(group)}". Skipped.`);
      skipped++;
      continue;
    }

    const result = await collect(group);
    if (result?.skipped) skipped++;
    if (!result || result.skipped) continue;

    manifest[group] = result.entry;
    total += result.count;
    encoded += result.encoded;

    for (const f of await readdir(join(kind.out, group))) {
      if (!result.expected.has(f)) orphans.push(join(kind.out, group, f));
    }

    const cached = result.encoded === 0 ? '' : `, ${result.encoded} encoded`;
    console.log(`  ${(kind.label + '/' + group).padEnd(32)} ${String(result.count).padStart(3)} images${cached}`);
  }

  // Keyed off the source folders, NOT the manifest: a group skipped over a naming
  // warning still has valid derivatives and must not be pruned out from under you.
  for (const e of await readdir(kind.out, { withFileTypes: true })) {
    if (e.isDirectory() && !groups.includes(e.name)) orphans.push(join(kind.out, e.name));
  }

  // A partial run must never write a partial manifest — one bad filename in one
  // group would otherwise wipe the data for every other group.
  if (skipped === 0) await writeFile(kind.manifest, render(manifest), 'utf8');

  return { manifest, orphans, total, encoded, skipped, groups };
}

/**
 * Cross-check the generated slugs against the hand-written half. A group with
 * images but no data entry renders as nothing, an entry with no folder renders
 * empty — both are silent failures without this.
 * Advisory only: a mid-edit data file must never break the pipeline.
 */
async function crossCheck(label, dataFile, sourceDirs, manifest) {
  let known;
  try {
    // Scraped, not imported. Importing the module would drag in whatever the data
    // file imports — projects.ts pulls its own generated manifest, and Node cannot
    // resolve the extensionless specifier the rest of the codebase uses. All this
    // needs is the slug list, and a flat literal array gives that up to a regex.
    const src = await readFile(join(ROOT, dataFile), 'utf8');
    known = [...src.matchAll(/^\s*slug: ['"]([^'"]+)['"]/gm)].map((m) => m[1]);
    if (known.length === 0) throw new Error('no slugs found');
  } catch (err) {
    note(`skipped the ${label} cross-check — couldn't read it (${err.code ?? err.message})`);
    return;
  }
  for (const slug of Object.keys(manifest)) {
    if (!known.includes(slug)) note(`${slug} has images but no entry in ${label} — it won't render yet`);
  }
  for (const slug of known) {
    if (!sourceDirs.includes(slug)) note(`${label} lists "${slug}" but no source folder exists for it`);
  }
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
  const gallery = await runPass(GALLERY, collectTrip, renderGallery);
  const projects = await runPass(PROJECTS, collectProject, renderProjects);

  if (gallery.skipped === 0) {
    await crossCheck('trips.ts', 'src/app/data/trips.ts', gallery.groups, gallery.manifest);
  }
  if (projects.skipped === 0) {
    await crossCheck('projects.ts', 'src/app/data/projects.ts', projects.groups, projects.manifest);
  }

  const orphans = [...gallery.orphans, ...projects.orphans];
  if (orphans.length > 0) {
    console.log('');
    for (const p of orphans) {
      // Belt and braces: only ever touch things under the two output roots.
      const inside = [GALLERY.out, PROJECTS.out].some((root) => !relative(root, p).startsWith('..'));
      if (!inside) throw new Error(`refusing to prune outside the image output roots: ${p}`);
      if (prune) await rm(p, { recursive: true, force: true });
      console.log(`  ${prune ? 'pruned ' : 'orphan '} ${relative(ROOT, p)}`);
    }
    if (!prune) console.log(`\n  ${orphans.length} orphan(s) — re-run with \`-- --prune\` to delete.`);
  }

  if (warnings.length > 0) {
    console.log('');
    for (const w of warnings) console.log(`  ! ${w}`);
    process.exitCode = 1;
  }

  if (notes.length > 0) {
    console.log('');
    for (const n of notes) console.log(`  · ${n}`);
  }

  const written = (pass, kind) =>
    pass.skipped === 0
      ? `  → ${relative(ROOT, kind.manifest)}`
      : `  → ${relative(ROOT, kind.manifest)} NOT written — fix the ${pass.skipped} skipped group(s) above first.`;

  console.log(
    `\n  ${gallery.total} photos · ${projects.total} project images · ` +
      `${gallery.encoded + projects.encoded} variants encoded\n` +
      `  ${mb(await dirSize(GALLERY.out))} gallery · ${mb(await dirSize(PROJECTS.out))} project\n` +
      `${written(gallery, GALLERY)}\n${written(projects, PROJECTS)}\n`,
  );
}

main().catch((err) => {
  console.error(`\n  photos failed: ${err.message}\n`);
  process.exitCode = 1;
});
