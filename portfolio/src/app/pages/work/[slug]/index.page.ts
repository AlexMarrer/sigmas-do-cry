import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouteMeta } from '@analogjs/router';

// ⚠ LANDMINE C5: static title = all 9 prerendered pages share it. Replace with
// a title ResolveFn that looks the slug up in data/projects — specs/04-project-detail.md.
export const routeMeta: RouteMeta = {
  title: 'Project — Alex Uscata',
};

// TODO(spec: specs/04-project-detail.md)
// Header, meta grid, cover, case study, shots, next-project footer.
// Unknown slug ⇒ redirect to /work (⚠ C3).
@Component({
  selector: 'app-project-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
})
export default class ProjectDetailPage {
  // ⚠ C3: bound by withComponentInputBinding() — no ActivatedRoute.
  readonly slug = input.required<string>();
}
