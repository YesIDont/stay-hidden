'use strict';
import { Body } from './Body.mjs';

export class Circle extends Body {
  constructor(x = 0, y = 0, radius = 0, scale = 1, padding = 0) {
    super(x, y, padding);

    this.radius = radius;
    this.scale = scale;
  }

  draw(context) {
    const x = this.x;
    const y = this.y;
    const radius = this.radius * this.scale;

    context.moveTo(x + radius, y);
    context.arc(x, y, radius, 0, Math.PI * 2);
  }
}
