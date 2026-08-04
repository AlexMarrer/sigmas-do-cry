import { ChangeDetectionStrategy, Component } from '@angular/core';

// TODO(spec: specs/07-footer.md)
// Dark footer on every page: CTA circle on the hairline, pills, bottom bar
// with <app-local-clock>.
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<!-- TODO(spec: specs/07-footer.md) -->`,
})
export class SiteFooter {}
