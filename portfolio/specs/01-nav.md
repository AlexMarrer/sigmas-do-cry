# 01 · Nav — `components/nav/nav.ts`

**Purpose.** Fixed top bar on every page that inverts its color over light/dark sections purely via `mix-blend-mode: difference` — zero JS, zero scroll listeners (README § View 1).

## Structure / DOM

```
:host (fixed bar, flex space-between)
├─ a[routerLink="/"]  "© Alex Uscata"
└─ div (pill group, flex)
   └─ a[routerLink] ×4  Home · Work · About · Gallery
      └─ span.dot (active indicator)
```

Real `<a routerLink>` everywhere — SSG needs crawlable links.

## Numbers (README § View 1 + prototype)

- Bar: `position: fixed; inset: 0 0 auto 0; z-index: 60`, padding `18px var(--gutter)`, `mix-blend-mode: difference; color: #fff` — **everything inside is white**; the blend does the inversion.
- Brand: 16px, weight 700, letter-spacing −0.01em.
- Pills: 15px, weight 500, padding `9px 16px`, radius `999px`; hover background `rgba(255,255,255,.16)` (transition .25s).
- Active dot: 4px white circle, absolutely centered under the pill (`left 50%; bottom 2px; translateX(-50%)`).

## States & interactions

- Active route: `routerLinkActive` — Home needs `[routerLinkActiveOptions]="{ exact: true }"`, the others match by subtree, which makes Work's dot light up on `/work/:slug` for free (the prototype needed a special case for that).
- Set `ariaCurrentWhenActive: 'page'` alongside `routerLinkActive`.
- Hover pill background; `:focus-visible` gets the same treatment (design shows no focus style — add one).

## Responsive (README § Breakpoints)

- ≤768px: pills `7px 11px`, 13px.
- ≤360px: pills `6px 8px`, 12px.

## Data / inputs

None. Nav links can be a small readonly array in the component.

## ⚠ LANDMINES

- **D1 — the blend mode is fragile.** `mix-blend-mode: difference` only blends against the backdrop if NO ancestor creates a stacking context (`transform`, `filter`, `opacity < 1`, `isolation`, `will-change`). Put the fixed+blend styles on `:host` itself, and keep `<app-nav>` a direct child of `app-root`'s template (it already is — don't "clean up" by wrapping it). If the nav ever renders plain white on the light hero, an ancestor grew a stacking context — that's the first thing to check.
- **D1b** — the blend needs a painted backdrop: sections must actually set `background` (the `.theme-dark` class and `body` background already do).
- **B5** — render the four links with `@for (link of links; track link.path)`.
