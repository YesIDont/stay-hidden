'use strict';
import { BVH } from './BVH.mjs';
import { Circle } from './Circle.mjs';
import { Point } from './Point.mjs';
import { Polygon } from './Polygon.mjs';
import { Result } from './Result.mjs';
import { SAT } from './SAT.mjs';

// A collision system used to track bodies in order to improve collision detection performance
export class Collisions {
  constructor() {
    this._bvh = new BVH();
  }

  createCircle(x = 0, y = 0, radius = 0, scale = 1, padding = 0) {
    const body = new Circle(x, y, radius, scale, padding);

    this._bvh.insert(body);

    return body;
  }

  createPolygon(x = 0, y = 0, points = [[0, 0]], angle = 0, scale_x = 1, scale_y = 1, padding = 0) {
    const body = new Polygon(x, y, points, angle, scale_x, scale_y, padding);

    this._bvh.insert(body);

    return body;
  }

  createPoint(x = 0, y = 0, padding = 0) {
    const body = new Point(x, y, padding);

    this._bvh.insert(body);

    return body;
  }

  createResult() {
    return new Result();
  }

  static createResult() {
    return new Result();
  }

  // Inserts bodies into the collision system
  insert(...bodies) {
    for (const body of bodies) {
      this._bvh.insert(body, false);
    }

    return this;
  }

  // Removes bodies from the collision system
  remove(...bodies) {
    for (const body of bodies) {
      this._bvh.remove(body, false);
    }

    return this;
  }

  // Updates the collision system. This should be called before any collisions are tested.
  update() {
    this._bvh.update();

    return this;
  }

  // Draws the bodies within the system to a CanvasRenderingContext2D's current path
  draw(context) {
    return this._bvh.draw(context);
  }

  drawBVH(context) {
    return this._bvh.drawBVH(context);
  }

  // Returns a list of potential collisions for a body
  potentials(body) {
    return this._bvh.potentials(body);
  }

  // Determines if two bodies are colliding
  collides(source, target, result = null, aabb = true) {
    return SAT(source, target, result, aabb);
  }
}
