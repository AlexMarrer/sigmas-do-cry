import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { MotionService } from '../services/motion.service';

// spec: specs/scroll-reveal.md — one-shot fade/slide-in on first scroll into
// view. Visual variants are template classes (styles/_reveal.scss).
@Directive({
  selector: '[appScrollReveal]',
})
export class ScrollReveal {
  readonly revealDelay = input(0, { transform: numberAttribute }); // ms
  readonly revealDuration = input(800, { transform: numberAttribute }); // ms
  readonly revealOffset = input('0px'); // rootMargin bottom, e.g. '-120px'
  // ⚠ A3: only for elements that were NEVER in the prerendered HTML — content
  // the user is already looking at must not blink out and fade back in.
  readonly revealAlways = input(false, { transform: booleanAttribute });

  constructor() {
    const el = inject(ElementRef).nativeElement as HTMLElement;
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);

    // ⚠ A1/A5: browser-only, after hydration.
    afterNextRender(() => {
      if (motion.reducedMotion()) return; // ⚠ E3
      // Visible on load (top above ~86% of the viewport) → leave it alone (⚠ A3),
      // unless the element only came into existence on an interaction.
      if (!this.revealAlways() && el.getBoundingClientRect().top < window.innerHeight * 0.86) {
        return;
      }

      el.style.setProperty('--reveal-delay', `${this.revealDelay()}ms`);
      el.style.setProperty('--reveal-duration', `${this.revealDuration()}ms`);
      el.classList.add('reveal--waiting');

      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          el.classList.remove('reveal--waiting');
          el.classList.add('reveal--in');
          io.disconnect(); // one-shot — no re-hiding on scroll-up
        },
        { threshold: 0.12, rootMargin: `0px 0px ${this.revealOffset()} 0px` },
      );
      io.observe(el);
      destroyRef.onDestroy(() => io.disconnect()); // ⚠ B3
    });
  }
}
