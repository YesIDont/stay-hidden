"use strict";

(function() {

    const { ECollisions, Vector } = Engine;

    const Monster = function({ x, y, size })
    {
        let monster = ECollisions.createCircle( x, y, size );
        monster.speed = 20;
        monster.damage = 1;
        monster.damageCooldownSeconds = 1;
        monster.damageCooldownCounter = 0;
        monster.destination = Vector.getRandomUnit();

        monster.solveCollisions = function(timeDelta)
        {
            const potentials = this.potentials();
            for (const body of potentials)
			{
				if(body.tags && body.tags.includes('player'))
				{
                    this.damageCooldownCounter += timeDelta;
                    if (this.damageCooldownCounter > this.damageCooldownSeconds)
                    {
                        body.getDamage(this.damage);
                        this.damageCooldownCounter = 0;
                    }
				}

                if(body.tags && body.tags.includes('obstacle') && !body.tags.includes('bounds') && this.collides(body, Result))
                {
                    this.x -= Result.overlap * Result.overlap_x;
                    this.y -= Result.overlap * Result.overlap_y;
                }
			}
        };

        monster.move = function(directionVector, timeDelta)
        {
            this.x += directionVector.x * this.speed * timeDelta;
            this.y += directionVector.y * this.speed * timeDelta;
        };
        
        monster.solveAILogic = function(timeDelta)
        {
            this.move(this.destination, timeDelta);
        };

        return monster;
    };

    Engine.Monster = Monster;

})();
