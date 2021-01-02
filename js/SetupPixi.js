"use strict";

(function() {

	Engine.SetupPixiJS = function() {

		const Pixi = PIXI;
		const GraphicsEngine = Pixi.Application;
		const Container = Pixi.Container;
		const Loader = new Pixi.Loader();
	
		const Graphics = new GraphicsEngine({
			antialias: true,
			autoResize: true,
			backgroundColor: '#111',
		});
		Graphics.stop();
		const Renderer = Graphics.renderer;
		const Screen = Renderer.screen;
		const Stage = Graphics.stage;
		Stage.sortableChildren = true;
		
		document.body.appendChild( Graphics.view );
	
		function UpdateRendereSize() {
			Renderer.resolution = GetCanvasAspectRatio( Renderer.context );
			const { width, height } = GetWindowInnerSize();
			Renderer.resize( width, height );
		};
	
		UpdateRendereSize();
		window.addEventListener( 'resize', UpdateRendereSize );

		// Masks
		const PlayerVisibleAreaMask = new Pixi.Graphics();
		const FlashlightIconMask = new Pixi.Graphics();
		const HealthMask = new Pixi.Graphics();
		
		const BackgroundStage = new Container();
		Stage.addChild( BackgroundStage );
		BackgroundStage.zIndex = 1;
		BackgroundStage.width = Screen.width;
		BackgroundStage.height = Screen.height;
		
		const PlayerVisibleAreaContainer = new Container();
		Stage.addChild( PlayerVisibleAreaContainer );
		PlayerVisibleAreaContainer.zIndex = 1;
		PlayerVisibleAreaContainer.width = Screen.width;
		PlayerVisibleAreaContainer.height = Screen.height;
		
		const PlayerSightStage = new Container();
		Stage.addChild( PlayerSightStage );
		PlayerSightStage.zIndex = 10;
		PlayerSightStage.width = Screen.width;
		PlayerSightStage.height = Screen.height;

		const UIStage = new Container();
		Stage.addChild( UIStage );
		UIStage.zIndex = 20;
		UIStage.width = Screen.width;
		UIStage.height = Screen.height;

		const HighlightsChangel = new Pixi.Graphics();
	
		Engine.Assets.Textures.forEach( textureName => {
			Loader.add( textureName, `assets/images/${textureName}.png` );
		});
		
		// General purposes draw
		const Draw = new Pixi.Graphics();
		Draw.zIndex = 100;
		Stage.addChild( Draw );
		
		return {
			BackgroundStage,
			Draw,
			FlashlightIconMask,
			Graphics,
			HealthMask,
			HighlightsChangel,
			Loader,
			Pixi,
			PlayerSightStage,
			PlayerVisibleAreaContainer,
			PlayerVisibleAreaMask,
			Renderer,
			Screen,
			Sprite: Pixi.Sprite,
			Stage,
			UIStage,
		}
	}

})();
