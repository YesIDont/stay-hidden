"use strict";

(function() {

    const Flashlight = function()
    {
        this.maxIntensity = 1;
        this.intensity = this.lightMaxIntensity;
        this.flickerOffset = 0;
        this.nextFlickerIn = .5;
        this.flickerCounter = 0;
        this.juice = 1;
        this.switchCooldown = 1;
    }

    Engine.Flashlight = Flashlight;

})();
