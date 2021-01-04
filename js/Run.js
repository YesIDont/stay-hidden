"use strict";

Engine.Run = function()
{
	const {
		Assets,
		ECollisions,
		Flashlight,
		Keys,
		KeysBindings,
		Map,
		Mouse,
		Player,
		Result,
	} = Engine;

	const map = new Map({
		columns: 16,
		rows: 16,
		tileSize: 160,
		wallsThickness: 16,
	});
	const mapSize = map.GetSize();
	const player = new Player({
		x: 50,
		y: 50,
		size: 10,
		maxSpeed: 80,
		sightMaxDistance: 500
	});
	const flashlight = new Flashlight();
	const UiPadding = 30;

	const {
		Draw,
		FlashlightIconMask,
		Graphics,
		HealthMask,
		HighlightsChangel,
		Loader,
		Screen,
		LevelContainer,
		PlayerVisibleAreaMask,
		UIDraw,
		UIStage,
	} = Engine.SetupPixiJS( mapSize );
	
	PlayerVisibleAreaMask.lineStyle(0);

	function AssetsPostLoadActions( loader, resources )
	{
		
		const {
			aimSightSprite,
			floorSprite,
			flashlightSprite,
			iconFlashlightUsedRed,
			iconFlashlight,
			iconHealthLostRed,
			iconHealth,
		} = Assets.GetSprites( resources );

		Mouse.attach( aimSightSprite );

		flashlightSprite.x = player.x;
		flashlightSprite.y = player.y;
		flashlightSprite.height = player.sightMaxDistance;
		
		iconFlashlight.x = iconFlashlightUsedRed.x = UiPadding;
		iconFlashlight.y = iconFlashlightUsedRed.y = Screen.height - UiPadding - iconFlashlight.height;
		
		iconHealth.x = iconHealthLostRed.x = Screen.width - iconHealth.width - UiPadding;
		iconHealth.y = iconHealthLostRed.y = Screen.height - iconHealth.height - UiPadding;
		iconHealth.mask = HealthMask;

		floorSprite.width = mapSize.width;
		floorSprite.height = mapSize.height;
		
		iconFlashlight.mask = FlashlightIconMask;
		floorSprite.mask = flashlightSprite;
		HighlightsChangel.mask = flashlightSprite;
		LevelContainer.mask = PlayerVisibleAreaMask;

		LevelContainer.addChild
		(
			PlayerVisibleAreaMask,
			flashlightSprite,
			floorSprite,
			HighlightsChangel,
			Draw,
		);
		
		LevelContainer.x = Screen.width * 0.5 - player.x;
		LevelContainer.y = Screen.height * 0.5 - player.y;
		
		UIStage.addChild
		(
			iconFlashlightUsedRed,
			iconFlashlight,
			iconHealthLostRed,
			iconHealth,
			aimSightSprite,
		);
		
		const {
			facilityAmbient,
			footstepsSound,
			lightSwitchSound,
			batteryDeadSound,
		} = Assets.GetSounds();

		function makeShape(segments, tags = [], color = '#777')
		{
			const points = segments.map(({ a }) => {
				return [a.x, a.y];
			});
			const shape = ECollisions.createPolygon(0, 0, points);
			shape.calculateSegments();
			shape.tags = tags;
			shape.color = color;
		
			return shape;
		}

		// add vewport borders to mapData
		makeShape	
		(
			[
				{a:{x:0,y:0}, b:{x:mapSize.width,y:0}},
				{a:{x:mapSize.width,y:0}, b:{x:mapSize.width,y:mapSize.height}},
				{a:{x:mapSize.width,y:mapSize.height}, b:{x:0,y:mapSize.height}},
				{a:{x:0,y:mapSize.height}, b:{x:0,y:0}},
			],
			['obstacle', 'bounds']
		);

		const obstacles = Engine.GenerateMaze( ECollisions, map );

		let lastUpdateTime = new Date().getTime();
		let potentials = null;

		const { youDiedScreen } = Engine.GetUI();

		function GlobalUpdate() {

			const { velocity, friction, halfFOV } = player;
			const currentTime = new Date().getTime();
			const timeDelta = (currentTime - lastUpdateTime) / 1000;
			lastUpdateTime = currentTime;

			
			// INPUT & MOVEMENT
			//////////////////////////////////////////////////////////////////////

			// Flashlight switch
			if (flashlight.switchCooldown === 1)
			{
				if (Keys[ KeysBindings.flashlightSwitch ] && flashlight.juice > 0)
				{
					flashlightSprite.visible = !flashlightSprite.visible;
					flashlight.switchCooldown = 0;
			
					lightSwitchSound.play();
				}
			}
			else {
				flashlight.switchCooldown = clamp(flashlight.switchCooldown + timeDelta * 3);
			}
			
			// Sprint switch
			player.isSprinting = Keys[ KeysBindings.sprint ];
			player.stamina = clamp
			(
				player.isSprinting
					? player.stamina - timeDelta / 10
					: player.stamina + timeDelta / 10
			);
			if (player.stamina === 0) player.isSprinting = false;

			const currentSpeed = player.isSprinting ? player.sprintSpeed : player.walkSpeed;
			// solve player's velocity
			if (Keys[ KeysBindings.right ])
			{
				velocity.x = currentSpeed;
			}
			else if (Keys[ KeysBindings.left ])
			{
				velocity.x = -currentSpeed;
			}
			
			if (Keys[ KeysBindings.up ])
			{
				velocity.y = -currentSpeed;
			}
			else if (Keys[ KeysBindings.down ])
			{
				velocity.y = currentSpeed;
			}

			const velocityLength = velocity.getLength();
			if (velocity.x !== 0)
			{
				player.x += (velocity.x / velocityLength) * Math.abs(velocity.x) * timeDelta;
				player.FOVarea.x = player.x;
				flashlightSprite.x = player.x;
				LevelContainer.x = Screen.width * 0.5 - player.x;
			};
			if (velocity.y !== 0)
			{
				player.y += (velocity.y / velocityLength) * Math.abs(velocity.y) * timeDelta;
				player.FOVarea.y = player.y;
				flashlightSprite.y = player.y;
				LevelContainer.y = Screen.height * 0.5 - player.y;
			};
			
			velocity.x *= friction;
			if (velocity.x < 0.01 && velocity.x > -0.01) velocity.x = 0;
			velocity.y *= friction;
			if (velocity.y < 0.01 && velocity.y > -0.01) velocity.y = 0;


			// SOLVE COLLISIONS
			//////////////////////////////////////////////////////////////////////

			ECollisions.update();

			// solve player's collisions
			potentials = player.potentials();
			for (const body of potentials)
			{
				if(body.tags && body.tags.includes('obstacle') && !body.tags.includes('bounds') && player.collides(body, Result))
				{
					player.x -= Result.overlap * Result.overlap_x;
					player.y -= Result.overlap * Result.overlap_y;
				}
			}

			// get obstacles that are overlaping with FOV area
			potentials = player.FOVarea.potentials();
			const obstaclesWithinSight = [];
			// Draw.strokeStyle = 'rgba(255, 0, 0, 0.2)';
			for(const body of potentials)
			{
				const colorSave = body.color;
				if(body.tags && body.tags.includes('obstacle') && player.FOVarea.collides(body, Result))
				{
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

			// STATE UDPATES
			//////////////////////////////////////////////////////////////////////

			if (player.currentHealth <= 0)
			{
				youDiedScreen.style.display = 'flex';
				Graphics.stop();
				return;
			}

			flashlight.juice = clamp
			(
				flashlightSprite.visible
					? flashlight.juice - timeDelta / 40
					: flashlight.juice + timeDelta / 8
			);
				
			if (flashlight.juice === 0)
			{
				flashlightSprite.visible = false;
				flashlight.switchCooldown = 0;
				batteryDeadSound.play();
			};
				
			flashlightSprite.rotation = Mouse.getMouseToPointAngle({
				x: LevelContainer.x + player.x,
				y: LevelContainer.y + player.y,
			});

			if (flashlightSprite.visible)
			{
				if (flashlight.flickerCounter < flashlight.nextFlickerIn && flashlight.intensity === flashlight.maxIntensity)
				{
					flashlight.flickerCounter += timeDelta;
				}
				else {
					flashlight.intensity = clamp(Math.sin(flashlight.flickerOffset), flashlight.maxIntensity * 0.7, flashlight.maxIntensity)
					flashlight.flickerOffset += randomInRange(-0.5, 0.5);
					flashlight.nextFlickerIn = randomInRange(0, 25) * timeDelta;
					flashlight.flickerCounter = 0;
				}

				flashlightSprite.alpha = flashlight.intensity;
			}
			
			footstepsSound.volume( mapValueInRangeClamped(velocityLength, 0, player.sprintSpeed ));
			footstepsSound.rate( player.isSprinting ? 1.5 : 0.9 );
			

			// DRAW
			//////////////////////////////////////////////////////////////////////

			Draw.clear();
			Draw.lineStyle(0);
			PlayerVisibleAreaMask.clear();
			FlashlightIconMask.clear();
			HighlightsChangel.clear();
			HealthMask.clear();
			UIDraw.clear();
			
			// Draw mask of the area that's visible for the player
			if (flashlightSprite.visible)
			{
				const visiblePolygons = [];
				const FOVpoly = GetFOVpolygon(player, obstaclesWithinSight, visiblePolygons);
				if (FOVpoly.length > 0)
				{
					PlayerVisibleAreaMask.beginFill( 0xFFFFFF );
					PlayerVisibleAreaMask.moveTo(FOVpoly[0].x, FOVpoly[0].y);
					// HighlightsChangel.moveTo(FOVpoly[0].x, FOVpoly[0].y);
					for ( let i = 1; i < FOVpoly.length; i++ )
					{
						PlayerVisibleAreaMask.lineTo(FOVpoly[i].x, FOVpoly[i].y);
						// HighlightsChangel.lineTo(FOVpoly[i].x, FOVpoly[i].y);
					};
					PlayerVisibleAreaMask.lineTo(FOVpoly[0].x, FOVpoly[0].y);
					// HighlightsChangel.lineTo(FOVpoly[0].x, FOVpoly[0].y);
					PlayerVisibleAreaMask.endFill();
					
					visiblePolygons.forEach(polygon => {
						strokePolygon(HighlightsChangel, polygon, 3, 0x888888);
					});

					// Debug draw: sight rays
					// Draw.lineStyle( 1, 0xFF0000, 0.1);
					// FOVpoly.forEach(point => {
					// 	Draw.moveTo(point.x, point.y);
					// 	Draw.lineTo(player.x, player.y);
					// });
				}				
			}
	
			
			// UI
			//////////////////////////////////////////////////////////////////////

			// Draw white stripe shrinking when player runs and growing when stamina
			// is regenerating
			if (player.stamina < 1)
			{
				fillRectangle
				(
					UIDraw,
					Screen.width * 0.5 - (70  * player.stamina),
					Screen.height - UiPadding - 5,
					140 * player.stamina,
					5,
					0xFFFFFF
				)
			}
			
			// Draw flashlight mask that covers portion of flishlight icon
			// to indicate battery consumption
			fillRectangle
			(
				FlashlightIconMask,
				iconFlashlight.x,
				iconFlashlight.y,
				iconFlashlight.width * flashlight.juice,
				iconFlashlight.height,
				0xFFFFFF
			);
			
			// Draw mask to indicate lost health
			const healthIconWidth = iconHealth.width;
			const healthIconHeight = iconHealth.height;
			const healthLostNormalized = mapValueInRangeClamped
			(
				player.maxHealth - player.currentHealth, 0, player.maxHealth
			);
			fillRectangle
			(
				HealthMask,
				iconHealth.x + healthIconWidth * healthLostNormalized,
				iconHealth.y,
				healthIconWidth - healthIconWidth * healthLostNormalized,
				healthIconHeight,
				0xFFFFFF
			);
			
			// DEBUG DRAW
			//////////////////////////////////////////////////////////////////////
			
			// draw all obstacles
			// obstacles.forEach(obstacle => {
			// 	fillPolygon( Draw, obstacle.getPoints(), 0x000000 );
			// 	// strokePolygon( Draw, obstacle.getPoints(), 1, 0x222222 );					
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

			// Draw FOV
			// strokeSegment(Draw, player, FOVbounds.left, 1, 0xFF0000);
			// strokeSegment(Draw, player, FOVbounds.right, 1, 0x00FF00);
		}

		Graphics.ticker.add( GlobalUpdate );
    	Graphics.start();
	}

	Loader.load( AssetsPostLoadActions );
};
