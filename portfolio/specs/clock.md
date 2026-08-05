# Shared · Local clock — `components/footer/local-clock.ts`

**Purpose.** "HH:MM · Basel" in the footer bottom bar, Europe/Zurich, refreshed every 20s. README § View 7.

## Behavior

- `readonly time = signal('–:–')` — that placeholder is what the server renders into all 13 static pages.
- In `afterNextRender`: format immediately (first real value appears right after hydration), then `setInterval(tick, 20_000)`; `DestroyRef.onDestroy(() => clearInterval(id))`.
- Format: `new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' }).format(new Date())` — construct the formatter **once**, reuse it in the tick.
- Template: `{{ time() }} · Basel`, `font-variant-numeric: tabular-nums` (footer styles).

## ⚠ LANDMINES

- **A2 — this is the hydration-mismatch poster child.** If the server renders a real time (build time!) and the client another, hydration fails (NG0500) on every page since the footer is global. The stable placeholder + browser-only first write is the whole fix. Never call `new Date()` in the template or in a `computed` that runs during SSR.
- **A2 addendum (found 2026-08-05):** `afterNextRender` was NOT skipped during the Analog prerender in this zoneless setup — the build time got baked into all 13 pages. The component additionally guards with `isPlatformBrowser(inject(PLATFORM_ID))` in the constructor; that guard is load-bearing. Assume the same for every other "browser-only via afterNextRender" effect and verify against the BUILT output, not just the dev server.
- **A1** — `setInterval` in a constructor/field initializer would also run during prerender (and leak in Node). `afterNextRender` only.
- **B3** — clear the interval via `DestroyRef`; the footer is app-level, but tests and future layout changes shouldn't inherit a ticking leak.
- Zoneless note: the signal write *is* the change-detection trigger — exactly why the state must be a signal, not a mutated field.
- The `–:–` placeholder flashes for a frame post-load; that's intended (and what the design's own "updates every 20s" tolerance implies). Don't "fix" it by rendering server time.
