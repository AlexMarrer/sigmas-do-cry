import { Injectable } from '@angular/core';

// TODO(spec: specs/00-checklist.md § MotionService, landmine E3)
// The single JS-side gate for motion: exposes e.g. `reducedMotion` and
// `finePointer` (hover: hover / pointer: fine). ⚠ A1: matchMedia is
// browser-only — must be SSR-safe (safe defaults on the server, real values
// in the browser). CSS keyframes are gated separately in _reset.scss.
@Injectable({ providedIn: 'root' })
export class MotionService {}
