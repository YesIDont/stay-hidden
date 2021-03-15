"use strict";

(function() {

    const { ECollisions, Vector } = Engine;

    const Player = function({ x, y, size, maxSpeed, sightMaxDistance, FOV = 130 })
    {
        let body = ECollisions.createCircle( x, y, size );
        body.maxHealth = 10;
        body.currentHealth = body.maxHealth * 0.6;
        body.FOVarea = ECollisions.createCircle( x, y, sightMaxDistance );
        body.FOV = FOV;
        body.halfFOV = FOV * 0.5;
        body.velocity = new Vector();
        body.walkSpeed = maxSpeed;
        body.sprintSpeed = maxSpeed * 2;
        body.friction = 0.9;
        body.sightMaxDistance = sightMaxDistance;
        body.isSprinting = false;
        body.stamina = 1;

        return body;
    };

    Engine.Player = Player;

})();
