# 05 · About — `pages/about.page.ts`

**Purpose.** Bio + portrait, toolbox pill groups, contact rows. README § View 5; screenshot `04-about.png`. All copy verbatim from the prototype.

## Structure & numbers

Section light, padding `clamp(140px,18vw,210px) var(--gutter) clamp(80px,10vw,130px)`, inner max-width 1400 centered.

**Bio grid** — `1.25fr .75fr`, gap `clamp(36px,6vw,90px)`; ≤922 → 1 column, gap 38px.
- Label "ABOUT ME" 12px/.16em/up/w600/op .55; h1 "Hoi, I'm Alex." `clamp(50px, 7.5vw, 110px)`, w550, ls −0.035em, lh .98, margin-top .3em.
- 3 paragraphs: `clamp(17px,1.5vw,20px)`, lh 1.7, op .85, max-width 640px; margins 36px (first) / 18px.
- Buttons row margin-top 40px, gap 14px, both `[appMagnetic]`:
  - "Download CV ↓" — accent bg, white, `16px 30px`, 15px w600, hover → ink bg. It's a `<button>` until the PDF exists (owner-provided); keep the prototype's `title` hint.
  - "See the gallery" — outline pill (`var(--hairline-strong)`), same padding, hover fills ink/light; `routerLink="/gallery"`.
- Portrait column: `rice.jpg`, `aspect-ratio: 3/4`, `object-fit: cover; object-position: 58% 16%`, radius 22px; caption margin-top 12px, 12px/.1em/up/w600/op .45.

**Toolbox** — margin-top `clamp(90px,12vw,150px)`; label; grid `repeat(auto-fit,minmax(230px,1fr))`, gap 28px, margin-top 26px. Group: border-top `rgba(23,24,26,.16)`, padding-top 18px; name 11px label style; pills `8px 16px`, 14px w550, gap 8px, margin-top 16px. Data: `data/skills.ts`, `@for … track group.name` / `track item`.

**Contact** — margin-top `clamp(90px,12vw,150px)`; label; list margin-top 22px with `border-bottom: var(--hairline)` on the container. Rows (`<a>` for email/GitHub/LinkedIn, `<div>` for Location): border-top hairline, padding `24px 2px`, flex baseline space-between wrap gap 20px; left label 11px/.16em/up/op .5; right value `clamp(20px,2.6vw,34px)`, w550, ls −0.01em with trailing ` ↗`; row hover → whole row text `var(--accent-text)` (E4 — the 11px labels are the constraint; .25s). Links: `mailto:alex@uscata.com`, `github.com/AlexMarrer`, LinkedIn placeholder — external ones `target="_blank" rel="noopener"`.

Scroll reveals: bio grid, toolbox block, contact block each get `appScrollReveal`.

## ⚠ LANDMINES

- **F1** — the portrait: `ngSrc` + real intrinsic `width/height` + `sizes="(max-width: 922px) 100vw, 37vw"`; keep `object-position` in CSS. It's below the fold → **no** `priority`, default lazy is right. `rice.jpg` is 1.2MB — resize/re-encode it (it renders ≤ ~520px wide); that's an easy 90% cut.
- Contact-row hover recolors the *row*; links already inherit color — just transition `color` on the anchor, don't fight encapsulation with inner selectors.
- The CV button is a placeholder for a file that doesn't exist yet — don't wire a dead `href="/cv.pdf"` (404 in prod, and crawlers find it); leave the `<button>` + TODO until the file lands.
