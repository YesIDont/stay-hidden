import { mapRangeClamped } from './utils/Utils.mjs';

export function newPulsatingEffect(ciclesPerSecond = 1, scale = 1) {
  const p = {};

  p.current = 0;
  p.speed = ciclesPerSecond;

  p.update = (timeDelta, currentTime) => {
    p.current = mapRangeClamped(Math.sin(currentTime * 0.01 * p.speed), -1, 1) * scale;

    return p.current;
  };

  return p;
}
