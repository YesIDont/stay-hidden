import { GetTwoSegmentsIntersection } from './GetTwoSegmentsIntersection.mjs';
import { getDistanceFromAtoB } from './utils.mjs';

export function GetClosestSegmentsIntersection(segment1, segments) {
  const intersections = [];
  segments.forEach((segment) => {
    const intersection = GetTwoSegmentsIntersection(segment1, segment);
    if (intersection) {
      intersections.push(intersection);
    }
  });

  if (intersections.length > 0) {
    const [x, y] = segment1;
    let distance = 99999999;
    let closesPoint;
    intersections.forEach((intersection) => {
      const distance2 = getDistanceFromAtoB(x, y, intersection.x, intersection.y);
      if (distance2 < distance) {
        distance = distance2;
        closesPoint = intersection;
      }
    });
    return closesPoint;
  }

  return null;
}
