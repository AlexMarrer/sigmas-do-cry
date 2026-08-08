import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
} from '@angular/core';
import { NavigationStart, Router, RouterLink } from '@angular/router';
import { HoverWipe } from '../../directives/hover-wipe';
import { ProjectHoverService } from '../../services/project-hover.service';
import type { Project } from '../../data/types';

// spec: specs/03-work.md § Project rows
// Shared row list: Home passes the 4 featured projects, Work passes all 9.
@Component({
  selector: 'app-project-rows',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, HoverWipe],
  templateUrl: './project-rows.html',
  styleUrls: ['./project-rows.scss'],
})
export class ProjectRows {
  readonly projects = input.required<Project[]>();

  // ⚠ B4: the one shared signal. Written here, read by the row expansion AND by
  // the cursor-preview card. It reports which row is ACTIVE, nothing more —
  // every consumer gates itself (⚠ E1: the `(hover: hover)` gate that keeps the
  // row from expanding on touch belongs in the SCSS, not in this class, or a
  // keyboard user on a touch-capable laptop loses the expansion too).
  private readonly hover = inject(ProjectHoverService);
  protected readonly hovered = this.hover.hovered;

  constructor() {
    const destroyRef = inject(DestroyRef);
    // ⚠ B4: clearing on mouseleave alone is not enough — a click leaves the list
    // via navigation, and the preview card would still be on screen when the
    // detail page mounts.
    const sub = inject(Router).events.subscribe((event) => {
      if (event instanceof NavigationStart) this.clear();
    });
    destroyRef.onDestroy(() => sub.unsubscribe()); // ⚠ B3
  }

  protected activate(project: Project): void {
    this.hover.hovered.set(project);
  }

  protected clear(): void {
    this.hover.hovered.set(null);
  }

  /** Display order — derived from position, never stored on the project. */
  protected pad(index: number): string {
    return String(index + 1).padStart(2, '0');
  }
}
