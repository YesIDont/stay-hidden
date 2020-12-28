const generateMazeWalls = function({ width, height, tileWidth }) {
    const cells = [[]];
    const walls = [];
    
    // check if cell is valid - not out of bounds
    function isCellValid( x, y ) {
      if( cells[ x ] && cells[ x ][ y ] ) return cells[ x ][ y ];
      return false;
    }
    
    const mazeRef = { width, height, isCellValid };
    
    // create two dimensional array of Cell objects
    for( let i = 0; i < width; i++ ) {
      cells[ i ] = []
      for( j = 0; j < height; j++ ) {
        cells[ i ][ j ] = new Cell( i, j, tileWidth, mazeRef );
      }
    }
  
    let currentCell = cells[0][0];
    currentCell.visited = true;
    let stack = [currentCell];
    let nextCell = undefined;
    
    function areAllCellsVisited() {
      let areAllVisited = true;
      for( let i = 0; i < width - 1; i++ ) {
        for( j = 0; j < height - 1; j++ ) {
          const { visited } = cells[i][j];
          if( !visited ) areAllVisited = false;
        }
      }
    
      return areAllVisited;
    }
    
    while( !(areAllCellsVisited()) ) {
  
      const { x, y } = stack[ stack.length - 1 ].address;
  
      currentCell = cells[ x ][ y ];
      currentCell.visited = true;
      nextCell = currentCell.getNeighbour( this );
      if( nextCell ) {
        // clear walls between both cells and randomly open one of walls
        const shouldOpenRandomWall = flipCoin();
        currentCell.clearWallsWith( nextCell, true /* shouldOpenRandomWall */ );
  
        // add cell to the stack
        stack.push(nextCell);
      }
      // if there is no visited cells avilable, trace the stack back to the first cell that has neighbour that was not visited avilable and start from there
      else {
        while( !nextCell && stack.length > 0 ) {
          // remove last element
          stack.splice(-1,1);
  
          if( stack.length > 0 ) {
            const { x, y } = stack[ stack.length - 1 ].address;
            currentCell = cells[ x ][ y ];
            nextCell = currentCell.getNeighbour( this );
          }
        }
        if( nextCell ) {
          stack.push(nextCell);
          // clear walls between both cells and randomly open one of walls
          // const shouldOpenRandomWall = RNG( 1 );
          currentCell.clearWallsWith( nextCell );
          currentCell.visited = true;
        }
      }
    }
    
    // save original walls (without repetitions)
    for( i = 0; i < cells.length; i++ ) {
      for( j = 0; j < cells[0].length; j++ ) {
        const cellRef = cells[i][j];
        if( cellRef ) {
          cellRef.walls.forEach(wall => {
            if( wall.isClosed ) {
              const { a, b } = wall;
              let isInPool = false;
              walls.forEach(item => {
                if (
                  item.a.x === a.x && item.a.y === a.y && item.b.x === b.x && item.b.y === b.y
                )
                {
                  isInPool = true;
                }
              });
              if (!isInPool) {
                walls.push({ a, b });
              }
            }
          })
        }
      }
    }
    
    return walls;
}
