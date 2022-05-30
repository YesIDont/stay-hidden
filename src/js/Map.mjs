'use strict';

export function Level({ columns, rows, tileSize, wallsThickness }) {
  // n tiles horizontally
  this.columns = columns;
  // n tiles vertically
  this.rows = rows;
  // tiles are squares that are base for maze generation algorythm
  this.tileSize = tileSize;
  this.wallsThickness = wallsThickness;
}

Level.prototype.GetWidth = function () {
  return this.columns * this.tileSize;
};

Level.prototype.GetHeight = function () {
  return this.rows * this.tileSize;
};

Level.prototype.GetSize = function () {
  return {
    width: this.GetWidth(),
    height: this.GetHeight(),
  };
};
