"use strict";

Engine.Run = function() {

	const { ECollisions, Flashlight, Keys, KeysBindings, Mouse, Player, Result } = Engine;
	const { Draw, Graphics, Loader, Screen, Pixi, PlayerSightStage, PlayerVisibleAreaMask, Sprite, UIStage } = Engine.SetupPixiJS();
	const player = new Player(Screen.width / 2, Screen.height / 2, 10, 120, 420);
	const flashlight = new Flashlight();

	function AssetsPostLoadActions( loader, resources ) {

		const AimSight = new Sprite( resources[ 'aimSight' ].texture );
		AimSight.anchor.set(0.5);
		AimSight.x = Mouse.x;
		AimSight.y = Mouse.y;
		AimSight.width = 24;
		AimSight.height = 24;
		UIStage.addChild( AimSight );

		const FlashlightImg = new Sprite( resources[ 'flashlight' ].texture );
		FlashlightImg.anchor.set(0.5, 1);
		FlashlightImg.x = player.x;
		FlashlightImg.y = player.y;
		FlashlightImg.width = 405;
		FlashlightImg.height = 420;

		const PersonalLight = new Sprite( resources[ 'personalLight' ].texture );
		PersonalLight.anchor.set(0.5, 0.5);
		PersonalLight.x = player.x;
		PersonalLight.y = player.y;
		PersonalLight.width = 300;
		PersonalLight.height = 300;
		PersonalLight.alpha = 0.5;
		PersonalLight.blendMode = Pixi.BLEND_MODES.OVERLAY;

		const FloorImg = new Sprite( resources[ 'floor' ].texture );
		FloorImg.anchor.set(0);
		FloorImg.x = 0;
		FloorImg.y = 0;
		FloorImg.width = 2000;
		FloorImg.height = 2000;
		FloorImg.mask = FlashlightImg;

		PlayerSightStage.addChild( /* PersonalLight, */ FlashlightImg, FloorImg );

		function makeShape(segments, tags = [], color = '#777') {
			const points = segments.map(({ a }) => {
				return [a.x, a.y];
			});
			const shape = ECollisions.createPolygon(0, 0, points);
			shape.calculateSegments();
			shape.tags = tags;
			shape.color = color;
		
			return shape;
		}

		// create map from polygons data
		const obstacles = [];	
		mapData.forEach(segment => {
			const obstacle = makeShape(segment, ['obstacle']);
			obstacles.push(obstacle);
		});
		
		// add vewport borders to mapData
		/* const mapBounds =  */makeShape([
			{a:{x:0,y:0}, b:{x:Screen.width,y:0}},
			{a:{x:Screen.width,y:0}, b:{x:Screen.width,y:Screen.height}},
			{a:{x:Screen.width,y:Screen.height}, b:{x:0,y:Screen.height}},
			{a:{x:0,y:Screen.height}, b:{x:0,y:0}},
		], ['obstacle', 'bounds']);

		let lastUpdateTime = new Date().getTime();
		let potentials = null;

		function GlobalUpdate() {

			const { velocity, friction, halfFOV } = player;
			const currentTime = new Date().getTime();
			const timeDelta = (currentTime - lastUpdateTime) / 1000;
			lastUpdateTime = currentTime;


			// INPUT & MOVEMENT
			//////////////////////////////////////////////////////////////////////

			// Flashlight switch
			if (flashlight.switchCooldown === 1) {
				if (Keys[ KeysBindings.flashlightSwitch ] && flashlight.juice > 0) {
					FlashlightImg.visible = !FlashlightImg.visible;
					flashlight.switchCooldown = 0;
			
					// lightSwitchSound.play();
				}
			}
			else {
				flashlight.switchCooldown = clamp(flashlight.switchCooldown + timeDelta * 3);
			}

			const currentSpeed = player.maxSpeed;
			// solve player's velocity
			if( Keys[ KeysBindings.right ] ) {
				velocity.x = currentSpeed;
			}
			else if( Keys[ KeysBindings.left ] ) {
				velocity.x = -currentSpeed;
			}
			
			if( Keys[ KeysBindings.up ] ) {
				velocity.y = -currentSpeed;
			}
			else if( Keys[ KeysBindings.down ] ) {
				velocity.y = currentSpeed;
			}

			const velocityLength = velocity.getLength();
			if (velocity.x !== 0) {
				player.x += (velocity.x / velocityLength) * Math.abs(velocity.x) * timeDelta;
				player.FOVarea.x = player.x;
				FlashlightImg.x = player.x;
				PersonalLight.x = player.x;
			};
			if (velocity.y !== 0) {
				player.y += (velocity.y / velocityLength) * Math.abs(velocity.y) * timeDelta;
				player.FOVarea.y = player.y;
				FlashlightImg.y = player.y;
				PersonalLight.y = player.y;
			};

			velocity.x *= friction;
			if (velocity.x < 0.01 && velocity.x > -0.01) velocity.x = 0;
			velocity.y *= friction;
			if (velocity.y < 0.01 && velocity.y > -0.01) velocity.y = 0;


			// COLLISIONS
			//////////////////////////////////////////////////////////////////////

			ECollisions.update();

			// solve player's collisions
			potentials = player.potentials();
			for(const body of potentials) {
				if(body.tags && body.tags.includes('obstacle') && !body.tags.includes('bounds') && player.collides(body, Result)) {
					player.x -= Result.overlap * Result.overlap_x;
					player.y -= Result.overlap * Result.overlap_y;
				}
			}

			// get obstacles that are overlaping with FOV area
			potentials = player.FOVarea.potentials();
			const obstaclesWithinSight = [];
			Draw.strokeStyle = 'rgba(255, 0, 0, 0.2)';
			for(const body of potentials) {
				const colorSave = body.color;
				if(body.tags && body.tags.includes('obstacle') && player.FOVarea.collides(body, Result)) {
					obstaclesWithinSight.push(body);
				}
			}

			// get FOV bounding vectors
			// const playerToMouseVector = {
			// 	x: Mouse.x - player.x,
			// 	y: Mouse.y - player.y,
			// }
			// const FOVbounds = {
			// 	left:  getRotatedVector(playerToMouseVector, -halfFOV, Mouse),
			// 	right: getRotatedVector(playerToMouseVector, halfFOV, Mouse),
			// };

			// draw FOV

			// strokeSegment(Draw, player, FOVbounds.left, 'rgba(0, 0, 255, 0.7)');
			// strokeSegment(Draw, player, FOVbounds.right, 'rgba(0, 255, 0, 0.7)');


			// DRAW
			//////////////////////////////////////////////////////////////////////

			FlashlightImg.rotation = Mouse.getMouseToPointAngle( player );

			if (FlashlightImg.visible)
			{
				if (flashlight.flickerCounter < flashlight.nextFlickerIn && flashlight.intensity === flashlight.maxIntensity) {
					flashlight.flickerCounter += timeDelta;
				}
				else {
					flashlight.intensity = clamp(Math.sin(flashlight.flickerOffset), flashlight.maxIntensity * 0.7, flashlight.maxIntensity)
					flashlight.flickerOffset += randomInRange(-0.5, 0.5);
					flashlight.nextFlickerIn = randomInRange(0, 25) * timeDelta;
					flashlight.flickerCounter = 0;
				}

				FlashlightImg.alpha = flashlight.intensity;
			}

			Draw.clear();
			PlayerVisibleAreaMask.clear();
			Draw.lineStyle(0);

			const FOVpoly = GetFOVpolygon(player, obstaclesWithinSight);
			if (FOVpoly.length > 0)
			{
				PlayerVisibleAreaMask.lineStyle(0);
				PlayerVisibleAreaMask.beginFill( 0xFFFFFF );
				PlayerVisibleAreaMask.moveTo(FOVpoly[0].x, FOVpoly[0].y);
				for ( let i = 1; i < FOVpoly.length; i++ )
				{
					PlayerVisibleAreaMask.lineTo(FOVpoly[i].x, FOVpoly[i].y);
				}
				PlayerVisibleAreaMask.lineTo(FOVpoly[0].x, FOVpoly[0].y);
				PlayerVisibleAreaMask.endFill();
			}


			// UI
			//////////////////////////////////////////////////////////////////////

			AimSight.x = Mouse.x;
			AimSight.y = Mouse.y;


			// DEBUG DRAW
			//////////////////////////////////////////////////////////////////////

			// draw all obstacles
			// Draw.lineStyle( 2, 0x444444 );
			// obstacles.forEach(obstacle => {
			// 	const points = obstacle.getPoints();
			// 	Draw.moveTo(points[0][0], points[0][1]);
			// 	for ( let i = 1; i < points.length; i++ )
			// 	{
			// 		Draw.lineTo(points[i][0], points[i][1]);
			// 	}
			// 	Draw.lineTo(points[0][0], points[0][1]);
			// });

			// Draw rays
			// Draw.lineStyle( 1, 0xFF0000, 0.2 );
			// FOVpoly.forEach(point => {
			// 	Draw.moveTo(point.x, point.y);
			// 	Draw.lineTo(player.x, player.y);
			// });

			// Draw view area circle
			// Draw.lineStyle( 1, 0xFF0000, 0.7 );
			// Draw.drawCircle(player.x, player.y, player.sightMaxDistance);

			// // draw player
			// Draw.lineStyle(0);
			// Draw.beginFill( 0xFF0000 );
			// Draw.drawCircle(player.x, player.y, 10);
			// Draw.endFill();

			// // draw line from player to Mouse
			// strokeSegment(Draw, player, Mouse, 'cyan');
		}

		Graphics.ticker.add( GlobalUpdate );
    	Graphics.start();
	}

	Loader.load( AssetsPostLoadActions );
};
