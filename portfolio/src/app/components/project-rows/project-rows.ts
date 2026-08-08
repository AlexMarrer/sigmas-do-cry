import { ChangeDetectionStrategy, Component, DestroyRef, inject, input } from "@angular/core";
import { NavigationStart, Router, RouterLink } from "@angular/router";
import { HoverWipe } from "../../directives/hover-wipe";
import { ProjectHoverService } from "../../services/project-hover.service";
import type { Project } from "../../data/types";

@Component({
  selector: "app-project-rows",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, HoverWipe],
  templateUrl: "./project-rows.html",
  styleUrls: ["./project-rows.scss"],
})
export class ProjectRows {
  readonly projects = input.required<Project[]>();
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
    return String(index + 1).padStart(2, "0");
  }
}
