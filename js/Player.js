"use strict";

(function() {

    const { ECollisions, Vector } = Engine;

    const Player = function({ x, y, size, maxSpeed, sightMaxDistance, FOV = 130 })
    {
        let player = ECollisions.createCircle( x, y, size );
        player.maxHealth = 10;
        player.currentHealth = player.maxHealth * 0.6;
        player.FOVarea = ECollisions.createCircle( x, y, sightMaxDistance );
        player.FOV = FOV;
        player.halfFOV = FOV * 0.5;
        player.velocity = new Vector();
        player.walkSpeed = maxSpeed;
        player.sprintSpeed = maxSpeed * 2;
        player.friction = 0.9;
        player.sightMaxDistance = sightMaxDistance;
        player.isSprinting = false;
        player.stamina = 1;
        player.tags = ['player'];

        player.solveCollisions = function()
        {
            const potentials = this.potentials();
            for (const body of potentials)
			{
				if(body.tags && body.tags.includes('obstacle') && !body.tags.includes('bounds') && this.collides(body, Result))
				{
					this.x -= Result.overlap * Result.overlap_x;
					this.y -= Result.overlap * Result.overlap_y;
				}
			}
        };

        player.getDamage = function(damageAmount)
        {
            this.currentHealth -= damageAmount;
        }

        return player;
    };

    Engine.Player = Player;

})();
