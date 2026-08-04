import { ChangeDetectionStrategy, Component } from '@angular/core';

// TODO(spec: specs/cursor-preview.md)
// Fixed, pointer-events:none card that lerps after the cursor (rAF, factor
// .13). ⚠ B1: the loop writes style.transform DIRECTLY — never a signal per
// frame. Visibility comes from ProjectHoverService.hovered. Browser-only
// (afterNextRender), disabled for touch/reduced-motion via MotionService.
@Component({
  selector: 'app-cursor-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<!-- TODO(spec: specs/cursor-preview.md) -->`,
})
export class CursorPreview {}
