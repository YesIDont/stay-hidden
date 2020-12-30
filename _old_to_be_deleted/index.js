const flashlight = new Image();
flashlight.src = 'images/flashlight.png';
const floor = new Image();
floor.src = 'images/floor.png';
const aim = new Image();
aim.src = 'images/aim.png';
const iconFlashlight = new Image();
iconFlashlight.src = 'images/icon-flashlight.png';
const iconHealth = new Image();
iconHealth.src = 'images/icon-life-heart.png';

const facilityAmbient = new Howl({
  src: ['sounds/sound-facility-ambient.mp3'],
  autoplay: true,
  loop: true,
  volume: 0.6,
});
facilityAmbient.once('load', () => facilityAmbient.play());

const footstepsSound = new Howl({
  src: ['sounds/sound-footsteps.mp3'],
  autoplay: true,
  loop: true,
  volume: 0,
});

const lightSwitchSound = new Howl({
  src: ['sounds/sound-light-switch.mp3'],
  autoplay: false,
  loop: false,
  volume: 1,
});

const batteryDeadSound = new Howl({
  src: ['sounds/sound-battery-out.mp3'],
  autoplay: false,
  loop: false,
  volume: 2,
});

window.addEventListener("load", function() {

  const youDiedScreen = document.querySelector('.you-died');
  const restartButton = document.querySelector('.you-died .restart-button');
  restartButton.addEventListener('click', () => {
    window.location.reload();
  });

  const map = {
    // n tiles horizontally
    width: 8,
    // n tiles vertically
    height: 8,
    // tiles are squares that are base for maze generation algorythm
    tileWidth: 256,
    wallsThickness: 16,
  }
  
  const playerSize = 12;
  const friction = 0.9;
  const collisions = new Collisions();
  const result = Collisions.createResult();
  const canvasWidthHalf = canvas.width * 0.5;
  const canvasHeightHalf = canvas.height * 0.5;
  let uniquePoints = [];
  let segments = [];
  let timeDelta = 0;
  let cursorSize = 24;
  let UiPadding = 30;
  let redOverlayOpacity = -1;

  // Flashlight
  let flashlightMaxIntensity = 1;
  let flashlightIntensity = flashlightMaxIntensity;
  let flashlightFlickerOffset = 0;
  let flashlightNextFlickerIn = .5;
  let flashlightFlickerCounter = 0;
  let flashlightJuice = randomInRange(0.6, 1); // start with random amount of battery
  let isFlashlightOn = true;
  let flashlightSwitchCooldown = 1;
  
  // Movement
  let speed = 12;
  let sprintSpeed = 40;
  let isSprintOn = false;
  let wasOnTheMove = false;

  const walls = generateMazeWalls( map );
  walls.forEach(wall => {
    const { a, b } = wall;
    const coreWidth = b.x - a.x;
    const coreHeight = b.y - a.y;
    const widthHalf = (map.wallsThickness + coreWidth) * 0.5;
    const heightHalf = (map.wallsThickness + coreHeight) * 0.5;
    const x = (a.x + coreWidth * 0.5);
    const y = (a.y + coreHeight * 0.5);
    const p0 = { x: -widthHalf, y: -heightHalf };
    const p1 = { x: widthHalf, y: -heightHalf };
    const p2 = { x: widthHalf, y: heightHalf };
    const p3 = { x: -widthHalf, y: heightHalf };
    collisions.createPolygon(x, y, [
      [p0.x, p0.y],
      [p1.x, p1.y],
      [p2.x, p2.y],
      [p3.x, p3.y],
    ]);
    segments.push({
      a: { x: p0.x + x, y: p0.y + y },
      b: { x: p1.x + x, y: p1.y + y },
    });
    segments.push({
      a: { x: p1.x + x, y: p1.y + y },
      b: { x: p2.x + x, y: p2.y + y },
    });
    segments.push({
      a: { x: p2.x + x, y: p2.y + y },
      b: { x: p3.x + x, y: p3.y + y },
    });
    segments.push({
      a: { x: p3.x + x, y: p3.y + y },
      b: { x: p0.x + x, y: p0.y + y },
    });
  });

  segments.forEach(({ a, b }) => {
    [a, b].forEach(point => {
      let isUnique = true;
      uniquePoints.forEach(item => {
        if (item.x === point.x && item.y === point.y) {
          isUnique = false; 
        }
      })
      if (isUnique) {
        uniquePoints.push(point);
      }
    });
  });

  const player = collisions.createCircle(
    map.tileWidth / 2,
    map.tileWidth / 2,
    playerSize,
  );
  
  player.stamina = 1;
  player.maxHealth = 5;
  player.health = player.maxHealth;

  const monster = collisions.createCircle(
    map.tileWidth / 2,
    map.tileWidth / 4,
    15,
  );
  monster.isMonster = true;
  monsterAttackCooldown = 1;
  monsterAttackCooldownCounter = monsterAttackCooldown;

  const velocity = new Vector();  
  const mouse = new Vector();
  
  function getMousePosition( e )
  {
    let v = e || window.event;
    let x = v.pageX;
    let y = v.pageY;

    // IE 8
    if ( x === undefined || x === null ) {
      const { scrollLeft, scrollTop } = document.body
      const { documentElement } = document
      x = v.clientX + scrollLeft + documentElement.scrollLeft;
      y = v.clientY + scrollTop + documentElement.scrollTop;
    }

    mouse.x = x;
    mouse.y = y;
  };
  document.addEventListener( 'mousemove', getMousePosition );
  
  function getPlayerToMouseAngle() {
    const angle = Math.atan2( canvasHeightHalf - mouse.y, canvasWidthHalf - mouse.x );

    return angle - (Math.PI * 0.5);
  }

  function convertScreenToMapCoordinates( point ) {
    return {
      x: -canvasWidthHalf + point.x + player.x,
      y: -canvasHeightHalf + point.y + player.y,
    };
  }

  const keysBindings = {
    up: 'w',
    down: 's',
    left: 'a',
    right: 'd',
    sprint: 'shift',
    flashlightSwitch: 'f',
  }

  const keys = {};
  keys[ keysBindings.up ] = false;
  keys[ keysBindings.down ] = false;
  keys[ keysBindings.left ] = false;
  keys[ keysBindings.right ] = false;
  keys[ keysBindings.sprint ] = false;
  keys[ keysBindings.flashlightSwitch ] = false;

  function onKeyDown({ key }) {
    keys[ key.toLowerCase() ] = true;
  }  

  function onKeyUp({ key }) {
    keys[ key.toLowerCase() ] = false;
  }

  window.addEventListener( 'keydown', onKeyDown );
  window.addEventListener( 'keyup', onKeyUp );

  let lastUpdateTime = new Date().getTime();
  // ctx.scale(3,3);
  // let angle = 0;
  // const angleMax = Math.PI * 2;
  // const angleMaxFraction = angleMax / 10;
  // const FOVfuzzyRadius = 8;

  function frame() {
    const currentTime = new Date().getTime();
    timeDelta = (currentTime - lastUpdateTime) / 1000;
    lastUpdateTime = currentTime;
    
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const canvasOffsetX = canvasWidthHalf - player.x;
    const canvasOffsetY = canvasHeightHalf - player.y;
    ctx.translate(canvasOffsetX, canvasOffsetY);
    
    const { x, y } = player;
    const mouseOnMap = convertScreenToMapCoordinates(mouse);
    // INPUT
    //////////////////////////////////////////////////////////////////////////////////////////////////
    
    // Flashlight switch
    if (flashlightSwitchCooldown === 1) {
      if (keys[ keysBindings.flashlightSwitch ] && flashlightJuice > 0) {
        isFlashlightOn = !isFlashlightOn;
        flashlightSwitchCooldown = 0;

        lightSwitchSound.play();
      }
    }
    else {
      flashlightSwitchCooldown = clamp(flashlightSwitchCooldown + timeDelta * 3);
    }
    
    // Sprint switch
    isSprintOn = keys[ keysBindings.sprint ];
    player.stamina = clamp(isSprintOn
      ? player.stamina - timeDelta / 10
      : player.stamina + timeDelta / 10);
    if (player.stamina === 0) isSprintOn = false;
    
    // Movement
    const currentSpeed = isSprintOn ? sprintSpeed : speed;
    currentSpeed *= timeDelta;
    if( keys[ keysBindings.right ] ) {
      velocity.x = currentSpeed;
    }
    else if( keys[ keysBindings.left ] ) {
      velocity.x = -currentSpeed;
    }
    
    if( keys[ keysBindings.up ] ) {
      velocity.y = -currentSpeed;
    }
    else if( keys[ keysBindings.down ] ) {
      velocity.y = currentSpeed;
    }

    let hasVelocityX = velocity.x !== 0;
    let hasVelocityY = velocity.y !== 0;

    let isOnTheMove = hasVelocityX || hasVelocityY;

    // start movement event
    if (isOnTheMove && !wasOnTheMove) {
      
    }
    // stop movement event
    else if (!isOnTheMove && wasOnTheMove) {
      
    }

    wasOnTheMove = isOnTheMove;

    if (isOnTheMove) {
      const velocityLength = velocity.getLength();
      if (hasVelocityX) player.x += (velocity.x / velocityLength) * Math.abs(velocity.x);
      if (hasVelocityY) player.y += (velocity.y / velocityLength) * Math.abs(velocity.y);
    }
    
    velocity.x *= friction;
		if (velocity.x < 0.01 && velocity.x > -0.01) velocity.x = 0;
		velocity.y *= friction;
		if (velocity.y < 0.01 && velocity.y > -0.01) velocity.y = 0;

    const footstepsMod = isSprintOn ? 1.8 : 0.9;
    footstepsSound.volume(footstepsMod);
    footstepsSound.rate(footstepsMod);

    // COLLISIONS
    //////////////////////////////////////////////////////////////////////////////////////////////////

    collisions.update();

		const potentials = player.potentials();

		// Negate any collisions
		for(const body of potentials) {
			if(player.collides(body, result)) {
				player.x -= result.overlap * result.overlap_x;
				player.y -= result.overlap * result.overlap_y;
      }
      if (body.isMonster && monsterAttackCooldownCounter >= monsterAttackCooldown) {
        player.health = clamp(player.health - 1, 0, player.maxHealth);
        monsterAttackCooldownCounter = 0;
        if (player.health <= 0) redOverlayOpacity = 1
        else redOverlayOpacity = 0.4;
      }
    }
    if (monsterAttackCooldownCounter < monsterAttackCooldown) monsterAttackCooldownCounter += timeDelta;
    
    // RENDERING
    //////////////////////////////////////////////////////////////////////////////////////////////////

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

      // ctx.beginPath();
      // ctx.fillStyle = 'rgba(255, 0, 0, 1)';
      // player.draw(ctx);
      // ctx.fill();

    if (flashlightJuice === 0) {
      isFlashlightOn = false;
      batteryDeadSound.play();
    };

    if (isFlashlightOn) {
      const FOVpoly = getSightPolygon(mouseOnMap, player, segments, uniquePoints, getPlayerToMouseAngle(), flashlight.height);
      if ( FOVpoly.length > 0 ) draw.polygon( FOVpoly, "#fff" );

      ctx.beginPath();
      ctx.fillStyle = 'rgba(255, 0, 0, 1)';
      monster.draw(ctx);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage( floor, 0, 0, floor.width, floor.height );
        
      ctx.globalCompositeOperation = 'destination-in';
      
      
      // get field of view polygon
      // const cornerPolys = []
      // for( angle = 0; angle < angleMax; angle += angleMaxFraction ) {
      //   const dx = Math.cos(angle) * FOVfuzzyRadius;
      //   const dy = Math.sin(angle) * FOVfuzzyRadius;
      //   cornerPolys.push( getSightPolygon( x + dx, y + dy, segments, uniquePoints ));
      // };
      
      // for( let i = 1; i < cornerPolys.length; i++ ) {
      //   draw.polygon( cornerPolys[i], "rgba(255,255,255,0.2)" );
      // }

      ctx.translate(x, y);
      ctx.rotate(getPlayerToMouseAngle());
      ctx.translate(-x, -y);

      if (flashlightFlickerCounter < flashlightNextFlickerIn && flashlightIntensity === flashlightMaxIntensity) {
        flashlightFlickerCounter += timeDelta;
      }
      else {
        flashlightIntensity = clamp(Math.sin(flashlightFlickerOffset), flashlightMaxIntensity * 0.7, flashlightMaxIntensity)
        flashlightFlickerOffset += randomInRange(-0.5, 0.5);
        flashlightNextFlickerIn = randomInRange(0, 1.5);
        flashlightFlickerCounter = 0;
      }
      
      ctx.globalAlpha = flashlightIntensity;
      ctx.drawImage(
        flashlight,
        x - flashlight.width * 0.5,
        y - flashlight.height + 10, // last number backs off light a little bit towards player
        flashlight.width,
        flashlight.height,
      );
      ctx.globalAlpha = 1;
    }

    // reset transform to draw UI elements in screen space
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    
    // red overlay displayed when player is hurt
    if (redOverlayOpacity > 0) {
      ctx.fillStyle = `rgba(255, 50, 0, ${redOverlayOpacity})`;
      ctx.beginPath();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      redOverlayOpacity -= timeDelta;
    }

    flashlightJuice = clamp(isFlashlightOn
      ? flashlightJuice - timeDelta / 40
      : flashlightJuice + timeDelta / 8);
    
    // flashilight shape under flashlight power indicator
    ctx.globalAlpha = 0.25;
    ctx.drawImage(
      iconFlashlight,
      0, 0,
      100, 40,
      30, canvas.height - 30 - 20,
      50, 20,
    );
    ctx.globalAlpha = 1;

    // bright flashlight icon showing how much power is left
    ctx.drawImage(
      iconFlashlight,
      0, 0,
      100 * flashlightJuice, 40,
      UiPadding, canvas.height - UiPadding - 20,
      50 * flashlightJuice, 20,
    );

    if (player.stamina < 1) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.fillRect(
        canvasWidthHalf - 70 * player.stamina,
        canvas.height - UiPadding - 5,
        140 * player.stamina, 5);
    }

    for ( let i = 1; i < player.health + 1; i++ ) {
      ctx.drawImage(
        iconHealth,
        canvas.width - UiPadding - ((iconHealth.width + 10) * i),
        canvas.height - UiPadding - iconHealth.height,
        iconHealth.width,
        iconHealth.height,
      );  
    }

    ctx.drawImage(
      aim,
      mouse.x - cursorSize * 0.5,
      mouse.y - cursorSize * 0.5,
      cursorSize,
      cursorSize,
    );
    
    if (player.health > 0) {
      requestAnimationFrame(frame);
    }
    else {
      youDiedScreen.style.display = 'flex';
      canvas.style.display = 'none';
    }
  }
  
  frame();

});
