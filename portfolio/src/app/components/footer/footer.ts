import { ChangeDetectionStrategy, Component } from "@angular/core";
import { LocalClock } from "../local-clock/local-clock";
import { Magnetic } from "../../directives/magnetic";

// spec: specs/07-footer.md — CTA circle + email pill are magnetic (⚠ D3: the
// directive writes --mx/--my, the styles compose them into the transform);
// bottom bar hosts the live <app-local-clock> (⚠ A2).
@Component({
  selector: "app-footer",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LocalClock, Magnetic],
  templateUrl: "./footer.html",
  styleUrls: ["./footer.scss"],
})
export class SiteFooter {}
