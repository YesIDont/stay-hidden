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
		Stage.addChild( PlayerVisibleAreaMask );
		
		const FlashlightIconMask = new Pixi.Graphics();
		Stage.addChild( FlashlightIconMask );
		
		const PlayerSightStage = new Container();
		Stage.addChild( PlayerSightStage );
		PlayerSightStage.zIndex = 10;
		PlayerSightStage.width = Screen.width;
		PlayerSightStage.height = Screen.height;
		PlayerSightStage.mask = PlayerVisibleAreaMask;

		const UIStage = new Container();
		Stage.addChild( UIStage );
		UIStage.zIndex = 20;
		UIStage.width = Screen.width;
		UIStage.height = Screen.height;
	
		Engine.Assets.Static.forEach( image => {
			Loader.add( image.name, image.path );
		});
		
		// Mostly for debug purposes
		const Draw = new Pixi.Graphics();
		Draw.zIndex = 100;
		Stage.addChild( Draw );
		
		return {
			Draw,
			FlashlightIconMask,
			Graphics,
			Loader,
			Pixi,
			PlayerSightStage,
			PlayerVisibleAreaMask,
			Renderer,
			Screen,
			Sprite: Pixi.Sprite,
			Stage,
			UIStage,
		}
	}

})();
