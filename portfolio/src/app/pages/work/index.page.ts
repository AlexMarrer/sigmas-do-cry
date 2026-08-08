import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouteMeta } from '@analogjs/router';
import { ProjectRows } from '../../components/project-rows/project-rows';
import { projects } from '../../data/projects';

// Derived, never typed out: the design's "2021 → 2025" was true for the
// placeholder set and silently goes stale the moment a project is added.
const years = projects.map((project) => Number(project.year)).filter(Number.isFinite);
const span = `${Math.min(...years)} → ${Math.max(...years)}`;

export const routeMeta: RouteMeta = {
  title: 'Work — Alex Uscata',
  meta: [{ name: 'description', content: `Client & side projects — ${span}.` }],
};

// spec: specs/03-work.md § Work page
@Component({
  selector: 'app-work-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProjectRows],
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
})
export default class WorkPage {
  protected readonly projects = projects;
  protected readonly count = projects.length;
  protected readonly span = span;
}
