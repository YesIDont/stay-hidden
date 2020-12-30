"use strict";

(function() {

    const { ECollisions, Vector } = Engine;

    const Player = function( x, y, size, maxSpeed, sightMaxDistance )
    {
        let body = ECollisions.createCircle( x, y, size );
        body.FOVarea = ECollisions.createCircle( x, y, sightMaxDistance );
        body.FOV = 120;
        body.halfFOV = this.FOV;
        body.velocity = new Vector();
        body.maxSpeed = maxSpeed;
        body.friction = 0.9;
        body.sightMaxDistance = sightMaxDistance;

        return body;
    };

    Engine.Player = Player;

})();
