import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  PLATFORM_ID,
  afterNextRender,
  computed,
  effect,
  inject,
  linkedSignal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../../services/motion.service';
import { ProjectHoverService } from '../../services/project-hover.service';
import { coverBackground } from '../../data/projects';
import type { Project } from '../../data/types';

// spec: specs/cursor-preview.md — rendered once in the app shell, fed by
// ProjectHoverService.hovered (⚠ B4), same signal the row expansion reads.
@Component({
  selector: 'app-cursor-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cursor-preview.html',
  styleUrls: ['./cursor-preview.scss'],
})
export class CursorPreview {
  private readonly hover = inject(ProjectHoverService);
  private readonly motion = inject(MotionService);

  // Touch and reduced-motion switch the card off entirely. Both MotionService
  // signals default to "off" on the server, so the prerendered card can never
  // ship visible.
  protected readonly visible = computed(
    () =>
      this.motion.finePointer() &&
      !this.motion.reducedMotion() &&
      this.hover.hovered() !== null,
  );

  // Reading `hovered` directly would blank the title and the background the
  // instant the row is left — mid-fade-out. Keep the last project until the
  // next one replaces it.
  private readonly shown = linkedSignal<Project | null, Project | null>({
    source: this.hover.hovered,
    computation: (project, previous) => project ?? previous?.value ?? null,
  });

  protected readonly title = computed(() => this.shown()?.title ?? '');
  protected readonly category = computed(() => this.shown()?.category ?? '');
  protected readonly background = computed(() => {
    const project = this.shown();
    return project ? coverBackground(project) : 'none';
  });

  constructor() {
    // ⚠ A2, the trap local-clock and curved-transition already hit:
    // afterNextRender does NOT skip the Analog prerender.
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const host = inject(ElementRef).nativeElement as HTMLElement;
    const injector = inject(Injector);
    const destroyRef = inject(DestroyRef);

    // ⚠ A1/A5: browser-only, after hydration.
    afterNextRender(() => {
      const card = host.firstElementChild as HTMLElement | null;
      // Pointer type does not change mid-session — the listener never needs to
      // exist on touch. Reduced-motion CAN flip mid-session, which is why that
      // half is handled reactively in `visible` instead (⚠ E3).
      if (!card || !this.motion.finePointer()) return;

      // ⚠ B1: all of these are PLAIN fields. A position signal here would run
      // change detection 60×/s — the single worst mistake available in this
      // design. The only signal involved is WHICH project is hovered, and that
      // changes a few times a minute.
      let targetX = window.innerWidth / 2;
      let targetY = window.innerHeight / 2;
      // x/y are the CARD's own top-left, not the cursor — the placement rule
      // below feeds the lerp, so a flip glides instead of jumping.
      let x = 0;
      let y = 0;
      let frame = 0;
      // Cached layout reads: the loop must never measure the DOM (⚠ B1).
      let cardHeight = card.offsetHeight;
      let viewportHeight = window.innerHeight;

      const restX = () => targetX + 30;
      // Below the cursor by default; flips above only when the card would not
      // fit underneath. Because the flip changes the lerp TARGET rather than
      // the written value, the card travels the swap smoothly instead of
      // teleporting a full card height in one frame.
      const restY = () => {
        const below = targetY + 20;
        return below + cardHeight <= viewportHeight - 16
          ? below
          : targetY - cardHeight - 20;
      };

      const write = () => {
        card.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      };

      const loop = () => {
        x += (restX() - x) * 0.13;
        y += (restY() - y) * 0.13;
        write();
        frame = requestAnimationFrame(loop);
      };

      const onMove = (event: MouseEvent) => {
        targetX = event.clientX;
        targetY = event.clientY;
      };
      document.addEventListener('mousemove', onMove, { passive: true });

      // Both feed the placement rule and both change with the window — the card
      // is sized in vw, so its height moves too.
      const onResize = () => {
        cardHeight = card.offsetHeight;
        viewportHeight = window.innerHeight;
      };
      window.addEventListener('resize', onResize, { passive: true });

      // The loop runs only while the card is up. While hidden the pointer is
      // still tracked, and showing snaps to it first — otherwise the card flies
      // in from wherever the previous hover ended.
      effect(
        () => {
          if (this.visible()) {
            if (frame) return;
            x = restX();
            y = restY();
            write();
            frame = requestAnimationFrame(loop);
          } else if (frame) {
            cancelAnimationFrame(frame);
            frame = 0;
          }
        },
        { injector },
      );

      x = restX();
      y = restY();
      write();

      destroyRef.onDestroy(() => {
        // ⚠ B3: this component lives in the app shell and survives every
        // navigation — teardown matters at app teardown and in tests.
        cancelAnimationFrame(frame);
        document.removeEventListener('mousemove', onMove);
        window.removeEventListener('resize', onResize);
      });
    });
  }
}
