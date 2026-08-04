import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouteMeta } from '@analogjs/router';

export const routeMeta: RouteMeta = {
  title: 'Alex Uscata — Software Developer',
  meta: [
    {
      name: 'description',
      content: 'Alex Uscata — application developer from Basel. Web, app and backend.',
    },
  ],
};

// TODO(spec: specs/02-home.md)
// Hero (marquee + portrait, LCP ⚠ F1) → dark intro + <app-circle-badge> →
// selected work (<app-project-rows> with the 4 featured projects).
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>Home — TODO(spec: specs/02-home.md)</h1>`,
})
export default class HomePage {}
