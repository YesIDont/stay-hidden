"use strict";

(function() {

    const Flashlight = function(consumptionRate = 40, rechargeRate = 8)
    {
        this.maxIntensity = 1;
        this.intensity = this.lightMaxIntensity;
        this.flickerOffset = 0;
        this.nextFlickerIn = .5;
        this.flickerCounter = 0;
        this.juice = 1;
        // the bigger the number the slower consumption / regeneration, small numbers === faster
        this.consumptionRate = consumptionRate;
        this.rechargeRate = rechargeRate;
        this.switchCooldown = 1;
    }

    Engine.Flashlight = Flashlight;

})();
