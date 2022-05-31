'use strict';

const branch_pool = [];

// A branch within a BVH
export class BVHBranch {
  constructor() {
    this._bvh_parent = null;
    this._bvh_branch = true;
    this._bvh_left = null;
    this._bvh_right = null;
    this._bvh_sort = 0;
    this._bvh_min_x = 0;
    this._bvh_min_y = 0;
    this._bvh_max_x = 0;
    this._bvh_max_y = 0;
  }

  // Returns a branch from the branch pool or creates a new branch
  static getBranch() {
    if (branch_pool.length) {
      return branch_pool.pop();
    }

    return new BVHBranch();
  }

  // Releases a branch back into the branch pool
  static releaseBranch(branch) {
    branch_pool.push(branch);
  }

  // Sorting callback used to sort branches by deepest first
  static sortBranches(branchA, branchB) {
    return branchA.sort > branchB.sort ? -1 : 1;
  }
}
