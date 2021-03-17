"use strict";

(function() {

    const { ECollisions, Vector } = Engine;

    const Monster = function({ x, y, size })
    {
        let monster = ECollisions.createCircle( x, y, size );
        monster.speed = 20;
        monster.damage = 2;
        monster.damageCooldownSeconds = 1;
        monster.damageCooldownCounter = 0;
        monster.destination = Vector.getRandomUnit();

        monster.solveCollisions = function(Result, timeDelta)
        {
            const potentials = this.potentials();
            for (const body of potentials)
			{
                if (body.tags)
                {
                    if(body.tags.includes('player'))
                    {
                        this.damageCooldownCounter += timeDelta;
                        if (this.damageCooldownCounter > this.damageCooldownSeconds)
                        {
                            body.getDamage(this.damage);
                            this.damageCooldownCounter = 0;
                        }
                    }
    
                    if(body.hasTags('obstacle') && this.collides(body, Result))
                    {
                        body.block(this, Result);
                    }
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
