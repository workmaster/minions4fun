var AnimationLayer = cc.Layer.extend({
	spriteOwner:null, 		// 己方
	spriteEnemy:null,		// 敌方
	spriteSheet:null, 		// 动画循环
	laughingAction:null, 	// 击中笑场动作
	ctor:function () {
		this._super();
		this.init();
	},
	init:function () {
		this._super();

		//create the hero sprite
		this.spriteOwner = cc.Sprite.create(res.Worker_png);
		this.spriteEnemy = cc.Sprite.create(res.Worker2_png);
		
		var winsize = cc.director.getWinSize();
		this.spriteOwner.attr({x: winsize.width - 226, y: winsize.height});
		this.spriteEnemy.attr({x: winsize.width /2 - 250, y: winsize.height});
		
		//this.initAction();
		
		// create sprite sheet
		cc.spriteFrameCache.addSpriteFrames(res.laught_plist);
		this.spriteSheet = cc.SpriteBatchNode.create(res.laught_png);
		this.addChild(this.spriteSheet);
		
		// init laughingAction
		var animFrames = [];
		for (var i = 50; i < 68; i++) {
			var str = i + ".png";
			var frame = cc.spriteFrameCache.getSpriteFrame(str);
			animFrames.push(frame);
		}
		
		var animation = cc.Animation.create(animFrames, 0.1);
		this.laughingAction = cc.Repeat.create(cc.Animate.create(animation), 1);
		this.laughingAction.retain(); // 不想自动释放内存

		//create the move action
		var action2Owner = cc.MoveTo.create(0.5, cc.p(winsize.width - 226, winsize.height / 2 + 27));
		var setScaleTo = cc.scaleTo(0, 0.35, 0.35);
		this.spriteOwner.runAction(
				cc.Sequence.create(
						setScaleTo,
						action2Owner
				)
		);
		this.addChild(this.spriteOwner);

		var action2Enemy = cc.MoveTo.create(0.5, winsize.width /2 - 250, winsize.height / 2 - 56);
		var setScaleTo2 = cc.scaleTo(0, 0.35, 0.35);
		this.spriteEnemy.runAction(
				cc.Sequence.create(
						setScaleTo2,
						action2Enemy
				)
		);
		this.addChild(this.spriteEnemy);
		
		
		
//		this.sprite = cc.Sprite.create("#50.png");
//		this.sprite.attr({x:80, y:85, scale: 0.35});
//		this.sprite.runAction(this.laughingAction);
//		this.spriteSheet.addChild(this.sprite);
		
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: this.onTouchBegan,
			onTouchMoved: this.onTouchMoved,
			onTouchEnded: this.onTouchEnded
		}, this)
	},
	onTouchBegan:function (touch, event) {
		return true;
	},
	onTouchMoved:function (touch, event) {

	},
	onTouchEnded:function (touch, event) {
		event.getCurrentTarget().laught();
	},
	laught:function (){
		cc.log("laughing");
		this.spriteOwner.runAction(this.laughingAction);
	},
	onExit:function() {
		this.laughingAction.release();
		this._super();
	}
});