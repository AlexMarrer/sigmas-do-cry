import { Injectable, signal } from '@angular/core';
import type { Project } from '../data/types';

// The ONE piece of shared UI state (⚠ B4): project rows write it on
// mouseenter/focus, row expansion and the cursor-preview card read it.
// Remember to clear it on list mouseleave AND on navigation, or the preview
// card survives onto the detail page.
@Injectable({ providedIn: 'root' })
export class ProjectHoverService {
  readonly hovered = signal<Project | null>(null);
}
