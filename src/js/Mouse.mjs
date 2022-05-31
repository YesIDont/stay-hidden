'use strict';

export const Mouse = {
  x: 0,
  y: 0,

  // objects attached to mouse will receive mouse position witch each mouse update
  attachedObjects: [],

  getMouseToPointAngle(point) {
    const { x, y } = point;

    return Math.atan2(this.x - x, y - this.y);
  },

  getMouseWorldPosition(worldContainer) {
    return {
      x: this.x - worldContainer.x,
      y: this.y - worldContainer.y,
    };
  },

  attach(object) {
    this.attachedObjects.push(object);
  },
};

function getmousePosition(e) {
  let v = e || window.event;
  let x = v.pageX;
  let y = v.pageY;

  // IE 8
  if (x === undefined || x === null) {
    const { scrollLeft, scrollTop } = document.body;
    const { documentElement } = document;
    x = v.clientX + scrollLeft + documentElement.scrollLeft;
    y = v.clientY + scrollTop + documentElement.scrollTop;
  }

  Mouse.x = x;
  Mouse.y = y;

  Mouse.attachedObjects.forEach((object) => {
    object.x = x;
    object.y = y;
  });
}

document.addEventListener('mousemove', getmousePosition);
