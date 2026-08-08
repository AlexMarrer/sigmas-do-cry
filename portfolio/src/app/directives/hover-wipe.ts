import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import { MotionService } from '../services/motion.service';

// spec: specs/hover-wipe.md — the hover fill grows out of the point the cursor
// entered and collapses toward the point it left.
// ⚠ Writes ONLY the --hx/--hy/--hd custom props; the growing itself is CSS
// (styles/_hover-wipe.scss). Disjoint from [appMagnetic]'s --mx/--my, so both
// directives can sit on the same host without fighting over `transform`.
// ⚠ B2 (zoneless discipline): style props only per event, never signals.
@Directive({
  selector: '[appHoverWipe]',
})
export class HoverWipe {
  constructor() {
    const el = inject(ElementRef).nativeElement as HTMLElement;
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);

    // ⚠ A1: browser-only. Without the directive the CSS falls back to
    // `var(--hx, 50%)` — a centre-out wipe — so SSR/touch/reduced-motion still
    // render a complete hover state.
    afterNextRender(() => {
      if (!motion.finePointer() || motion.reducedMotion()) return;

      // ⚠ enter/leave only — on mousemove the circle's centre would drag around
      // mid-animation. Leave re-aims it so the fill retreats the way you left.
      // ⚠ Never offsetX/offsetY: those are relative to event.target, which is
      // the inner label whenever a button wraps its text. The rect is already
      // post-transform, so this stays correct on magnetic hosts.
      const setOrigin = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty('--hx', `${x}px`);
        el.style.setProperty('--hy', `${y}px`);
        // ⚠ THE timing trap: on a fixed oversized disc the box is visually full
        // well before the transition ends, and that dead air reads as "snaps in,
        // way too fast". Distance to the farthest corner is the radius where
        // coverage completes exactly as the transition ends.
        const radius = Math.hypot(
          Math.max(x, rect.width - x),
          Math.max(y, rect.height - y),
        );
        el.style.setProperty('--hd', `${radius * 2}px`);
      };

      el.addEventListener('mouseenter', setOrigin);
      el.addEventListener('mouseleave', setOrigin);
      destroyRef.onDestroy(() => {
        // ⚠ B3 — nothing survives the element.
        el.removeEventListener('mouseenter', setOrigin);
        el.removeEventListener('mouseleave', setOrigin);
      });
    });
  }
}
