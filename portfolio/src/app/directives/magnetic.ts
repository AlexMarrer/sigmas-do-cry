import { Directive } from '@angular/core';

// TODO(spec: specs/magnetic.md)
// Magnetic pull toward the cursor (×.25 / ×.35), spring-back .35s.
// ⚠ D3: writes --mx/--my custom props, NOT style.transform — the footer CTA
// circle already carries translateY(-50%). Listens on the host (not document),
// browser-only, gated by MotionService (hover: none ⇒ off), cleanup via
// DestroyRef.
@Directive({
  selector: '[appMagnetic]',
})
export class Magnetic {}
