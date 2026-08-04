# 04 · Project detail — `pages/work/[slug].page.ts`

**Purpose.** One template rendering all 9 projects, prerendered per slug, with a next-project footer cycling through the set. README § View 4; screenshot `03-project-detail.png`.

## Structure

```
section.light (padding clamp(130px,16vw,190px) gutter clamp(70px,9vw,110px); inner max-width 1400 centered)
├─ a "← ALL WORK" → /work
├─ h1 title · p description
├─ div.meta-grid: Role / Tech stack / Year / Links
├─ div.cover (gradient placeholder)
├─ div.case-study (label column + paragraphs)
└─ div.shots (placeholder cards)
section.theme-dark.next  (NEXT PROJECT / huge link / counter / hairline)
```

## Numbers (README § View 4)

- Back link: 12px/.12em/up/w600/op .55, hover `var(--accent-text)` (E4) + op 1. (The next-project title hover stays plain `--accent` — it's huge, AA-large passes.)
- Title: `clamp(54px, 9vw, 140px)`, w550, ls −0.035em, lh .98, margin-top .15em. Description: `clamp(17px,1.5vw,21px)`, lh 1.55, max-width 560px, op .75, margin-top 24px.
- Meta grid: margin-top `clamp(44px,6vw,70px)`, `repeat(auto-fit, minmax(200px,1fr))`, gap 26px; each cell `border-top: 1px rgba(23,24,26,.2)`, padding-top 16px; label 11px/.16em/up/w600/op .5; value 16px w550 margin-top 12px; stack = outline pill tags `6px 13px`, 13px w550; Links: "Live site ↗" accent bg + white text (hover → ink bg), "GitHub ↗" outline — both only `@if` the URL exists.
- Cover: margin-top `clamp(48px,6vw,80px)`, radius 26px, `aspect-ratio: 16 / 8.5`, background `coverGradient(hue)`; centered title `clamp(36px,5.5vw,84px)` w600 white .95 + "COVER PLACEHOLDER" 11px/.22em/up/op .5.
- Case study: margin-top `clamp(60px,8vw,110px)`, grid `minmax(160px,240px) 1fr`, gap `clamp(28px,4vw,70px)`; label "CASE STUDY"; paragraphs `clamp(17px,1.45vw,21px)`, lh 1.65, op .85, margin-bottom 1.3em, max-width 760px. ≤922: grid → 1 column, gap 38px.
- Shots: margin-top `clamp(50px,7vw,80px)`, grid `repeat(auto-fit, minmax(min(360px,100%),1fr))`, gap `clamp(18px,2.5vw,28px)`; card i=0 → `aspect 16/9; grid-column: 1 / -1`, others 4/3; radius 22px; background `shotBg(hue)`, label `"{Title} — {shot}"` in `shotFg(hue)`, 12px/.16em/up/w600/op .85.
- Next footer: dark, padding `clamp(80px,10vw,130px) var(--gutter) 0`, centered; label 11px/.18em/up/op .5; project link margin-top 16px, `clamp(46px,8vw,120px)`, w550, ls −0.035em, lh 1, hover → accent (.3s); counter margin-top 18px, 13px, op .4, tabular, format `"{next.idx} / 09"` (both zero-padded, total from `projects.length`); closing hairline margin-top `clamp(60px,8vw,90px)`.

## ⚠ LANDMINES

- **C3 — slug → project.** `slug = input.required<string>()` is already bound (config has `withComponentInputBinding()`). Derive `project = computed(() => projects.find(...))`. Unknown slug (typo URL in prod): redirect to `/work` — inject `Router` and handle it in an `effect`/guard, don't render an empty template.
- **C5 — the title.** The static `routeMeta.title` in the stub gives all 9 pages the same `<title>`. Replace with a ResolveFn: `title: (route) => …look up route.paramMap slug…` — that resolves at prerender time, so every static HTML gets its own title. Same idea for the meta description if you care.
- **Next-project cycling** is data logic, not component logic: implement `nextProject(slug)` in `data/projects.ts` (marked TODO there) — `(index + 1) % projects.length`. The component just renders it.
- **C4** — arriving here from a scrolled Work page must land at the top: already handled by `withInMemoryScrolling` in `app.config.ts` — if you ever see it broken, look there before adding `scrollTo` hacks.
- Navigating next → next stays on the *same component instance* (only the input changes): any per-project state must be `computed` from the slug input, never set once in a constructor/`afterNextRender`.

## Data / inputs

`slug` route input; `projects`, `coverGradient/shotBg/shotFg`, `nextProject` from `data/projects.ts`.
