'use strict';


function addLocalStyles(cssString)
{
  const head = document.getElementsByTagName('head')[0];
  const s = document.createElement('style');
  s.setAttribute('type', 'text/css');
  if (s.styleSheet)
  {
    s.styleSheet.cssText = cssString;
  }
  else
  {
    s.appendChild(document.createTextNode(cssString));
  }
  head.appendChild(s);
}

export function FpsDisplay( initWidth = 200, initHeight = 60, initUpdateInterval = 0.25 /* seconds to wait before next update */ )
{
  const width = initWidth;
  const height = initHeight;
  const wrapper = document.createElement('div');
  let fps = 1;
  let pick = 1;
  let updateInterval = initUpdateInterval;
  let updateCounter = 0;
  let sacledHeight = 1;
  let shouldScaleGraph = false;

  wrapper.className = 'fps-display';
  wrapper.innerHTML = `
            <span class="fps-display-max">Max: <span>0</span></span>
            <span class="fps-display-current">Now: <span>0</span></span>
            <canvas class="fps-display-canvas" width="${width}" height="${height}"></canvas>
        `;

  addLocalStyles(`
            .fps-display {
                font-size: 11px;
                height: ${height}px;
                position: fixed;
                right: 0;
                top: 0;
                width: ${width}px;
                background-color: #000;
                border: 1px dashed #999;
                padding: 6px;
            }

            .fps-display-canvas {
                background-color: transparent;
                height: ${height}px;
                width: ${width}px;
            }

            .fps-display-max {
                background-color: #000;
                bottom: 3px;
                color: #fff;
                display: block;
                height: 11px;
                left: 3px;
                position: absolute;
                width: ${width * 0.5}px;
            }

            .fps-display-current {
                background-color: #000;
                bottom: 3px;
                color: #fff;
                display: block;
                height: 11px;
                position: absolute;
                right: 3px;
                width: ${width * 0.5}px;
            }
        `);

  document.body.appendChild(wrapper);

  const canvas = wrapper.querySelector('canvas');
  this.canvas = canvas;
  const ctx = canvas.getContext('2d');

  ctx.lineWidth = 1;
  ctx.strokeStyle = '#00FF00';

  const drawingHeight = height - 11;
  sacledHeight = drawingHeight;

  this.updateCurrent = function (value)
  {
    wrapper.querySelector('.fps-display-current span').innerHTML = Math.floor(value);
  };

  this.updateMax = function (value)
  {
    wrapper.querySelector('.fps-display-max span').innerHTML = Math.floor(value);
  };

  this.drawSegement = function (x1, y1, x2, y2, color = '#00FF00')
  {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  this.drawFrame = function()
  {
    const canvasContent = ctx.getImageData(0, 0, width, drawingHeight);
    ctx.clearRect(0, 0, width, drawingHeight);
    ctx.putImageData
    (
      canvasContent,
      -1,
      shouldScaleGraph ? drawingHeight - sacledHeight : 0,
      0, 0,
      width,
      shouldScaleGraph ? sacledHeight : drawingHeight
    );

    // draw single column indicating current value
    this.drawSegement(width - 1, drawingHeight, width - 1, drawingHeight - (drawingHeight * (fps / pick)));

    // draw horizontal lines to indicate ranges
    const numOfLines = Math.floor(pick / 30);
    for (let i = 0; i < numOfLines; i++)
    {
      const rangeLimitAsHeight = drawingHeight - (drawingHeight * (((i + 1) * 30) / pick));
      this.drawSegement(0, rangeLimitAsHeight, width, rangeLimitAsHeight, '#FF0000');
    }
  };

  this.update = function( timeDelta )
  {
    if (updateCounter < updateInterval)
    {
      updateCounter += timeDelta;
      return;
    };
    fps = 1 / timeDelta;
    this.updateCurrent(fps);
    if (fps > pick)
    {
      sacledHeight = Math.floor(drawingHeight * (pick / fps));
      pick = fps;
      this.updateMax(pick);
      shouldScaleGraph = true;
    };
    this.drawFrame();
    shouldScaleGraph = false;
    updateCounter = 0;
  };

  this.show = function()
  {
    wrapper.style.display = 'block';
  };

  this.hide = function()
  {
    wrapper.style.display = 'none';
  };
}
