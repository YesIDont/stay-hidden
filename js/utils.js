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

function clamp(value, min = 0, max = 1) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function randomInRange(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

function mapValueInRangeClamped(value, in_min, in_max, out_min = 0, out_max = 1) {
  const inRange = (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  return clamp(inRange, out_min, out_max);
}
