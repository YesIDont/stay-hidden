'use strict';
import { Result } from './Result.mjs';
import { SAT } from './SAT.mjs';

// The base class for bodies used to detect collisions
export class Body
{
  constructor(x = 0, y = 0, padding = 0)
  {
    this.x = x;
    this.y = y;

    // The amount to pad the bounding volume when testing for potential collisions
    this.padding = padding;
    this.tags = [];
    this._circle = false;
    this._polygon = false;
    this._point = false;
    this._bvh = null;
    this._bvh_parent = null;
    this._bvh_branch = false;
    this._bvh_padding = padding;
    this._bvh_min_x = 0;
    this._bvh_min_y = 0;
    this._bvh_max_x = 0;
    this._bvh_max_y = 0;
  }

  // Determines if the body is colliding with another body
  collides(target, result = null, aabb = true)
  {
    return SAT(this, target, result, aabb);
  }

  // Returns a list of potential collisions
  potentials()
  {
    const bvh = this._bvh;

    if (bvh === null)
    {
      throw new Error('Body does not belong to a collision system');
    }

    return bvh.potentials(this);
  }

  // Removes the body from its current collision system
  remove()
  {
    const bvh = this._bvh;

    if (bvh)
    {
      bvh.remove(this, false);
    }
  }

  // Creates a Result used to collect the detailed results of a collision test
  createResult()
  {
    return new Result();
  }

  // Static version of the createResult() method
  static createResult()
  {
    return new Result();
  }

  // Collision response behavior: block other body from overlaping by pushing it back
  // along the overlap vector
  block(other, collisionResult)
  {
    other.x -= collisionResult.overlap * collisionResult.overlap_x;
    other.y -= collisionResult.overlap * collisionResult.overlap_y;
  }

  hasTags(...tags)
  {
    return tags.some((tag) => this.tags.includes(tag));
  }
}
