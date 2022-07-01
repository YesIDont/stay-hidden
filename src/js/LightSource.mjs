import { CIRCULAR_GRADIENT_TEXTURE } from './Assets.mjs';

export const lightTints = {
  red: 0xff0000,
};

export function newLightSource(resources, x, y, width, height, effect, tint) {
  const l = new PIXI.Sprite(resources[CIRCULAR_GRADIENT_TEXTURE].texture);

  l.width = width;
  l.height = height;
  l.x = x;
  l.y = y;
  l.effect = effect;
  l.anchor.set(0.5, 0.5);
  l.alphaMultiplier = 1;

  if (tint) {
    l.tint = lightTints[tint];
    l.blendMode = PIXI.BLEND_MODES.ADD;
    l.alphaMultiplier = 2;
  }

  l.update = (timeDelta, currentTime) => {
    l.alpha = l.effect.update(timeDelta, currentTime) * l.alphaMultiplier;
  };

  return l;
}
