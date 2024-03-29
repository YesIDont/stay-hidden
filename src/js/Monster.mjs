'use strict';
import { ECollisions } from './ECollisions.mjs';
import { AStarPathfinder } from './pathfinder/AStarPathfinder.mjs';
import { GetClosestSegmentsIntersection } from './utils/GetClosestSegmentsIntersection.mjs';
import { getDistanceFromAtoB, randomInRange } from './utils/utils.mjs';

function spawnBullet(x, y, xDirection, yDirection, damage) {
  const b = ECollisions.createCircle(x, y, 2);
  b.fired = true;
  b.xDirection = xDirection;
  b.yDirection = yDirection;
  b.damage = damage;
  b.speed = 800;

  b.update = function (timeDelta, Result) {
    b.x += b.xDirection * b.speed * timeDelta;
    b.y += b.yDirection * b.speed * timeDelta;

    b.potentials().some((body) => {
      if (b.collides(body, Result)) {
        if (body.hasTags('player')) {
          body.receiveDamage(damage);
          b.fired = false;
          return true;
        }

        if (body.hasTags('obstacle')) {
          b.fired = false;
          return true;
        }
        return false;
      }

      return false;
    });
  };

  b.fire = function (x, y, xDirection, yDirection) {
    b.x = x;
    b.y = y;
    b.fired = true;
    b.xDirection = xDirection;
    b.yDirection = yDirection;
  };

  return b;
}

export const Monster = function ({ x, y, size, gridProps, player, sounds }) {
  const m = ECollisions.createCircle(x, y, size);
  m.sightMaxDistance = 1500;
  m.FOVarea = ECollisions.createCircle(x, y, m.sightMaxDistance);
  m.speed = 40;
  m.damage = 2;
  m.damageCooldownSeconds = 1;
  m.damageCooldownCounter = 0;
  m.pathfinder = new AStarPathfinder(gridProps);
  m.player = player;
  m.direction = { x: 0, y: 0 };
  m.lookDirection = { x: 0, y: 0 };
  // array of points to follow
  m.scent = [];
  m.spriteAngle = 0;
  m.timeDelta = 0;

  m.target = undefined;
  m.targetInView = false;
  m.canFireAtTarget = false;
  m.firePermissionSwitch = () => {
    m.canFireAtTarget = !m.canFireAtTarget;
  };

  sounds.robotFoundTarget.on('end', m.firePermissionSwitch);

  // cannon
  m.magazineSize = 20;
  m.ammo = 20;
  m.rateOfFire = 1 / 30; // per second
  m.rateOfFireCounter = 0;
  m.bullets = [];
  m.reloadTime = 3000;
  m.cannonDamage = 0;
  m.reload = () => {
    m.ammo = m.magazineSize;
    m.rateOfFireCounter = 0;
  };
  m.updateBullets = (b) => {
    if (b.fired) {
      b.update(m.timeDelta, m.result);
    }
  };

  m.setDirection = (x, y) => {
    const length = Math.sqrt(x * x + y * y);
    m.direction.x = x / length;
    m.direction.y = y / length;
  };

  m.solveCollisions = (Result, timeDelta) => {
    const potentials = m.potentials();
    for (const body of potentials) {
      if (body.hasTags('player', 'obstacle') && m.collides(body, Result)) {
        body.block(m, Result);
      }
    }
  };

  m.move = (timeDelta) => {
    m.x += m.direction.x * m.speed * timeDelta;
    m.y += m.direction.y * m.speed * timeDelta;
  };

  m.update = (timeDelta, tileSize, Result) => {
    m.timeDelta = timeDelta;
    m.result = Result;
    const { x, y, target, FOVarea } = m;
    const { x: tx, y: ty } = target;
    FOVarea.x = x;
    FOVarea.y = y;

    const targetInViewRange = getDistanceFromAtoB(x, y, tx, ty) < m.sightMaxDistance;
    const obstaclesGeometry = FOVarea.potentials()
      .filter((o) => o._polygon)
      .map((o) => o.getSegments())
      .flat();
    const segmentFromMeToTarget = [x, y, tx, ty];
    const isTargetObscured = GetClosestSegmentsIntersection(segmentFromMeToTarget, obstaclesGeometry);
    const targetInView = targetInViewRange && !isTargetObscured;

    if (targetInView) {
      if (!m.targetInView) {
        sounds.robotFoundTarget.play();
      }

      if (m.canFireAtTarget) {
        const lx = tx - x;
        const ly = ty - y;
        const length = Math.sqrt(lx * lx + ly * ly);
        m.lookDirection.x = lx / length;
        m.lookDirection.y = ly / length;

        if (m.ammo > 0) {
          m.rateOfFireCounter += timeDelta;
          if (m.rateOfFireCounter > m.rateOfFire) {
            m.ammo--;
            m.rateOfFireCounter = 0;
            let bullet = m.bullets.find((b) => !b.fired);
            if (!bullet) {
              bullet = spawnBullet(x, y, m.lookDirection.x, m.lookDirection.y, m.cannonDamage);
              m.bullets.push(bullet);
            } else {
              bullet.fire(x, y, m.lookDirection.x, m.lookDirection.y);
            }
            sounds.gunshot.volume(randomInRange(0.5, 1));
            sounds.gunshot.play();
          }
        } else {
          setTimeout(m.reload, m.reloadTime);
        }
      }
    }

    m.targetInView = targetInView;
    if (!targetInView) m.canFireAtTarget = false;

    m.bullets.forEach(m.updateBullets);

    const { scent, pathfinder } = m;
    const monsterCell = pathfinder.grid.getCellUnderPointer(m.x, m.y, tileSize);
    const playerCell = pathfinder.grid.getCellUnderPointer(m.player.x, m.player.y, tileSize);

    // if (monsterCell?.id === playerCell?.id) {
    //   m.setDirection(m.player.x - Math.round(m.x), m.player.y - Math.round(m.y));
    //   m.move(timeDelta);
    //   return;
    // }

    scent.length = 0;
    pathfinder.grid.setOrigin(monsterCell);
    pathfinder.grid.setTarget(playerCell);
    pathfinder.findPath(scent);

    if (scent.length > 0) {
      m.setDirection(
        tileSize * 0.5 + scent[0].x * tileSize - Math.round(m.x),
        tileSize * 0.5 + scent[0].y * tileSize - Math.round(m.y),
      );
      m.move(timeDelta);
    }
  };

  return m;
};
