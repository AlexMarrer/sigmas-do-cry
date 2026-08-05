import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideFileRouter } from '@analogjs/router';
import {
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    // Zoneless: all state is signals; per-frame effects write the DOM directly
    // (landmines B1/B2 in specs/00-checklist.md).
    provideZonelessChangeDetection(),
    provideFileRouter(
      // [slug] arrives as a component input — no ActivatedRoute plumbing (C3).
      withComponentInputBinding(),
      // SPA navigations must land at the top of the page (C4).
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
      // Drives the nav's active-dot morph (see nav.scss + styles.scss).
      // skipInitialTransition: no transition on the SSG/hydration first paint.
      withViewTransitions({ skipInitialTransition: true }),
    ),
    provideClientHydration(withEventReplay()),
  ],
};
