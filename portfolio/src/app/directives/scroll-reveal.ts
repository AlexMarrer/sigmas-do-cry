import { Directive } from '@angular/core';

// TODO(spec: specs/scroll-reveal.md)
// IntersectionObserver reveal (threshold .12, translateY(34px)+opacity, .8s).
// ⚠ A3: the hidden state is applied in the BROWSER ONLY (afterNextRender) and
// only to elements below ~86% of the viewport — prerendered HTML must never
// ship invisible content. Cleanup via DestroyRef (⚠ B3).
@Directive({
  selector: '[appScrollReveal]',
})
export class ScrollReveal {}
