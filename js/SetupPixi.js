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

		const LevelContainer = new Container();
		Stage.addChild( LevelContainer );
		LevelContainer.zIndex = 10;
		LevelContainer.width = 2000;
		LevelContainer.height = 2000;

		const UIStage = new Container();
		Stage.addChild( UIStage );
		UIStage.zIndex = 20;
		UIStage.width = Screen.width;
		UIStage.height = Screen.height;

		const HighlightsChangel = new Pixi.Graphics();

		// Masks
		const PlayerVisibleAreaMask = new Pixi.Graphics();
		const FlashlightIconMask = new Pixi.Graphics();
		const HealthMask = new Pixi.Graphics();
	
		Engine.Assets.Textures.forEach( textureName => {
			Loader.add( textureName, `assets/images/${textureName}.png` );
		});
		
		// General purposes draw
		const Draw = new Pixi.Graphics();
		Draw.zIndex = 100;

		const UIDraw = new Pixi.Graphics();
		UIDraw.zIndex = 100;
		UIStage.addChild( UIDraw );
		
		return {
			Draw,
			FlashlightIconMask,
			Graphics,
			HealthMask,
			HighlightsChangel,
			Loader,
			Pixi,
			LevelContainer,
			PlayerVisibleAreaMask,
			Renderer,
			Screen,
			Sprite: Pixi.Sprite,
			Stage,
			UIDraw,
			UIStage,
		}
	}

})();
