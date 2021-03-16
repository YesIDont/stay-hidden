"use strict";

class Point extends Polygon {
	constructor(x = 0, y = 0, padding = 0) {
		super(x, y, [[0, 0]], 0, 1, 1, padding);

		this._point = true;
	}
};
