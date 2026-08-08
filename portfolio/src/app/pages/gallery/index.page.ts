import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouteMeta } from '@analogjs/router';
import { captionFor, galleryTrips, photoSrc } from '../../data/gallery';
import { ScrollReveal } from '../../directives/scroll-reveal';

export const routeMeta: RouteMeta = {
  title: 'Gallery — Alex Uscata',
  meta: [
    { name: 'description', content: 'Off the clock — photographs from the road.' },
  ],
};

// spec: specs/06-gallery.md · photos in specs/photos.md
@Component({
  selector: 'app-gallery-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, ScrollReveal],
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
})
export default class GalleryPage {
  readonly trips = galleryTrips;
  readonly captionFor = captionFor;
  readonly photoSrc = photoSrc;

  // Page-local, no service: it dies with the page (unlike the cross-component
  // hover state). TODO(spec: specs/lightbox.md) — @defer'd <app-lightbox> reads it.
  readonly lightbox = signal<{ trip: number; index: number } | null>(null);

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }
}
