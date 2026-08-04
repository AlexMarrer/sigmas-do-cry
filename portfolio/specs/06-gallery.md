# 06 · Gallery — `pages/gallery.page.ts`

**Purpose.** "Off the clock" — 3 trip groups with CSS-columns masonry of placeholder tiles, opening the lightbox. README § View 6; screenshot `05-gallery.png`.

## Structure & numbers

Section light, padding `clamp(140px,18vw,210px) var(--gutter) clamp(80px,10vw,130px)`, inner max-width 1400.

**Header** (`appScrollReveal`): label "GALLERY"; h1 "Off the clock" `clamp(54px, 8.5vw, 130px)`, w550, ls −0.035em, lh .96, margin-top .25em; intro paragraph margin-top 26px, 17px/1.6, op .65, max-width 520px.

**Trip group** ×3 (`data/trips.ts`), margin-top `clamp(70px,9vw,110px)`:
- Header row (`appScrollReveal`): border-top hairline, padding-top 22px, flex baseline gap 18px wrap — idx "01" 13px w700 `var(--accent-text)` (E4) tabular · h2 name `clamp(24px,3vw,42px)` w550 ls −0.02em · spacer · meta 11px/.16em/up/w600/op .5.
- Masonry: `column-width: 320px; column-gap: 18px`, margin-top 28px.
- Tile = `<button>` (opens lightbox): background `shot.tone`, `aspect-ratio: shot.aspect`, radius 16px, `break-inside: avoid`, margin-bottom 18px, `position: relative; overflow: hidden`, hover/`focus-visible` `scale(1.015)` .45s `cubic-bezier(.2,.8,.2,1)`; caption abs left 16 / bottom 13, white .9, 12px w550 ls .02em; number abs right 16 / top 13, white .55, 11px tabular.

## States & interactions

- Lightbox state lives **here**: `readonly lightbox = signal<{ trip: number; index: number } | null>(null)` — page-local (it dies with the page; no service, unlike the hover state which is cross-component).
- Tile click/Enter ⇒ `lightbox.set({trip, index})`; everything else in lightbox.md.
- `@defer (when lightbox() !== null)` around `<app-lightbox …>` — CDK stays out of the initial bundle until the first open.

## ⚠ LANDMINES

- **E1** — tiles are `<button type="button">`, not clickable `<div>`s (keyboard + AT). Reset button chrome in CSS; give them a `:focus-visible` outline — the scale alone isn't a focus indicator.
- **D6** — CSS columns order content down each column, so DOM order ≠ visual order; that's acceptable here (tab order stays logical per trip), but don't "fix" it by reordering data. When real photos land: every tile keeps its `aspect-ratio` box (space always reserved ⇒ no CLS from lazy loads) and images become `ngSrc` + width/height, lazy by default, `sizes="(max-width: 660px) 100vw, 320px"`.
- **B5** — `@for (trip of trips; track trip.name)`, inner `@for (shot of trip.shots; track shot.caption)`.
- Captions double as future `alt` text — they're already in the data; wire them when `<img>` replaces the tone `<div>` background.
