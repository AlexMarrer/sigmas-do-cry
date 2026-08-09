import { Location, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouteMeta } from '@analogjs/router';
import { captionFor, galleryTrips, photoSrc } from '../../data/gallery';
import type { GalleryPhoto } from '../../data/types';
import { HoverWipe } from '../../directives/hover-wipe';
import { ScrollReveal } from '../../directives/scroll-reveal';

export const routeMeta: RouteMeta = {
  title: 'Gallery — Alex Uscata',
  meta: [
    { name: 'description', content: 'Off the clock — photographs from the road.' },
  ],
};

// Tiles per trip before "Show all" — ~2 masonry rows at the 1400px content width.
const PREVIEW_COUNT = 9;

const COLUMN_WIDTH = 320;
const GAP = 18;
// One grid row. Small enough that rounding a tile's height to whole rows stays
// invisible, large enough to keep the implicit row count in the hundreds.
const ROW_UNIT = 4;
// Prerender reference: the 1400px content column, which fits four columns. The
// grid is sized in `cqw`, so a client that is narrower still gets the right
// proportions before the measurement lands — only the count is off.
const ASSUMED_WIDTH = 1400;
const WIDTH_STEP = 32;

// A photo earns the double width if it is this landscape and lands on the
// cadence — every Nth of them, so the accent stays an accent.
const WIDE_RATIO = 1.3;
const WIDE_EVERY = 4;
/** Padding a wide tile may cost the shorter of its two columns, in row spans. */
const WIDE_WASTE_LIMIT = 0.25;

interface Tile {
  photo: GalleryPhoto;
  /** Index in `trip.photos` — the tile number and the lightbox's page position. */
  index: number;
  /** 1-based CSS grid placement. */
  column: number;
  columnSpan: number;
  row: number;
  rowSpan: number;
}

/**
 * Skyline masonry packer: walk the photos in order, drop each into the position
 * where its top edge ends up highest, remember the new profile. Deterministic
 * and free of DOM measurement — at a known column count a tile's height is
 * `width × height / width`, all of it in `cqw`.
 *
 * ⚠ The point is that it is **stable under append**: a photo's placement reads
 * only the skyline the photos before it produced, so "Show all" grows the grid
 * downward instead of reshuffling it. CSS multicol cannot do this —
 * `column-fill: balance` derives one target height from the TOTAL and fills
 * columns to it, so every added tile re-flows the block (⚠ D6 in 06-gallery.md).
 */
function pack(
  photos: readonly GalleryPhoto[],
  columns: number,
  gap: number,
  unit: number,
): Tile[] {
  const skyline = new Array<number>(columns).fill(0); // next free row per column
  const columnWidth = (100 - (columns - 1) * gap) / columns;
  let landscapeSeen = 0;
  const tiles: Tile[] = [];

  const rowsFor = (ratio: number, span: number) =>
    // Reserves the tile plus one gap; `row-gap` is 0 because the gap has to be
    // part of the same rounding rather than added on top of it.
    Math.max(Math.round(((span * columnWidth + (span - 1) * gap) / ratio + gap) / unit), 1);

  /** Cheapest slot for a `span`-wide tile: high up, and across level columns. */
  const slotFor = (span: number) => {
    let column = 0;
    let row = Infinity;
    let waste = 0;
    for (let c = 0; c + span <= columns; c++) {
      const tops = skyline.slice(c, c + span);
      const top = Math.max(...tops);
      const uneven = top - Math.min(...tops);
      // ⚠ Score, not just `top`: a wide tile has to wait for BOTH columns, so
      // the shorter one is padded out. Penalising that is what keeps the hole
      // in front of a wide tile from growing to a few hundred px.
      if (top + uneven < row + waste) {
        row = top;
        waste = uneven;
        column = c;
      }
    }
    return { column, row, waste };
  };

  photos.forEach((photo, index) => {
    const ratio = photo.width / photo.height;
    const wide =
      // Two columns need a third to sit next to, or the "accent" is just the row.
      columns >= 3 && ratio >= WIDE_RATIO && landscapeSeen++ % WIDE_EVERY === 0;

    let columnSpan = wide ? 2 : 1;
    let rowSpan = rowsFor(ratio, columnSpan);
    let slot = slotFor(columnSpan);

    // Still too expensive at the best position — it stays a normal tile rather
    // than punching a hole through the column beside it.
    if (columnSpan === 2 && slot.waste > rowSpan * WIDE_WASTE_LIMIT) {
      columnSpan = 1;
      rowSpan = rowsFor(ratio, 1);
      slot = slotFor(1);
    }

    tiles.push({
      photo,
      index,
      column: slot.column + 1,
      columnSpan,
      row: slot.row + 1,
      rowSpan,
    });
    for (let c = slot.column; c < slot.column + columnSpan; c++) {
      skyline[c] = slot.row + rowSpan;
    }
  });

  return tiles;
}

