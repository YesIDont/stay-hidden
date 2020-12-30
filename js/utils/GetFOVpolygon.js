"use strict";

function GetFOVpolygon(pointOfView, obstaclesWithinSight) {

    const segments = [];
    const uniquePoints = [];
    obstaclesWithinSight.forEach(obstacle => {
        const points = obstacle.getPoints();
        points.forEach(point => {
            uniquePoints.push(point);
        });
        obstacle.getSegments().forEach(segment => segments.push(segment));
    });

	// Get angles
	let uniqueAngles = [];
	uniquePoints.forEach(point => {
		const angle = Math.atan2(point[1] - pointOfView.y, point[0] - pointOfView.x);
        point.angle = angle;
        uniqueAngles.push(angle - 0.00001, angle, angle + 0.00001);
    });

	// cast rays to find intersections
	let intersects = [];
	uniqueAngles.forEach(angle => {
		// Calculate dx & dy from angle
		let dx = Math.cos(angle);
		let dy = Math.sin(angle);

		// Ray from center of screen to pointOfView
		let ray = {
			a: { x: pointOfView.x, y: pointOfView.y },
			b: { x: pointOfView.x + dx, y: pointOfView.y + dy }
		};

		// Find CLOSEST intersection
		let closestIntersect = null;
		for( let i = 0; i < segments.length; i++ ) {
			let intersect = GetRaySegmentIntersection( ray, segments[i] );
			if( intersect && ( !closestIntersect || intersect.param < closestIntersect.param )) {
				closestIntersect = intersect;
			}
		}

		// Intersect angle
		if( closestIntersect ) {
			closestIntersect.angle = angle;
	
			// Add to list of intersects
			intersects.push( closestIntersect );
		};
    });

	// Sort intersects by angle
	intersects = intersects.sort(( a, b ) => {
		return a.angle - b.angle;
	});

	// Polygon is intersects, in order of angle
	return intersects;
}
