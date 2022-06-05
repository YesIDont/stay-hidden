'use strict';

const Assets = {};

Assets.Sounds = [
  {
    name: 'facilityAmbient',
    props: [
      { name: 'src', value: 'assets/sounds/sound-facility-ambient.mp3' },
      { name: 'autoplay', value: true },
      { name: 'loop', value: true },
      { name: 'volume', value: 0.7 },
    ],
  },
  {
    name: 'footstepsSound',
    props: [
      { name: 'src', value: 'assets/sounds/sound-footsteps.mp3' },
      { name: 'autoplay', value: true },
      { name: 'loop', value: true },
      { name: 'volume', value: 0 },
    ],
  },
  {
    name: 'lightSwitchSound',
    props: [
      { name: 'src', value: 'assets/sounds/sound-light-switch.mp3' },
      { name: 'autoplay', value: false },
      { name: 'loop', value: false },
      { name: 'volume', value: 0.5 },
    ],
  },
  {
    name: 'batteryDeadSound',
    props: [
      { name: 'src', value: 'assets/sounds/sound-battery-out.mp3' },
      { name: 'autoplay', value: false },
      { name: 'loop', value: false },
      { name: 'volume', value: 1.5 },
    ],
  },
  {
    name: 'gunshot',
    props: [
      { name: 'src', value: 'assets/sounds/sound-gunshot.mp3' },
      { name: 'autoplay', value: false },
      { name: 'loop', value: false },
      { name: 'volume', value: 0.9 },
    ],
  },
  {
    name: 'robotFoundTarget',
    props: [
      { name: 'src', value: 'assets/sounds/sound-robot-found-target.mp3' },
      { name: 'autoplay', value: false },
      { name: 'loop', value: false },
      { name: 'volume', value: 1 },
    ],
  },
];

// Below are names of the texture files, that all are placed in one directory
// All textures are and should be of png file type
export const PLAYER_TEXTURE = 'player';
export const BLACK_PIXEL_TEXTURE = 'black-pixel';
export const AIM_TEXTURE = 'aim';
export const FLOOR_TILE_TEXTURE = 'floor-tile';
export const FLASHLIGHT_TEXTURE = 'flashlight-thin';
export const ICON_FLASHLIGHT_TEXTURE = 'icon-flashlight';
export const ICON_HEALTH_TEXTURE = 'health';
export const CIRCULAR_GRADIENT_TEXTURE = 'circular-gradient';
export const DRONE = 'drone';
export const BLAST = 'blast';

Assets.Textures = [
  PLAYER_TEXTURE,
  BLACK_PIXEL_TEXTURE,
  AIM_TEXTURE,
  FLOOR_TILE_TEXTURE,
  FLASHLIGHT_TEXTURE,
  ICON_FLASHLIGHT_TEXTURE,
  ICON_HEALTH_TEXTURE,
  CIRCULAR_GRADIENT_TEXTURE,
  DRONE,
  BLAST,
];

const SPRITE_TYPES = {
  SPRITE: 'Sprite',
  TILING_SPRITE: 'TilingSprite',
};

