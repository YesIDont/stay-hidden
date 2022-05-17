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
    ]
  },
  {
    name: 'footstepsSound',
    props: [
      { name: 'src', value: 'assets/sounds/sound-footsteps.mp3' },
      { name: 'autoplay', value: true },
      { name: 'loop', value: true },
      { name: 'volume', value: 0 },
    ]
  },
  {
    name: 'lightSwitchSound',
    props: [
      { name: 'src', value: 'assets/sounds/sound-light-switch.mp3' },
      { name: 'autoplay', value: false },
      { name: 'loop', value: false },
      { name: 'volume', value: 0.5 },
    ]
  },
  {
    name: 'batteryDeadSound',
    props: [
      { name: 'src', value: 'assets/sounds/sound-battery-out.mp3' },
      { name: 'autoplay', value: false },
      { name: 'loop', value: false },
      { name: 'volume', value: 1.5 },
    ]
  },
];

// Below are names of the texture files, that all are placed in one directory
// All textures are and should be of png file type
const AIM_TEXTURE = 'aim';
const FLOOR_TILE_TEXTURE = 'floor-tile';
const FLASHLIGHT_TEXTURE = 'flashlight';
const ICON_FLASHLIGHT_TEXTURE = 'icon-flashlight';
const ICON_HEALTH_TEXTURE = 'health';
const CIRCULAR_GRADIENT_TEXTURE = 'circular-gradient';

Assets.Textures = [
  AIM_TEXTURE,
  FLOOR_TILE_TEXTURE,
  FLASHLIGHT_TEXTURE,
  ICON_FLASHLIGHT_TEXTURE,
  ICON_HEALTH_TEXTURE,
  CIRCULAR_GRADIENT_TEXTURE,
];

const SPRITE_TYPES = {
  SPRITE: 'Sprite',
  TILING_SPRITE: 'TilingSprite',
};

Assets.Sprites = [
  {
    name: 'aimSightSprite',
    type: SPRITE_TYPES.SPRITE,
    texture: AIM_TEXTURE,
    props: [
      { name: 'anchor', value: [0.5, 0.5] },
      { name: 'width', value: 24 },
      { name: 'height', value: 24 },
    ]
  },
  {
    name: 'floorSprite',
    type: SPRITE_TYPES.TILING_SPRITE,
    texture: FLOOR_TILE_TEXTURE,
    props: [
      { name: 'width', value: 2000 },
      { name: 'height', value: 2000 },
      { name: 'tileSize', value: [64, 64] },
    ]
  },
  {
    name: 'flashlightSprite',
    type: SPRITE_TYPES.SPRITE,
    texture: FLASHLIGHT_TEXTURE,
    props: [
      { name: 'anchor', value: [0.5, 1] },
      { name: 'width', value: 900 },
      { name: 'height', value: 500 },
    ]
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
    ]
  },
  {
    name: 'iconFlashlight',
    type: SPRITE_TYPES.SPRITE,
    texture: ICON_FLASHLIGHT_TEXTURE,
    props: [
      { name: 'width', value: 50 },
      { name: 'height', value: 20 },
    ]
  },
  {
    name: 'iconHealth',
    type: SPRITE_TYPES.SPRITE,
    texture: ICON_HEALTH_TEXTURE,
    props: [
      { name: 'width', value: 148 },
      { name: 'height', value: 22 },
    ]
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
    ]
  },
  {
    name: 'circularGradientSprite',
    type: SPRITE_TYPES.SPRITE,
    texture: CIRCULAR_GRADIENT_TEXTURE,
    props: [
      { name: 'anchor', value: [0.5, 0.5] },
      { name: 'width', value: 300 },
      { name: 'height', value: 300 },
      // { name: 'alpha', value: 0.4 },
    ]
  },
];

Assets.GetSprites = function( loadedResources )
{
  const Sprites = {};

  for ( const Asset of Assets.Sprites )
  {
    let props = {};
    Asset.props.forEach(prop =>
    {
      props[prop.name] = prop.value;
    });

    let newSprite = {};

    if (Asset.type === SPRITE_TYPES.TILING_SPRITE)
    {
      let { tileSize, ...propsTemp } = props;
      newSprite = new PIXI[Asset.type]( loadedResources[ Asset.texture ].texture, tileSize[0], tileSize[1] );
      props = propsTemp;
    }
    else
    {
      newSprite = new PIXI[Asset.type]( loadedResources[ Asset.texture ].texture );
    }

    Asset.props.forEach( prop =>
    {
      if ( prop.name === 'anchor' )
      {
        newSprite.anchor.set(prop.value[0], prop.value[1]);
      }
      else
      {
        newSprite[ prop.name ] = prop.value;
      }
    });

    Sprites[ Asset.name ] = newSprite;
  }

  return Sprites;
};

Assets.GetSounds = function()
{
  const Sounds = {};

  for ( const Asset of Assets.Sounds )
  {
    let props = {};
    Asset.props.forEach( prop =>
    {
      props[ prop.name ] = prop.value;
    });

    Sounds[ Asset.name ] = new Howl(props);
  }

  return Sounds;
};

export { Assets };

