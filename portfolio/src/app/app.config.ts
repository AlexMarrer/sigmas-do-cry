import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { IMAGE_LOADER, type ImageLoaderConfig } from '@angular/common';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideFileRouter } from '@analogjs/router';
import { widthsFor } from './data/gallery';
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
    // ⚠ F5: this replaces the loader for EVERY NgOptimizedImage in the app, and
    // the plain `ngSrc` goes through it too — hence the passthrough, or the hero's
    // /images/hero-cutout.png would be rewritten into a gallery URL.
    // Gallery srcs are `<trip-slug>/<photo-id>` (see gallery.ts · photoSrc).
    {
      provide: IMAGE_LOADER,
      useValue: ({ src, width }: ImageLoaderConfig) => {
        if (src.startsWith('/')) return src;
        return `/images/gallery/${src}-${width ?? widthsFor(src).at(-1)}.avif`;
      },
    },
  ],
};
