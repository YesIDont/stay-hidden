"use strict";

/**
 * An object used to collect the detailed results of a collision test.
 * NOTE: It is highly recommended you recycle the same Result object if possible 
 * in order to avoid wasting memory.
 */


class Result {
	constructor() {
		this.collision = false;

		// The source body tested
		this.a = null;

		// The target body tested against
		this.b = null;

		// True if A is completely contained within B
		this.a_in_b = false;

		// True if B is completely contained within A
		this.b_in_a = false;

		// The magnitude of the shortest axis of overlap
		this.overlap = 0;

		// The X direction of the shortest axis of overlap
		this.overlap_x = 0;

		// The Y direction of the shortest axis of overlap
		this.overlap_y = 0;
	}
};
