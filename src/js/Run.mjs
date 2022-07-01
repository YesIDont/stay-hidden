'use strict';
import { Assets } from './Assets.mjs';
import { Collisions } from './collisions/Collisions.mjs';
import { ECollisions } from './ECollisions.mjs';
import { Flashlight } from './Flashlight.mjs';
import { newFlickerEffect } from './FlickerEffect.mjs';
import { FpsDisplay } from './FpsDisplay.mjs';
import { Keys, KeysBindings } from './Keys.mjs';
import { newLightSource } from './LightSource.mjs';
import { Level } from './Map.mjs';
import { newMaze } from './Maze.mjs';
import { Monster } from './Monster.mjs';
import { Mouse } from './Mouse.mjs';
import { Player } from './Player.mjs';
import { newPulsatingEffect } from './PulsatingEffect.mjs';
import { SetupPixiJS } from './SetupPixi.mjs';
import { GetUI } from './UI.mjs';
import { GetFOVpolygon } from './utils/GetFOVpolygon.mjs';
import * as utils from './utils/Utils.mjs';

function Run() {
  const {
    clamp,
    randomInRange,
    mapRangeClamped,
    fillRectangle,
    strokePolygon,
    fillPolygon,
    fillCircle,
    normalizeVector,
    getRotatedVector,
    angleToRadians,
    strokeSegment,
  } = utils;
  const Result = Collisions.createResult();
  const fpsDisplay = new FpsDisplay();

  // const map = new Map({
  //   columns: 16,
  //   rows: 16,
  //   tileSize: 240, // 140
  //   wallsThickness: 32,
  // });
  const level = new Level({
    columns: 8,
    rows: 8,
    tileSize: 220,
    wallsThickness: 32,
  });
  // const level = new Level({
  //   columns: 1,
  //   rows: 1,
  //   tileSize: 512, // 140
  //   wallsThickness: 8,
  // });

  const mapSize = level.GetSize();
  const player = new Player({
    x: level.GetWorldPositionAtTileAddress(0),
    y: level.GetWorldPositionAtTileAddress(0),
    size: 25,
    maxSpeed: 80,
    sightMaxDistance: 600,
  });
  const flashlight = new Flashlight(150, 10);
  const UiPadding = 30;
  let VisibleAreaPoly = {};

  const {
    DebugDraw,
    Draw,
    FlashlightIconMask,
    Graphics,
    HealthMask,
    HighlightsChangel,
    LightsTexture,
    Loader,
    Screen,
    LevelContainer,
    PlayerVisibleAreaMask,
    UIDraw,
    UIStage,
    VisibilityContainer,
    Renderer,
    whiteBackgroundSprite,
    LightsColorsSprite,
  } = SetupPixiJS(mapSize);

  PlayerVisibleAreaMask.lineStyle(0);

  function AssetsPostLoadActions(loader, resources) {
    const Sprites = Assets.GetSprites(resources);
    const {
      playerSprite,
      blackPixel,
      aimSightSprite,
      floorSprite,
      flashlightSprite,
      iconFlashlightUsedRed,
      iconFlashlight,
      iconHealthLostRed,
      iconHealth,
      droneSprite,
    } = Sprites;

    Mouse.attach(aimSightSprite);

    flashlightSprite.height = player.sightMaxDistance;

    iconFlashlight.x = iconFlashlightUsedRed.x = UiPadding;
    iconFlashlight.y = iconFlashlightUsedRed.y = Screen.height - UiPadding - iconFlashlight.height;

    iconHealth.x = iconHealthLostRed.x = Screen.width - iconHealth.width - UiPadding;
    iconHealth.y = iconHealthLostRed.y = Screen.height - iconHealth.height - UiPadding;
    iconHealth.mask = HealthMask;

    floorSprite.width = mapSize.width;
    floorSprite.height = mapSize.height;

    iconFlashlight.mask = FlashlightIconMask;

    VisibilityContainer.addChild(
      PlayerVisibleAreaMask,
      floorSprite,
      playerSprite,
      droneSprite,
      LightsColorsSprite,
      // HighlightsChangel,
      Draw,
    );

    DebugDraw.x = LevelContainer.x = Screen.width * 0.5 - player.x;
    DebugDraw.y = LevelContainer.y = Screen.height * 0.5 - player.y;

    UIStage.addChild(iconFlashlightUsedRed, iconFlashlight, iconHealthLostRed, iconHealth, aimSightSprite, DebugDraw);

    const sounds = Assets.GetSounds();
    const { facilityAmbient, footstepsSound, lightSwitchSound, batteryDeadSound } = sounds;

    facilityAmbient.volume(1);

    const maze = newMaze(ECollisions, level, false);
    const corridorsLights = maze.pathfindingData
      .map((cell) => {
        const lights = cell.walls.map(({ a, b }) => {
          const horizontalMiddle = Math.max(a.x, b.x) - Math.min(a.x, b.x);
          const verticallMiddle = Math.max(a.y, b.y) - Math.min(a.y, b.y);

          return [
            [0, 0],
            [a.x + horizontalMiddle * 0.25, a.y + verticallMiddle * 0.25],
            [a.x + horizontalMiddle * 0.5, a.y + verticallMiddle * 0.5],
            [a.x + horizontalMiddle * 0.75, a.y + verticallMiddle * 0.75],
          ].map(([x, y]) =>
            newLightSource(
              resources,
              x,
              y,
              110,
              110,
              randomInRange() > 0.15 ? newPulsatingEffect(0.1, 0.75) : newFlickerEffect(0.35, 2, true),
              'red',
            ),
          );
        });

        if (randomInRange() > 0.7) {
          lights.push(
            newLightSource(
              resources,
              level.GetWorldPositionAtTileAddress(cell.x),
              level.GetWorldPositionAtTileAddress(cell.y),
              270,
              270,
              // newPulsatingEffect(0.5, 0.35),
              newFlickerEffect(randomInRange(0.1, 0.3), 0.2, true),
            ),
          );
        }

        return lights;
      })
      .flat(2)
      // remove duplicated lights
      .reduce((acc, curr) => (!acc.find((i) => i.x === curr.x && i.y === curr.y) ? [curr, ...acc] : acc), []);

    const monster = new Monster({
      x: level.GetWorldPositionAtTileAddress(level.rows - 1),
      y: level.GetWorldPositionAtTileAddress(level.columns - 1),
      size: 35,
      gridProps: maze.pathfindingData,
      player,
      sounds,
    });
    droneSprite.x = monster.x;
    droneSprite.y = monster.y;

    monster.target = player;

    const gunBlastSprites = [];
    for (let i = 0; i < monster.magazineSize; i++) {
      const sprite = Sprites[`gunBlastSprite${i + 1}`];
      sprite.visible = false;
      gunBlastSprites.push(sprite);
      VisibilityContainer.addChild(sprite);
    }

    const gunBlastLightSprites = [];
    for (let i = 0; i < monster.magazineSize; i++) {
      const sprite = Sprites[`gunBlastLightSprite${i + 1}`];
      sprite.visible = false;
      gunBlastLightSprites.push(sprite);
    }

    let lastUpdateTime = performance.now();
    let potentials = null;

    const { debugDrawSwitch, showBHVSwitch, youDiedScreen, statusBar } = GetUI();
    debugDrawSwitch.addEventListener('change', ({ target }) => {
      fpsDisplay.show(target.checked);
    });

    document.addEventListener('keydown', ({ key }) => {
      if (key === ' ') {
        debugDrawSwitch.checked = !debugDrawSwitch.checked;
        const debugOn = debugDrawSwitch.checked;
        statusBar.style.display = debugOn ? 'inline' : 'none';
        fpsDisplay.show(debugOn);
      }
    });

    function GlobalUpdate() {
      const { velocity, friction, halfFOV } = player;
      const currentTime = performance.now();
      const timeDelta = (currentTime - lastUpdateTime) * 0.001;
      const mouseWorldPosition = Mouse.getMouseWorldPosition(LevelContainer);
      lastUpdateTime = currentTime;

      // INPUT & MOVEMENT
      //////////////////////////////////////////////////////////////////////

      // Flashlight switch
      if (flashlight.switchCooldown === 1) {
        if (Keys[KeysBindings.flashlightSwitch] && flashlight.juice > 0) {
          flashlightSprite.visible = !flashlightSprite.visible;
          flashlight.switchCooldown = 0;

          lightSwitchSound.play();
        }
      } else {
        flashlight.switchCooldown = clamp(flashlight.switchCooldown + timeDelta * 3);
      }

      // Sprint switch
      player.isSprinting = Keys[KeysBindings.sprint];
      if (!debugDrawSwitch.checked) {
        player.stamina = clamp(player.isSprinting ? player.stamina - timeDelta / 10 : player.stamina + timeDelta / 10);
        if (player.stamina === 0) player.isSprinting = false;
      }

      const currentSpeed = player.isSprinting ? player.sprintSpeed : player.walkSpeed;
      // solve player's velocity
      if (Keys[KeysBindings.right]) {
        velocity.x = currentSpeed;
      } else if (Keys[KeysBindings.left]) {
        velocity.x = -currentSpeed;
      }

      if (Keys[KeysBindings.up]) {
        velocity.y = -currentSpeed;
      } else if (Keys[KeysBindings.down]) {
        velocity.y = currentSpeed;
      }

      const velocityLength = velocity.getLength();
      if (velocity.x !== 0) {
        player.x += (velocity.x / velocityLength) * Math.abs(velocity.x) * timeDelta;
        player.FOVarea.x = player.x;
        flashlightSprite.x = player.x;
        LevelContainer.x = Screen.width * 0.5 - player.x;
      }
      if (velocity.y !== 0) {
        player.y += (velocity.y / velocityLength) * Math.abs(velocity.y) * timeDelta;
        player.FOVarea.y = player.y;
        flashlightSprite.y = player.y;
        LevelContainer.y = Screen.height * 0.5 - player.y;
      }

      velocity.x *= friction;
      if (velocity.x < 0.01 && velocity.x > -0.01) velocity.x = 0;
      velocity.y *= friction;
      if (velocity.y < 0.01 && velocity.y > -0.01) velocity.y = 0;

      // SOLVE COLLISIONS
      //////////////////////////////////////////////////////////////////////

      ECollisions.update();

      monster.update(timeDelta, level.tileSize, Result);
      const targetAngle = Math.atan2(monster.lookDirection.y, monster.lookDirection.x) + Math.PI * 0.5;
      droneSprite.rotation = utils.interpolateRadians(droneSprite.rotation, targetAngle, timeDelta);

      // solve player's collisions
      player.solveCollisions(Result);
      monster.solveCollisions(Result, timeDelta);

      // get obstacles that are overlaping with FOV area
      potentials = player.FOVarea.potentials();
      const obstaclesWithinSight = [];
      for (const body of potentials) {
        if (body.hasTags('obstacle') && player.FOVarea.collides(body, Result)) {
          obstaclesWithinSight.push(body);
        }
      }

      // STATE UDPATES
      //////////////////////////////////////////////////////////////////////

      playerSprite.x = player.x;
      playerSprite.y = player.y;
      const angle = Mouse.getMouseToPointAngle({
        x: LevelContainer.x + player.x,
        y: LevelContainer.y + player.y,
      });
      playerSprite.rotation = angle - Math.PI * 0.5;
      flashlightSprite.rotation = angle;
      flashlightSprite.x = playerSprite.x + Math.cos(angle - Math.PI * 0.5) * 50;
      flashlightSprite.y = playerSprite.y + Math.sin(angle - Math.PI * 0.5) * 50;

      if (player.currentHealth <= 0) {
        youDiedScreen.style.display = 'flex';
        Graphics.stop();
        return;
      }

      if (!debugDrawSwitch.checked) {
        flashlight.juice = clamp(
          flashlightSprite.visible
            ? flashlight.juice - timeDelta / flashlight.consumptionRate
            : flashlight.juice + timeDelta / flashlight.rechargeRate,
        );

        if (flashlight.juice === 0) {
          flashlightSprite.visible = false;
          flashlight.switchCooldown = 0;
          batteryDeadSound.play();
        }
      }

      droneSprite.x = monster.x;
      droneSprite.y = monster.y;

      if (flashlightSprite.visible) {
        flashlightSprite.alpha = flashlight.flickerEffect.update(timeDelta);
      }

      footstepsSound.volume(mapRangeClamped(velocityLength, 0, player.sprintSpeed));
      footstepsSound.rate(player.isSprinting ? 1.5 : 0.9);

      // DRAW
      //////////////////////////////////////////////////////////////////////

      whiteBackgroundSprite.visible = debugDrawSwitch.checked;
      Draw.visible = !debugDrawSwitch.checked;

      DebugDraw.clear();
      Draw.clear();
      Draw.lineStyle(0);
      PlayerVisibleAreaMask.clear();
      FlashlightIconMask.clear();
      HighlightsChangel.clear();
      HealthMask.clear();
      UIDraw.clear();

      // Lights
      // ! filter out lights that are not on the screen
      Renderer.render(blackPixel, LightsTexture);

      if (flashlightSprite.visible) Renderer.render(flashlightSprite, LightsTexture, false);

      corridorsLights.forEach((light) => {
        light.update(timeDelta, currentTime);
        Renderer.render(light, LightsTexture, false);
      });

      monster.bullets.forEach((bullet, index) => {
        let sprite = gunBlastSprites[index];
        if (sprite) {
          sprite.visible = bullet.fired;
          sprite.alpha = randomInRange(0.7, 1);
          sprite.x = bullet.x;
          sprite.y = bullet.y;
          sprite.rotation = Math.atan2(bullet.yDirection, bullet.xDirection) - Math.PI * 0.5;
        }
        let lightSprite = gunBlastLightSprites[index];
        if (lightSprite) {
          lightSprite.visible = bullet.fired;
          lightSprite.alpha = randomInRange(0.05, 0.5);
          lightSprite.x = bullet.x;
          lightSprite.y = bullet.y;
          Renderer.render(lightSprite, LightsTexture, false);
        }
      });

      // Draw mask of the area that's visible for the player
      // if (flashlightSprite.visible) {
      const visiblePolygons = [];
      VisibleAreaPoly = GetFOVpolygon(player, obstaclesWithinSight, visiblePolygons);
      if (VisibleAreaPoly.length > 0) {
        // PlayerVisibleAreaMask.blendMode = PIXI.BLEND_MODES.DIFFERENCE;
        PlayerVisibleAreaMask.beginFill(0xff0000);
        PlayerVisibleAreaMask.moveTo(VisibleAreaPoly[0].x, VisibleAreaPoly[0].y);
        for (let i = 1; i < VisibleAreaPoly.length; i++) {
          PlayerVisibleAreaMask.lineTo(VisibleAreaPoly[i].x, VisibleAreaPoly[i].y);
        }
        PlayerVisibleAreaMask.lineTo(VisibleAreaPoly[0].x, VisibleAreaPoly[0].y);
        PlayerVisibleAreaMask.endFill();
      }
      // }

      // UI
      //////////////////////////////////////////////////////////////////////

      // Draw white stripe shrinking when player is sprinting and growing when stamina
      // is regenerating
      if (player.stamina < 1) {
        fillRectangle(
          UIDraw,
          Screen.width * 0.5 - 70 * player.stamina,
          Screen.height - UiPadding - 5,
          140 * player.stamina,
          5,
          0xffffff,
        );
      }

      // Draw flashlight mask that covers portion of flishlight icon
      // to indicate battery consumption
      fillRectangle(
        FlashlightIconMask,
        iconFlashlight.x,
        iconFlashlight.y,
        iconFlashlight.width * flashlight.juice,
        iconFlashlight.height,
        0xffffff,
      );

      // Draw mask to indicate lost health
      const healthIconWidth = iconHealth.width;
      const healthIconHeight = iconHealth.height;
      const healthLostNormalized = mapRangeClamped(player.maxHealth - player.currentHealth, 0, player.maxHealth);
      fillRectangle(
        HealthMask,
        iconHealth.x + healthIconWidth * healthLostNormalized,
        iconHealth.y,
        healthIconWidth - healthIconWidth * healthLostNormalized,
        healthIconHeight,
        0xffffff,
      );

      // DEBUG DRAW
      //////////////////////////////////////////////////////////////////////

      if (debugDrawSwitch.checked) {
        DebugDraw.x = LevelContainer.x;
        DebugDraw.y = LevelContainer.y;

        // draw all obstacles
        maze.wallsGeometry.forEach((obstacle) => {
          strokePolygon(DebugDraw, obstacle.getPoints(), 1, 0x999999, 0.05);
        });

        obstaclesWithinSight.forEach((obstacle) => {
          if (!obstacle.tags.includes('bounds')) {
            fillPolygon(DebugDraw, obstacle.getPoints(), 0xff0000, 0.5);
          }
        });

        // Draw view area circle
        // DebugDraw.beginFill(0xff0000, 0.2);
        // DebugDraw.drawCircle(player.x, player.y, player.sightMaxDistance);

        // sight rays
        if (VisibleAreaPoly) {
          DebugDraw.lineStyle(1, 0x009ffb, 0.3);
          VisibleAreaPoly.forEach((point) => {
            DebugDraw.moveTo(point.x, point.y);
            DebugDraw.lineTo(player.x, player.y);
          });
        }

        // draw player
        fillCircle(DebugDraw, player, player.radius, 0x00ff00);
        fillCircle(DebugDraw, monster, monster.radius, 0xff0000);

        // Draw FOV
        let playerToMouseVector = {
          x: mouseWorldPosition.x - player.x,
          y: mouseWorldPosition.y - player.y,
        };
        playerToMouseVector = normalizeVector(playerToMouseVector);
        playerToMouseVector.x *= player.sightMaxDistance;
        playerToMouseVector.y *= player.sightMaxDistance;

        const FOVbounds = {
          left: getRotatedVector(playerToMouseVector, -halfFOV, player),
          right: getRotatedVector(playerToMouseVector, halfFOV, player),
        };

        // DebugDraw.beginFill(0x00ff00, 0.3);
        // DebugDraw.lineStyle(0);
        // DebugDraw.moveTo(player.x, player.y);
        // // DebugDraw.lineTo(FOVbounds.left.x, FOVbounds.left.y);
        // // DebugDraw.lineTo(FOVbounds.right.x, FOVbounds.right.y);
        // const mod = angleToRadians((180 - player.FOV) * 0.5);
        // // angleToRadians(player.FOV)
        // DebugDraw.arc(
        //   player.x,
        //   player.y,
        //   player.sightMaxDistance,
        //   flashlightSprite.rotation - Math.PI + mod,
        //   flashlightSprite.rotation - mod,
        // );
        // // DebugDraw.lineTo(player.x, player.y);
        // DebugDraw.endFill();

        strokeSegment(DebugDraw, player, FOVbounds.left, 1, 0x00ff00);
        strokeSegment(DebugDraw, player, FOVbounds.right, 1, 0x00ff00);

        if (showBHVSwitch.checked) {
          DebugDraw.lineStyle(1, 0x00ff00, 0.3);
          ECollisions.drawBVH(DebugDraw);
        }

        fpsDisplay.update(timeDelta);
      }
    }

    Graphics.ticker.add(GlobalUpdate);
    Graphics.start();
  }

  Loader.load(AssetsPostLoadActions);
}

window.addEventListener('load', Run);
