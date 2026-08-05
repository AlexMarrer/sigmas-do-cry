import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// spec: specs/00-checklist.md § MotionService — the single JS-side motion gate
// (landmine E3; the CSS half lives in _reset.scss). ⚠ A1: matchMedia is
// browser-only — on the server both signals keep their safe defaults
// (no motion, no fine pointer), so SSR/prerender never attaches an effect.
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly _reducedMotion = signal(true);
  private readonly _finePointer = signal(false);

  readonly reducedMotion = this._reducedMotion.asReadonly();
  readonly finePointer = this._finePointer.asReadonly();

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const destroyRef = inject(DestroyRef);

    const watch = (query: string, set: (matches: boolean) => void) => {
      const mq = window.matchMedia(query);
      set(mq.matches);
      const onChange = (e: MediaQueryListEvent) => set(e.matches);
      mq.addEventListener('change', onChange);
      destroyRef.onDestroy(() => mq.removeEventListener('change', onChange));
    };

    watch('(prefers-reduced-motion: reduce)', (m) => this._reducedMotion.set(m));
    watch('(hover: hover) and (pointer: fine)', (m) => this._finePointer.set(m));
  }
}
