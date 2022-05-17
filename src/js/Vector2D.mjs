'use strict';
import { randomInRange } from './utils/Utils.mjs';

export const Vector = function (x = 0, y = 0)
{
  this.x = x;

  this.y = y;

  return this;
};

Vector.getRandomUnit = function ()
{
  const v = new Vector(randomInRange(-1, 1), randomInRange(-1, 1));

  return v.normalize();
};

Vector.prototype.getLength = function ()
{
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.normalize = function ()
{
  const length = this.getLength();

  this.x = this.x / length;

  this.y = this.y / length;

  return this;
};
