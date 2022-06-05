export class Grid {
  constructor(nodes) {
    this.nodes = nodes;
    this.origin = null;
    this.target = null;
  }

  setOrigin(origin) {
    this.origin = origin;
  }

  setTarget(target) {
    this.target = target;
  }

  getCellUnderPointer(x, y, cellSize) {
    const row = Math.floor(y / cellSize);
    const column = Math.floor(x / cellSize);

    return this.nodes.find((n) => n.x === column && n.y === row);
  }

  reset() {
    this.nodes.forEach((node) => {
      node.wasVisisted = false;
      node.gCost = null;
      node.hCost = null;
      node.fCost = null;
    });
  }
}
