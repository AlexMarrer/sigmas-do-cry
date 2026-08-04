# Shared · Scroll reveal — `directives/scroll-reveal.ts`

**Purpose.** Fade/slide-in of sections on first scroll into view. README § Interactions: IntersectionObserver, threshold .12, `translateY(34px) + opacity`, .8s `cubic-bezier(.2,.65,.3,1)`. Attribute directive: `<div appScrollReveal>` — never copy-pasted per component.

## Behavior

1. In the **browser only** (`afterNextRender`): if the element's top is already above ~86% of the viewport height (prototype: `rect.top > innerHeight * .86` decides *hidden*), do nothing — it's visible content, leave it alone.
2. Otherwise set the hidden state (`opacity: 0; transform: translateY(34px)`) + the transition, and `observe()` it.
3. On intersection (threshold .12): remove the hidden state, `unobserve` — reveals run once, no re-hiding on scroll-up.
4. `MotionService.reducedMotion` ⇒ skip entirely (content just is visible).

## ⚠ LANDMINES

- **A3 — never put the hidden state in a stylesheet.** `[appScrollReveal] { opacity: 0 }` in CSS means the prerendered HTML is invisible to crawlers, no-JS visitors, and everyone during the pre-hydration window. Hidden state is applied *by the directive, in the browser, after hydration* — the static HTML always ships visible.
- **A5** — that also means: not in `ngOnInit` (runs before hydration completes and mutates DOM Angular is still matching) — `afterNextRender` is the only correct hook.
- **A1** — `IntersectionObserver` referenced at module/constructor level crashes the prerender build. Inside `afterNextRender` you're safe.
- **B3** — `DestroyRef.onDestroy(() => observer.disconnect())` — directives die on every route change; a leaked IO holds detached DOM.
- Implementation freedom: per-directive IO instance is fine at this scale (~15 elements/page); a shared-IO service is a refactor for later, not a requirement.
- Don't put it on the hero (it has its own CSS entrance) or on anything above the fold on load — rule 1 handles most of it, but placement per the view specs.
