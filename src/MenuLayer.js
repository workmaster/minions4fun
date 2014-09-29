var MenuLayer = cc.Layer.extend({
	spritebg:null,
	ctor : function(){
		//1. call super class's ctor function
		this._super();
	},
	init:function(){
		//call super class's super function
		this._super();

		//2. get the screen size of your game canvas
		var winsize = cc.director.getWinSize();

		//3. calculate the center point
		var centerpos = cc.p(winsize.width / 2, winsize.height / 2);
		var sanfenpos = cc.p(winsize.width / 4, winsize.height / 4);

		//4. create a background image and set it's position at the center of the screen
		this.spritebg = cc.Sprite(res.background_png);
		this.spritebg.setPosition(centerpos);
		this.spritebg.setOpacity(0); // 渐变值
		this.addChild(this.spritebg, 0);
//		spritebg.runAction(
//		cc.sequence(
//		cc.scaleTo(2, 1.35, 1)
//		)
//		);
		// 淡入
		this.spritebg.runAction(
				cc.FadeIn.create(2)
		);

		//5.无效的
		cc.MenuItemFont.setFontSize(60);

		//6.create a menu and assign onPlay event callback to it
		var menuItemPlay= cc.MenuItemSprite.create(
				cc.Sprite.create(res.CloseNormal_png), // normal state image
				cc.Sprite.create(res.CloseSelected_png), //select state image
				this.onPlay, this);
		var menu = cc.Menu.create(menuItemPlay);  //7. create the menu
		menu.setPosition(sanfenpos);
		this.addChild(menu);
	},

	onPlay : function(){
		cc.log("==onplay clicked");
		this.spritebg.runAction(
				cc.FadeOut.create(1.5)
		); // 貌似无效
		cc.director.runScene(new PlayScene());
	}
});

var MenuScene = cc.Scene.extend({
	onEnter:function () {
		this._super();
		var layer = new MenuLayer();
		layer.init();
		this.addChild(layer);
	}
});