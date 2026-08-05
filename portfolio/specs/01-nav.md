# 01 · Nav — `components/nav/nav.ts` (+ `nav.html`, `nav.scss`)

**Purpose.** Fixed top bar on every page that inverts its color over light/dark sections purely via `mix-blend-mode: difference` — zero JS, zero scroll listeners (README § View 1).

**Status: built.** Template and styles live in sibling files (`nav.html` / `nav.scss`), wired via `templateUrl` / `styleUrls`. Classes follow BEM (`nav__brand`, `nav__pills`, `nav__pill`, `nav__pill--active`, `nav__dot`); measurements are in `rem` (16px base) except the `999px` full-pill sentinel and the `-0.01em` letter-spacing.

## Structure / DOM

```
.nav (fixed bar, grid.wrapper from styles/_grid.scss)
└─ .nav__bar (content column, flex space-between)
   ├─ a[routerLink="/"]  "© Alex Uscata"
   ├─ div (pill group, flex — hidden ≤768px)
   │  └─ a[routerLink] ×4  Home · Work · About · Gallery
   │     └─ span.dot (active indicator)
   └─ button.nav__burger (2-line burger → X, shown only ≤768px)
nav.nav-menu.theme-dark (@if menuOpen() — full-screen sheet, SIBLING of .nav)
└─ a[routerLink] ×4 (big type, active link in --accent-text)
```

Real `<a routerLink>` everywhere — SSG needs crawlable links.

## Numbers (README § View 1 + prototype)

- Bar: `position: fixed; inset: 0 0 auto 0; z-index: 60`, `grid.wrapper` + `padding-block: 18px` (horizontal spacing comes from the grid's gutter columns; `.nav__bar` sits in the content column, so brand/pills align with the boxed 1400px content on ultrawide screens), `mix-blend-mode: difference; color: #fff` — **everything inside is white**; the blend does the inversion.
- Brand: 16px, weight 700, letter-spacing −0.01em.
- Pills: 15px, weight 500, padding `9px 16px`, radius `999px`; hover background `rgba(255,255,255,.16)` (transition .25s).
- Active dot: 4px white circle, absolutely centered under the pill (`left 50%; bottom 2px; translateX(-50%)`).

## States & interactions

- Active route: `routerLinkActive` — Home needs `[routerLinkActiveOptions]="{ exact: true }"`, the others match by subtree, which makes Work's dot light up on `/work/:slug` for free (the prototype needed a special case for that).
- Set `ariaCurrentWhenActive: 'page'` alongside `routerLinkActive`.
- Hover pill background; `:focus-visible` gets the same treatment (design shows no focus style — add one).

### Active-dot morph (view transitions)

On route change the active dot *slides* from the old pill to the new one instead of fade-swapping. Driven by the Router's View Transitions API, not JS measurement:

- `provideFileRouter(…, withViewTransitions({ skipInitialTransition: true }))` in `app.config.ts` — `skipInitialTransition` avoids a transition on the SSG/hydration first paint.
- `view-transition-name: nav-dot` sits on `.nav__pill--active .nav__dot` (component scss) — **only the active dot**, so the name is unique and the browser can morph it (⚠ D7).
- Overlay tuning is global (`styles.scss`), nested under `:root`, because `::view-transition-*` pseudos originate on the document root and can't be component-scoped: the default full-page root fade is switched off (`animation: none`), the `nav-dot` group gets the slide easing (0.35s, `cubic-bezier(.2,.8,.2,1)`), and `mix-blend-mode: difference` is re-applied there so the lifted snapshot keeps inverting (⚠ D7).
- Reduced-motion kills the `::view-transition-*` animations in the one global E3 block (`_reset.scss`) — the `*` selector there does **not** reach these pseudos, so they're listed explicitly.

Degrades cleanly: browsers without view transitions (older Firefox) just snap the dot to the new pill, exactly like the pre-morph behaviour.

## Responsive (README § Breakpoints)

- ≤768px (`tokens.$bp-sm`): pills hidden; burger button (44px hit area, 2 white
  lines → X) toggles a full-screen `.nav-menu` sheet. **Deviation from the
  README** (which shrank the pills to 13px/12px at ≤768/≤360) — user decision
  2026-08-05. The old ≤360 pill-shrink rule is gone with the pills.
- Sheet: `position: fixed; inset: 0; z-index: 50` (below the bar's 60),
  `theme-dark` palette, links `clamp(2rem, 9vw, 3rem)`, active link colored
  `var(--accent-text)` (no dot — the morph stays desktop-only).
- Behavior: `menuOpen` signal; link/brand click closes; Escape closes and
  refocuses the burger; body gets `.u-no-scroll` (global, styles.scss) while
  open; focus moves onto the sheet (`tabindex="-1"`) when it renders;
  `aria-expanded`/`aria-controls` on the button.

## Data / inputs

None. Nav links can be a small readonly array in the component.

## ⚠ LANDMINES

- **D1 — the blend mode is fragile.** `mix-blend-mode: difference` only blends against the backdrop if NO ancestor creates a stacking context (`transform`, `filter`, `opacity < 1`, `isolation`, `will-change`). Put the fixed+blend styles on `:host` itself, and keep `<app-nav>` a direct child of `app-root`'s template (it already is — don't "clean up" by wrapping it). If the nav ever renders plain white on the light hero, an ancestor grew a stacking context — that's the first thing to check.
- **D1b** — the blend needs a painted backdrop: sections must actually set `background` (the `.theme-dark` class and `body` background already do).
- **B5** — render the four links with `@for (link of links; track link.path)`.
- **D8 — the mobile sheet must stay a SIBLING of `.nav`.** `.nav` carries
  `mix-blend-mode: difference`; a full-screen sheet *inside* that context would
  difference-invert against the whole page. As a sibling at `z-index: 50` it
  paints below the bar (60), and the bar's white brand + X blend against the
  dark sheet to near-white — that interplay is the design, don't "fix" the
  z-order. The sheet's entry animation uses `transform`, which is fine on the
  sheet itself but would be a D1 stacking-context bug on any ancestor.
- **D7 — the dot morph has three separate traps.** (1) `view-transition-name` must be unique at any instant — it belongs on `.nav__pill--active .nav__dot`, never on `.nav__dot` (four elements sharing a name aborts the whole transition). (2) The morphing snapshot is lifted into the top-level `::view-transition` overlay, *outside* the nav's `:host` blend context, so a plain white dot flashes pure white mid-morph; re-apply `mix-blend-mode: difference` on `::view-transition-group(nav-dot)` to keep it inverted against the page snapshot below it. (3) The `::view-transition-*` pseudos live on `:root`, not inside the component — their tuning and their reduced-motion kill go in the global layer, not `nav.scss`.
