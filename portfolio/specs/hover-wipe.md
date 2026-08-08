# Shared · Directional hover wipe — `directives/hover-wipe.ts` + `styles/_hover-wipe.scss`

**Purpose.** The hover fill doesn't cross-fade — it grows as a circle out of the exact point the cursor entered, and collapses back toward the point it left. Attribute directive `[appHoverWipe]` + Sass mixin `hover-wipe.wipe($fill, $duration, $easing, $pressed-shadow)`.

Used on: intro "About me" (`.btn--primary`), "All work" (`.btn--secondary`), footer CTA circle, footer email pill. Sits **alongside** `[appMagnetic]` on the same hosts — the two directives write disjoint custom props (`--hx/--hy/--hd` vs `--mx/--my`), so they never fight over `transform`.

Not used on: `.hero__pill` (a status label, not interactive), `.link--*` (colour-only, nothing to fill), `app-circle-badge` (spins, no hover state).

## Behavior

- The fill is a **`::before` disc**, larger than the host and trimmed by `overflow: hidden` — not the host's `background`, which can't grow.
- The disc is **placed** with `left`/`top`/`width` (all instant) and **animated** with `transform: scale(0 → 1)` only. Keeping the origin out of the animated property is load-bearing, see the ordering landmine below.
- The **directive only writes geometry**: `--hx`/`--hy` (origin) and `--hd` (diameter), all in **px**, on `mouseenter` and `mouseleave`.
- Fallbacks `var(--hx, 50%)` / `var(--hd, 300%)` — without the directive (touch, reduced motion, SSR, no JS) the wipe still runs, just centre-out. Nothing ever renders unfilled.
- Duration .55s on `cubic-bezier(.4,0,.2,1)`; the host's own `color` transition gets a ~.1s delay so the label flips while the fill is passing under it, not before.
- Gate: `MotionService.finePointer && !reducedMotion`, listeners in `afterNextRender` (identical to magnetic).

## ⚠ LANDMINES

- **The origin must never be part of the animated property.** `[appHoverWipe]` has to call `getBoundingClientRect()`, and that forces a **synchronous style flush** — at a moment when `:hover` already matches but `--hx/--hy` still hold the *previous* entry point. So the transition always starts aimed at the stale origin, and only then does the directive write the new one. With the origin baked into an interpolated `clip-path: circle(r at x y)` that stale point animates: enter left, leave, re-enter right, and the fill still opens from the left the first time. With `left`/`top` it's an untransitioned jump that lands while `scale` is still ~0, i.e. invisible. (Known residual: re-entering *while the previous collapse is still running* jumps a partially-grown disc. Rare, and better than animating from the wrong side.)
- **Stacking context or the effect is invisible.** `z-index: -1` puts the `::before` *behind the host's own background* unless the host forms a stacking context. `isolation: isolate` in the mixin does that. The magnetic hosts already get one for free from their `transform` — don't rely on it, someone will delete that transform.
- **The mixin does NOT set `position`.** The host must already be positioned. `.footer__cta` is `position: absolute`; if the mixin emitted `position: relative` it would rip the CTA off its hairline. `.btn` / `.footer__pill--mail` declare `position: relative` themselves.
- **A fixed oversized disc makes the timing feel broken.** From a point entry, a disc big enough for the worst case covers the box well before the transition ends; the remainder is dead air and the whole thing reads as *snapping in far too fast*. Hence `--hd` = 2 × distance to the farthest corner, so coverage completes exactly as the transition ends. Keep the CSS fallback generous anyway; it only ever runs centred.
- **`$ease-hover` is the wrong curve here.** It front-loads almost the whole travel into the first third — layered on a circle's own r² coverage that's a double acceleration. Wipes want a gentle start and a decelerating end.
- **`aspect-ratio`, not `height: var(--hd)`.** A percentage height resolves against the *host's* height, so the fallback would be an ellipse on any non-square host.
- **Never `offsetX/offsetY`.** They're relative to `event.target`, which is the inner `<span>` whenever a button wraps its label — the origin would snap to the label's corner. Use `clientX − getBoundingClientRect().left`; the rect is already post-transform, so it's correct on magnetic hosts too.
- **`mouseenter`/`mouseleave` only, never `mousemove`.** Updating the origin continuously drags the disc around while it grows.
- **`:hover` must stop setting `background`.** Both `.btn` variants and the footer CTA used to swap the background on hover — leave that in and the base colour flips instantly, so the disc grows in its own colour and you see nothing. The hover rule keeps `color` / `border-color` only.
- **`:active` splits across two layers.** Painting order is: host background/border → negative-z pseudos → content. The pressed *tint* rides the disc (`&:active::before { background }`). The pressed *inner shadow* can't: on the host it paints under the disc, and on the disc itself it traces a rim that sits outside the host once filled. It gets its own `::after` overlay via `$pressed-shadow` — same `z-index`, later in DOM order, so it paints on top. `transform: scale(.98)` stays on the host (it must compose with `--mx/--my`, D3).
