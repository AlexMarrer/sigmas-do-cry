import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CircleBadge } from '../circle-badge/circle-badge';
import { HoverWipe } from '../../directives/hover-wipe';
import { Magnetic } from '../../directives/magnetic';
import { ScrollReveal } from '../../directives/scroll-reveal';

// spec: specs/02-home.md § Section 2
@Component({
  selector: 'app-intro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CircleBadge, HoverWipe, Magnetic, ScrollReveal],
  templateUrl: './intro.html',
  styleUrls: ['./intro.scss'],
})
export class Intro {}
