'use strict';

const Point = function (x = 0, y = 0) {
  this.x = x;
  this.y = y;

  return;
};

const Wall = function (a, b, positionInCell, isMazeBoundary) {
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
};

const Cell = function (a, b, size, mazeRef) {
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
    new Wall(new Point(x, y), new Point(x + h, y), 0, b === 0),
    // 1: right
    new Wall(new Point(x + h, y), new Point(x + h, y + h), 1, a === mazeRef.width - 1),
    // 2: bottom
    new Wall(new Point(x, y + h), new Point(x + h, y + h), 2, b === mazeRef.height - 1),
    // 3: left
    new Wall(new Point(x, y), new Point(x, y + h), 3, a === 0),
  ];
};

function hasOpenWallsWith(cell, neighbour) {
  const { x, y } = cell.address;
  const v = cell.walls;
  const a = neighbour.address;
  const w = neighbour.walls;
  let hasOpenWalls = true;

  if (x === a.x) {
    // if you are below me
    if (y < a.y) {
      hasOpenWalls = !v[2].isClosed && !w[0].isClosed;
    } else {
      hasOpenWalls = !v[0].isClosed && !w[2].isClosed;
    }
  }
  // if we are in the same row
  else {
    // if you are on the right
    if (x < a.x) {
      hasOpenWalls = !v[1].isClosed && !w[3].isClosed;
    }
    // if you are on the left
    else {
      hasOpenWalls = !v[3].isClosed && !w[1].isClosed;
    }
  }

  return hasOpenWalls;
}

Cell.prototype.clearWallsWith = function (neighbourCell, shouldOpenRandomWall) {
  const { x, y } = this.address;
  const v = this.walls;
  const a = neighbourCell.address;
  const w = neighbourCell.walls;

  // if we are in the same column
  if (x === a.x) {
    // if you are below me
    if (y < a.y) {
      v[2].isClosed = false;
      w[0].isClosed = false;
    } else {
      v[0].isClosed = false;
      w[2].isClosed = false;
    }
  }
  // if we are in the same row
  else {
    // if you are on the right
    if (x < a.x) {
      v[1].isClosed = false;
      w[3].isClosed = false;
    }
    // if you are on the left
    else {
      v[3].isClosed = false;
      w[1].isClosed = false;
    }
  }

  // randomly open one of walls (without opening maze's boundaries)
  if (shouldOpenRandomWall) {
    let randomWall = Math.round(Math.random() * 3);

    /* eslint-disable indent */
    switch (randomWall) {
      case 0:
        if (!v[2].isMazeBoundary) v[2].isClosed = false;
        if (!w[0].isMazeBoundary) w[0].isClosed = false;
        break;

      case 1:
        if (!v[0].isMazeBoundary) v[0].isClosed = false;
        if (!w[2].isMazeBoundary) w[2].isClosed = false;
        break;

      case 2:
        if (!v[1].isMazeBoundary) v[1].isClosed = false;
        if (!w[3].isMazeBoundary) w[3].isClosed = false;
        break;

      default:
        if (!v[3].isMazeBoundary) v[3].isClosed = false;
        if (!w[1].isMazeBoundary) w[1].isClosed = false;
    }
  }
  /* eslint-enable indent */
};

Cell.prototype.getNeighbour = function () {
  const { maze } = this;
  // get reference to cell's own address coords
  const { x, y } = this.address;

  // make sure that neighbour addresses (top, right, bottom or left) are valid
  let neighbours = [
    maze.isCellValid(x, y - 1),
    maze.isCellValid(x + 1, y),
    maze.isCellValid(x, y + 1),
    maze.isCellValid(x - 1, y),
  ];

  // filter cells out of bounds
  neighbours = neighbours.filter((element) => !!element);

  // pick randomly one of neighbours: 0 to 3
  let resultIndex = Math.round(Math.random() * (neighbours.length - 1));
  let result = neighbours[resultIndex];

  // in case result was already visited remove it from neighbours and draw again
  while (result.visited) {
    // filter out current result to avoid drawing it again
    neighbours = neighbours.filter(function (element, index) {
      return index !== resultIndex;
    });

    // break if neighbour array is empty
    if (neighbours.length === 0) break;

    // draw another neighbour
    resultIndex = Math.round(Math.random() * (neighbours.length - 1));
    result = neighbours[resultIndex];
  }

  if (neighbours.length === 0) return false;

  return result;
};

