import { CIRCULAR_GRADIENT_TEXTURE } from './Assets.mjs';
import { newFlickerEffect } from './FlickerEffect.mjs';

export function newLightSource(resources, x, y, width, height, alpha) {
  const t = resources[CIRCULAR_GRADIENT_TEXTURE].texture;
  const l = new PIXI.Sprite(t);

  l.width = width;
  l.height = height;
  l.x = x;
  l.y = y;
  l.anchor.set(0.5, 0.5);
  l.flickerEffect = newFlickerEffect(alpha, 2);

  // // mask : half, 1/4 etc

  l.update = function (timeDelta) {
    l.alpha = l.flickerEffect.update(timeDelta);
  };

  // s.setSprite = function (type) {
  //   let sprite;

  //   /* eslint-disable indent */
  //   switch() {
  //   // case :

  //   // break;
  //   default: //omni-full
  //     break;

  //   }
  //   /* eslint-enable indent */
  // };

  return l;
}
