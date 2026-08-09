// Real project data, gathered from the repos (READMEs + manifests) on 2026-08-06.
// Strings containing "TODO(you)" render visibly on the page — they are the spots
// only you can fill (outcomes, results, screen names, wording).
// FRAMEWORK-FREE: imported by vite.config.ts for the prerender route list.

import { projectImages } from "./projects.generated";
import type { Project, ProjectImage } from "./types";

/** Per-project cover gradient — README: Design Tokens · Colors. */
export function coverGradient(hue: number): string {
  return `linear-gradient(135deg, oklch(71% 0.055 ${hue}), oklch(42% 0.095 ${hue}))`;
}

/**
 * Flat 55% black. Both call sites centre white text over the cover, so a light
 * UI screenshot would be white on white. Flat rather than directional because
 * the text is centred on BOTH axes — a bottom-weighted gradient would leave the
 * title sitting on the bright half. 55% is what puts the 26px title at 4.5:1
 * over a worst-case pure-white screenshot.
 */
const COVER_SCRIM = "linear-gradient(rgb(0 0 0 / 55%), rgb(0 0 0 / 55%))";

/**
 * The `background` shorthand for anything that shows a project visually — the
 * cursor-preview card (700) and the detail cover (1400). Cover image if
 * `project-images/<slug>/cover.*` exists, hue gradient if it does not, so both
 * call sites stay branch-free and a project can gain a screenshot without
 * touching a component.
 *
 * With an image it is three layers, topmost first: scrim, screenshot, then the
 * hue gradient as the base — the card sets this background at hover time, so
 * the gradient is what paints while the screenshot is still in flight. Same role
 * `tone` plays for gallery photos.
 *
 * A `background` cannot carry a srcset, so the surface picks its own width here.
 */
export function coverBackground(project: Project, width: 700 | 1400 = 700): string {
  const cover = projectImages[project.slug]?.cover;
  if (!cover) return coverGradient(project.hue);
  const w = cover.widths.includes(width) ? width : cover.widths[cover.widths.length - 1];
  const url = `/images/project/${project.slug}/${cover.id}-${w}.avif`;
  return `${COVER_SCRIM}, url("${url}") center / cover no-repeat, ${coverGradient(project.hue)}`;
}

/**
 * The extra images for a project, filename order — they render at the end of the
 * detail page. Empty when the project has no source folder yet, so the shot
 * placeholders in `Project.shots` stay the fallback until real images land.
 */
export function projectShots(project: Project): ProjectImage[] {
  return projectImages[project.slug]?.shots ?? [];
}

/** Screenshot-placeholder tints — README: View 4 (Project detail). */
export function shotBg(hue: number): string {
  return `oklch(90% 0.022 ${hue})`;
}
export function shotFg(hue: number): string {
  return `oklch(42% 0.07 ${hue})`;
}

// TODO(you): nextProject(slug) lives HERE, next to the data — pure function,
// cycles (index + 1) % projects.length. See specs/04-project-detail.md.

