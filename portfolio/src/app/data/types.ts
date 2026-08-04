// Data model for the whole site. FRAMEWORK-FREE ZONE:
// vite.config.ts imports the data files at config-eval time (Node, no Angular)
// to enumerate the prerender routes — never import Angular here.
// See specs/00-checklist.md · landmine C1.

export interface Project {
  slug: string;
  title: string;
  category: string;
  year: string;
  role: string;
  stack: string[];
  /** One-liner shown in the expanded row + project-detail header. */
  description: string;
  /** OKLCH hue driving cover gradient + screenshot tints (see gradient helpers). */
  hue: number;
  /** Present only if the project has a live site / public repo. */
  liveUrl?: string;
  gitUrl?: string;
  /** Featured projects appear in "Selected work" on Home (4 of 9). */
  featured: boolean;
  /** Case-study paragraphs (3). */
  body: string[];
  /** Screenshot placeholder labels (3) — first one renders full-width 16/9. */
  shots: string[];
}

export interface TripShot {
  /** CSS aspect-ratio value, e.g. '3 / 4'. */
  aspect: string;
  /** Numeric w/h ratio — the lightbox sizes the stage from it. */
  ratio: number;
  caption: string;
  /** Placeholder tone (hex) until real photos land. */
  tone: string;
}

export interface Trip {
  name: string;
  /** e.g. 'Switzerland · 2025 · 6 photos' */
  meta: string;
  shots: TripShot[];
}

export interface SkillGroup {
  name: string;
  items: string[];
}
