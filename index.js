const flashlight = new Image();
flashlight.src = 'images/flashlight.png';
const floor = new Image();
floor.src = 'images/floor.png';
const aim = new Image();
aim.src = 'images/aim.png';
const iconFlashlight = new Image();
iconFlashlight.src = 'images/icon-flashlight.png';

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
  
  const map = {
    // n tiles horizontally
    width: 8,
    // n tiles vertically
    height: 8,
    // tiles are squares that are base for maze generation algorythm
    tileWidth: 160,
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
  let speed = 60;
  let sprintSpeed = 160;
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

  const monster = collisions.createCircle(
    map.tileWidth / 2,
    map.tileWidth / 4,
    15,
  );

  player.stamina = 1;

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
  
  function getPlayerToPointAngle() {
    const angle = Math.atan2( canvasHeightHalf - mouse.y, canvasWidthHalf - mouse.x );
    return angle - (Math.PI * 0.5);
    // return Math.atan2( point.y - mouse.y, point.x - mouse.x );
  }

  const keysBindings = {
    sprint: 'shift',
    up: 'w',
    down: 's',
    left: 'a',
    right: 'd',
  }

  const keys = [];
  keys[ keysBindings.sprint ] = false;
  keys[ keysBindings.up ] = false;
  keys[ keysBindings.down ] = false;
  keys[ keysBindings.left ] = false;
  keys[ keysBindings.right ] = false;

  function onKeyDown({ key }) {
    keys[ key.toLowerCase() ] = true;
  }  

  function onKeyUp({ key }) {
    keys[ key.toLowerCase() ] = false;
  }

  window.addEventListener( 'keydown', onKeyDown );
  window.addEventListener( 'keyup', onKeyUp );

  let lastUpdateTime = new Date().getTime();
  // let angle = 0;
  // const angleMax = Math.PI * 2;
  // const angleMaxFraction = angleMax / 10;
  // const FOVfuzzyRadius = 8;

  function frame() {
    const currentTime = new Date().getTime();
    timeDelta = (currentTime - lastUpdateTime) / 1000;
    lastUpdateTime = currentTime;
    
    const { x, y } = player;
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvasWidthHalf - x, canvasHeightHalf - y);
    
    // INPUT
    //////////////////////////////////////////////////////////////////////////////////////////////////
    
    // Flashlight switch
    if (flashlightSwitchCooldown === 1) {
      if (keys[ 'f' ] && flashlightJuice > 0) {
        isFlashlightOn = !isFlashlightOn;
        flashlightSwitchCooldown = 0;

        lightSwitchSound.play();
      }
    }
    else {
      flashlightSwitchCooldown = clamp(flashlightSwitchCooldown + timeDelta * 3);
    }
    
    // Sprint switch
    isSprintOn = keys[ 'shift' ];
    player.stamina = clamp(isSprintOn
      ? player.stamina - timeDelta / 10
      : player.stamina + timeDelta / 10);
    if (player.stamina === 0) isSprintOn = false;
    const deltaSpeed = isSprintOn
      ? sprintSpeed * timeDelta
      : speed * timeDelta;

    // Movement
    if( keys[ 'd' ] ) {
      velocity.x = deltaSpeed;
    }
    else if( keys[ 'a' ] ) {
      velocity.x = -deltaSpeed;
    }
    
    if( keys[ 'w' ] ) {
      velocity.y = -deltaSpeed;
    }
    else if( keys[ 's' ] ) {
      velocity.y = deltaSpeed;
    }

    const footstepsMod = mapValueInRangeClamped(velocity.getLength(), 0, .3, 0, isSprintOn ? 1.8 : 0.9);
    footstepsSound.volume(footstepsMod);
    footstepsSound.rate(footstepsMod);

    let isOnTheMove = velocity.x !== 0 || velocity.y !== 0;

    // // start movement event
    // if (isOnTheMove && !wasOnTheMove) {
      
    // }
    // // stop movement event
    // else if (!isOnTheMove && wasOnTheMove) {
      
    // }

    wasOnTheMove = isOnTheMove;
    
    if (velocity.x !== 0) player.x += velocity.x;
    if (velocity.y !== 0) player.y += velocity.y;
    
    velocity.x *= friction;
    if (velocity.x < 0.01) velocity.x = 0;
    velocity.y *= friction;
    if (velocity.y < 0.01) velocity.y = 0;
    
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
    }
    
    // RENDERING
    //////////////////////////////////////////////////////////////////////////////////////////////////

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    if (flashlightJuice === 0) {
      isFlashlightOn = false;
      batteryDeadSound.play();
    };

    if (isFlashlightOn) {
      ctx.drawImage( floor, 0, 0, floor.width, floor.height);

      ctx.beginPath();
      ctx.fillStyle = 'rgba(255, 0, 0, 1)';
      monster.draw(ctx);
      ctx.fill();
        
      ctx.globalCompositeOperation = 'destination-in';
      
      const FOVpoly = getSightPolygon(x, y, segments, uniquePoints);
      draw.polygon( FOVpoly, "#000" );
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
      ctx.rotate(getPlayerToPointAngle());
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

    flashlightJuice = clamp(isFlashlightOn
      ? flashlightJuice - timeDelta / 40
      : flashlightJuice + timeDelta / 8);

    ctx.globalCompositeOperation = 'source-over';
    
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
      30, canvas.height - 30 - 20,
      50 * flashlightJuice, 20,
    );

    if (player.stamina < 1) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.fillRect(
        canvasWidthHalf - 70 * player.stamina,
        canvas.height - 50,
        140 * player.stamina, 5);
    }

    ctx.drawImage(
      aim,
      mouse.x - cursorSize * 0.5,
      mouse.y - cursorSize * 0.5,
      cursorSize,
      cursorSize,
    );
    
    requestAnimationFrame(frame);
  }
  
  frame();

});
