# Handoff: Alex Uscata — Personal Portfolio

## Overview
Personal portfolio website for Alex Uscata, application developer from Basel. Style heavily inspired by dennissnellenberg.com: minimal, calm, elegant — generous whitespace, oversized typography, smooth motion, alternating light/dark sections, pill-shaped buttons, subtle micro-interactions.

5 views in one design: Home, Work (project list), Project detail (one template for 9 projects), About, Gallery (travel photos with lightbox).

## About the Design Files
The file in this bundle (`Alex Portfolio.dc.html`) is a **design reference created in HTML** — a prototype showing intended look and behavior, NOT production code to copy directly. The task is to **recreate this design in a real codebase** using your chosen stack and its established patterns. The prototype's internal templating (`{{ }}` holes, `sc-for`/`sc-if` tags, logic class) is prototype infrastructure — ignore it; the visual/behavioral spec below is the source of truth.

**Explicit request from the designer/owner:** produce an implementation **plan first** (component structure, tech choices, performance considerations) before writing any code. Do not auto-generate the whole site.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy and interactions are final intent. Recreate pixel-perfectly. Placeholder content (project data, gallery photos, live-site links, LinkedIn URL, CV file) will be replaced by the owner — build so content is data-driven and easy to swap.

## Design Tokens

### Colors
- Light background: `#EFECE7` (warm off-white)
- Dark background / primary ink: `#17181A`
- Light text on dark: `#EFECE7`
- Accent: `#C6402E` (red — used as ONE strong accent per section; alternates in tweaks: `#3050D8`, `#1F6B56`, `#B4690E`)
- Hairline borders: `rgba(23,24,26,.14)` on light, `rgba(239,236,231,.16–.3)` on dark
- Project cover placeholders: per-project OKLCH gradient `linear-gradient(135deg, oklch(71% 0.055 H), oklch(42% 0.095 H))` with a per-project hue H
- Selection: dark bg, light text

### Typography
- Single family: **Hanken Grotesk** (Google Fonts), weights 300–800, `-webkit-font-smoothing: antialiased`
- Display (hero marquee): `clamp(70px, 11.5vw, 200px)`, weight 600, letter-spacing −0.035em, line-height 0.95
- Page titles (Work/About/Gallery/Project): `clamp(50–60px, 7.5–10vw, 110–150px)`, weight 550, letter-spacing −0.035em
- Project row titles: `clamp(26px, 3.6vw, 56px)`, weight 550, letter-spacing −0.025em
- Body: 17px, line-height 1.65
- Small labels: 11–12px, uppercase, letter-spacing .14–.18em, weight 600, ~50–55% opacity
- Numbers/years: `font-variant-numeric: tabular-nums`

### Spacing & Radii
- Page gutter: `clamp(20px, 5vw, 72px)`
- Section padding vertical: `clamp(80px, 10vw, 140px)` (variants up to 170px)
- Max content width: 1400px, centered
- Pills/buttons: `border-radius: 999px`, padding ~14–18px × 24–34px
- Cards/images: 16–26px radius

### Breakpoints
- `≤922px`: 2-column grids collapse to 1 column; circle badge shrinks
- `≤768px`: mobile — smaller nav pills, hero image 94vw, project rows wrap, category label hidden, reduced indents
- `≤360px`: extra-small tuning (320px target)
- Desktop reference: 1440px+

## Screens / Views

### 1. Navigation (all pages)
- Fixed top bar, full width, `padding: 18px gutter`
- Left: "© Alex Uscata" (16px, weight 700); right: Home / Work / About / Gallery as pills (15px, padding 9px 16px)
- **Signature technique: `mix-blend-mode: difference` with white text** — nav automatically inverts over light and dark sections. No scroll listener, no JS. Hover: `rgba(255,255,255,.16)` pill background. Active page: 4px white dot centered under the pill.

### 2. Home
**Hero (100vh, light):**
- Centerpiece: transparent-cutout portrait PNG (`uploads/hero-cutout.png`), width `clamp(480px, 67vw, 1035px)`, max-height 92vh, `drop-shadow(0 30px 50px rgba(23,24,26,.22))`, z-index above marquee
- **Signature element:** name marquee running horizontally BEHIND the portrait — "Alex Uscata — Alex Uscata — …", display size (see tokens), infinite CSS `translateX(0 → −50%)` loop, duration tweakable 10–60s (default 26s). Duplicate the track for a seamless loop. Vertically centered at 54% of hero.
- Bottom bar: left — dark pill "Based in Switzerland" with pulsing accent dot (2.4s opacity loop); right — "↳ Application Developer" + "WEB · APP · BACKEND" label (right-aligned, margin-right 150px on desktop to clear the circle badge below)
- Entrance: portrait and marquee fade/slide up (~1s, cubic-bezier(.2,.65,.3,1), staggered 0/.15s/.35s)

**Intro section (dark `#17181A`):**
- Straddling the light/dark boundary, right-aligned: 128px accent circle badge with rotating circular SVG text "ALEX USCATA — SOFTWARE DEVELOPER —" (18s linear spin) and a ↓ in the center. Positioned `top: −64px; right: gutter`.
- 2-col grid (1.5fr/.9fr): large statement (clamp(26–52px), weight 500, lh 1.18) + supporting paragraph and "About me" outline pill (hover: fills light, text dark)

**Selected work (light):**
- Label row: "SELECTED WORK / 04" + "All projects →"
- 4 featured project rows (same behavior as Work page, below)
- Centered dark pill "All work 9" (hover: accent bg)

