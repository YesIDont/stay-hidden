"use strict";

(function() {

    const Vector = function(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;

        return this;
    }

    Vector.getRandomUnit = function()
    {
        const v = new Vector( Math.random(), Math.random() );

        return v.normalize();
    }

    Vector.prototype.getLength = function()
    {
        return Math.sqrt((this.x * this.x + this.y * this.y));
    }

    Vector.prototype.normalize = function()
    {
        const length = this.getLength();

        this.x = this.x / length;
        this.y = this.y / length;

        return this;
    }

    Engine.Vector = Vector;
    window.Vector = Vector;

})();
