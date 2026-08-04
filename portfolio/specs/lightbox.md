# Shared · Lightbox — `components/lightbox/lightbox.ts`

**Purpose.** Full-screen photo viewer for gallery tiles. README § View 6: overlay `rgba(15,16,18,.95)`, centered stage, caption + "TRIP · n / total", circular prev/next/close, Esc/←/→, click-outside closes.

## State & wiring

- Source of truth: the gallery page's `lightbox = signal<{trip; index} | null>` (see 06-gallery.md). This component receives the current trip/shot (inputs or a computed passed down) and emits close/step — or you host it via CDK `Dialog` with a data payload; either is fine, keep the state in the page.
- Wrap-around stepping: `(i + dir + n) % n`.
- `@defer (when lightbox() !== null)` in the gallery template keeps CDK out of the initial JS.

## DOM & numbers

- Backdrop: fixed inset 0, `rgba(15,16,18,.95)`, z-index 90 (CDK overlay container handles the layering), column-centered, padding `5vh 5vw`.
- Stage: background `shot.tone`, `aspect-ratio: shot.aspect`, `width: min(86vw, round(72 × shot.ratio)vh)` (the prototype's sizing — keeps the whole stage on screen for any ratio), radius 18px; placeholder label "PHOTO PLACEHOLDER" 11px/.22em/up/op .35 until real photos land.
- Caption row: caption 16px w550 + meta `"{trip.name} · {i+1} / {n}"` 12px/.14em/up/w600/op .5, light text, gap 16px.
- Buttons: prev/next 54px circles, abs left/right 26px vertically centered, `border: 1px rgba(239,236,231,.35)`, transparent bg, white, 20px, hover bg `rgba(239,236,231,.15)`; close 46px, top 26 / right 26, 17px.

## Interactions

- Esc closes; ← / → step (wrap). Backdrop click closes; clicks on stage/buttons must not (CDK: `overlayRef.backdropClick()` gives you this for free — hand-rolled, you'd be doing `stopPropagation` bookkeeping).
- Focus: initial focus → close button; Tab cycles inside; on close, focus returns to the tile that opened it.
- Announce on open/step via `LiveAnnouncer`: e.g. "Lisbon, photo 3 of 5 — Azulejos, Rua da Bica".

## ⚠ LANDMINES

- **E2 — use CDK, don't hand-roll.** The prototype's version (a fixed div) has: no focus trap (Tab lands on the page behind the overlay), no focus restore, background scrollable, global keydown that survives forever, no `role="dialog" aria-modal="true"`, arrow keys also scrolling the page. `@angular/cdk/overlay` (or `@angular/cdk/dialog`, which bundles trap + restore + aria) + `BlockScrollStrategy` covers every one. Keydown: `overlayKeydownEvents()` / `@HostListener('keydown', …)` inside the overlay component — scoped, auto-torn-down.
- **B3** — if you subscribe to overlay streams, `takeUntilDestroyed`. Dispose the `OverlayRef` when the signal goes null AND in `DestroyRef` (route-away while open).
- **A1** — the overlay only ever opens from a click, so it's browser-only by construction; just don't create the `Overlay` portal eagerly in a constructor.
- Buttons need `aria-label` ("Previous photo", "Next photo", "Close") — they're glyph-only.
- prev/next click must not re-trigger backdrop close *and* must keep focus inside the trap — CDK handles the latter; for the former, buttons live inside the overlay pane, not on the backdrop.