Assets.Sprites = [
  {
    name: 'playerSprite',
    type: SPRITE_TYPES.SPRITE,
    texture: PLAYER_TEXTURE,
    props: [
      { name: 'anchor', value: [0.3, 0.5] },
      { name: 'width', value: 90 },
      { name: 'height', value: 63 },
    ],
  },
  {
    name: 'blackPixel',
    type: SPRITE_TYPES.SPRITE,
    texture: BLACK_PIXEL_TEXTURE,
    props: [
      { name: 'anchor', value: [0.5, 0.5] },
      { name: 'width', value: 1 },
      { name: 'height', value: 1 },
    ],
  },
  {
    name: 'aimSightSprite',
    type: SPRITE_TYPES.SPRITE,
    texture: AIM_TEXTURE,
    props: [
      { name: 'anchor', value: [0.5, 0.5] },
      { name: 'width', value: 24 },
      { name: 'height', value: 24 },
      { name: 'zIndex', value: 100 },
    ],
  },
  {
    name: 'floorSprite',
    type: SPRITE_TYPES.TILING_SPRITE,
    texture: FLOOR_TILE_TEXTURE,
    props: [
      { name: 'width', value: 2000 },
      { name: 'height', value: 2000 },
      { name: 'tileSize', value: [64, 64] },
      { name: 'zIndex', value: 1 },
    ],
  },
  {
    name: 'flashlightSprite',
    type: SPRITE_TYPES.SPRITE,
    texture: FLASHLIGHT_TEXTURE,
    props: [
      { name: 'anchor', value: [0.5, 1] },
      { name: 'width', value: 900 },
      { name: 'height', value: 500 },
    ],
  },
  {
    name: 'iconFlashlightUsedRed',
    type: SPRITE_TYPES.SPRITE,
    texture: ICON_FLASHLIGHT_TEXTURE,
    props: [
      { name: 'width', value: 50 },
      { name: 'height', value: 20 },
      { name: 'alpha', value: 0.6 },
      { name: 'tint', value: 0xff0000 },
    ],
  },
  {
    name: 'iconFlashlight',
    type: SPRITE_TYPES.SPRITE,
    texture: ICON_FLASHLIGHT_TEXTURE,
    props: [
      { name: 'width', value: 50 },
      { name: 'height', value: 20 },
    ],
  },
  {
    name: 'iconHealth',
    type: SPRITE_TYPES.SPRITE,
    texture: ICON_HEALTH_TEXTURE,
    props: [
      { name: 'width', value: 148 },
      { name: 'height', value: 22 },
    ],
  },
  {
    name: 'iconHealthLostRed',
    type: SPRITE_TYPES.SPRITE,
    texture: ICON_HEALTH_TEXTURE,
    props: [
      { name: 'width', value: 148 },
      { name: 'height', value: 22 },
      { name: 'alpha', value: 0.6 },
      { name: 'tint', value: 0xff0000 },
    ],
  },
  {
    name: 'gunBlastLightSprite',
    type: SPRITE_TYPES.SPRITE,
    texture: CIRCULAR_GRADIENT_TEXTURE,
    props: [
      { name: 'anchor', value: [0.5, 0.5] },
      { name: 'width', value: 200 },
      { name: 'height', value: 200 },
      { name: 'count', value: 20 },
    ],
  },
  {
    name: 'droneSprite',
    type: SPRITE_TYPES.SPRITE,
    texture: DRONE,
    props: [
      { name: 'anchor', value: [0.5, 0.5] },
      { name: 'width', value: 50 },
      { name: 'height', value: 50 },
      { name: 'zIndex', value: 2 },
    ],
  },
  {
    name: 'gunBlastSprite',
    type: SPRITE_TYPES.SPRITE,
    texture: BLAST,
    props: [
      { name: 'anchor', value: [0.5, 0.5] },
      { name: 'width', value: 4 },
      { name: 'height', value: 45 },
      { name: 'count', value: 20 },
      { name: 'zIndex', value: 1 },
    ],
  },
];

Assets.GetSprites = function (loadedResources) {
  const Sprites = {};

  for (const Asset of Assets.Sprites) {
    let props = {};
    let count = 1;
    Asset.props.forEach(({ name, value }) => {
      if (name === 'count') {
        count = value;
        return;
      }
      props[name] = value;
    });

    for (let i = 0; i < count; i++) {
      let newSprite = {};

      if (Asset.type === SPRITE_TYPES.TILING_SPRITE) {
        let { tileSize, ...propsTemp } = props;
        newSprite = new PIXI[Asset.type](loadedResources[Asset.texture].texture, tileSize[0], tileSize[1]);
        props = propsTemp;
      } else {
        newSprite = new PIXI[Asset.type](loadedResources[Asset.texture].texture);
      }

      Asset.props.forEach(({ name, value }) => {
        /* eslint-disable indent */
        switch (name) {
          case 'anchor':
            newSprite.anchor.set(value[0], value[1]);
            break;

          default:
            newSprite[name] = value;
            break;
        }
        /* eslint-enable indent */
      });

      Sprites[`${Asset.name}${count > 1 ? i + 1 : ''}`] = newSprite;
    }
  }

  return Sprites;
};

Assets.GetSounds = function () {
  const Sounds = {};

  for (const Asset of Assets.Sounds) {
    let props = {};
    Asset.props.forEach((prop) => {
      props[prop.name] = prop.value;
    });

    Sounds[Asset.name] = new Howl(props);
  }

  return Sounds;
};

export { Assets };
