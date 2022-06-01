'use strict';
import { ECollisions } from './ECollisions.mjs';
import { AStarPathfinder } from './pathfinder/AStarPathfinder.mjs';

export const Monster = function ({ x, y, size, gridProps, player }) {
  let monster = ECollisions.createCircle(x, y, size);
  monster.speed = 40;
  monster.damage = 2;
  monster.damageCooldownSeconds = 1;
  monster.damageCooldownCounter = 0;
  monster.pathfinder = new AStarPathfinder(gridProps);
  monster.player = player;
  monster.direction = { x: 0, y: 0 };
  // array of points to follow
  monster.scent = [];
  monster.spriteAngle = 0;

  monster.setDirection = function (x, y) {
    const length = Math.sqrt(x * x + y * y);
    this.direction.x = x / length;
    this.direction.y = y / length;
  };

  monster.solveCollisions = function (Result, timeDelta) {
    const potentials = this.potentials();
    for (const body of potentials) {
      if (body.tags) {
        // if (body.tags.includes('player')) {
        //   this.damageCooldownCounter += timeDelta;
        //   if (this.damageCooldownCounter > this.damageCooldownSeconds) {
        //     body.getDamage(this.damage);
        //     this.damageCooldownCounter = 0;
        //   }
        // }

        if (body.hasTags('obstacle') && this.collides(body, Result)) {
          body.block(this, Result);
        }
      }
    }
  };

  monster.move = function (timeDelta) {
    this.x += this.direction.x * this.speed * timeDelta;
    this.y += this.direction.y * this.speed * timeDelta;
  };

  monster.solveAILogic = function (timeDelta, tileSize) {
    const { scent, pathfinder } = this;
    const monsterCell = pathfinder.grid.getCellUnderPointer(this.x, this.y, tileSize);
    const playerCell = pathfinder.grid.getCellUnderPointer(this.player.x, this.player.y, tileSize);

    if (monsterCell?.id === playerCell?.id) {
      this.setDirection(this.player.x - Math.round(this.x), this.player.y - Math.round(this.y));
      this.move(timeDelta);
      return;
    }

    scent.length = 0;
    pathfinder.grid.setOrigin(monsterCell);
    pathfinder.grid.setTarget(playerCell);
    pathfinder.findPath(scent);
    scent.push(playerCell);

    if (scent.length > 0) {
      this.setDirection(
        tileSize * 0.5 + scent[0].x * tileSize - Math.round(this.x),
        tileSize * 0.5 + scent[0].y * tileSize - Math.round(this.y),
      );
      this.move(timeDelta);
    }
  };

  return monster;
};