// Order = Work page order AND the next-project cycle. Currently sorted by last
// activity, newest first.
export const projects: Project[] = [
  {
    slug: "portfolio",
    title: "Portfolio",
    category: "Website",
    year: "2026",
    role: "Design & development",
    stack: ["Angular", "Analog", "SCSS"],
    description: "This site — a statically generated portfolio built from a design prototype.",
    hue: 25,
    gitUrl: "https://github.com/AlexMarrer/sigmas-do-cry",
    featured: false,
    body: [
      "The site you are reading. Built from a high-fidelity design prototype and rebuilt pixel by pixel in Angular — the interesting part was not the layout but keeping every interaction honest: hover effects that respect reduced-motion, a clock that survives hydration, rows that work keyboard-only.",
      "Angular with Analog on top, prerendered to static HTML — thirteen pages, no server. The data layer stays framework-free so the build can enumerate every project URL before Angular even exists. Motion sits behind a single service that knows about reduced-motion and pointer type.",
      "TODO(you): closing line — what you got out of building it, or what you would do differently.",
    ],
    shots: ["Home", "Work index", "Project detail"],
  },
  {
    slug: "proxmox-selfservice",
    title: "Proxmox Self-Service",
    category: "Web platform",
    year: "2026",
    role: "Backend development (team of four)",
    stack: ["Java", "Spring Boot", "Angular", "PrimeNG"],
    description: "Automated provisioning of isolated lab environments on a school Proxmox cluster.",
    hue: 265,
    gitUrl: "https://github.com/BBZ-BL-IT/m306-project-proxmox",
    featured: true,
    body: [
      "The school runs three decommissioned servers as a Proxmox cluster so every learner can build VMs and containers instead of running a hypervisor on their own laptop. The cluster worked — but handing out isolated environments to a class still meant a lot of manual clicking.",
      "We automated that. A Spring Boot service talks to the Proxmox API and provisions per-learner and per-group environments; an Angular frontend with PrimeNG puts it behind a form instead of a runbook. I worked on the backend, alongside Furkan Güner, Lev Geer and Yannick Büchler.",
      "TODO(you): outcome — is it in use, how much manual work does it actually save, what would the next iteration be?",
    ],
    shots: ["Environment request", "Cluster overview", "TODO(you): third screen"],
  },
  {
    slug: "recipevault",
    title: "RecipeVault",
    category: "Web app",
    year: "2026",
    role: "Full-stack development",
    stack: ["Java", "Spring Boot", "PostgreSQL", "Keycloak"],
    description: "A digital recipe collection with role-based access — recipes, ingredients, ratings.",
    hue: 95,
    gitUrl: "https://github.com/AlexMarrer/RecipeVault",
    featured: true,
    body: [
      "RecipeVault manages recipes, ingredients, categories and ratings behind a proper permission model: users read and rate, chefs write, admins run the place. Built solo as the competency assessment for modules 294 and 295.",
      "A Spring Boot REST API on PostgreSQL, documented with OpenAPI and mapped with MapStruct; authentication runs through Keycloak with JWT rather than a hand-rolled login. Tests use MockMvc against an in-memory H2 — the part that made refactoring painless.",
      "TODO(you): what you would keep from this build and what you would throw away — a sentence with an opinion in it.",
    ],
    shots: ["Recipe list", "Recipe detail", "Swagger UI"],
  },
  {
    slug: "gnarly-security",
    title: "Gnarly Security",
    category: "Web app",
    year: "2026",
    role: "Application security",
    stack: ["Java", "Spring Boot", "Spring Security", "MySQL"],
    description: "Hardening a business management web app — authentication, access control, audit.",
    hue: 320,
    gitUrl: "https://github.com/AlexMarrer/Gnarly_Business_Management_Security_Project",
    featured: false,
    body: [
      "A business management application — customers, products, orders — that came with the module. The application was the given part; the security was the work. Module M183 (application security) at BBZ BL, together with Furkan Güner.",
      "Spring Security over a Spring Boot and Thymeleaf app on MySQL: authentication, role-separated access for admins and users, self-registration, and the surrounding hardening the module required.",
      "TODO(you): the interesting part — which attack did you actually defend against, and what surprised you while doing it?",
    ],
    shots: ["Login", "Admin panel", "TODO(you): third screen"],
  },
  {
    slug: "scheduleregio",
    title: "ScheduleRegio",
    category: "Desktop app",
    year: "2026",
    role: "Development",
    stack: ["C#", ".NET 8", "WPF"],
    description: "A scheduling desktop app, written as practice for the Swiss RegioSkills competition.",
    hue: 210,
    gitUrl: "https://github.com/AlexMarrer/ScheduleRegio",
    featured: false,
    body: [
      "My first WPF application, built as preparation for the Swiss RegioSkills competition — a scheduling tool assembled against a competition brief and a clock.",
      "C# on .NET 8 with WPF and a separate database layer. TODO(you): what the app actually schedules — citizens and locations, going by the data files, but say it in your own words.",
      "TODO(you): what the competition taught you that a relaxed side project would not have.",
    ],
    shots: ["TODO(you): three screen names"],
  },
  {
    slug: "bank-marketing-analysis",
    title: "Bank Marketing Analysis",
    category: "Data analysis",
    year: "2026",
    role: "Analysis & development (pair)",
    stack: ["Python", "Jupyter"],
    description: "The same campaign dataset analysed twice — once imperatively, once functionally.",
    hue: 145,
    gitUrl: "https://github.com/stoicfist/Modul-323-Projektarbeit",
    featured: false,
    body: [
      "A Portuguese bank collected customer data during a marketing campaign — age, job, marital status, balance, call duration — and the question was which customers actually sign up. Success rates, group comparisons, correlations.",
      "The point of the exercise was the second implementation: the same analysis written imperatively (loops, mutable state, continue) and functionally (map, filter, reduce, composed predicates), so the two can be read side by side. Module M323, functional programming, with Peter Ngo.",
      "TODO(you): which version you would maintain a year from now, and why — that is the actual takeaway.",
    ],
    shots: ["Functional notebook", "Imperative notebook", "Grouped results"],
  },
  {
    slug: "roamnote",
    title: "RoamNote",
    category: "Mobile app",
    year: "2025",
    role: "Design & development",
    stack: ["Ionic", "Angular", "Capacitor", "Supabase"],
    description: "A travel app that plans the trip and then keeps the diary — pinned to real places.",
    hue: 35,
    gitUrl: "https://github.com/AlexMarrer/RoamNote",
    featured: true,
    body: [
      "RoamNote covers both halves of a trip. Before: plan the route, add destinations from Google Places, drag them into the order you actually want. During: write daily entries tied to the place you were standing in, so the diary maps itself.",
      "Ionic 8 and Angular 20 standalone components, packaged for Android with Capacitor, on a Supabase backend. Google Maps for live location, offline-capable diary entries, and a push notification a day before you arrive somewhere.",
      "TODO(you): have you travelled with it yourself — and did it survive contact with a real trip and a bad connection?",
    ],
    shots: ["Trip planner", "Live map", "Diary entry"],
  },
  {
    slug: "rising-sigmas",
    title: "Rising Sigmas",
    category: "Web platform",
    year: "2025",
    role: "Full-stack development",
    stack: [".NET 8", "Angular", "Ionic", "MSSQL"],
    description: "Training plans without a spreadsheet — sessions, load, and weekly progression.",
    hue: 235,
    gitUrl: "https://github.com/AlexMarrer/the-rising-sigmas",
    featured: true,
    body: [
      "Everyone in the gym plans their training in a spreadsheet, and every spreadsheet is a private disaster. Rising Sigmas replaces it: which sessions on which day, an interactive calendar you can drag exercises into, exercise templates grouped by muscle group.",
      ".NET 8 with Entity Framework on SQL Server, an Angular and Ionic frontend, the whole thing containerised with Docker Compose. Started with Kevin Marrer; the planned next steps were a load calculator, automatic weekly weight progression, and a trainer role that can write plans for others and check up on them.",
      "Currently paused. TODO(you): say why in one honest line — and whether it comes back.",
    ],
    shots: ["Workout calendar", "Exercise library", "Plan detail"],
  },
  {
    slug: "k-ranking-list",
    title: "K-Ranking List",
    category: "Desktop app",
    year: "2024",
    role: "Development",
    stack: ["Electron", "JavaScript", "Spotify API"],
    description: "A first web app: search artists and tracks through the Spotify API and play them.",
    hue: 160,
    gitUrl: "https://github.com/AlexMarrer/k-ranking-list",
    featured: false,
    body: [
      "My first real go at a web app, and my first at Electron: search artists and tracks against the Spotify API, play them, rank them. No framework, no build step — plain JavaScript, HTML and CSS, figured out as I went.",
      "TODO(you): the honest bit — what the Spotify API taught you the hard way (auth flow? rate limits?).",
      'TODO(you): why it is still worth showing — the "this is where I started" line.',
    ],
    shots: ["Search", "Ranking list", "TODO(you): third screen"],
  },
];