### 3. Work
- Title "Work⁽⁹⁾" (superscript count in accent), sub-label "CLIENT & SIDE PROJECTS — 2021 → 2025"
- **Project rows** (border-top hairlines): number (accent, 13px) · title (large) · spacer · CATEGORY label · year
- **Hover behavior (two combined effects):**
  1. Row expands smoothly: detail area animates `max-height 0 → auto(~340px)` + `opacity/translateY(12px)` fade-in delayed ~.12s; expand ~.65s `cubic-bezier(.3,.9,.25,1)`, collapse faster (~.5s). Background tints `rgba(23,24,26,.05)`. Revealed: one-line description + pill links "Live site ↗" / "GitHub ↗" (only if they exist) + "Case study →" in accent.
  2. **Cursor-following preview card:** fixed-position card (min(24vw, 330px), 4/3, radius 18px, project gradient + title) follows the mouse with lerp smoothing (factor ~0.13 per frame, requestAnimationFrame), offset +30px/−110px from cursor, scales .8→1 and fades in/out .28–.38s. Pointer-events none.
- Whole row clicks through to the project detail. Link pills use stopPropagation.
- Alternative grid layout exists as a variant (cards 4/3 with gradient covers).

### 4. Project detail (template ×9)
- "← ALL WORK" back link, huge title, short description (max 560px)
- Meta grid (auto-fit, min 200px, border-top hairlines): Role / Tech stack (outline pill tags) / Year / Links (accent pill "Live site ↗", outline "GitHub ↗")
- Full-width cover placeholder (16/8.5, radius 26px, project gradient, project name centered)
- Case study: 2-col ("CASE STUDY" label / 3 paragraphs, max 760px)
- Screenshot placeholders: first spans full width (16/9), then 4/3 cards, tinted `oklch(90% 0.022 H)` bg with `oklch(42% 0.07 H)` labels
- **Next project footer (dark):** "NEXT PROJECT" label, huge next-project title (hover: accent), counter "05 / 09". Cycles through all 9.

### 5. About
- 2-col: left — "ABOUT ME" label, "Hoi, I'm Alex." title, 3 warm bio paragraphs, buttons: accent pill "Download CV ↓" (file to be provided) + outline pill "See the gallery"; right — portrait photo (3/4, radius 22px) with small caption
- Toolbox: 4 groups (Backend: C#, ASP.NET Core, Java, Spring Boot, PHP · Frontend: Angular, Ionic, TypeScript · Databases: MSSQL, PostgreSQL, MongoDB · CMS & Web: Craft CMS, REST APIs, CI/CD) as outline pill tags under hairline-topped columns
- Contact: full-width hairline rows — Email `alex@uscata.com`, GitHub `github.com/AlexMarrer`, LinkedIn (placeholder URL), Location "Basel, Switzerland". Row hover: text → accent.

### 6. Gallery
- Title "Off the clock", 3 trip groups (Bernese Oberland / Lisbon / Tokyo), each: hairline header (number, name, meta) + **CSS masonry** (`column-width: 320px; column-gap: 18px`), tiles with mixed aspect ratios (3/4, 4/3, 1/1, 16/11), radius 16px, caption bottom-left, number top-right, hover scale 1.015
- **Lightbox:** fixed overlay `rgba(15,16,18,.95)`, centered image, caption + "TRIP · n / total", circular outline prev/next/close buttons, keyboard: Esc/←/→, click-outside closes

### 7. Footer (all pages, dark)
- Small round portrait + "GOT A PROJECT IN MIND?" label
- Huge "Let's build something together"
- Hairline with overlapping **accent circle CTA "Get in touch"** (clamp(122px,12vw,164px), sits on the line via translateY(−50%); hover: inverts to light)
- Pill row: `alex@uscata.com` + "Basel, Switzerland"
- Bottom bar: © 2026 Alex Uscata · **live local time** "HH:MM · Basel" (Intl.DateTimeFormat, Europe/Zurich, updates every 20s) · GitHub / LinkedIn / Email links (hover: accent)

## Interactions & Behavior — summary for the implementation plan
| Effect | Technique | Cost |
|---|---|---|
| Nav color inversion | `mix-blend-mode: difference` (pure CSS) | free |
| Name marquee | CSS keyframes translateX, duplicated track | free (GPU) |
| Scroll reveals | IntersectionObserver, threshold .12, translateY(34px)+opacity, .8s | cheap |
| Magnetic buttons | mousemove → translate toward cursor (×.25/.35), spring back via transition .35s | cheap; desktop only |
| Cursor preview card | rAF lerp (.13), `translate3d`, pointer-events:none | cheap |
| Row expand | max-height + opacity/transform, asymmetric durations | cheap |
| Badge text spin | SVG textPath + CSS rotate 18s | free |
| Availability dot | CSS opacity pulse | free |

Best-practice notes: respect `prefers-reduced-motion` (disable marquee/spin/magnetic), disable cursor-preview and magnetic effects on touch devices, lazy-load gallery images, use real `<a>` routes per page (SSG-friendly — Astro/Next static export are natural fits), keep hero cutout PNG optimized (currently ~311KB) and preload it.

## State Management
- Current route (5 views), hovered project (drives row expansion + preview card), lightbox {trip, index}, clock string. All local UI state — no store needed.
- Projects, trips, skills as plain data arrays (see prototype logic for full placeholder dataset).

## Assets
- `uploads/hero-cutout.png` — transparent hero portrait (1537×1023, provided by owner)
- `uploads/rice.jpg` — About-page + footer portrait (owner-provided; to be replaced)
- Hanken Grotesk via Google Fonts
- All project covers/screenshots and gallery photos are placeholders (gradients/tones) — real assets pending

## Screenshots
Reference captures in `screenshots/`: 01-home, 02-work, 03-project-detail, 04-about, 05-gallery.

## Files
- `Alex Portfolio.dc.html` — the full design reference (all 5 views, all data, all effects)
