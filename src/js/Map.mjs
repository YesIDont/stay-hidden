'use strict';


export function Map({ columns, rows, tileSize, wallsThickness })
{
  // n tiles horizontally
  this.columns = columns;
  // n tiles vertically
  this.rows = rows;
  // tiles are squares that are base for maze generation algorythm
  this.tileSize = tileSize;
  this.wallsThickness = wallsThickness;
};

Map.prototype.GetWidth = function()
{
  return this.columns * this.tileSize;
};

Map.prototype.GetHeight = function()
{
  return this.rows * this.tileSize;
};

Map.prototype.GetSize = function()
{
  return {
    width: this.GetWidth(),
    height: this.GetHeight(),
  };
};
