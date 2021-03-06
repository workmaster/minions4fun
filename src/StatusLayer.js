var StatusLayer = cc.Layer.extend({
	labelCoin:null,
	labelMeter:null,

	ctor:function () {
		this._super();
		this.init();
	},

	init:function () {
		this._super();

		var winsize = cc.director.getWinSize();

		// 特注：文本标签
		this.labelCoin = cc.LabelTTF.create("技能数值:0", "Helvetica", 20);// 1:文本 2:字体3:字体大小
		this.labelCoin.setColor(cc.color(255,255,255));//black color
		this.labelCoin.setPosition(cc.p(winsize.width - 70, winsize.height - 40));
		this.addChild(this.labelCoin);

		this.labelMeter = cc.LabelTTF.create("风力大小:0", "Helvetica", 20);
		this.labelMeter.setPosition(cc.p(winsize.width - 70, winsize.height - 60));
		this.addChild(this.labelMeter);
		
		var menuItemPlay= cc.MenuItemSprite.create(
				cc.Sprite.create(res.CloseNormal_png), // normal state image
				cc.Sprite.create(res.CloseSelected_png), //select state image
				this.onPlay, this);
		var menu = cc.Menu.create(menuItemPlay);  //7. create the menu
		menu.setPosition(winsize.width - 70, winsize.height - 90);
		this.addChild(menu);
	},
	onPlay : function(){
		cc.log("==game over");
		cc.director.pause();
//		cc.director.runScene(new GameOverLayer());
		this.addChild(new GameOverLayer());
	}
});