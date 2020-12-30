"use strict";

(function() {

    const Engine = {};
    const ECollisions = new Collisions();
    const Result = Collisions.createResult();

    Engine.ECollisions = ECollisions;
    Engine.Result = Result;
    window.Engine = Engine;

})();
