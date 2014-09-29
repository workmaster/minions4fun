var AnimationLayer = cc.Layer.extend({
	ctor:function () {
		this._super();
		this.init();
	},
	init:function () {
		this._super();

		//create the hero sprite
		var spriteRunner = cc.Sprite.create(res.Worker_png);
		var spriteEnemy = cc.Sprite.create(res.Worker2_png);
		
		var winsize = cc.director.getWinSize();
		spriteRunner.attr({x: winsize.width - 226, y: winsize.height});
		spriteEnemy.attr({x: winsize.width /2 - 250, y: winsize.height});

		//create the move action
		var actionTo = cc.MoveTo.create(0.5, cc.p(winsize.width - 226, winsize.height / 2 + 27));
		var setScaleTo = cc.scaleTo(0, 0.35, 0.35);
		spriteRunner.runAction(
				cc.Sequence.create(
						setScaleTo,
						actionTo
				)
		);
		this.addChild(spriteRunner);
		
		var action2 = cc.MoveTo.create(0.5, winsize.width /2 - 250, winsize.height / 2 - 56);
		var setScaleTo2 = cc.scaleTo(0, 0.35, 0.35);
		spriteEnemy.runAction(
				cc.Sequence.create(
						setScaleTo2,
						action2
				)
		);
		this.addChild(spriteEnemy);
	}
});