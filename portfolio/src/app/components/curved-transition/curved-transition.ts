import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../../services/motion.service';

// Reusable section seam — drop it between any two sections and set the colours
// via --transition-from / --transition-to (see curved-transition.scss). The
// scroll link is a single custom property written per frame, which is exactly
// the "scrub" behaviour: progress is derived from position, never tweened.
@Component({
  selector: 'app-curved-transition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './curved-transition.html',
  styleUrls: ['./curved-transition.scss'],
})
export class CurvedTransition {
  /**
   * Geometry preset. Pair the stronger ones with a longer scroll span
   * (`bold` ≈ end 0.35, `dome` ≈ end 0.3), or a tall bulge collapses in a jolt.
   */
  readonly strength = input<'subtle' | 'default' | 'bold' | 'dome'>('default');
  /** Flip the curve so the following section bulges up into the previous one. */
  readonly reverse = input(false, { transform: booleanAttribute });
  /** Keep the full bulge, never animate. */
  readonly frozen = input(false, { transform: booleanAttribute });
  /** Viewport fraction the seam's top edge sits at when progress is 0. */
  readonly start = input(1, { transform: numberAttribute });
  /** Viewport fraction the seam's top edge sits at when progress is 1. */
  // Deeper curves need more scroll to unfold — keep these in step if you raise
  // --transition-height, or a tall bulge collapses in a jolt.
  readonly end = input(0.4, { transform: numberAttribute });

  constructor() {
    // ⚠ A2, same trap as local-clock: afterNextRender does NOT skip the Analog
    // prerender, so everything below would run in Node where no DOM globals
    // exist. Until now only MotionService's reducedMotion default (true on the
    // server) shielded this — one early return, and the build threw.
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const host = inject(ElementRef).nativeElement as HTMLElement;
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);

    // ⚠ A1/A5: browser-only, after hydration.
    afterNextRender(() => {
      const root = host.firstElementChild as HTMLElement | null;
      if (!root || this.frozen()) return;

      let frame = 0;
      let last = -1;
      // ⚠ MOBILE: window.innerHeight shrinks and grows while the URL bar hides
      // on scroll, and every change fires a resize MID-SCRUB. Reading it per
      // frame moves both ends of the range under the curve and pops it by
      // ~15% in a single frame. Cache it, refresh only on a real WIDTH change
      // (a desktop height-only drag stays stale until the next width change —
      // the trade the mobile jank is worth).
      let vw = window.innerWidth;
      let vh = window.innerHeight;

      const update = () => {
        frame = 0;
        // ⚠ E3 — checked every frame, not once at setup: the OS setting can
        // flip mid-session while the listeners stay attached.
        if (motion.reducedMotion()) {
          if (last !== 0) root.style.setProperty('--curve-p', String((last = 0)));
          return;
        }
        // Guard start === end — a zero span would divide by 0 and blow up to NaN.
        const span = (this.start() - this.end()) * vh || 1;
        const raw = (this.start() * vh - root.getBoundingClientRect().top) / span;
        const p = Math.min(1, Math.max(0, raw));
        // Both ends of the scrub clamp for a long time — skip the style write
        // (and the restyle it schedules) once the value stops moving.
        if (p === last) return;
        root.style.setProperty('--curve-p', String((last = p)));
      };

      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(update);
      };

      const onResize = () => {
        if (window.innerWidth !== vw) {
          vw = window.innerWidth;
          vh = window.innerHeight;
        }
        schedule();
      };

      update(); // deep-links / reloads mid-page start at the right progress

      // The scroll handler only exists while the seam is within a viewport of
      // the fold — otherwise every scroll frame of the whole page pays for a
      // layout read it cannot use. Leaving the band always ends with one last
      // update, so a fling that outruns the observer still settles clamped.
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            window.addEventListener('scroll', schedule, { passive: true });
          } else {
            window.removeEventListener('scroll', schedule);
          }
          schedule();
        },
        { rootMargin: '100% 0px' },
      );
      io.observe(root);
      window.addEventListener('resize', onResize, { passive: true });

      destroyRef.onDestroy(() => {
        // ⚠ B3
        cancelAnimationFrame(frame);
        io.disconnect();
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', onResize);
      });
    });
  }
}
