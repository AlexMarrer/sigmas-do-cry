import { ChangeDetectionStrategy, Component } from '@angular/core';

// TODO(spec: specs/01-nav.md)
// Fixed top bar, mix-blend-mode: difference (blend styles on :host — D1),
// routerLinkActive dot, no scroll listeners.
@Component({
  selector: 'app-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<!-- TODO(spec: specs/01-nav.md) -->`,
})
export class SiteNav {}
