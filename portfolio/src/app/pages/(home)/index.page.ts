import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouteMeta } from '@analogjs/router';
import { Hero } from '../../components/hero/hero';
import { Intro } from '../../components/intro/intro';
import { SelectedWork } from '../../components/selected-work/selected-work';
import { CurvedTransition } from '../../components/curved-transition/curved-transition';
import { projects } from '../../data/projects';

export const routeMeta: RouteMeta = {
  title: 'Alex Uscata — Software Developer',
  meta: [
    {
      name: 'description',
      content: 'Alex Uscata — application developer from Basel. Web, app and backend.',
    },
  ],
};

// spec: specs/02-home.md
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Hero, Intro, SelectedWork, CurvedTransition],
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
})
export default class HomePage {
  protected readonly featured = projects.filter((p) => p.featured);
  protected readonly total = projects.length;
}
