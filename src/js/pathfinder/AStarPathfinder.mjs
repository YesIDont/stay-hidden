import { Grid } from './Grid.mjs';
import { HeapTree } from './HeapTree.mjs';

export class AStarPathfinder {
  constructor(gridProps) {
    this.grid = new Grid(gridProps);
    this.openSet = new HeapTree();
    this.pathIsFound = false;
  }

  findPath(path) {
    const { origin, target } = this.grid;
    if (!origin || !target) return;
    this.searchSetup(origin, target);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!this.searchLoop(origin, target)) break;
    }

    if (!this.pathIsFound) return;
    path.length = 0;
    this.tracePathBackToOrigin(origin, target, path);
  }

  searchSetup(origin, target) {
    this.pathIsFound = false;
    this.grid.reset();
    origin.gCost = 0;
    origin.fCost = origin.gCost + this.getEuclideanDistance(origin, target);
    this.openSet.reset();
    this.openSet.push(origin);
  }

  searchLoop(origin, target) {
    let current = this.openSet.pullOutTheLowest();

    if (!current || !origin || !target) {
      return false;
    }

    if (current.id === target.id) {
      this.pathIsFound = true;

      return false;
    }

    current.wasVisisted = true;
    current.neighbours.forEach((node) => {
      if (node.wasVisisted) return;

      const newgCost = current.gCost + 1;
      const isNodeNOTInOpen = !this.openSet.items.some((item) => item.id === node.id);
      if (isNodeNOTInOpen || newgCost < node.gCost) {
        node.gCost = newgCost;
        node.fCost = node.gCost + this.getEuclideanDistance(node, target);
        node.parent = current;
        if (isNodeNOTInOpen) {
          this.openSet.push(node);
        }
      }
    });

    return true;
  }

  tracePathBackToOrigin(origin, target, path) {
    let current = target.parent;
    if (!current) {
      this.pathIsFound = false;
      return;
    }

    while (current.id !== origin.id) {
      path.push(current);
      current = current.parent;
    }
    path.reverse();
  }

  getEuclideanDistance(nodeFrom, nodeTo) {
    const dx = Math.abs(nodeFrom.x - nodeTo.x);
    const dy = Math.abs(nodeFrom.y - nodeTo.y);

    return Math.sqrt(dx * dx + dy * dy);
  }
}
