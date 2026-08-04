# 07 · Footer — `components/footer/footer.ts`

**Purpose.** Dark closing section on every page: big CTA + circle button on a hairline, contact pills, bottom bar with the live clock. README § View 7.

## Structure & numbers

`<footer class="theme-dark">`, padding `clamp(90px,12vw,160px) var(--gutter) 30px`, inner max-width 1400 centered.

1. **Intro row** (`appScrollReveal`): round portrait `rice.jpg` 52×52, `border-radius: 50%`, `object-position: 58% 12%` + label "GOT A PROJECT IN MIND?" 13px/.14em/up/w600/op .6, gap 20px.
2. **Headline**: "Let's build something together", `clamp(46px, 7.5vw, 116px)`, w550, ls −0.035em, lh 1.02, `max-width: 12em`, margin-top 26px. (It's an `<h2>` — the page's `h1` belongs to the routed view.)
3. **Hairline + CTA circle**: wrapper `position: relative`, margin-top `clamp(56px,8vw,100px)`; hairline `border-top: 1px rgba(239,236,231,.22)`; `<a href="mailto:…">` circle: absolute, `right: clamp(8px, 8vw, 120px); top: 0; transform: translateY(-50%)`, width `clamp(122px, 12vw, 164px)`, `aspect-ratio: 1`, radius 50%, accent bg, white, 16px w600, centered text "Get in touch"; hover inverts (light bg, ink text, .35s). `[appMagnetic]`.
4. **Pill row**: margin-top `clamp(56px,8vw,96px)`, gap 14px — `alex@uscata.com` mailto pill (outline `--hairline-strong`, `16px 28px`, 16px w550, hover fills light/ink, `[appMagnetic]`) + "Basel, Switzerland" pill (outline `--hairline` .16, op .7, w500, not interactive).
5. **Bottom bar**: margin-top `clamp(70px,9vw,110px)`, border-top `rgba(239,236,231,.14)`, padding-top 26px, flex wrap space-between gap 26px:
   - "VERSION" micro-label (10px/.18em/up/w600/op .4) over "© 2026 Alex Uscata" (14px, op .85, margin-top 7px).
   - "LOCAL TIME" micro-label over `<app-local-clock>` (14px, op .85, tabular) — see clock.md.
   - Links GitHub / LinkedIn / Email, gap 22px, 14px, op .85, hover → `var(--accent-text)` (E4 — this is the dark side, where plain accent is only 3.53:1; `.theme-dark` already swaps the var).

## ⚠ LANDMINES

- **D3 — the CTA circle is THE magnetic trap.** Its resting position depends on `transform: translateY(-50%)`. A magnetic directive that assigns `style.transform` teleports it onto the line. This is why the directive writes `--mx/--my` and the circle's own CSS composes: `transform: translateY(-50%) translate(var(--mx, 0px), var(--my, 0px))`. If you implement magnetic before the footer, test it *here* first.
- **A2** — the clock is its own component so the footer stays static-renderable; don't inline `new Date()` anywhere in this template.
- The footer sits inside `.theme-dark` — style with `var(--ink)`/`var(--hairline)` and it needs zero dark-specific rules (D4).
- The portrait is 52px — don't ship the 1.2MB original; a dedicated small crop or the same resized asset as About (F1).
