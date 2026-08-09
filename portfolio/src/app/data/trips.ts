// Gallery trips — the HAND-MAINTAINED half. Photos, dimensions and dates come
// from `trips.generated.ts` (written by `npm run photos`); the two are joined in
// `gallery.ts`. FRAMEWORK-FREE (see types.ts).
//
// To add a trip: create photos/<slug>/, run `npm run photos`, add an entry here
// with the same slug. Order doesn't matter — gallery.ts sorts newest first.
//
//   {
//     slug: 'japan-2026',        // === the folder name under photos/
//     name: 'Tokyo',
//     country: 'Japan',
//     year: 2026,
//     cover: 'dsc-4821',         // optional, defaults to the first photo
//     captions: {                // optional and sparse — only what earns a caption
//       'dsc-4821': 'Shinjuku after rain',
//     },
//   }

import type { Trip } from "./types";

export const trips: Trip[] = [
  {
    slug: "korea-2025",
    name: "Korea",
    country: "South Korea",
    year: 2025,
  },
  {
    slug: "amsterdam-2026",
    name: "Amsterdam",
    country: "Netherlands",
    year: 2026,
  },
  {
    slug: "london-2026",
    name: "London",
    country: "United Kingdom",
    year: 2026,
  },
];
