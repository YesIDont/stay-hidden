"use strict";

const log = console.log;

function clamp( value, min = 0, max = 1 )
{
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

function randomInRange( min = 0, max = 1 ) {
    return Math.random() * (max - min) + min;
}

function getRotatedVector(vector, angle, pivotPoint)
{
    if (angle === 0)
    {
        return { x, y };
    }

    const angleRad = angle * Math.PI / 180; // radians
    const sin = Math.sin(angleRad);
    const cos = Math.cos(angleRad);

    const { x, y } = vector;

    return {
        x: x * cos - y * sin + pivotPoint.x,
        y: x * sin + y * cos + pivotPoint.y,
    }
};

function GetCanvasAspectRatio( context ) {
    
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    const backingStoreRatio = context.webkitBackingStorePixelRatio ||    
      context.mozBackingStorePixelRatio ||    
      context.msBackingStorePixelRatio ||    
      context.oBackingStorePixelRatio ||    
      context.backingStorePixelRatio || 1;
    
    const ratio = devicePixelRatio / backingStoreRatio;
  
    return ratio;
};

function GetWindowInnerSize() {
    return {
      width: window.innerWidth && document.documentElement.clientWidth
        ? Math.min( window.innerWidth, document.documentElement.clientWidth )
        : window.innerWidth
          || document.documentElement.clientWidth
          || document.getElementsByTagName('body')[0].clientWidth,

      height: window.innerHeight && document.documentElement.clientHeight
        ? Math.min(window.innerHeight, document.documentElement.clientHeight)
        : window.innerHeight
          || document.documentElement.clientHeight
          || document.getElementsByTagName('body')[0].clientHeight
    }
};

