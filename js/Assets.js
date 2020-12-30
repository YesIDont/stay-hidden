"use strict";

(function()
{
    const Assets = {
        SFX: [],
        Static: [],
    };

    Assets.Static = [
        {
            name: 'aimSightSprite',
            path: 'assets/images/aim.png',
            props: [
                { name: 'anchor', value: [0.5, 0.5] },
                { name: 'width', value: 24 },
                { name: 'height', value: 24 },
            ]
        },
        {
            name: 'floorSprite',
            path: 'assets/images/floor.png',
            props: [
                { name: 'width', value: 2000 },
                { name: 'height', value: 2000 },
            ]
        },
        {
            name: 'flashlightSprite',
            path: 'assets/images/flashlight.png',
            props: [
                { name: 'anchor', value: [0.5, 1] },
                { name: 'width', value: 1200 },
                { name: 'height', value: 500 },
            ]
        },
        {
            name: 'personalLightSprite',
            path: 'assets/images/personal-light.png',
            props: [
                { name: 'anchor', value: [0.5, 0.5] },
                { name: 'width', value: 300 },
                { name: 'height', value: 300 },
                { name: 'alpha', value: 0.5 },
                { name: 'blendMode', value: PIXI.BLEND_MODES.OVERLAY },
            ]
        },
        {
            name: 'iconFlashlightSprite',
            path: 'assets/images/icon-flashlight.png'
        },
        {
            name: 'iconHealthSprite',
            path: 'assets/images/icon-life-heart.png'
        },
    ];
    
    Assets.GetSprites = function( loadedResources )
    {
        const Sprites = {};
        
        for ( const Asset of Assets.Static )
        {
            const newSprite = new PIXI.Sprite( loadedResources[ Asset.name ].texture );
            
            if ( Asset.props )
            {
                Asset.props.forEach( prop => {
                    if ( prop.name === 'anchor' ) {
                        newSprite.anchor.set(prop.value[0], prop.value[1]);
                    }
                    else {
                        newSprite[ prop.name ] = prop.value;                        
                    }
                });
            }
            
            Sprites[ Asset.name ] = newSprite;
        }
        
        return Sprites;
    }

    Engine.Assets = Assets;

})();
