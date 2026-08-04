# Shared · Cursor preview card — `components/cursor-preview/cursor-preview.ts`

**Purpose.** A fixed card (project gradient + title) that lerps after the cursor while a project row is hovered. README § View 3 hover behavior 2. Rendered once in `app-root` (already in the shell), fed by `ProjectHoverService.hovered`.

## DOM & numbers

```
:host  fixed, left 0, top 0, z-index 70, pointer-events: none, will-change: transform
└─ div.card
```

- Card: `width: min(24vw, 330px)`, `aspect-ratio: 4/3`, radius 18px, background `coverGradient(project.hue)`, column-centered content: title 26px w600 white .95, category 11px/.16em/up/w600 white .7 margin-top 8px; `box-shadow: 0 30px 60px rgba(0,0,0,.18)`.
- Position: host `transform: translate3d(x + 30px, y − 110px, 0)` where x/y lerp toward the cursor at factor **.13 per frame** (`pos += (target − pos) × .13`).
- Show/hide: opacity 0↔1 (.28s ease) + scale .8↔1 (.38s `cubic-bezier(.2,.8,.2,1)`) — driven by whether `hovered()` is set. Content (gradient/title) comes from the same signal.

## Behavior

- `afterNextRender`, gated by `MotionService.finePointer && !reducedMotion` (touch devices: this component does nothing at all):
  - one `document`-level `mousemove` stores the target point in **plain fields**;
  - one rAF loop lerps and writes `style.transform` on the host.
- Initialize the lerp position to the first real cursor position (or viewport center like the prototype) so the card doesn't fly in from (0,0) on first hover.

## ⚠ LANDMINES

- **B1 — the frame loop never touches signals.** Target point, lerped point: plain class fields; per-frame output: direct `style.transform` write. Only *which project is hovered* is a signal (it changes a few times per minute, not 60×/s). A position signal here means change detection every frame — the single worst perf mistake available in this design.
- **B3** — `cancelAnimationFrame` + remove the mousemove listener in `DestroyRef.onDestroy`. The component lives in the app shell, so it survives navigations — the cleanup matters at app teardown and in tests, and the *hover reset on navigation* matters every time (B4: rows clear the signal; verify the card actually disappears when you click through to a detail page).
- Keep the rAF loop running only while it needs to (card visible or still lerping out) *or* accept an always-on loop like the prototype — an always-on loop that writes one transform is cheap; if you keep it, at least don't query the DOM in it.
- `pointer-events: none` on the host is load-bearing — without it the card blocks the row underneath from receiving hover, causing flicker loops.
