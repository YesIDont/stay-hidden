function getSightPolygon( mouse, player, segments, uniquePoints, playerToMouseAngle, lightMaxLength ) {

	// Get all angles
	let uniqueAngles = [];
	uniquePoints.forEach(point => {
		const toPlayerLength = getTwoPointsLength(point, player);
		const angle = Math.atan2( point.y - player.y, point.x - player.x );
		// const angleDegrees = normalizeAngle((angle * 180) / Math.PI);
		// const mouseAngleDegrees = normalizeAngle((playerToMouseAngle * 180) / Math.PI - 90);
		if (/* angleDegrees > mouseAngleDegrees - 90
			&& angleDegrees < mouseAngleDegrees + 90
			&& */ toPlayerLength < lightMaxLength * 1.5
		) {
			point.angle = angle;
			uniqueAngles.push( angle - 0.00001, angle, angle + 0.00001 );
		}
	});
// log(uniqueAngles.length)
// 	// Add two points to cover area right behind player, in case there is no points there.
// 	// Place them two steps behind player, one slightly to the left and second to the right
// 	const mouseToPlayer = getVectorNormalized({ x: player.x - mouse.x, y: player.y - mouse.y });
// 	mouseToPlayer.x *= 50;
// 	mouseToPlayer.y *= 50;
// 	const pointLeft = getRotatedVector(mouseToPlayer, 90);
// 	pointLeft.x += 50;
// 	pointLeft.y += 50;
// 	const pointRight = getRotatedVector(mouseToPlayer, -90);
// 	pointRight.x += 50;
// 	pointRight.y += 50;
// 	[pointLeft, pointRight].forEach(point => {
// 		const angle = Math.atan2( point.y - player.y, point.x - player.x );
// 		point.angle = angle;
// 		uniqueAngles.push( angle );
// 	});

	// RAYS IN ALL DIRECTIONS
	let intersects = [];
	if (uniqueAngles.length === 0) return intersects;
	uniqueAngles.forEach(angle => {
		// Calculate dx & dy from angle
		let dx = Math.cos(angle);
		let dy = Math.sin(angle);

		// Ray from center of screen to player
		let ray = {
			a: { x: player.x, y: player.y },
			b: { x: player.x + dx, y: player.y + dy }
		};

		draw.segment(ray.a, ray.b)

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