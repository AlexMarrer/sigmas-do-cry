// Gallery trip data — placeholder tones until real photos land.
// FRAMEWORK-FREE (see types.ts).

import type { Trip } from './types';

export const trips: Trip[] = [
  {
    name: 'Bernese Oberland',
    meta: 'Switzerland · 2025 · 6 photos',
    shots: [
      { aspect: '3 / 4', ratio: 0.75, caption: 'Kleine Scheidegg, first light', tone: '#9AA4AC' },
      { aspect: '4 / 3', ratio: 1.333, caption: 'Eiger north face', tone: '#7E8A94' },
      { aspect: '1 / 1', ratio: 1, caption: 'Grindelwald fog', tone: '#B7BEC4' },
      { aspect: '3 / 4', ratio: 0.75, caption: 'Trail marker, Männlichen', tone: '#5E6A73' },
      { aspect: '16 / 11', ratio: 1.4545, caption: 'Cablecar window', tone: '#A9B4B0' },
      { aspect: '3 / 4', ratio: 0.75, caption: 'Lauterbrunnen valley', tone: '#8B979E' },
    ],
  },
  {
    name: 'Lisbon',
    meta: 'Portugal · 2024 · 5 photos',
    shots: [
      { aspect: '4 / 3', ratio: 1.333, caption: 'Alfama rooftops', tone: '#C8A288' },
      { aspect: '3 / 4', ratio: 0.75, caption: 'Tram 28, rush hour', tone: '#B0785A' },
      { aspect: '1 / 1', ratio: 1, caption: 'Azulejos, Rua da Bica', tone: '#D9C3A5' },
      { aspect: '16 / 11', ratio: 1.4545, caption: 'Tejo at golden hour', tone: '#8A5B45' },
      { aspect: '3 / 4', ratio: 0.75, caption: 'Pastéis, obviously', tone: '#C9976B' },
    ],
  },
  {
    name: 'Tokyo',
    meta: 'Japan · 2023 · 6 photos',
    shots: [
      { aspect: '3 / 4', ratio: 0.75, caption: 'Shinjuku after rain', tone: '#8E8E93' },
      { aspect: '1 / 1', ratio: 1, caption: 'Vending machines, 2 a.m.', tone: '#5C5F66' },
      { aspect: '4 / 3', ratio: 1.333, caption: 'Meiji shrine forest', tone: '#B5B2AB' },
      { aspect: '3 / 4', ratio: 0.75, caption: 'Yamanote platform', tone: '#3E4148' },
      { aspect: '16 / 11', ratio: 1.4545, caption: 'Golden Gai lanterns', tone: '#9BA0A8' },
      { aspect: '4 / 3', ratio: 1.333, caption: 'Fuji from the train', tone: '#767B72' },
    ],
  },
];
