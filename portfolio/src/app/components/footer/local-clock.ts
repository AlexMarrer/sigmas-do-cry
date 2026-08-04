import { ChangeDetectionStrategy, Component } from '@angular/core';

// TODO(spec: specs/clock.md)
// Live "HH:MM · Basel" (Europe/Zurich, 20s interval). ⚠ LANDMINE A2: the
// server must render a stable placeholder — first real value only in
// afterNextRender, or hydration breaks.
@Component({
  selector: 'app-local-clock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<!-- TODO(spec: specs/clock.md) -->`,
})
export class LocalClock {}
