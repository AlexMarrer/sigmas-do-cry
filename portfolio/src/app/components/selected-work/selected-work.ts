import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectRows } from '../project-rows/project-rows';
import { HoverWipe } from '../../directives/hover-wipe';
import { Magnetic } from '../../directives/magnetic';
import { ScrollReveal } from '../../directives/scroll-reveal';
import type { Project } from '../../data/types';

// spec: specs/02-home.md § Section 3
@Component({
  selector: 'app-selected-work',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProjectRows, HoverWipe, Magnetic, ScrollReveal],
  templateUrl: './selected-work.html',
  styleUrls: ['./selected-work.scss'],
})
export class SelectedWork {
  readonly projects = input.required<Project[]>();
  readonly total = input.required<number>();

  protected readonly label = computed(() =>
    String(this.projects().length).padStart(2, '0'),
  );
}
