// Placeholder project data, seeded 1:1 from the design prototype.
// Owner will swap copy/links later — keep everything data-driven.
// FRAMEWORK-FREE: imported by vite.config.ts for the prerender route list.

import type { Project } from './types';

/** Per-project cover gradient — README: Design Tokens · Colors. */
export function coverGradient(hue: number): string {
  return `linear-gradient(135deg, oklch(71% 0.055 ${hue}), oklch(42% 0.095 ${hue}))`;
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

export const projects: Project[] = [
  {
    slug: 'alpenblick',
    title: 'Alpenblick',
    category: 'Web platform',
    year: '2025',
    role: 'Full-stack development',
    stack: ['Angular', 'ASP.NET Core', 'MSSQL'],
    description: 'Booking platform for independent mountain lodges across the Alps.',
    hue: 160,
    liveUrl: 'https://example.com',
    gitUrl: 'https://github.com/AlexMarrer/alpenblick',
    featured: true,
    body: [
      'Alpenblick connects hikers with 140+ independent mountain lodges that used to take bookings by phone and paper calendar. The brief: make booking a hut as easy as booking a hotel — without losing the charm.',
      'I built the booking engine on ASP.NET Core with an MSSQL backbone, and an Angular frontend that keeps working on a spotty connection at 2,800 metres. Availability syncs offline-first and reconciles once the hut warden regains signal.',
      "Since launch, partner lodges report roughly a third less admin time per season — and I've personally tested the product more than professionally necessary.",
    ],
    shots: ['Booking flow', 'Warden dashboard', 'Availability calendar'],
  },
  {
    slug: 'trackwerk',
    title: 'Trackwerk',
    category: 'Dashboard',
    year: '2024',
    role: 'Frontend & API development',
    stack: ['Angular', 'SignalR', 'PostgreSQL'],
    description: 'Real-time logistics dashboard for a regional freight carrier.',
    hue: 235,
    gitUrl: 'https://github.com/AlexMarrer/trackwerk',
    featured: true,
    body: [
      'Trackwerk gives dispatchers a live picture of 300 vehicles, replacing a wall of spreadsheets and two-way radio guesswork.',
      'SignalR pushes fleet events into an Angular dashboard tuned to stay smooth with thousands of live markers; PostgreSQL with PostGIS does the geo-heavy lifting underneath.',
      'Dispatch response times dropped measurably in the first quarter — and the radio is now mostly used for good-morning banter.',
    ],
    shots: ['Live map', 'Vehicle detail', 'Shift planner'],
  },
  {
    slug: 'mundo',
    title: 'Mundo',
    category: 'Mobile app',
    year: '2024',
    role: 'Design & development',
    stack: ['Ionic', 'Angular', 'MongoDB'],
    description: 'A quiet little travel journal app — offline first, ad free.',
    hue: 25,
    gitUrl: 'https://github.com/AlexMarrer/mundo',
    featured: true,
    body: [
      "Mundo is my own itch, scratched: a travel journal that works in airplane mode, respects your photos and never asks you to 'go premium'.",
      'Built with Ionic and Angular on a MongoDB sync layer — entries are geotagged, photographed and searchable. Everything is stored locally first and syncs when it can.',
      'It quietly powers the Gallery page on this site: every trip you see there started as a Mundo entry.',
    ],
    shots: ['Journal timeline', 'Entry editor', 'Map of trips'],
  },
  {
    slug: 'kantina',
    title: 'Kantina',
    category: 'Mobile app',
    year: '2023',
    role: 'Full-stack development',
    stack: ['Ionic', 'Spring Boot', 'PostgreSQL'],
    description: 'Pre-order app for a company canteen — skip the queue at noon.',
    hue: 95,
    featured: false,
    body: [
      'Kantina lets 900 employees order lunch before the rush and pick it up on a dedicated shelf. The queue at 12:02 was the real client.',
      'A Spring Boot API balances kitchen load with capacity-based time slots; the Ionic app talks to the badge system, so pickup is a single scan.',
      "Around 60% of the kitchen's daily orders now arrive through the app, and lunchtime feels a lot less like boarding a budget flight.",
    ],
    shots: ['Menu of the day', 'Slot picker', 'Kitchen board'],
  },
  {
    slug: 'atelier-frei',
    title: 'Atelier Frei',
    category: 'Website & shop',
    year: '2023',
    role: 'Design & development',
    stack: ['Craft CMS', 'PHP'],
    description: 'Portfolio and small shop for a Basel ceramics studio.',
    hue: 70,
    liveUrl: 'https://example.com',
    featured: true,
    body: [
      'Sabine Frei makes beautiful ceramics; her old site made them look like stock photos. We rebuilt it around big, honest photography and very little else.',
      'Craft CMS gives her full control over pieces, firings and exhibition dates; a lightweight PHP shop handles the twelve-items-a-month sales volume without a heavyweight platform.',
      'The site now does the quiet selling — most pieces sell out within days of a kiln post.',
    ],
    shots: ['Collection grid', 'Piece detail', 'Studio journal'],
  },
  {
    slug: 'papierwerk',
    title: 'Papierwerk',
    category: 'Web app',
    year: '2022',
    role: 'Backend development',
    stack: ['C#', 'ASP.NET', 'MSSQL'],
    description: 'Document workflow suite for a fiduciary — goodbye, shared-drive chaos.',
    hue: 265,
    featured: false,
    body: [
      "Papierwerk routes contracts, payroll and tax documents through review chains that used to live in email threads titled 'FINAL_v7_really'.",
      'I focused on the backend: an ASP.NET service layer with a strict audit trail, role-based access and full-text search across fifteen years of archived PDFs.',
      'Auditors now get read-only access instead of a conference room full of binders. Everyone involved considers this a win.',
    ],
    shots: ['Review chain', 'Archive search', 'Audit log'],
  },
  {
    slug: 'velora',
    title: 'Velora',
    category: 'Web platform',
    year: '2022',
    role: 'Full-stack development',
    stack: ['Spring Boot', 'Angular', 'PostgreSQL'],
    description: 'Community platform for cycling routes — built by riders, for riders.',
    hue: 145,
    gitUrl: 'https://github.com/AlexMarrer/velora',
    featured: false,
    body: [
      'Velora is where a local cycling club shares, rates and argues about routes. Think of it as a very polite comment section with elevation profiles.',
      'Spring Boot and PostGIS crunch GPX uploads into comparable segments; an Angular frontend renders the profiles and turns the eternal gravel-versus-road debate into filters.',
      '3,000 riders and 11,000 routes later, the whole thing still runs on a single modest VPS — a point of personal pride.',
    ],
    shots: ['Route explorer', 'Elevation profile', 'Club leaderboard'],
  },
  {
    slug: 'klangraum',
    title: 'Klangraum',
    category: 'Website',
    year: '2021',
    role: 'Development',
    stack: ['Craft CMS', 'PHP', 'PostgreSQL'],
    description: 'Site and ticketing for a small Basel music venue.',
    hue: 320,
    liveUrl: 'https://example.com',
    featured: false,
    body: [
      'Klangraum hosts jazz on Thursdays and everything else on weekends. The site had to feel like the room: dark, warm and a little analog.',
      'Craft CMS drives the programme; a slim PHP ticketing flow with QR door lists replaced a paid platform that ate 8% of every ticket.',
      'The venue kept its margins and I kept a permanent spot on the guest list. Fair trade.',
    ],
    shots: ['Programme', 'Event page', 'Door list'],
  },
  {
    slug: 'uhrwerk',
    title: 'Uhrwerk',
    category: 'Web app',
    year: '2021',
    role: 'Full-stack development',
    stack: ['C#', '.NET', 'Angular'],
    description: 'Time tracking for small agencies — honest hours, zero drama.',
    hue: 210,
    gitUrl: 'https://github.com/AlexMarrer/uhrwerk',
    featured: false,
    body: [
      "Uhrwerk started as a weekend project when my then-agency's tracking tool billed us for fixing its own bugs. It tracked time; mostly it wasted ours.",
      'A pragmatic .NET API, an Angular frontend and exactly the features a ten-person agency needs: timers, budgets, exports. Nothing else.',
      "It's open source, it's opinionated, and three agencies I've never met run their books on it. The internet is occasionally lovely.",
    ],
    shots: ['Week view', 'Budget overview', 'Export'],
  },
];
