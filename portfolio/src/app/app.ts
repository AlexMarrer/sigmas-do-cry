import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteNav } from './components/nav/nav';
import { SiteFooter } from './components/footer/footer';
import { CursorPreview } from './components/cursor-preview/cursor-preview';

// App shell: nav + routed page + footer + the root-level cursor-preview card.
// ⚠ LANDMINE D1: <app-nav> must stay a DIRECT child of this template — never
// wrap it in a container with transform/filter/opacity/overflow, or its
// mix-blend-mode inversion silently dies. Same for <app-cursor-preview>
// (position: fixed must not get a transformed ancestor).
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SiteNav, SiteFooter, CursorPreview],
  template: `
    <app-nav />
    <main>
      <router-outlet />
    </main>
    <app-footer />
    <app-cursor-preview />
  `,
})
export class App {}
