import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouteMeta } from '@analogjs/router';

export const routeMeta: RouteMeta = {
  title: 'About — Alex Uscata',
  meta: [
    { name: 'description', content: "Hoi, I'm Alex — software developer from Basel." },
  ],
};

// TODO(spec: specs/05-about.md)
// Bio 2-col + portrait, toolbox (data/skills.ts), contact rows.
@Component({
  selector: 'app-about-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>About — TODO(spec: specs/05-about.md)</h1>`,
})
export default class AboutPage {}
