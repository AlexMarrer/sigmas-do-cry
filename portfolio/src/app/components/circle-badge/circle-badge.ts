import { ChangeDetectionStrategy, Component } from '@angular/core';

// TODO(spec: specs/02-home.md § Circle badge)
// 128px accent circle, rotating SVG textPath ("ALEX USCATA — SOFTWARE
// DEVELOPER —", 18s), ↓ centered. Straddles the light/dark boundary.
@Component({
  selector: 'app-circle-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './circle-badge.html',
  styleUrls: ['./circle-badge.scss'],
})
export class CircleBadge {}
