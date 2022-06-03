'use strict';
import { ECollisions } from './ECollisions.mjs';
import { Vector } from './Vector2D.mjs';

export const Player = function ({ x, y, size, maxSpeed, sightMaxDistance, FOV = 130 }) {
  const p = ECollisions.createCircle(x, y, size);
  p.maxHealth = 10;
  p.currentHealth = p.maxHealth;
  p.FOVarea = ECollisions.createCircle(x, y, 1200);
  p.FOV = FOV;
  p.halfFOV = FOV * 0.5;
  p.velocity = new Vector();
  p.walkSpeed = maxSpeed;
  p.sprintSpeed = maxSpeed * 2;
  p.friction = 0.9;
  p.sightMaxDistance = sightMaxDistance;
  p.isSprinting = false;
  p.stamina = 1;
  p.tags = ['player'];

  p.solveCollisions = function (Result) {
    const potentials = this.potentials();
    for (const body of potentials) {
      if (body.hasTags('obstacle') && this.collides(body, Result)) {
        body.block(this, Result);
      }
    }
  };

  p.receiveDamage = function (damageAmount) {
    this.currentHealth -= damageAmount;
  };

  return p;
};
