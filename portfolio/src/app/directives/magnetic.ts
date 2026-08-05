import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import { MotionService } from '../services/motion.service';

// spec: specs/magnetic.md — pull toward the cursor (×.25 / ×.35), spring back
// via the host's own `transition: transform .35s`.
// ⚠ D3: writes ONLY the --mx/--my custom props — the host's CSS composes them
// into its transform (the footer CTA rests on translateY(-50%); assigning
// style.transform would teleport it onto the line).
// ⚠ B2 (zoneless discipline): per mousemove we touch style props only, never
// signals.
@Directive({
  selector: '[appMagnetic]',
})
export class Magnetic {
  constructor() {
    const el = inject(ElementRef).nativeElement as HTMLElement;
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);

    // ⚠ A1: browser-only; the gate reads real matchMedia values here, never
    // the server defaults.
    afterNextRender(() => {
      if (!motion.finePointer() || motion.reducedMotion()) return;

      // Rect per move, uncached: one element, no loop — and it moves with
      // page scroll (spec).
      const onMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        // Deviation 2026-08-05: prototype used ×.25/×.35 — bumped for a
        // stronger pull (see magnetic.md).
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.35;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.5;
        el.style.setProperty('--mx', `${dx}px`);
        el.style.setProperty('--my', `${dy}px`);
      };
      const onLeave = () => {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      };

      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      destroyRef.onDestroy(() => {
        // ⚠ B3 — nothing survives the element.
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      });
    });
  }
}
