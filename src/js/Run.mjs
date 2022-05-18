'use strict';
import { Assets } from './Assets.mjs';
import { Collisions } from './collisions/Collisions.mjs';
import { ECollisions } from './ECollisions.mjs';
import { Flashlight } from './Flashlight.mjs';
import { FpsDisplay } from './FpsDisplay.mjs';
import { Keys, KeysBindings } from './Keys.mjs';
import { Map } from './Map.mjs';
import { GenerateMaze } from './Maze.mjs';
import { Monster } from './Monster.mjs';
import { Mouse } from './Mouse.mjs';
import { Player } from './Player.mjs';
import { SetupPixiJS } from './SetupPixi.mjs';
import { GetUI } from './UI.mjs';
import { GetFOVpolygon } from './utils/GetFOVpolygon.mjs';
import * as utils from './utils/Utils.mjs';

function Run()
{
  const {
    clamp,
    randomInRange,
    mapValueInRangeClamped,
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

  const map = new Map({
    columns: 16,
    rows: 16,
    tileSize: 240, // 140
    wallsThickness: 32,
  });
  const mapSize = map.GetSize();
  const player = new Player({
    x: 50,
    y: 50,
    size: 10,
    maxSpeed: 80,
    sightMaxDistance: 600,
  });
  const flashlight = new Flashlight(1000, 8);
  const monster = new Monster({
    x: 150,
    y: 50,
    size: 20,
  });
  const UiPadding = 30;
  let VisibleAreaPoly = {};

  const {
    DebugDraw,
    Draw,
    FlashlightIconMask,
    Graphics,
    HealthMask,
    HighlightsChangel,
    Loader,
    Screen,
    LevelContainer,
    PlayerVisibleAreaMask,
    UIDraw,
    UIStage,
  } = SetupPixiJS(mapSize);

  PlayerVisibleAreaMask.lineStyle(0);

  function AssetsPostLoadActions(loader, resources)
  {
    const {
      aimSightSprite,
      floorSprite,
      flashlightSprite,
      iconFlashlightUsedRed,
      iconFlashlight,
      iconHealthLostRed,
      iconHealth,
    } = Assets.GetSprites(resources);

    Mouse.attach(aimSightSprite);

    flashlightSprite.x = player.x;
    flashlightSprite.y = player.y;
    flashlightSprite.height = player.sightMaxDistance;

    iconFlashlight.x = iconFlashlightUsedRed.x = UiPadding;
    iconFlashlight.y = iconFlashlightUsedRed.y = Screen.height - UiPadding - iconFlashlight.height;

    iconHealth.x = iconHealthLostRed.x = Screen.width - iconHealth.width - UiPadding;
    iconHealth.y = iconHealthLostRed.y = Screen.height - iconHealth.height - UiPadding;
    iconHealth.mask = HealthMask;

    floorSprite.width = mapSize.width;
    floorSprite.height = mapSize.height;

    iconFlashlight.mask = FlashlightIconMask;
    floorSprite.mask = flashlightSprite;
    HighlightsChangel.mask = flashlightSprite;
    LevelContainer.mask = PlayerVisibleAreaMask;

    const whiteBackgroundSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    whiteBackgroundSprite.width = mapSize.width;
    whiteBackgroundSprite.height = mapSize.height;
    whiteBackgroundSprite.tint = 0xffffff;

    LevelContainer.addChild(
      PlayerVisibleAreaMask,
      flashlightSprite,
      whiteBackgroundSprite,
      floorSprite,
      HighlightsChangel,
      Draw,
    );

    DebugDraw.x = LevelContainer.x = Screen.width * 0.5 - player.x;
    DebugDraw.y = LevelContainer.y = Screen.height * 0.5 - player.y;

    UIStage.addChild(iconFlashlightUsedRed, iconFlashlight, iconHealthLostRed, iconHealth, aimSightSprite, DebugDraw);

    const { facilityAmbient, footstepsSound, lightSwitchSound, batteryDeadSound } = Assets.GetSounds();

    facilityAmbient.volume(1);

    const obstacles = GenerateMaze(ECollisions, map);

    let lastUpdateTime = new Date().getTime();
    let potentials = null;

    const { debugDrawSwitch, showBHVSwitch, youDiedScreen, statusBar } = GetUI();
    debugDrawSwitch.addEventListener('change', ({ target }) =>
    {
      fpsDisplay.show(target.checked);
    });

    document.addEventListener('keydown', ({ key }) =>
    {
      console.log(key);
      if (key === ' ')
      {
        debugDrawSwitch.checked = !debugDrawSwitch.checked;
        const debugOn = debugDrawSwitch.checked;
        statusBar.style.display = debugOn ? 'inline' : 'none';
        fpsDisplay.show(debugOn);
      }
    });

    function GlobalUpdate()
    {
      const { velocity, friction, halfFOV } = player;
      const currentTime = new Date().getTime();
      const timeDelta = (currentTime - lastUpdateTime) / 1000;
      lastUpdateTime = currentTime;

      // INPUT & MOVEMENT
      //////////////////////////////////////////////////////////////////////

      // Flashlight switch
      if (flashlight.switchCooldown === 1)
      {
        if (Keys[KeysBindings.flashlightSwitch] && flashlight.juice > 0)
        {
          flashlightSprite.visible = !flashlightSprite.visible;
          flashlight.switchCooldown = 0;

          lightSwitchSound.play();
        }
      }
      else
      {
        flashlight.switchCooldown = clamp(flashlight.switchCooldown + timeDelta * 3);
      }

      // Sprint switch
      player.isSprinting = Keys[KeysBindings.sprint];
      if (!debugDrawSwitch.checked)
      {
        player.stamina = clamp(player.isSprinting ? player.stamina - timeDelta / 10 : player.stamina + timeDelta / 10);
        if (player.stamina === 0) player.isSprinting = false;
      }

      const currentSpeed = player.isSprinting ? player.sprintSpeed : player.walkSpeed;
      // solve player's velocity
      if (Keys[KeysBindings.right])
      {
        velocity.x = currentSpeed;
      }
      else if (Keys[KeysBindings.left])
      {
        velocity.x = -currentSpeed;
      }

      if (Keys[KeysBindings.up])
      {
        velocity.y = -currentSpeed;
      }
      else if (Keys[KeysBindings.down])
      {
        velocity.y = currentSpeed;
      }

      const velocityLength = velocity.getLength();
      if (velocity.x !== 0)
      {
        player.x += (velocity.x / velocityLength) * Math.abs(velocity.x) * timeDelta;
        player.FOVarea.x = player.x;
        flashlightSprite.x = player.x;
        LevelContainer.x = Screen.width * 0.5 - player.x;
      }
      if (velocity.y !== 0)
      {
        player.y += (velocity.y / velocityLength) * Math.abs(velocity.y) * timeDelta;
        player.FOVarea.y = player.y;
        flashlightSprite.y = player.y;
        LevelContainer.y = Screen.height * 0.5 - player.y;
      }

      velocity.x *= friction;
      if (velocity.x < 0.01 && velocity.x > -0.01) velocity.x = 0;
      velocity.y *= friction;
      if (velocity.y < 0.01 && velocity.y > -0.01) velocity.y = 0;

      monster.solveAILogic(timeDelta);

      // SOLVE COLLISIONS
      //////////////////////////////////////////////////////////////////////

      ECollisions.update();

      // solve player's collisions
      player.solveCollisions(Result);
      monster.solveCollisions(Result, timeDelta);

      // get obstacles that are overlaping with FOV area
      potentials = player.FOVarea.potentials();
      const obstaclesWithinSight = [];
      for (const body of potentials)
      {
        if (body.tags && body.tags.includes('obstacle') && player.FOVarea.collides(body, Result))
        {
          obstaclesWithinSight.push(body);
        }
      }

      // STATE UDPATES
      //////////////////////////////////////////////////////////////////////

      if (player.currentHealth <= 0)
      {
        youDiedScreen.style.display = 'flex';
        Graphics.stop();
        return;
      }

      if (!debugDrawSwitch.checked)
      {
        flashlight.juice = clamp(
          flashlightSprite.visible
            ? flashlight.juice - timeDelta / flashlight.consumptionRate
            : flashlight.juice + timeDelta / flashlight.rechargeRate,
        );

        if (flashlight.juice === 0)
        {
          flashlightSprite.visible = false;
          flashlight.switchCooldown = 0;
          batteryDeadSound.play();
        }
      }

      flashlightSprite.rotation = Mouse.getMouseToPointAngle({
        x: LevelContainer.x + player.x,
        y: LevelContainer.y + player.y,
      });

      if (flashlightSprite.visible)
      {
        if (flashlight.flickerCounter < flashlight.nextFlickerIn && flashlight.intensity === flashlight.maxIntensity)
        {
          flashlight.flickerCounter += timeDelta;
        }
        else
        {
          flashlight.intensity = clamp(
            Math.sin(flashlight.flickerOffset),
            flashlight.maxIntensity * 0.7,
            flashlight.maxIntensity,
          );
          flashlight.flickerOffset += randomInRange(-0.5, 0.5);
          flashlight.nextFlickerIn = randomInRange(0, 25) * timeDelta;
          flashlight.flickerCounter = 0;
        }

        flashlightSprite.alpha = flashlight.intensity;
      }

      footstepsSound.volume(mapValueInRangeClamped(velocityLength, 0, player.sprintSpeed));
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

      // Draw mask of the area that's visible for the player
      if (flashlightSprite.visible)
      {
        const visiblePolygons = [];
        VisibleAreaPoly = GetFOVpolygon(player, obstaclesWithinSight, visiblePolygons);
        if (VisibleAreaPoly.length > 0)
        {
          // PlayerVisibleAreaMask.blendMode = PIXI.BLEND_MODES.DIFFERENCE;
          PlayerVisibleAreaMask.beginFill(0xff0000);
          PlayerVisibleAreaMask.moveTo(VisibleAreaPoly[0].x, VisibleAreaPoly[0].y);
          for (let i = 1; i < VisibleAreaPoly.length; i++)
          {
            PlayerVisibleAreaMask.lineTo(VisibleAreaPoly[i].x, VisibleAreaPoly[i].y);
          }
          PlayerVisibleAreaMask.lineTo(VisibleAreaPoly[0].x, VisibleAreaPoly[0].y);
          PlayerVisibleAreaMask.endFill();
        }
      }

      // UI
      //////////////////////////////////////////////////////////////////////

      // Draw white stripe shrinking when player is sprinting and growing when stamina
      // is regenerating
      if (player.stamina < 1)
      {
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
      const healthLostNormalized = mapValueInRangeClamped(player.maxHealth - player.currentHealth, 0, player.maxHealth);
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

      if (debugDrawSwitch.checked)
      {
        DebugDraw.x = LevelContainer.x;
        DebugDraw.y = LevelContainer.y;

        // draw all obstacles
        obstacles.forEach((obstacle) =>
        {
          strokePolygon(DebugDraw, obstacle.getPoints(), 1, 0x999999, 0.05);
        });

        obstaclesWithinSight.forEach((obstacle) =>
        {
          if (!obstacle.tags.includes('bounds'))
          {
            fillPolygon(DebugDraw, obstacle.getPoints(), 0xff0000, 0.5);
          }
        });

        // Draw view area circle
        DebugDraw.beginFill(0xff0000, 0.2);
        DebugDraw.drawCircle(player.x, player.y, player.sightMaxDistance);

        // sight rays
        if (VisibleAreaPoly)
        {
          DebugDraw.lineStyle(1, 0x009ffb, 0.3);
          VisibleAreaPoly.forEach((point) =>
          {
            DebugDraw.moveTo(point.x, point.y);
            DebugDraw.lineTo(player.x, player.y);
          });
        }

        // draw player
        fillCircle(DebugDraw, player, player.radius, 0x00ff00);
        fillCircle(DebugDraw, monster, monster.radius, 0xff0000);

        // Draw FOV
        const mouseWorldPosition = Mouse.getMouseWorldPosition(LevelContainer);
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

        DebugDraw.beginFill(0x00ff00, 0.3);
        DebugDraw.lineStyle(0);
        DebugDraw.moveTo(player.x, player.y);
        // DebugDraw.lineTo(FOVbounds.left.x, FOVbounds.left.y);
        // DebugDraw.lineTo(FOVbounds.right.x, FOVbounds.right.y);
        const mod = angleToRadians((180 - player.FOV) * 0.5);
        // angleToRadians(player.FOV)
        DebugDraw.arc(
          player.x,
          player.y,
          player.sightMaxDistance,
          flashlightSprite.rotation - Math.PI + mod,
          flashlightSprite.rotation - mod,
        );
        // DebugDraw.lineTo(player.x, player.y);
        DebugDraw.endFill();

        strokeSegment(DebugDraw, player, FOVbounds.left, 1, 0x00ff00);
        strokeSegment(DebugDraw, player, FOVbounds.right, 1, 0x00ff00);

        if (showBHVSwitch.checked)
        {
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
