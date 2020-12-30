"use strict";

(function() {

    const Assets = {
        SFX: [],
        Static: [],
    };

    Assets.Static = [
        {
            name: 'aimSight',
            path: 'assets/images/aim.png'
        },
        {
            name: 'floor',
            path: 'assets/images/floor.png'
        },
        {
            name: 'flashlight',
            path: 'assets/images/flashlight.png'
        },
        {
            name: 'personalLight',
            path: 'assets/images/personal-light.png'
        },
        {
            name: 'iconFlashlight',
            path: 'assets/images/icon-flashlight.png'
        },
        {
            name: 'iconHealth',
            path: 'assets/images/icon-life-heart.png'
        },
    ];

    Engine.Assets = Assets;

})();
