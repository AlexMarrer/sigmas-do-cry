import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Project } from '../../data/types';

// TODO(spec: specs/03-work.md § Project rows)
// Shared row list: Home passes the 4 featured projects, Work passes all 9.
// Hover/focus writes ProjectHoverService; expansion animates via
// grid-template-rows 0fr↔1fr (⚠ D2), row links use the stretched-link
// pattern (⚠ A4 — no nested <a>).
@Component({
  selector: 'app-project-rows',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<!-- TODO(spec: specs/03-work.md) -->`,
})
export class ProjectRows {
  readonly projects = input.required<Project[]>();
}
