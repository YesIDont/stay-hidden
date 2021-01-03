"use strict";

(function() {

    const map = {
        // n tiles horizontally
        width: 8,
        // n tiles vertically
        height: 8,
        // tiles are squares that are base for maze generation algorythm
        tileWidth: 96,
        wallsThickness: 16,
    }

    const Point = function( x = 0, y = 0 )
    {
        this.x = x;
        this.y = y;
    
        return;
    }

    const Wall = function( a, b, positionInCell, isMazeBoundary ) {
        this.a = a || new Point();
        this.b = b || new Point();
        // if false wall is hidden and not taken into account in render loop or collisions
        this.isClosed = true;
        /*
            int indicating wall's position in cell:
            0: top
            1: right
            2: bottom
            3: left
        */
        this.positionInCell = positionInCell;
        this.isMazeBoundary = isMazeBoundary;
    }

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
    }

    Engine.GenerateMaze = function( collisions )
    {
        const { width, height, tileWidth, wallsThickness } = map;
        const cells = [[]];
        const wallsAsSegments = [];
        
        // check if cell is valid - not out of bounds
        function isCellValid( x, y )
        {
            if( cells[ x ] && cells[ x ][ y ] ) return cells[ x ][ y ];
            return false;
        }
        
        const mazeRef = { width, height, isCellValid };
        
        // create two dimensional array of Cell objects
        for( let i = 0; i < width; i++ )
        {
            cells[ i ] = []
            for( let j = 0; j < height; j++ )
            {
                cells[ i ][ j ] = new Cell( i, j, tileWidth, mazeRef );
            }
        }

        let currentCell = cells[0][0];
        currentCell.visited = true;
        let stack = [currentCell];
        let nextCell = undefined;
        
        function areAllCellsVisited()
        {
            let areAllVisited = true;
            for( let i = 0; i < width - 1; i++ )
            {
                for( let j = 0; j < height - 1; j++ )
                {
                    const { visited } = cells[i][j];
                    if( !visited ) areAllVisited = false;
                }
            }
        
            return areAllVisited;
        }
        
        while( !(areAllCellsVisited()) )
        {
            const { x, y } = stack[ stack.length - 1 ].address;
        
            currentCell = cells[ x ][ y ];
            currentCell.visited = true;
            nextCell = currentCell.getNeighbour( this );
            if( nextCell )
            {
                // clear walls between both cells and randomly open one of walls
                // const shouldOpenRandomWall = flipCoin();
                currentCell.clearWallsWith( nextCell, true /* shouldOpenRandomWall */ );
            
                // add cell to the stack
                stack.push(nextCell);
            }
            // if there is no visited cells avilable, trace the stack back to the first cell that has neighbour that was not visited avilable and start from there
            else {
                while( !nextCell && stack.length > 0 )
                {
                    // remove last element
                    stack.splice(-1,1);
            
                    if( stack.length > 0 )
                    {
                        const { x, y } = stack[ stack.length - 1 ].address;
                        currentCell = cells[ x ][ y ];
                        nextCell = currentCell.getNeighbour( this );
                    }
                }

                if( nextCell )
                {
                    stack.push(nextCell);
                    // clear walls between both cells and randomly open one of walls
                    // const shouldOpenRandomWall = RNG( 1 );
                    currentCell.clearWallsWith( nextCell );
                    currentCell.visited = true;
                }
            }
        }

        // save original segments (walls) without repetitions
        for( let i = 0; i < cells.length; i++ )
        {
            for( let j = 0; j < cells[0].length; j++ )
            {
            const cellRef = cells[i][j];
            if( cellRef ) {
                cellRef.walls.forEach(wall => {
                if( wall.isClosed )
                {
                    const { a, b } = wall;
                    let isInPool = false;
                    wallsAsSegments.forEach(item => {
                            if (
                                item.a.x === a.x && item.a.y === a.y && item.b.x === b.x && item.b.y === b.y
                            ) {
                                isInPool = true;
                            }
                        }
                    );
                    if (!isInPool)
                    {
                        wallsAsSegments.push({ a, b });
                    }
                }
                })
            }
        }
    }

    const wallsGeometry = wallsAsSegments.map(wall => {
        const { a, b } = wall;
        const coreWidth = b.x - a.x;
        const coreHeight = b.y - a.y;
        const widthHalf = (wallsThickness + coreWidth) * 0.5;
        const heightHalf = (wallsThickness + coreHeight) * 0.5;
        const x = (a.x + coreWidth * 0.5);
        const y = (a.y + coreHeight * 0.5);
        const p0 = { x: -widthHalf, y: -heightHalf };
        const p1 = { x: widthHalf, y: -heightHalf };
        const p2 = { x: widthHalf, y: heightHalf };
        const p3 = { x: -widthHalf, y: heightHalf };
        const shape = collisions.createPolygon(x, y, [
          [p0.x, p0.y],
          [p1.x, p1.y],
          [p2.x, p2.y],
          [p3.x, p3.y],
        ]);
        shape.calculateSegments();
        shape.tags = ['obstacle'];

        return shape;
    });
      
    return wallsGeometry;
  }

})();
