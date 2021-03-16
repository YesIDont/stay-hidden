"use strict";

(function() {

    Engine.GetUI = function()
    {
        const get = (query, element = document) =>
        {
            return element.querySelector(query);
        };
        const youDiedScreen = get('.you-died');
        const restartButton = get('.you-died .restart-button');
        const debugDrawSwitch = get('.status-debug input');
        const showBHVSwitch = get('.status-bvh input');

        restartButton.addEventListener
        ('click', () =>
            {
                window.location.reload();
            }
        );

        return {
            debugDrawSwitch,
            showBHVSwitch,
            youDiedScreen,
        }
    };    

})();
