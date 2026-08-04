import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouteMeta } from '@analogjs/router';

export const routeMeta: RouteMeta = {
  title: 'Gallery — Alex Uscata',
  meta: [
    { name: 'description', content: 'Off the clock — photographs from the road.' },
  ],
};

// TODO(spec: specs/06-gallery.md)
// "Off the clock", 3 trip groups (data/trips.ts), CSS-columns masonry,
// lightbox state signal lives HERE (page-local), @defer'd <app-lightbox>.
@Component({
  selector: 'app-gallery-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>Gallery — TODO(spec: specs/06-gallery.md)</h1>`,
})
export default class GalleryPage {}
