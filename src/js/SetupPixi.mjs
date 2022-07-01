'use strict';
import { Assets } from './Assets.mjs';
import { GetCanvasAspectRatio, GetWindowInnerSize } from './utils/Utils.mjs';

export function SetupPixiJS(mapSize) {
  const Pixi = PIXI;
  const GraphicsEngine = Pixi.Application;
  const Container = Pixi.Container;
  const Loader = new Pixi.Loader();

  const Graphics = new GraphicsEngine({
    antialias: true,
    autoResize: true,
    // backgroundColor: '#111',
  });
  Graphics.stop();
  const Renderer = Graphics.renderer;
  const Screen = Renderer.screen;
  const Stage = Graphics.stage;
  Stage.sortableChildren = true;

  document.body.appendChild(Graphics.view);

  function UpdateRendereSize() {
    Renderer.resolution = GetCanvasAspectRatio(Renderer.context);
    const { width, height } = GetWindowInnerSize();
    Renderer.resize(width, height);
  }

  UpdateRendereSize();
  window.addEventListener('resize', UpdateRendereSize);

  // Masks
  const PlayerVisibleAreaMask = new Pixi.Graphics();
  const FlashlightIconMask = new Pixi.Graphics();
  const HealthMask = new Pixi.Graphics();

  const whiteBackgroundSprite = new Pixi.Sprite(Pixi.Texture.WHITE);
  whiteBackgroundSprite.width = mapSize.width;
  whiteBackgroundSprite.height = mapSize.height;
  whiteBackgroundSprite.zIndex = 50;

  const LevelContainer = new Container();
  Stage.addChild(LevelContainer);
  LevelContainer.zIndex = 10;
  LevelContainer.width = mapSize.width;
  LevelContainer.height = mapSize.height;
  LevelContainer.mask = PlayerVisibleAreaMask;

  const LightsTexture = Pixi.RenderTexture.create(mapSize);
  const LightsSprite = new Pixi.Sprite(LightsTexture);

  const LightsColorsSprite = new Pixi.Sprite(LightsTexture);
  LightsColorsSprite.blendMode = Pixi.BLEND_MODES.ADD;

  const VisibilityContainer = new Container();
  VisibilityContainer.mask = LightsSprite;
  VisibilityContainer.zIndex = 10;
  VisibilityContainer.sortableChildren = true;
  VisibilityContainer.width = mapSize.width;
  VisibilityContainer.height = mapSize.height;
  LevelContainer.addChild(VisibilityContainer);

  const UIStage = new Container();
  Stage.addChild(UIStage);
  UIStage.zIndex = 20;
  UIStage.width = Screen.width;
  UIStage.height = Screen.height;

  const HighlightsChangel = new Pixi.Graphics();

  Assets.Textures.forEach((textureName) => {
    Loader.add(textureName, `assets/images/${textureName}.png`);
  });

  // General purposes draw
  const Draw = new Pixi.Graphics();
  Draw.zIndex = 100;

  const DebugDraw = new Pixi.Graphics();
  Draw.zIndex = 100;

  const UIDraw = new Pixi.Graphics();
  UIDraw.zIndex = 100;
  UIStage.addChild(UIDraw);

  LevelContainer.addChild(whiteBackgroundSprite, /* LightsColorsSprite, */ LightsSprite);

  return {
    DebugDraw,
    Draw,
    FlashlightIconMask,
    Graphics,
    HealthMask,
    HighlightsChangel,
    LevelContainer,
    LightsTexture,
    Loader,
    Pixi,
    PlayerVisibleAreaMask,
    Renderer,
    Screen,
    Sprite: Pixi.Sprite,
    Stage,
    UIDraw,
    UIStage,
    VisibilityContainer,
    LightsSprite,
    whiteBackgroundSprite,
    LightsColorsSprite,
  };
}
