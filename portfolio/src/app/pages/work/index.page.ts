import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouteMeta } from '@analogjs/router';

export const routeMeta: RouteMeta = {
  title: 'Work — Alex Uscata',
  meta: [
    { name: 'description', content: 'Client & side projects — 2021 → 2025.' },
  ],
};

// TODO(spec: specs/03-work.md)
// "Work⁽⁹⁾" title + <app-project-rows> with all 9 projects.
@Component({
  selector: 'app-work-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // TEMP: clears the fixed nav until the real section carries its own
  // padding-top (spec: clamp(140px,18vw,220px)). Remove then — don't stack.
  styles: `:host { display: block; padding-top: clamp(140px, 18vw, 220px); }`,
  template: `<h1>Work — TODO(spec: specs/03-work.md)</h1>`,
})
export default class WorkPage {}
