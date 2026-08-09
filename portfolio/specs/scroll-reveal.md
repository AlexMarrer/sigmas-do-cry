# Shared · Scroll reveal — `directives/scroll-reveal.ts` + `styles/_reveal.scss`

**Purpose.** Fade/slide-in of sections on first scroll into view. README § Interactions: IntersectionObserver, threshold .12, `translateY(34px) + opacity`, .8s `cubic-bezier(.2,.65,.3,1)`. Attribute directive: `<div appScrollReveal>` — never copy-pasted per component.

**Status: built** (2026-08-05). Wired on Home (intro grid, selected-work label row); remaining placements per the view specs as views get built.

## API

Visual variant = plain class in the template (pure CSS, `styles/_reveal.scss`).
Named after what they do, animate.style-style (`fadeInUp` → `fade-in-up`), kebab-cased:

| Class | Enters |
|---|---|
| `reveal--fade-in` | in place, opacity only |
| `reveal--fade-in-up` | from below, `translateY(34px)` (also the fallback without any variant class) |
| `reveal--fade-in-down` | from above |
| `reveal--fade-in-left` | from the left, `translateX(-34px)` |
| `reveal--fade-in-right` | from the right |
| `reveal--zoom-in` | `scale(0.94)` |

Timing/trigger = directive inputs → written as `--reveal-delay`/`--reveal-duration` custom props on the host (same pattern as magnetic's `--mx/--my`, D3):

| Input | Default | Meaning |
|---|---|---|
| `revealDelay` | `0` | ms before the transition starts — stagger via `[revealDelay]="i * 80"` |
| `revealDuration` | `800` | ms transition duration |
| `revealOffset` | `'0px'` | IO `rootMargin` bottom; `'-120px'` = trigger 120px later |
| `revealAlways` | `false` | skip rule 1 below — animate even when the element is already in view |

```html
<div class="intro__grid reveal--fade-in-up" appScrollReveal></div>
<article class="rows__item reveal--fade-in-up" appScrollReveal [revealDelay]="i * 80">…</article>
```

## Behavior

1. In the **browser only** (`afterNextRender`): if the element's top is already above ~86% of the viewport height, do nothing — it's visible content, leave it alone. `revealAlways` opts out (added 2026-08-09 for the gallery's "Show all": tiles created by a click were never on screen, so landing in view is not a reason to skip their entrance).
2. Otherwise write the custom props, add `.reveal--waiting` (hidden state) and `observe()`.
3. On intersection (threshold .12): swap `--waiting` for `--in` (carries the transition), disconnect — reveals run once, no re-hiding on scroll-up.
4. `MotionService.reducedMotion` ⇒ skip entirely (content just is visible).

## ⚠ LANDMINES

- **A3 — the hidden state must never match prerendered HTML.** It lives on `.reveal--waiting`, which only the directive adds, client-side, after hydration. Never write `reveal--waiting`/`reveal--in` in a template, and never attach hidden styles to `[appScrollReveal]` itself. Same rule bounds `revealAlways`: it is for elements that cannot be in the prerendered HTML (created on an interaction). On anything above the fold at load it makes content the user is already reading blink out and fade back in.
- **A5** — not in `ngOnInit` (mutates DOM Angular is still hydrating) — `afterNextRender` is the only correct hook.
- **A1** — `IntersectionObserver` referenced at module/constructor level crashes the prerender build. Inside `afterNextRender` you're safe.
- **B3** — `DestroyRef.onDestroy(() => io.disconnect())` — directives die on every route change; a leaked IO holds detached DOM.
- **Don't stack with magnetic.** `.reveal--waiting/--in` own `transform` — on a host that composes `--mx/--my` (D3) they'd stomp each other. Reveal wraps sections/rows; magnetic wraps pills. Keep them on different elements.
- `rootMargin` is per-observer, not per-element — per-element `revealOffset` only works because each directive instance owns its IO. Fine at this scale (~15 elements/page); a shared-IO service is a refactor for later, not a requirement.
- Don't put it on the hero (it has its own CSS entrance) or on anything above the fold on load — rule 1 handles most of it, but placement per the view specs.
