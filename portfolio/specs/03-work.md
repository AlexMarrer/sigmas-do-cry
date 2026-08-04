# 03 · Work — `pages/work/index.page.ts` + `components/project-rows/project-rows.ts`

**Purpose.** The Work page (title + all 9 rows) and the shared row-list component used by Home (4 featured) and Work (9). README § View 3; screenshot `02-work.png`.

## Work page

- Section light, padding `clamp(140px,18vw,220px) 0 clamp(70px,9vw,120px)`; header block padded by gutter.
- Title `Work⁽⁹⁾`: `clamp(60px, 10vw, 150px)`, w550, ls −0.035em, lh .95; `<sup>` `(9)` at `.22em`, `var(--accent-text)` (E4 — it's ~13px on mobile), w600, margin-left 16px — **count from `projects.length`**.
- Sub-label margin-top 26px: "CLIENT & SIDE PROJECTS — 2021 → 2025", 12px/.16em/up/w600/op .55.
- Rows: `<app-project-rows [projects]="projects">`, margin-top `clamp(40px,6vw,70px)`.
- (README notes a grid-cards variant of this page — optional, skip until everything else is done.)

## Project rows component

### Structure (per row)

```
div.rows (border-bottom: 1px var(--hairline); mouseleave ⇒ hover.clear())
└─ article.row ×N (border-top hairline; group hover/focus state)
   ├─ div.row-line
   │  ├─ span.num      "01"  (accent, tabular)
   │  ├─ a.title       [routerLink]="/work/{slug}"  ← the stretched link
   │  ├─ span.spacer   (flex 1)
   │  ├─ span.category CATEGORY (hidden ≤768)
   │  └─ span.year
   └─ div.detail (expandable)
      └─ div.detail-inner
         ├─ p description
         └─ span.links: [a "Live site ↗"] [a "GitHub ↗"] span "Case study →"
```

### Numbers (README § View 3)

- Row line: flex, gap `clamp(14px,2.6vw,36px)`, padding `clamp(22px,3vw,34px) var(--gutter)`.
- Number: 13px w700 `var(--accent-text)` (E4), min-width 26px, `font-variant-numeric: tabular-nums`. Title: `clamp(26px,3.6vw,56px)`, w550, ls −0.025em, lh 1.02. Category: 11px/.14em/up/w600/op .5. Year: 14px, op .6, tabular.
- Row hover/expanded background: `rgba(23,24,26,.05)`, transition .45s.
- Detail inner: padding `2px var(--gutter) clamp(22px,3vw,30px) calc(var(--gutter) + 26px + clamp(14px,2.6vw,36px))` (aligns under the title); description 16px, op .72, max-width 520px; link pills `9px 18px`, 13px w600, border `var(--hairline-strong)`, hover fills ink; "Case study →" 13px w600 `var(--accent-text)` (E4; it's a label, not a link — the row already navigates).
- Expand timing (asymmetric): open — size .65s `cubic-bezier(.3,.9,.25,1)`, opacity .5s ease **delay .12s**, translateY(12px→0) .6s `cubic-bezier(.2,.8,.2,1)` delay .12s. Close — size .5s, opacity .3s, transform .4s, no delays.

### States & interactions

1. `mouseenter` / `focusin` on a row ⇒ `ProjectHoverService.hovered.set(project)`; `mouseleave` on the whole list ⇒ `set(null)`. Expansion is *derived*: a row is open iff `hovered()?.slug === project.slug`. This one signal also drives the cursor-preview card (cursor-preview.md).
2. "Live site ↗"/"GitHub ↗" render **only if the URL exists** (`@if (project.liveUrl)`), `target="_blank" rel="noopener"`.
3. Whole row navigates to the detail page (via the stretched title link, below).

### Responsive

- ≤768: category hidden; row line wraps (`flex-wrap: wrap; row-gap: 4px`); title `clamp(22px, 7vw, 26px)`; detail-inner left padding back to plain gutter.

## ⚠ LANDMINES

- **A4 — do NOT make the row an `<a>`.** Rows contain the live/GitHub anchors; nested `<a>` is invalid HTML and the parser *re-parents* them when the prerendered page is parsed → the DOM no longer matches what Angular rendered → hydration error (NG0500). Stretched-link pattern instead: the **title** is the only row-level `<a routerLink>`; give it a `::after { position: absolute; inset: 0 }` over the (relatively positioned) row; lift the pill links above it with `position: relative; z-index: 1`. No click handlers, no `stopPropagation`, real crawlable links.
- **D2 — the expansion.** Not `max-height: 340px` (clips wrapped content on mobile, laggy close). CSS grid technique: `.detail { display: grid; grid-template-rows: 0fr; }` ⇒ open `1fr`; `.detail-inner { min-height: 0; overflow: hidden; }`. Transition `grid-template-rows` with the timings above; pair opacity/transform on the inner element.
- **E1 — keyboard parity.** Expansion must also trigger on focus (`focusin` on the row = the title link receiving focus). Without it, keyboard users never see descriptions or link pills. On touch (`hover: none`): no expansion, tap navigates.
- **B4** — the hover signal lives in `ProjectHoverService` (already stubbed). Also clear it on navigation, or the preview card is still visible when the detail page mounts.
- **B5** — `@for (project of projects(); track project.slug)`.

## Data / inputs

`projects = input.required<Project[]>()` (already stubbed). Row number = `01`-padded index (`String(i+1).padStart(2,'0')`) — display order, computed in the template/`computed`, not stored.
