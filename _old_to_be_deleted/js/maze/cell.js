const Cell = function( a, b, size, mazeRef ) {
  this.maze = mazeRef;
  this.visited = false;
  this.address = {
    x: a,
    y: b,
  };
  let h = size;
  let x = a * h;
  let y = b * h;
  this.x = x;
  this.y = y;
  // cell's half size

  // top, right, bottom and left walls (clockwise)
  this.walls = [
    // 0: top
    new Wall(
      new Point( x, y ),
      new Point( x + h, y ),
      0,
      b === 0,
    ),
    // 1: right
    new Wall(
      new Point( x + h, y ),
      new Point( x + h, y + h ),
      1,
      a === mazeRef.width - 1,
    ),
    // 2: bottom
    new Wall(
      new Point( x, y + h ),
      new Point( x + h, y + h ),
      2,
      b === mazeRef.height - 1,
    ),
    // 3: left
    new Wall(
      new Point( x, y ),
      new Point( x, y + h ),
      3,
      a === 0,
    ),
  ];
}

Cell.prototype.clearWallsWith = function( neighbourCell, shouldOpenRandomWall ) {
  const { x, y } = this.address;
  const v = this.walls;
  const a = neighbourCell.address;
  const w = neighbourCell.walls;

  // if we are in the same column
  if( x === a.x ) {
    // if you are below me
    if( y < a.y ) {
      v[2].isClosed = false;
      w[0].isClosed = false;
    }
    else {
      v[0].isClosed = false;
      w[2].isClosed = false;
    }
  }
  // if we are in the same row
  else {
    // if you are on the right
    if( x < a.x ) {
      v[1].isClosed = false;
      w[3].isClosed = false;
    }
    // if you are on the left
    else {
      v[3].isClosed = false;
      w[1].isClosed = false;
    }
  }

  // open walls randomly but avoid opening maze's boundaries
  if( shouldOpenRandomWall ) {
    let randomWall = Math.round( Math.random() * 3 );

    switch( randomWall ) {
      case 0:
        if( !v[2].isMazeBoundary ) v[2].isClosed = false;
        if( !w[0].isMazeBoundary ) w[0].isClosed = false;
        break;

      case 1:
        if( !v[0].isMazeBoundary ) v[0].isClosed = false;
        if( !w[2].isMazeBoundary ) w[2].isClosed = false;
        break;

      case 2:
        if( !v[1].isMazeBoundary ) v[1].isClosed = false;
        if( !w[3].isMazeBoundary ) w[3].isClosed = false;
        break;
      
      default:
        if( !v[3].isMazeBoundary ) v[3].isClosed = false;
        if( !w[1].isMazeBoundary ) w[1].isClosed = false;
    }
  }
}

Cell.prototype.getNeighbour = function() {
  const { maze } = this;
  // get reference to cell's own address coords
  const { x, y } = this.address;
  
  // check if one of neighbour addresses (top, right, bottom or left) is valid 
  let neighbours = [
    maze.isCellValid( x, y - 1 ),
    maze.isCellValid( x + 1, y ),
    maze.isCellValid( x, y + 1 ),
    maze.isCellValid( x - 1, y ),
  ];

  // filter cells out of bounds
  neighbours = neighbours.filter(function( element ) {
    return !!element
  })

  // pick randomly one of neighbours: 0 to 3
  let resultIndex = Math.round( Math.random() * ( neighbours.length - 1 ));
  let result = neighbours[resultIndex];

  // in case result was already visited remove it from neighbours and draw again
  while( result.visited ) {
    // filter out current result to avoid drawing it again
    neighbours = neighbours.filter(function( element, index ) {
      return index !== resultIndex
    })

    // break if neighbour array is empty
    if( neighbours.length === 0 ) break;

    // draw another neighbour
    resultIndex = Math.round( Math.random() * ( neighbours.length - 1 ));
    result = neighbours[resultIndex];
  }

  if( neighbours.length === 0 ) return false;

  return result
};
