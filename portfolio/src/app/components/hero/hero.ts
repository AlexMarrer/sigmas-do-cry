import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Magnetic } from '../../directives/magnetic';

// spec: specs/02-home.md § Section 1
@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, Magnetic],
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss'],
})
export class Hero {}
