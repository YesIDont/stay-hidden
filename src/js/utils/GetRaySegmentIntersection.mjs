'use strict';

export function GetRaySegmentIntersection( ray, segment )
{
  // RAY in parametric: Point + Delta*T1
  let r_px = ray.a.x;
  let r_py = ray.a.y;
  let r_dx = ray.b.x-ray.a.x;
  let r_dy = ray.b.y-ray.a.y;

  // SEGMENT in parametric: Point + Delta*T2
  let s_px = segment[0][0];
  let s_py = segment[0][1];
  let s_dx = segment[1][0] - segment[0][0];
  let s_dy = segment[1][1] - segment[0][1];

  // Are they parallel? If so, no intersect
  let r_mag = Math.sqrt(r_dx*r_dx+r_dy*r_dy);
  let s_mag = Math.sqrt(s_dx*s_dx+s_dy*s_dy);
  if(r_dx/r_mag==s_dx/s_mag && r_dy/r_mag==s_dy/s_mag)
  {
    // Unit vectors are the same.
    return null;
  }

  // SOLVE FOR T1 & T2
  let T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx);
  let T1 = (s_px+s_dx*T2-r_px)/r_dx;

  // Must be within parametic whatevers for RAY/SEGMENT
  if(T1<0) return null;
  if(T2<0 || T2>1) return null;

  // Return the POINT OF INTERSECTION
  return {
    x: r_px+r_dx*T1,
    y: r_py+r_dy*T1,
    param: T1
  };
};
