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
