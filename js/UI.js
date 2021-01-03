"use strict";

(function() {

    Engine.GetUI = function()
    {
        const youDiedScreen = document.querySelector('.you-died');
        const restartButton = document.querySelector('.you-died .restart-button');
        restartButton.addEventListener('click', () => {
            window.location.reload();
        });

        return {
            youDiedScreen,
        }
    };    

})();
