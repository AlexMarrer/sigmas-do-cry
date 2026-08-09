# Master checklist

Work top to bottom — the order is dependency-driven. Every item links a spec; every spec references the exact numbers in the design README (`../../design_handoff_portfolio/README.md`, "README" below). Landmine IDs (A1, D2, …) used in code comments and specs are defined in the legend at the bottom.

Definition of done per item: matches the screenshot/prototype visually, works keyboard-only, survives `npm run build` with 13 prerendered pages.

## 0 · Toolchain & skeleton — DONE (scaffolded)

- [x] Analog + Angular 22, zoneless, file router (+ input binding, scroll restore, view transitions), hydration + event replay
- [x] Prerender enumerates 4 static routes + 9 slugs from `data/projects.ts` (verified: 13 pages)
- [x] Typed data files seeded from prototype (`data/projects|trips|skills.ts`)
- [x] Token layer (`_tokens/_themes/_fonts/_reset`), self-hosted variable font + preload
- [x] PostCSS (autoprefixer + preset-env), modern browserslist
- [x] Stub pages/components/directives/services

## 1 · Foundation polish

- [x] Accent-contrast strategy (⚠ E4) — DECIDED: two-tier accent. `--accent` (#C6402E) for fills/large text only; `--accent-text` (#B23A29 on light, #E05A44 in `.theme-dark`) for all accent text < ~19px. Tokens are in place — the per-component wiring is called out in each spec.
- [x] Grid system → [grid.md](grid.md) — 3-column frame (`grid.wrapper` + placement mixins, ⚠ G1), breakpoints + `down()`, output-free token rule (⚠ G2). Adopt per section as views get built.
- [x] Image pipeline → [photos.md](photos.md) — DONE (2026-08-08): `npm run photos` (sharp), two passes over one encoder (⚠ F3, F4). Gallery: `photos/<trip>/` → `public/images/gallery/` + `trips.generated.ts`. Projects: `project-images/<slug>/` → `public/images/project/` + `projects.generated.ts`, `cover.*` reserved, rest are shots in filename order. `Project.cover` removed — the folder name is the only link. Storage: repo, no CDN, ~187 KB/photo measured.
- [ ] Project images through the same pipeline → [photos.md](photos.md) — second collection: `photos/work/<slug>/cover.png` + `01-*.png` → `public/images/project/<slug>/` + `data/shots.generated.ts`. Config-driven collections instead of a second script; widths `[700, 1400, 2100]` off the 1400px content width, filename ordering, `cover` reserved (⚠ F6, F7). Existing trips move to `photos/gallery/<slug>/` (local `mv`, orphans nothing); the five committed `cover.png` files need a hand-written `git rm` afterwards.

## 2 · Shell components (everything depends on these visually)

- [x] Nav → [01-nav.md](01-nav.md) — blend-mode inversion (⚠ D1), active dot morphing between pills on route change (⚠ D7), responsive pills
- [x] Footer, static part → [07-footer.md](07-footer.md) — CTA circle (⚠ D3 later), pills, bottom bar (clock placeholder for now). Ships `images/rice-small.jpg` (240×160, 8 KB downscale of rice.jpg) for the 52px portrait.

## 3 · Views, static (no JS effects yet — build all five before any effect)

- [ ] Home hero → [02-home.md](02-home.md) — marquee (CSS only), portrait (LCP, ⚠ F1/F2), bottom bar
- [ ] Home intro + circle badge → [02-home.md](02-home.md)
- [ ] Project rows component, static → [03-work.md](03-work.md) — stretched-link rows (⚠ A4), no expand yet; used by Home (4 featured) + Work (9)
- [ ] Home selected-work section → [02-home.md](02-home.md) — depends on project rows
- [ ] Work page → [03-work.md](03-work.md)
- [ ] Project detail page → [04-project-detail.md](04-project-detail.md) — slug input (⚠ C3), dynamic title (⚠ C5), `nextProject()` in data layer. Cover: `coverBackground(project, 1400)`. Shots: `projectShots(project)` when non-empty, `Project.shots` labels otherwise — rendering them via `ngSrc` needs a `project/` branch in the image loader (⚠ F5), it only knows gallery srcs today.
- [ ] About page → [05-about.md](05-about.md)
- [ ] Gallery page, static tiles → [06-gallery.md](06-gallery.md) — masonry (⚠ D6), tiles as buttons (⚠ E1)
- [x] Gallery data layer → [photos.md](photos.md) — DONE (2026-08-08): `Trip` reworked (slug/name/country/year + optional cover/captions), `TripShot` dropped, `data/gallery.ts` joins the hand-written and generated halves (`galleryTrips`, `captionFor`, `photoSrc`). First real trip encoded: `korea-2025`, 46 photos, 8.4 MB.
- [x] Gallery on real photos → [photos.md](photos.md) — DONE (2026-08-08): `IMAGE_LOADER` provider with absolute-src passthrough (⚠ F5), tiles render `ngSrc`/`ngSrcset` off `photo.widths`, `tone` + `aspect-ratio` on the button (⚠ D6, measured CLS-free). Verified on `korea-2025`: 13 pages built, 136 AVIFs shipped, srcset in the prerendered HTML, hero src unrewritten.
- [ ] Place filter → [photos.md](photos.md) § Filtering & scale — chips over `country`, `?place=` in the query params. Dead UI until there are ~4 trips; revisit then.
- [ ] Re-run `npm run build` — still 13 pages, spot-check `/work/velora/index.html` content

## 4 · Motion & interaction layer (order matters: service → simple → complex)

- [x] MotionService — SSR-safe `reducedMotion` / `finePointer` (⚠ A1, E3); everything below consumes it (pulled ahead 2026-08-05 for the footer's magnetic CTA)
- [x] Scroll-reveal directive → [scroll-reveal.md](scroll-reveal.md) (⚠ A3) — DONE (2026-08-05): directive + `styles/_reveal.scss` variants, wired on Home (intro grid, selected-work label row). Still to sprinkle per the view specs as views get built
- [x] Magnetic directive → [magnetic.md](magnetic.md) (⚠ D3, B2) — DONE, wired: footer CTA + email pill. Still to wire as their views get built: hero pill, About pill, all-work pill, CV/gallery buttons, circle badge
- [x] Hover-wipe directive → [hover-wipe.md](hover-wipe.md) — DONE (2026-08-06): directive + `styles/_hover-wipe.scss` mixin, wired on both `.btn` variants, footer CTA + email pill. Not on `.link--*` (colour-only) or the hero status pill. Addition, not in the README
- [ ] Row expand animation → [03-work.md](03-work.md) § Hover behavior (⚠ D2, E1) — depends on ProjectHoverService wiring
- [ ] Cursor-preview card → [cursor-preview.md](cursor-preview.md) (⚠ B1, B3) — depends on ProjectHoverService wiring
- [x] Clock → [clock.md](clock.md) (⚠ A2) — independent, do anytime (done 2026-08-05 with the footer)
- [ ] Lightbox → [lightbox.md](lightbox.md) (⚠ E2) — depends on gallery tiles; `@defer` + CDK

## 5 · Cross-cutting passes (after everything works)

- [ ] Reduced-motion pass: verify marquee/spin/pulse stop (CSS, `_reset.scss`) and magnetic/cursor-card/reveals are gated (MotionService); test with OS setting on
- [ ] Touch pass: `(hover: none)` disables magnetic + cursor card; rows navigate on tap; nothing requires hover
- [ ] A11y pass: keyboard-only walk of all 5 views; focus visible on every pill; row expand on focus (⚠ E1); lightbox trap/restore (⚠ E2); one `h1` per page; `aria-current` on nav
- [ ] Perf pass: hero as AVIF/WebP-with-alpha + PNG fallback (⚠ F2); Lighthouse on the BUILT output (`npx serve dist/analog/public`), LCP < 2.5s, CLS ≈ 0
- [ ] Replace `favicon.ico` (still the Analog default)
- [ ] Final build audit: 13 pages, every page has correct `<title>`, no hydration warnings in console

## 6 · Deploy

- [ ] Cloudflare Pages: build `npm run build`, output `dist/analog/public`, Node 24; connect repo, verify all 13 URLs + a hard refresh on a deep link (`/work/mundo`)

---

## Landmine legend

| ID | Short name | Detailed in |
|---|---|---|
| A1 | Browser APIs at construction/SSR time → `afterNextRender` | scroll-reveal.md, clock.md, cursor-preview.md, magnetic.md |
| A2 | Clock hydration mismatch → stable SSR placeholder | clock.md |
| A3 | Reveal styles must not hide prerendered HTML | scroll-reveal.md |
| A4 | Nested `<a>` in rows breaks hydration → stretched link | 03-work.md |
| A5 | No DOM mutation before hydration (`ngOnInit`) → `afterNextRender` | scroll-reveal.md |
| B1 | Never write signals per animation frame → direct DOM writes | cursor-preview.md |
| B2 | Zone pollution (moot when zoneless, discipline stays) | magnetic.md, cursor-preview.md |
| B3 | Teardown via `DestroyRef` — intervals, rAF, listeners, IO | all effect specs |
| B4 | Shared hover state = one root signal service | 03-work.md, cursor-preview.md |
| B5 | `@if`/`@for` + `track` only; no NgModules | all view specs |
| C1 | Prerender must enumerate slugs; data layer framework-free | vite.config.ts |
| C2 | Pages need `export default`; `index`/`[slug]` file conventions | pages/ |
| C3 | Slug via `withComponentInputBinding` + `input.required` | 04-project-detail.md |
| C4 | Scroll restoration via router, not `scrollTo` | app.config.ts |
| C5 | Dynamic `<title>` for [slug] via ResolveFn | 04-project-detail.md |
| D1 | `mix-blend-mode` dies in stacking contexts | 01-nav.md |
| D2 | Row expand: `grid-template-rows 0fr↔1fr`, not max-height | 03-work.md |
| D3 | Magnetic writes `--mx/--my`, never `style.transform` | magnetic.md, 07-footer.md |
| D4 | Sass `@use` only; tokens once; no `::ng-deep` | styles/, grid.md |
| D8 | Nav mobile sheet stays a SIBLING of `.nav` (blend context) | 01-nav.md |
| D9 | HISTORICAL (closed 2026-08-06). Symptom: nav frozen at the old width after a window drag (`innerWidth` 2329 vs `clientWidth` 1286) → overflow until reload. The original diagnosis ("fixed sizes against a stale ICB") was incomplete — the stale ICB was itself caused by the D10 scroll container. A JS cap (`--nav-max-width` from `documentElement.clientWidth`) compensated for the symptom; removed after D10 landed and drag-testing showed `innerWidth == clientWidth == scrollWidth` throughout | D10 |
| D10 | `overflow: hidden` creates a SCROLL CONTAINER — a clipped 6000px marquee stays scrollable overflow area and was what froze the viewport's scrolling region, and with it the ICB (the real cause behind D9's mis-sized nav). Use `overflow: clip` for decorative clipping, with `hidden` as the preceding fallback declaration | 02-home.md, hero.scss |
| G1 | Component host is the grid item → host needs `display: block` | grid.md |
| G2 | `_tokens`/`_grid` must stay output-free (no CSS emission) | grid.md |
| G4 | Placement mixins must out-specify `wrapper`'s `> *` default (emulated encapsulation makes it 0,3,0) — they emit a doubled class | grid.md |
| G3 | Declarations before nested `@include down(…)` (Sass mixed-decls) | grid.md |
| D5 | Weight 550 needs the variable font | _fonts.scss |
| D6 | CSS-columns masonry: DOM order + reserved aspect boxes | 06-gallery.md |
| D7 | Nav dot view-transition morph: unique name on active dot only, blend re-applied in the overlay, reduced-motion killed globally | 01-nav.md |
| E1 | Hover-only affordances need focus/touch equivalents | 03-work.md, 06-gallery.md |
| E2 | Lightbox a11y → CDK Overlay + FocusTrap + LiveAnnouncer | lightbox.md |
| E3 | One motion gate: CSS media block + MotionService | _reset.scss, motion.service.ts |
| E4 | RESOLVED: two-tier accent — small accent text uses `var(--accent-text)` | _tokens.scss |
| F1 | NgOptimizedImage: priority hero, width/height, honest `sizes` | 02-home.md, 05-about.md |
| F2 | 318KB cutout PNG is the LCP → AVIF/WebP-with-alpha | 02-home.md |
| F3 | Gallery originals stay OUT of `public/` (Vite copies it verbatim) and out of git | photos.md, .gitignore |
| F4 | `.rotate()` before resize, never `.withMetadata()` — orientation baked in, EXIF/GPS dropped | photos.md, scripts/photos.mjs |
| F5 | `ngSrcset` needs `provideImageLoader`; the default noop loader ignores width | photos.md, app.config.ts |
| F6 | Prune guard is per collection — never widen it to `public/images/` | photos.md, scripts/photos.mjs |
| F7 | Quality 55 is a photo setting; screenshots ring — per-collection quality, `--force` to re-encode | photos.md, scripts/photos.mjs |
