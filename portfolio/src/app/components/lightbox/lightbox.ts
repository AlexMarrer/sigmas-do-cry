import { ChangeDetectionStrategy, Component } from '@angular/core';

// TODO(spec: specs/lightbox.md)
// Gallery lightbox on CDK Overlay: FocusTrap, focus restore, scroll-block,
// Esc/←/→, LiveAnnouncer. Loaded via @defer from the gallery page so CDK
// stays out of the initial bundle (⚠ E2).
@Component({
  selector: 'app-lightbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<!-- TODO(spec: specs/lightbox.md) -->`,
})
export class Lightbox {}
