var BackgroundLayer = cc.Layer.extend({
	ctor:function () {
		this._super();
		this.init();
	},

	init:function () {
		this._super();
		var winsize = cc.director.getWinSize();

		//create the background image and position it at the center of screen
		var centerPos = cc.p(winsize.width / 2, winsize.height / 2);
		var spriteBG = cc.Sprite.create(res.PlayBG_png);
		spriteBG.setPosition(centerPos);
		spriteBG.setOpacity(0); // 渐变值
		this.addChild(spriteBG);
		spriteBG.runAction(
				cc.sequence(
						cc.scaleTo(0, 0.55, 0.55),
						cc.FadeIn.create(1.5)
				)
		);
	}
});