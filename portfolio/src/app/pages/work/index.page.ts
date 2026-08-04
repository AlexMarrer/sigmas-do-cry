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
  template: `<h1>Work — TODO(spec: specs/03-work.md)</h1>`,
})
export default class WorkPage {}
