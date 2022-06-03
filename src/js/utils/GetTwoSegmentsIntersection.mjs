export function GetTwoSegmentsIntersection(segment1, segment2) {
  const [s1a, s1b, s1c, s1d] = segment1;
  const [s2a, s2b, s2c, s2d] = segment2;
  // const { a: p0, b: p1 } = segment1;
  // const { a: p2, b: p3 } = segment2;

  // const s10_x = p1.x - p0.x;
  // const s10_y = p1.y - p0.y;
  // const s32_x = p3.x - p2.x;
  // const s32_y = p3.y - p2.y;
  const s10_x = s1c - s1a;
  const s10_y = s1d - s1b;
  const s32_x = s2c - s2a;
  const s32_y = s2d - s2b;

  const denom = s10_x * s32_y - s32_x * s10_y;
  // collinear
  if (denom == 0) return null;

  const s02_x = s1a - s2a;
  const s02_y = s1b - s2b;
  const s_numer = s10_x * s02_y - s10_y * s02_x;

  // no collision
  if (s_numer < 0 == denom > 0) return null;

  const t_numer = s32_x * s02_y - s32_y * s02_x;

  // no collision
  if (t_numer < 0 == denom > 0) return null;

  if (s_numer > denom == denom > 0 || t_numer > denom == denom > 0) return null; // no collision

  // collision detected
  const t = t_numer / denom;

  return { x: s1a + t * s10_x, y: s1b + t * s10_y };
}
