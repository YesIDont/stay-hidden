'use strict';

export const { PI } = Math;
export const halfPI = PI * 0.5;
export const twoPI = 2 * Math.PI;

export function clamp(value, min = 0, max = 1) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function mapValueInRangeClamped(value, in_min, in_max, out_min = 0, out_max = 1) {
  const inRange = ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;

  return clamp(inRange, out_min, out_max);
}

export function randomInRange(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

export function getRotatedVector(vector, angle, pivotPoint) {
  if (angle === 0) {
    return { x, y };
  }

  const angleRad = (angle * Math.PI) / 180; // radians
  const sin = Math.sin(angleRad);
  const cos = Math.cos(angleRad);

  const { x, y } = vector;

  return {
    x: x * cos - y * sin + pivotPoint.x,
    y: x * sin + y * cos + pivotPoint.y,
  };
}

export const normalizeRadians = (radians) => {
  if (radians > PI) return -(twoPI - radians);
  if (radians < -PI) return twoPI + radians;

  return radians;
};

export const interpolateRadians = (current, target, deltaTime, speed = 4) => {
  const diff = normalizeRadians(target - current);
  const dffAbs = Math.abs(diff);
  if (dffAbs < 0.05) return target;
  if (dffAbs > Math.PI) return current - diff * deltaTime * speed;

  return current + diff * deltaTime * speed;
};

export function GetCanvasAspectRatio(context) {
  const devicePixelRatio = window.devicePixelRatio || 1;

  const backingStoreRatio =
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio ||
    1;

  const ratio = devicePixelRatio / backingStoreRatio;

  return ratio;
}

export function GetWindowInnerSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  // return {
  //   width: window.innerWidth && document.documentElement.clientWidth
  //     ? Math.min( window.innerWidth, document.documentElement.clientWidth )
  //     : window.innerWidth
  //         || document.documentElement.clientWidth
  //         || document.getElementsByTagName('body')[0].clientWidth,

  //   height: window.innerHeight && document.documentElement.clientHeight
  //     ? Math.min(window.innerHeight, document.documentElement.clientHeight)
  //     : window.innerHeight
  //         || document.documentElement.clientHeight
  //         || document.getElementsByTagName('body')[0].clientHeight
  // };
}

export function fillRectangle(pixiGraphics, x, y, width, height, color = 0x000000, alpha = 1) {
  if (width === 0 || height === 0) return;

  pixiGraphics.beginFill(color, alpha);
  pixiGraphics.moveTo(x, y);
  pixiGraphics.lineTo(x + width, y);
  pixiGraphics.lineTo(x + width, y + height);
  pixiGraphics.lineTo(x, y + height);
  pixiGraphics.lineTo(x, y);
  pixiGraphics.endFill();
}

export function strokeSegment(pixiGraphics, startPoint, endPoint, lineThickness = 1, color = 0x000000) {
  pixiGraphics.lineStyle(lineThickness, color);
  pixiGraphics.moveTo(startPoint.x, startPoint.y);
  pixiGraphics.lineTo(endPoint.x, endPoint.y);
}

export function strokePolygon(pixiGraphics, points, lineThickness = 1, color = 0x000000) {
  pixiGraphics.lineStyle(lineThickness, color);
  pixiGraphics.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    pixiGraphics.lineTo(points[i][0], points[i][1]);
  }
  pixiGraphics.lineTo(points[0][0], points[0][1]);
}

export function fillPolygon(pixiGraphics, points, color = 0x000000, alpha = 1) {
  pixiGraphics.beginFill(color, alpha);
  pixiGraphics.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    pixiGraphics.lineTo(points[i][0], points[i][1]);
  }
  pixiGraphics.lineTo(points[0][0], points[0][1]);
  pixiGraphics.endFill();
}

export function fillCircle(pixiGraphics, centerPoint, radius, color = 0x000000, alpha = 1) {
  pixiGraphics.lineStyle(0);
  pixiGraphics.beginFill(color, alpha);
  pixiGraphics.drawCircle(centerPoint.x, centerPoint.y, radius);
  pixiGraphics.endFill();
}

export function angleToRadians(angle) {
  return angle * (Math.PI / 180);
}

export function radiansToAngle(angle) {
  return angle * (180 / Math.PI);
}

export function getVectorMagnitude(vector) {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

export function normalizeVector(vector) {
  const magnitude = getVectorMagnitude(vector);

  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  };
}