// spec: specs/06-gallery.md · photos in specs/photos.md § Filtering & scale
@Component({
  selector: 'app-gallery-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, HoverWipe, ScrollReveal],
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
})
export default class GalleryPage {
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);

  readonly captionFor = captionFor;
  readonly photoSrc = photoSrc;
  readonly previewCount = PREVIEW_COUNT;

  // Derived from the data, never typed out — a new trip brings its own chips.
  readonly places = [...new Set(galleryTrips.map((trip) => trip.country))].sort();
  readonly years = [...new Set(galleryTrips.map((trip) => trip.year))].sort((a, b) => b - a);

  readonly place = signal<string | null>(null);
  readonly year = signal<number | null>(null);
  readonly filtered = computed(() => this.place() !== null || this.year() !== null);

  // ⚠ Place is a property of the TRIP, not the photo — filtering hides whole
  // groups and the masonry layout stays untouched (specs/photos.md).
  private readonly matching = computed(() =>
    galleryTrips.filter(
      (trip) =>
        (this.place() === null || trip.country === this.place()) &&
        (this.year() === null || trip.year === this.year()),
    ),
  );

  private readonly expanded = signal<Set<string>>(new Set());
  private readonly width = signal(ASSUMED_WIDTH);

  // Any child of the grid's content column has the masonry's width; the filter
  // bar is the one that is always rendered, empty state or not.
  private readonly widthProbe = viewChild.required<ElementRef<HTMLElement>>('widthProbe');

  /**
   * Track sizes in `cqw` — 1% of the masonry's own width — so the grid keeps its
   * proportions at any width, including the prerendered one nobody measured.
   * Derived from the measurement, so at the real width they are exactly 18/4px.
   */
  readonly grid = computed(() => {
    const width = this.width();
    const columns = Math.max(Math.floor((width + GAP) / (COLUMN_WIDTH + GAP)), 1);
    return {
      columns,
      gap: (GAP / width) * 100,
      unit: (ROW_UNIT / width) * 100,
    };
  });

  readonly groups = computed(() => {
    const expanded = this.expanded();
    const { columns, gap, unit } = this.grid();
    return this.matching().map((trip) => {
      const open = expanded.has(trip.slug);
      // ⚠ Slice from the START, and pack AFTER slicing: the packer walks photos
      // in order, so the first nine land in the same places either way — that is
      // what makes expanding move nothing.
      const photos = open ? trip.photos : trip.photos.slice(0, PREVIEW_COUNT);
      return {
        trip,
        open,
        hidden: Math.max(trip.photos.length - PREVIEW_COUNT, 0),
        tiles: pack(photos, columns, gap, unit),
      };
    });
  });

  readonly summary = computed(() => {
    const trips = this.matching().length;
    const photos = this.matching().reduce((total, trip) => total + trip.photos.length, 0);
    return `${trips} trip${trips === 1 ? '' : 's'} · ${photos} photo${photos === 1 ? '' : 's'}`;
  });

  // Page-local, no service: it dies with the page (unlike the cross-component
  // hover state). ⚠ Keyed by slug, not by index — filtering renumbers the
  // visible trips. TODO(spec: specs/lightbox.md) — @defer'd <app-lightbox> reads it.
  readonly lightbox = signal<{ trip: string; index: number } | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);

    // ⚠ A5: the prerendered HTML is the UNFILTERED page at DEFAULT_COLUMNS, so
    // neither the query params nor the real column count may reach the signals
    // before hydration has matched the DOM. Hence a snapshot read here instead
    // of a bound input (⚠ C3), and ResizeObserver instead of a render-time read.
    afterNextRender(() => {
      const query = this.route.snapshot.queryParamMap;
      const place = query.get('place');
      const year = Number(query.get('year'));
      this.place.set(place !== null && this.places.includes(place) ? place : null);
      this.year.set(this.years.includes(year) ? year : null);

      const probe = this.widthProbe().nativeElement;
      // ⚠ B1: fires per resize frame, so the width is quantised — the `cqw`
      // sizes only exist to pin the gap near 18px, and a signal write with an
      // unchanged value is a no-op. Without this a drag repacks every tile per
      // pixel for a sub-pixel difference.
      const measure = () =>
        this.width.set(Math.round(probe.clientWidth / WIDTH_STEP) * WIDTH_STEP);
      measure();

      const observer = new ResizeObserver(measure);
      observer.observe(probe);
      destroyRef.onDestroy(() => observer.disconnect()); // ⚠ B3
    });
  }

  selectPlace(place: string | null): void {
    this.place.set(place);
    this.syncUrl();
  }

  selectYear(year: number | null): void {
    this.year.set(year);
    this.syncUrl();
  }

  clearFilters(): void {
    this.place.set(null);
    this.year.set(null);
    this.syncUrl();
  }

  toggleTrip(slug: string): void {
    this.expanded.update((expanded) => {
      const next = new Set(expanded);
      if (!next.delete(slug)) next.add(slug);
      return next;
    });
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  // ⚠ F1: honest `sizes`, and a double-width tile is a different question than
  // a single one. Columns stretch past their 320px minimum, hence 31/62vw.
  sizesFor(tile: { columnSpan: number }): string {
    return tile.columnSpan === 2
      ? '(max-width: 660px) 100vw, (max-width: 1080px) 94vw, min(62vw, 920px)'
      : '(max-width: 660px) 100vw, (max-width: 1080px) 46vw, min(31vw, 460px)';
  }

  // The URL is a MIRROR of the signals, not a navigation: `router.navigate` here
  // ⚠ fires a view transition per chip click (two quick clicks abort each other
  // with an InvalidStateError) and would stack up the back history. Location
  // replaces in place — which is also why the params are read once above.
  private syncUrl(): void {
    const params: string[] = [];
    // ⚠ Not URLSearchParams: it form-encodes 'South Korea' as `South+Korea`,
    // while the router writes `%20` — one shape of shareable URL, not two.
    if (this.place() !== null) params.push(`place=${encodeURIComponent(this.place()!)}`);
    if (this.year() !== null) params.push(`year=${this.year()}`);
    this.location.replaceState(this.location.path().split('?')[0], params.join('&'));
  }
}
