"use strict";

(function() {

    const { ECollisions } = Engine;

    const Monster = function({ x, y, size })
    {
        let monster = ECollisions.createCircle( x, y, size );
        monster.damage = 1;
        monster.damageCooldownSeconds = 1;
        monster.damageCooldownCounter = 0;

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
			}
        };

        return monster;
    };

    Engine.Monster = Monster;

})();
