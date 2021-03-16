"use strict";

class Circle extends Body {
	constructor(x = 0, y = 0, radius = 0, scale = 1, padding = 0) {
		super(x, y, padding);

		/**
		 * @desc
		 * @type {Number}
		 */
		this.radius = radius;

		/**
		 * @desc
		 * @type {Number}
		 */
		this.scale = scale;
	}

	/**
	 * Draws the circle to a CanvasRenderingContext2D's current path
	 * @param {CanvasRenderingContext2D} context The context to add the arc to
	 */
	draw(context) {
		const x      = this.x;
		const y      = this.y;
		const radius = this.radius * this.scale;

		context.moveTo(x + radius, y);
		context.arc(x, y, radius, 0, Math.PI * 2);
	}
};
