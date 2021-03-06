"use strict";

const log = console.log;

function clamp( value, min = 0, max = 1 )
{
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

function mapValueInRangeClamped( value, in_min, in_max, out_min = 0, out_max = 1 )
{
    const inRange = (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;

    return clamp(inRange, out_min, out_max);
}

function randomInRange( min = 0, max = 1 )
{
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

function GetCanvasAspectRatio( context )
{
    
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    const backingStoreRatio = context.webkitBackingStorePixelRatio ||    
      context.mozBackingStorePixelRatio ||    
      context.msBackingStorePixelRatio ||    
      context.oBackingStorePixelRatio ||    
      context.backingStorePixelRatio || 1;
    
    const ratio = devicePixelRatio / backingStoreRatio;
  
    return ratio;
};

function GetWindowInnerSize()
{
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

function fillRectangle( pixiGraphics, x, y, width, height, color = 0x000000, alpha = 1 )
{
    if (width === 0 || height === 0) return;

    pixiGraphics.beginFill( color, alpha );
    pixiGraphics.moveTo( x, y );
    pixiGraphics.lineTo( x + width, y );
    pixiGraphics.lineTo( x + width, y + height);
    pixiGraphics.lineTo( x, y + height);
    pixiGraphics.lineTo( x, y );
    pixiGraphics.endFill();
}

function strokeSegment( pixiGraphics, startPoint, endPoint, lineThickness = 1, color = 0x000000 )
{
    pixiGraphics.lineStyle( lineThickness, color );
    pixiGraphics.moveTo( startPoint.x, startPoint.y );
    pixiGraphics.lineTo( endPoint.x, endPoint.y );
}

function strokePolygon( pixiGraphics, points, lineThickness = 1, color = 0x000000 )
{
    pixiGraphics.lineStyle( lineThickness, color );
    pixiGraphics.moveTo(points[0][0], points[0][1]);
    for ( let i = 1; i < points.length; i++ )
    {
        pixiGraphics.lineTo(points[i][0], points[i][1]);
    }
    pixiGraphics.lineTo(points[0][0], points[0][1]);
}

function fillPolygon( pixiGraphics, points, color = 0x000000, alpha = 1 )
{
    pixiGraphics.beginFill( color, alpha );
    pixiGraphics.moveTo(points[0][0], points[0][1]);
    for ( let i = 1; i < points.length; i++ )
    {
        pixiGraphics.lineTo(points[i][0], points[i][1]);
    }
    pixiGraphics.lineTo(points[0][0], points[0][1]);
    pixiGraphics.endFill();
}

function fillCircle( pixiGraphics, centerPoint, radius, color = 0x000000, alpha = 1 )
{
    pixiGraphics.lineStyle(0);
    pixiGraphics.beginFill( color, alpha );
    pixiGraphics.drawCircle(centerPoint.x, centerPoint.y, radius);
    pixiGraphics.endFill();
}

function angleToRadians(angle)
{
    return angle * (Math.PI / 180);
}

function radiansToAngle(angle)
{
    return angle * (180 / Math.PI);
}

function getVectorMagnitude(vector)
{
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

function normalizeVector(vector)
{
    const magnitude = getVectorMagnitude(vector);

    return {
        x: vector.x / magnitude,
        y: vector.y / magnitude,
    }    
}
