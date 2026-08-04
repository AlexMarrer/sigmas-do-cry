# 02 · Home — `pages/index.page.ts`

**Purpose.** Hero (marquee behind portrait) → dark intro with circle badge → selected work. README § View 2; screenshot `01-home.png`.

## Section 1 — Hero (light, 100vh)

### Structure

```
section.hero (min-height 100vh, overflow hidden, flex center)
├─ h1.visually-hidden       "Alex Uscata — Application Developer, Basel"
├─ div.marquee (abs, z1)    two identical tracks, second aria-hidden
├─ img hero-cutout (z2)     NgOptimizedImage
└─ div.hero-bar (abs bottom, z3)
   ├─ pill "Based in Switzerland" + pulsing dot   [appMagnetic]
   └─ right block "↳ Application Developer" / "WEB · APP · BACKEND"
```

### Numbers (README § View 2 + tokens)

- Marquee: positioned `top 54%; translateY(-50%)`; type = display token (`clamp(70px, 11.5vw, 200px)`, w600, ls −0.035em, lh 0.95); items `Alex Uscata` + dimmed `—` (opacity .25, w400), gap/padding-right `.45em`; animation `translateX(0 → −50%)` linear infinite, `var(--marquee-duration)` (26s, tweakable 10–60s); track `display: flex; width: max-content; will-change: transform`.
- Portrait: width `clamp(480px, 67vw, 1035px)`, `max-height 92vh`, `object-fit: contain`, margin-top 6vh, `filter: drop-shadow(0 30px 50px rgba(23,24,26,.22))`.
- Bottom bar: `bottom: 32px`, padding `0 var(--gutter)`; dark pill `13px 24px`, 14px w600, with 8px accent dot pulsing (opacity 1→.3→1, 2.4s); right block right-aligned, `margin-right: 150px` (clears the badge below), title 16px w700, label 11px/.18em/uppercase/op .55/w600.
- Entrance: fade/slide-up ~26px, `cubic-bezier(.2,.65,.3,1)`, staggered — portrait 1s @0s, marquee 1.1s @.15s, bottom bar 1s @.35s, all `animation-fill-mode: backwards`.

### ⚠ LANDMINES

- **F1** — this is the LCP. `ngSrc="/images/hero-cutout.png"` + `priority` + `width="1537" height="1023"` + `sizes="(max-width: 768px) 94vw, 67vw"`. `priority` emits the preload into the prerendered head; a sloppy `sizes` silently ships 2× the pixels.
- **F2** — 318KB transparent PNG: generate an AVIF/WebP-with-alpha variant (typically −60–80%), `<picture>` or ngSrc with the new file; keep the drop-shadow in CSS.
- Marquee seam: the second track is a *duplicate* with `aria-hidden="true"`; `−50%` only loops seamlessly if both tracks are identical.
- `overflow: hidden` on the **hero section only** — never on `body` (kills sticky/fixed behavior).
- Entrance animation is pure CSS ⇒ SSG-safe and reduced-motion-safe via the global `_reset.scss` block. No JS.

## Section 2 — Intro (dark)

### Structure & numbers

- `section.theme-dark`, `position: relative`, padding `clamp(90px,12vw,170px) var(--gutter) var(--section-pad)`.
- `<app-circle-badge>` absolutely at `top: −64px; right: var(--gutter)`, 128px — straddles the boundary (section must NOT get `overflow: hidden`). Badge: accent circle, spinning SVG (`viewBox 0 0 100 100`, circular path r=38, text 8.6px, ls .14em, white, w600, "ALEX USCATA — SOFTWARE DEVELOPER —", CSS `rotate 360°` 18s linear infinite), centered `↓` 22px. `[appMagnetic]`.
- Grid `1.5fr .9fr`, gap `clamp(32px,5vw,80px)`, max-width `var(--max-width)` centered.
- Statement: `clamp(26px, 3.3vw, 52px)`, w500, lh 1.18. Support column: 17px/1.65, op .7, column-gap 26px, padding-top 10px.
- "About me" outline pill `[appMagnetic]` `[routerLink]="'/about'"`: border `var(--hairline-strong)` (dark variant), padding `14px 28px`, 15px w600; hover fills `#EFECE7`, text `#17181A` (.3s).
- Badge sizes at breakpoints: ≤922 → 104px/top −52; ≤768 → 88px/−44; ≤360 → 76px/−38.

### ⚠ LANDMINES

- SVG `textPath` needs `href="#some-id"` — the `id` must be unique per page; fine here (badge appears once), but don't copy the badge elsewhere without namespacing the id.
- Badge spin + pulse are CSS keyframes — covered by the global reduced-motion kill; nothing to do, just don't reimplement them in JS.

## Section 3 — Selected work (light)

- Padding `var(--section-pad) 0 clamp(70px,9vw,120px)`; label row padded by gutter, margin-bottom 28px: "SELECTED WORK" 12px/.16em/up/w600/op .55 with `/ 04` in `var(--accent-text)` (E4 — 12px); right link "All projects →" 13px w600 op .6, hover `var(--accent-text)`.
- `<app-project-rows [projects]="featured">` — the 4 `featured` projects (derive with a `computed`/const from `data/projects.ts`; **count derived from the array**, not hardcoded).
- Centered pill "All work 9" `[appMagnetic]` `[routerLink]="'/work'"`, margin-top 56px: dark bg, padding `18px 34px`, 15px w600; count 13px op .55; hover → accent background.

### Responsive

- ≤768: portrait 94vw, margin-top 2vh; right hero block `margin-right: 0`; intro grid → 1 column (gap 38px).

## Data / inputs

`projects` (featured slice) from `data/projects.ts`. All copy is verbatim in the prototype — lift it from there.

Scroll reveals: intro grid, selected-work label row and each row get `appScrollReveal` (see scroll-reveal.md) — hero does **not** (it has its own entrance).
