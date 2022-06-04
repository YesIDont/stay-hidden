import { clamp, randomInRange } from './utils/Utils.mjs';

export function newFlickerEffect(max = 1) {
  const f = {};

  f.max = max;
  f.current = f.max;
  f.flickerOffset = 0;
  f.nextFlickerIn = 0.5;
  f.flickerCounter = 0;

  f.update = function (timeDelta) {
    if (f.flickerCounter < f.nextFlickerIn && f.current === f.max) {
      f.flickerCounter += timeDelta;
    } else {
      f.current = clamp(Math.sin(f.flickerOffset), f.max * 0.7, f.max);
      f.flickerOffset += randomInRange(-0.5, 0.5);
      f.nextFlickerIn = randomInRange(0, 25) * timeDelta;
      f.flickerCounter = 0;
    }

    return f.current;
  };

  return f;
}
