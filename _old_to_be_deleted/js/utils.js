const log = console.log;

// flip a coin to draw true or false
function flipCoin() {
  return !!Math.round( Math.random() );
}

// test success for given 1/100 chance
function d100( chance ) {
  // percentage chance ( n out of 100 )
  let random = Math.round( Math.random() * 100 );
  return random < chance;
}

function degreesToRadians( degrees ) {
  return degrees * ( Math.PI / 180);
}

function getTwoPointsLength(a, b) {
  const x = b.x - a.x;
  const y = b.y - a.y;

  return Math.sqrt((x * x + y * y));
}

function getVectorLength( vector ) {
  return Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
}

function getVectorNormalized( vector ) {
  const length = getVectorLength( vector );

  return {
    x: vector.x / length,
    y: vector.y / length,
  }
}

function getRotatedVector( vector, angle ) {
    const theta = angle * (Math.PI / 180); // radians
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
            
    return { 
      x: (cos * vector.x) - (sin * vector.y), 
      y: (sin * vector.x) + (cos * vector.y),
    };
}

function clamp( value, min = 0, max = 1 ) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function randomInRange( min = 0, max = 1 ) {
  return Math.random() * (max - min) + min;
}

function mapValueInRangeClamped( value, in_min, in_max, out_min = 0, out_max = 1 ) {
  const inRange = (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  return clamp(inRange, out_min, out_max);
}

function normalizeAngle( angle ) {
  let mod = angle % 360;
  if (mod < 0) mod += 360;
  if (mod > 180) mod -=360;

  return mod;
}
