function getSightPolygon( xPOV, yPOV, segments, uniquePoints ) {

	// Get all angles
	let uniqueAngles = [];
	for( let j = 0; j < uniquePoints.length; j++ ) {
		let uniquePoint = uniquePoints[j];
        let angle = Math.atan2( uniquePoint.y - yPOV, uniquePoint.x - xPOV );
		uniquePoint.angle = angle;
		uniqueAngles.push( angle - 0.00001, angle, angle + 0.00001 );
	}

	// RAYS IN ALL DIRECTIONS
	let intersects = [];
	for( let j = 0; j < uniqueAngles.length; j++ ) {
        let angle = uniqueAngles[j];

		// Calculate dx & dy from angle
		let dx = Math.cos(angle);
		let dy = Math.sin(angle);

		// Ray from center of screen to mouse
		let ray = {
			a: { x: xPOV, y: yPOV },
			b: { x: xPOV + dx, y: yPOV+dy }
		};

		// Find CLOSEST intersection
		let closestIntersect = null;
		for( let i = 0; i < segments.length; i++ ) {
			let intersect = getIntersection( ray, segments[i] );
			if( !intersect ) continue;
			if( !closestIntersect || intersect.param < closestIntersect.param ) {
				closestIntersect = intersect;
			}
		}

		// Intersect angle
		if( !closestIntersect ) continue;
		closestIntersect.angle = angle;

		// Add to list of intersects
		intersects.push( closestIntersect );
	}

	// Sort intersects by angle
	intersects = intersects.sort(( a, b ) => {
		return a.angle - b.angle;
	});

	// Polygon is intersects, in order of angle
	return intersects;
}