import { ChangeDetectionStrategy, Component } from '@angular/core';

// spec: specs/02-home.md § Section 2 (circle badge)
@Component({
  selector: 'app-circle-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './circle-badge.html',
  styleUrls: ['./circle-badge.scss'],
})
export class CircleBadge {}
