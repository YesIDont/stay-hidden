'use strict';
import { newFlickerEffect } from './FlickerEffect.mjs';

export const Flashlight = function (consumptionRate = 40, rechargeRate = 8) {
  this.flickerEffect = newFlickerEffect();
  this.juice = 1;
  // the bigger the number the slower consumption / regeneration, small numbers === faster
  this.consumptionRate = consumptionRate;
  this.rechargeRate = rechargeRate;
  this.switchCooldown = 1;
};