function generateChessboardBasedMaze(mapSettings) {
  const { columns, rows, tileSize } = mapSettings;
  const cells = [[]];

  // check if cell is valid - not out of bounds
  function isCellValid(x, y) {
    if (cells[x] && cells[x][y]) return cells[x][y];
    return false;
  }

  const mazeRef = { width: columns, height: rows, isCellValid };

  // create two dimensional array of Cell objects
  for (let i = 0; i < columns; i++) {
    cells[i] = [];
    for (let j = 0; j < rows; j++) {
      cells[i][j] = new Cell(i, j, tileSize, mazeRef);
    }
  }

  let currentCell = cells[0][0];
  currentCell.visited = true;
  let stack = [currentCell];
  let nextCell = undefined;

  function areAllCellsVisited() {
    let areAllVisited = true;
    for (let i = 0; i < columns - 1; i++) {
      for (let j = 0; j < rows - 1; j++) {
        if (!cells[i][j].visited) areAllVisited = false;
      }
    }

    return areAllVisited;
  }

  while (!areAllCellsVisited()) {
    const { x, y } = stack[stack.length - 1].address;

    currentCell = cells[x][y];
    currentCell.visited = true;
    nextCell = currentCell.getNeighbour(this);
    if (nextCell) {
      // clear walls between both cells and randomly open one of walls
      // const shouldOpenRandomWall = flipCoin();
      currentCell.clearWallsWith(nextCell, true);

      // add cell to the stack
      stack.push(nextCell);
    }
    // if there is no visited cells avilable, trace the stack back to the first cell that has neighbour that was not visited avilable and start from there
    else {
      while (!nextCell && stack.length > 0) {
        // remove last element
        stack.splice(-1, 1);

        if (stack.length > 0) {
          const { x, y } = stack[stack.length - 1].address;
          currentCell = cells[x][y];
          nextCell = currentCell.getNeighbour(this);
        }
      }

      if (nextCell) {
        stack.push(nextCell);
        // clear walls between both cells and randomly open one of walls
        // const shouldOpenRandomWall = RNG( 1 );
        currentCell.clearWallsWith(nextCell);
        currentCell.visited = true;
      }
    }
  }

  return cells;
}

function filterRepeatingWallsCells(cells) {
  let wallsAsSegments = [];

  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells[0].length; j++) {
      const cellRef = cells[i][j];
      if (cellRef) {
        cellRef.walls.forEach((wall) => {
          if (wall.isClosed) {
            const { a, b } = wall;
            let isInPool = false;
            wallsAsSegments.forEach((item) => {
              if (item.a.x === a.x && item.a.y === a.y && item.b.x === b.x && item.b.y === b.y) {
                isInPool = true;
              }
            });
            if (!isInPool) {
              wallsAsSegments.push({ a, b });
            }
          }
        });
      }
    }
  }

  return wallsAsSegments;
}

function filterAndMergeHorizontalWallsCells(wallsAsSegments) {
  let horizontal = wallsAsSegments.filter((segment) => segment.a.y === segment.b.y);
  let horizontalMerged = [];

  while (horizontal.length > 0) {
    let group = [horizontal.shift()];
    // create group with walls on the same level and connected with either left or right points
    horizontal = horizontal.filter((wall) => {
      // check if any wall from the group is on the same height and if at least one point is covered
      if (group.some((item) => item.a.y === wall.a.y && (item.a.x === wall.b.x || item.b.x === wall.a.x))) {
        group.push(wall);
        return false;
      }
      return true;
    });
    // merge connected walls if there is more than one wall in a group
    if (group.length > 1) {
      // grab two points positioned at the furthest ends of the group
      const left = group.reduce((acc, val) => {
        if (val.a.x < acc.x) acc.x = val.a.x;
        return acc;
      }, group[0].a);

      const right = group.reduce((acc, val) => {
        if (val.b.x > acc.x) acc.x = val.b.x;
        return acc;
      }, group[0].b);

      group = { a: left, b: right };
    } else {
      group = group[0];
    }
    group.isHorizontal = true;
    horizontalMerged.push(group);
  }

  return horizontalMerged;
}

function filterAndMergeVerticalWallsCells(wallsAsSegments) {
  let vertical = wallsAsSegments.filter((segment) => segment.a.x === segment.b.x);
  let verticalMerged = [];

  while (vertical.length > 0) {
    let group = [vertical.shift()];
    // create group with walls in the same column and connected with either top or bottom points
    vertical = vertical.filter((wall) => {
      // check if any wall from the group is in the same column and if at least one point is covered
      if (group.some((item) => item.a.x === wall.a.x && (item.a.y === wall.b.y || item.b.y === wall.a.y))) {
        group.push(wall);
        return false;
      }
      return true;
    });
    // merge connected walls if there is more than one wall in a group
    if (group.length > 1) {
      // grab two points positioned at the furthest ends of the group
      const top = group.reduce((acc, val) => {
        if (val.a.y < acc.y) acc.y = val.a.y;
        return acc;
      }, group[0].a);

      const bottom = group.reduce((acc, val) => {
        if (val.b.y > acc.y) acc.y = val.b.y;
        return acc;
      }, group[0].b);

      group = { a: top, b: bottom };
    } else {
      group = group[0];
    }
    verticalMerged.push(group);
  }

  return verticalMerged;
}

