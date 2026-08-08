# Grid & breakpoints — `styles/_grid.scss` + `styles/_tokens.scss`

**Purpose.** One shared page frame: full-bleed section backgrounds with content
boxed to the design's max width, expressed as Sass mixins so every component
places itself the same way. Formalises what the design does implicitly — it is
**not** a 12-column system (the design doesn't align to one).

**Status: built.** First consumer is the nav (`01-nav.md`); every section
component should adopt it as it gets built.

## The frame

```
[full-start]    minmax(gutter, 1fr)     ← fluid margin, grows on wide screens
[content-start] minmax(0, 1400px)       ← the content column
[content-end]   minmax(gutter, 1fr)
[full-end]
```

- Gutter: `tokens.$gutter` = `clamp(20px, 5vw, 72px)` — also exposed as
  `var(--gutter)` for non-grid uses (padding etc.).
- Max content width: `tokens.$max-width` = `1400px`.
- **Zero media queries** — `clamp` + `minmax` cover every viewport. Above
  ~1544px (1400 + 2×72) the content column stops growing and centers; the
  gutters absorb the rest. That's the intended ultrawide behavior, no extra
  breakpoint needed.

## Mixins

| Mixin | Effect |
|---|---|
| `wrapper` | The 3-column frame. Direct children land in the **content column by default** (`> *` rule) — only exceptions need a placement mixin. |
| `full-block` | Child spans `full-start / full-end` (edge to edge). |
| `overlap-left-block` | `full-start / content-end` — bleeds left only. |
| `overlap-right-block` | `content-start / full-end` — bleeds right only. |

## Usage (root-class convention)

Section components apply `wrapper` on their root element — the root is then
full-width (put the section background / `theme-dark` there) and its children
are automatically content-aligned:

```scss
@use '../../../styles/grid'; // pages: ../../styles/grid

.footer {
  @include grid.wrapper;
}

.footer__marquee {
  @include grid.full-block; // edge-to-edge exception
}
```

A `full-block` child that needs aligned content *inside* applies `wrapper`
again itself — each grid is independent, the named lines don't collide.

Inner section layouts (the 2-col `1.5fr/.9fr` splits, `auto-fit` meta grids,
gallery masonry) are **not** grid.scss's business — they stay section-specific
per the view specs.

## Breakpoints

SCSS-only (media queries can't read custom props): `tokens.$bp-*` plus the
`tokens.down($bp)` max-width mixin.

| Token | Value | What changes (README § Breakpoints) |
|---|---|---|
| `$bp-md` | 922px | 2-col grids collapse to 1; circle badge shrinks |
| `$bp-sm` | 768px | Mobile: burger nav + sheet (01-nav, ⚠ D8), hero 94vw, rows wrap, category label hidden |
| `$bp-xs` | 360px | Smallest tweaks |

```scss
.hero__grid {
  display: grid;
  grid-template-columns: 1.5fr 0.9fr;

  @include tokens.down(tokens.$bp-md) {
    grid-template-columns: 1fr;
  }
}
```

- **Open decision (2026-08-05):** 320px was floated as the smallest breakpoint;
  README and tokens say 360px. If 320 wins, change `$bp-xs` here and note the
  deviation — don't fork a second token.
- **Ultrawide `$bp-xl` = 2560px (added 2026-08-05).** From ~1544px the frame
  freezes (content 1400px, gutters absorb); at ≥2560 the content column goes
  `$max-width-xl` = `calc(100% - Xrem)` — effectively full width, where X is the
  two side gutters combined (the `1fr` tracks split it evenly, half per side).
  Tune X by eye in `_tokens.scss`; it is not a design-spec number.
  Mechanism: the wrapper's content track is `minmax(0, var(--max-width, 1400px))`
  and **one** `:root` override in `styles.scss` bumps `--max-width` — no media
  query is emitted into component styles. `up()` mixin exists alongside `down()`.
  ⚠ The 1400 → ~2240 jump at the boundary is deliberate (owner call). Type
  stays clamped, so line lengths grow with the column — if xl ever needs bigger
  type, that's a separate decision, not more width.
- **Still no 1440 token.** Between 1544 and 2560 the automatic behavior stands;
  add a token only when a component actually needs one.

## Token architecture (⚠ the output-free rule)

`_tokens.scss` and `_grid.scss` must contain **only variables and mixins — no
CSS output**. Component styles `@use` them, and every component stylesheet is
its own Sass compilation: any emitted CSS would be duplicated into each one
(as dead `:root[_ngcontent-…]` rules). The runtime layer (`:root { --bg: … }`)
is emitted **once, in `styles.scss`**; `.theme-dark` (`_themes.scss`, global)
flips it per section.

## ⚠ LANDMINES

- **G1 — the component host is the grid item.** When a page's root has
  `wrapper` and a child is a component (`<app-footer />`), the *host element*
  sits in the grid, not the root div inside it. Hosts are unknown elements →
  `display: inline` by UA default: give the host `display: block`, and if the
  component needs `full-block`-style placement from outside, it must go on the
  host. Simplest rule: sections apply `wrapper` themselves and are plain
  block-level children from the outside.
- **G2 — keep `_tokens.scss` / `_grid.scss` output-free** (see above). If a
  component ships `:root[_ngcontent-…]` rules, someone re-added CSS output to a
  shared partial.
- **G3 — Sass mixed-decls:** inside a rule, put all declarations *before* any
  `@include tokens.down(…)` block. Declarations after a nested rule are
  deprecated in Dart Sass and will start warning.
