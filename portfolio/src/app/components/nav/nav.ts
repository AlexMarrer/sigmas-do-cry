import { ChangeDetectionStrategy, Component, DOCUMENT, ElementRef, effect, inject, signal, viewChild } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: "app-nav",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: "./nav.html",
  styleUrls: ["./nav.scss"],
  host: {
    "(document:keydown.escape)": "closeMenu(true)",
  },
})
export class SiteNav {
  // exact:true only for Home — otherwise its dot lights up on every route
  // (`/` is a prefix of everything). false lets Work match /work/:slug for free.
  protected readonly links = [
    { path: "/", label: "Home", exact: true },
    { path: "/work", label: "Work", exact: false },
    { path: "/about", label: "About", exact: false },
    { path: "/gallery", label: "Gallery", exact: false },
  ] as const;

  protected readonly menuOpen = signal(false);

  private readonly doc = inject(DOCUMENT);
  private readonly burger = viewChild<ElementRef<HTMLButtonElement>>("burger");
  private readonly menu = viewChild<ElementRef<HTMLElement>>("menu");

  constructor() {
    // Scroll-lock the page while the sheet is up, and move focus into it once
    // @if has rendered it (menu() flips from undefined → effect reruns).
    effect(() => {
      const open = this.menuOpen();
      this.doc.body.classList.toggle("u-no-scroll", open);
      if (open) this.menu()?.nativeElement.focus();
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  // refocusBurger: only for Escape — after a link click the router moves on,
  // and the burger may already be display:none again.
  protected closeMenu(refocusBurger = false): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (refocusBurger) this.burger()?.nativeElement.focus();
  }
}
