'use strict';
import { ECollisions } from './ECollisions.mjs';
import { AStarPathfinder } from './pathfinder/AStarPathfinder.mjs';
import { Vector } from './Vector2D.mjs';

export const Monster = function ({ x, y, size, gridProps, player }) {
  let monster = ECollisions.createCircle(x, y, size);
  monster.speed = 40;
  monster.damage = 2;
  monster.damageCooldownSeconds = 1;
  monster.damageCooldownCounter = 0;
  monster.destination = Vector.getRandomUnit();
  monster.pathfinder = new AStarPathfinder(gridProps);
  monster.player = player;
  // array of points to follow
  monster.scent = [];

  monster.solveCollisions = function (Result, timeDelta) {
    const potentials = this.potentials();
    for (const body of potentials) {
      if (body.tags) {
        if (body.tags.includes('player')) {
          this.damageCooldownCounter += timeDelta;
          if (this.damageCooldownCounter > this.damageCooldownSeconds) {
            body.getDamage(this.damage);
            this.damageCooldownCounter = 0;
          }
        }

        if (body.hasTags('obstacle') && this.collides(body, Result)) {
          body.block(this, Result);
        }
      }
    }
  };

  monster.move = function (xDirection, yDirection, timeDelta) {
    const length = Math.sqrt(xDirection * xDirection + yDirection * yDirection);
    this.x += (xDirection / length) * this.speed * timeDelta;
    this.y += (yDirection / length) * this.speed * timeDelta;
  };

  monster.solveAILogic = function (timeDelta, tileSize) {
    const { scent, pathfinder } = this;
    const monsterCell = pathfinder.grid.getCellUnderPointer(this.x, this.y, 64);
    const playerCell = pathfinder.grid.getCellUnderPointer(this.player.x, this.player.y, 64);

    if (monsterCell.id === playerCell.id) {
      this.move(this.player.x - Math.round(this.x), this.player.y - Math.round(this.y), timeDelta);
      return;
    }

    pathfinder.grid.setOrigin(monsterCell);
    pathfinder.grid.setTarget(playerCell);
    pathfinder.findPath(scent);
    scent.push(playerCell);

    if (scent.length > 0) {
      this.move(
        tileSize * 0.5 + scent[0].x * tileSize - Math.round(this.x),
        tileSize * 0.5 + scent[0].y * tileSize - Math.round(this.y),
        timeDelta,
      );
    }
  };

  return monster;
};
