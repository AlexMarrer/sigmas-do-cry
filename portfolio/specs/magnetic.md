# Shared · Magnetic buttons — `directives/magnetic.ts`

**Purpose.** Pills/circles lean toward the cursor and spring back. README § Interactions: translate toward cursor ×.25 (x) / ×.35 (y), spring back via transition .35s. Attribute directive `[appMagnetic]`.

> Deviation 2026-08-05: strength bumped to **×.35 (x) / ×.5 (y)** — the prototype's pull felt too weak. The README numbers above are the original reference.

Used on: hero "Based in Switzerland" pill, circle badge, intro "About me" pill, "All work 9" pill, About's two buttons, footer CTA circle + email pill.

## Behavior

- `mousemove` **on the host** (not `document` — the prototype only did that because its framework had no directives): `dx = (clientX − centerX) × .25`, `dy = (clientY − centerY) × .35`; on `mouseleave` reset to 0.
- The directive writes CSS custom properties: `host.style.setProperty('--mx', dx + 'px')` (and `--my`).
- The **component's CSS** owns the transform & spring: every magnetic element includes `translate(var(--mx, 0px), var(--my, 0px))` in its `transform` and `transition: transform .35s cubic-bezier(.2,.8,.2,1)`.
- Gate: only when `MotionService.finePointer && !reducedMotion`; attach listeners in `afterNextRender`.

## ⚠ LANDMINES

- **D3 — never assign `style.transform`.** The footer CTA circle rests on `translateY(-50%)`; overwriting `transform` teleports it. Custom props compose with whatever base transform the element has — that's the whole trick. (The prototype's `dataset.baseTf` bookkeeping is the smell you're avoiding.)
- **B2** — zoneless: mousemove can't trigger global change detection, so no `runOutsideAngular` needed — but keep the discipline: the directive touches style props only, never signals, per event.
- **A1/B3** — listeners attached in `afterNextRender`, removed via `DestroyRef` (or use host listeners that Angular tears down; either way nothing survives the element).
- `getBoundingClientRect` per mousemove is fine (it's one element, no loop) — don't cache it; the element moves with page scroll.