function mapMazeGridToCollisionData(wallsAsSegments, wallsThickness, verticalMerged, collisions) {
  return wallsAsSegments.map((wall) => {
    const { a, b } = wall;
    const coreWidth = b.x - a.x;
    const coreHeight = b.y - a.y;
    const widthHalf = (wallsThickness + coreWidth) * 0.5;
    const heightHalf = (wallsThickness + coreHeight) * 0.5;
    const x = a.x + coreWidth * 0.5;
    const y = a.y + coreHeight * 0.5;
    let p0, p1, p2, p3;

    if (wall.isHorizontal) {
      // Make sure neither of the horizontal wall's ends overlaps with any verticall wall.
      // If it does - contract its corresponding end.
      const isAOverlapped = verticalMerged.some((wall) => wall.a.y < a.y && wall.b.y > a.y && wall.a.x === a.x);
      const aMod = isAOverlapped ? wallsThickness : 0;

      const isBOverlapped = verticalMerged.some((wall) => wall.a.y < a.y && wall.b.y > a.y && wall.a.x === b.x);
      const bMod = isBOverlapped ? wallsThickness : 0;

      p0 = { x: -widthHalf + aMod, y: -heightHalf };
      p1 = { x: widthHalf - bMod, y: -heightHalf };
      p2 = { x: widthHalf - bMod, y: heightHalf };
      p3 = { x: -widthHalf + aMod, y: heightHalf };
    } else {
      // Contract top and bottom of the vertical wall to inside, to avoid overlapping with horizontal walls
      p0 = { x: -widthHalf, y: -heightHalf + wallsThickness };
      p1 = { x: widthHalf, y: -heightHalf + wallsThickness };
      p2 = { x: widthHalf, y: heightHalf - wallsThickness };
      p3 = { x: -widthHalf, y: heightHalf - wallsThickness };
    }
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
}

function mapMazeCellsToPathfindingData(cells) {
  let index = 0;

  const data = cells.map((row) =>
    row.map((cell) => {
      return {
        id: index++,
        x: cell.address.x,
        y: cell.address.y,
        gCost: null,
        hCost: null,
        fCost: null,
        wasVisisted: false,
        parent: null,
        heapIndex: null,
        walls: cell.walls.filter((w) => w.isClosed).map(({ a, b }) => ({ a, b })),
      };
    }),
  );

  const neighbourAddressCoords = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],

    // diagonal
    // [-1, -1],
    // [1, -1],
    // [1, 1],
    // [-1, 1],
  ];

  return data
    .map((row) =>
      row.map((dataItem) => {
        const parentCell = cells[dataItem.x] && cells[dataItem.x][dataItem.y];

        const neighbours = neighbourAddressCoords
          .map(([x, y]) => {
            const row = dataItem.x + x;
            const column = dataItem.y + y;
            const neighbour = data[row] && data[row][column];
            const cell = cells[row] && cells[row][column];

            return { neighbour, cell };
          })
          .filter((n) => n && n.cell && hasOpenWallsWith(parentCell, n.cell))
          .map(({ neighbour }) => neighbour);

        dataItem.neighbours = neighbours;
        return dataItem;
      }),
    )
    .flat();
}

export function newMaze(collisions, mapSettings, emptyLevel = false) {
  let cells = generateChessboardBasedMaze(mapSettings);

  if (emptyLevel) {
    cells = cells.map((row) =>
      row.map((cell) => {
        cell.walls.forEach((wall) => {
          wall.isClosed = wall.isMazeBoundary;
        });
        return cell;
      }),
    );
  }

  const cellsAsWalls = filterRepeatingWallsCells(cells);
  const horizontalMerged = filterAndMergeHorizontalWallsCells(cellsAsWalls);
  const verticalMerged = filterAndMergeVerticalWallsCells(cellsAsWalls);
  const { wallsThickness } = mapSettings;

  return {
    pathfindingData: mapMazeCellsToPathfindingData(cells),
    wallsGeometry: mapMazeGridToCollisionData(
      [...horizontalMerged, ...verticalMerged],
      wallsThickness,
      verticalMerged,
      collisions,
    ),
  };
}
