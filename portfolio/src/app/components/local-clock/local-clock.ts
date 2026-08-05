import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// spec: specs/clock.md — "HH:MM · Basel", Europe/Zurich, 20s refresh.
@Component({
  selector: 'app-local-clock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './local-clock.html',
  styleUrls: ['./local-clock.scss'],
})
export class LocalClock {
  // ⚠ A2: this placeholder is what the server renders into all 13 static
  // pages — the first real value is written only after hydration, or every
  // page throws NG0500. Never new Date() in the template or during SSR.
  readonly time = signal('–:–');

  constructor() {
    // ⚠ A2, hard-learned: afterNextRender alone did NOT skip the Analog
    // prerender here (the build time got baked into the static pages), so the
    // platform guard is load-bearing, not belt-and-suspenders.
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const destroyRef = inject(DestroyRef);

    // ⚠ A1: browser-only — an interval started in the constructor would also
    // run (and leak) during prerender.
    afterNextRender(() => {
      const fmt = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Zurich',
      });
      // Zoneless: the signal write IS the change-detection trigger.
      const tick = () => this.time.set(fmt.format(new Date()));
      tick();
      const id = setInterval(tick, 20_000);
      destroyRef.onDestroy(() => clearInterval(id)); // ⚠ B3
    });
  }
}
