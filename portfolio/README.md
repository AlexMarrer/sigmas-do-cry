# Alex Uscata — Portfolio

Statically prerendered portfolio on [Analog](https://analogjs.org/) (Angular 22, standalone + signals, zoneless). Recreates the design in `../design_handoff_portfolio/` — that README is the authoritative visual spec.

**Status: skeleton.** Structure, routing, prerender, data and design tokens are in place; every view/effect is a stub. The implementation plan lives in [`specs/00-checklist.md`](specs/00-checklist.md) — work through it top to bottom. Each stub file carries a `TODO(spec: …)` pointing at its spec.

```bash
npm run dev      # dev server → http://localhost:5173
npm run build    # SSG build → dist/analog/public (must contain 13 index.html)
npm test         # vitest
npm run photos   # gallery photos: photos/<trip>/ → AVIF + manifest (see PHOTOS.md)
```

## Gallery photos

Originals go in `photos/<trip-slug>/` (gitignored); `npm run photos` encodes the AVIF variants into `public/images/gallery/` and regenerates `src/app/data/trips.generated.ts`. Step-by-step in [`PHOTOS.md`](PHOTOS.md), architecture and landmines in [`specs/photos.md`](specs/photos.md).

## Deploy (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `dist/analog/public`
- No server, no functions — pure static.

## Layout

- `src/app/data/` — typed content (projects/trips/skills). **Framework-free**: `vite.config.ts` imports it to enumerate prerender routes.
- `src/styles/` — tokens (`_tokens.scss`), theming (`_themes.scss`), font (`_fonts.scss`), reset.
- `src/app/pages/` — Analog file-based routes (`/`, `/work`, `/work/:slug`, `/about`, `/gallery`).
- `specs/` — build checklist + one spec per view/component with ⚠ LANDMINE callouts.
- `photos/` — gallery originals, gitignored staging only. Not a backup: keep masters elsewhere.
- `scripts/photos.mjs` — the photo pipeline behind `npm run photos`.
