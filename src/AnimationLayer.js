var AnimationLayer = cc.Layer.extend({
	spriteOwner:null, 		// 己方
	spriteEnemy:null,		// 敌方
	spriteSheet:null, 		// 动画循环
	spriteSheet2:null, 		// 敌方动画循环
	laughingAction:null, 	// 击中笑场动作
	laughingAction2:null, 	// 敌方击中笑场动作
	
	_debugNode: null,           //测试NODE
	space: null,                //物理世界
	body:null,
	shape:null,
	box: null,                 
	boxDirectionX: 1,          //飞的方向 -1为向左飞 1为向右飞
	waterBoxBody: null,
	
	ctor:function (space) {
		this.space = space;
		this._super();
		this.init();
	},
	initAction:function(target_plist,target_png,target_Sheet,startpos,endpos)
	{
		// create sprite sheet
		cc.spriteFrameCache.addSpriteFrames(target_plist);
		target_Sheet = cc.SpriteBatchNode.create(target_png);
		this.addChild(target_Sheet);

		// init laughingAction
		var animFrames = [];
		for (var i = startpos; i < endpos; i++) {
			var str = i + ".png";
			var frame = cc.spriteFrameCache.getSpriteFrame(str);
			animFrames.push(frame);
		}

		var animation = cc.Animation.create(animFrames, 0.1);
		actionObj = cc.Repeat.create(cc.Animate.create(animation), 1);
		return actionObj;
	},
	init:function () {
		this._super();
		
		var winsize = cc.director.getWinSize();
		
		//初始化物理世界
		this.initPhysics();

		//create the hero sprite
		this.spriteOwner = new cc.PhysicsSprite(res.Worker_png);
		//---test physics start---
		var contentSize = this.spriteOwner.getContentSize();
		this.body = new cp.StaticBody();
		this.body.setPos(cc.p(winsize.width - 226, winsize.height / 2 + 27));
		this.shape = new cp.BoxShape(this.body, contentSize.width/5, contentSize.height/5);
		this.space.addShape(this.shape);
		this.spriteOwner.setBody(this.body);
		this.scheduleUpdate();
		//---test physics end---
		
		this.spriteEnemy = cc.Sprite.create(res.Worker2_png);
		
		this.spriteOwner.attr({x: winsize.width - 226, y: winsize.height});
		this.spriteEnemy.attr({x: winsize.width /2 - 250, y: winsize.height});
		this.body.setPos(cc.p(300, 300));
		
		//this.initAction();
		this.laughingAction = this.initAction(res.laught_plist, res.laught_png, res.spriteSheet, 50, 68);
		this.laughingAction.retain(); // 不想自动释放内存
		this.laughingAction2 = this.initAction(res.enemy_laught_plist, res.enemy_laught_png, res.spriteSheet2, 111, 127);
		this.laughingAction2.retain(); 

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
		}, this);
	},
	
	initPhysics: function () {
		var space = this.space ;
		var staticBody = space.staticBody;
		var winSize = cc.director.getWinSize();

		//开启物体形状测试
		this.initDebugMode();

		// Gravity
		space.gravity = cp.v(0, -980);      //重力
		space.sleepTimeThreshold = 0.5;     //休眠临界时间
		space.collisionSlop = 0.5;          //


		//----------------水面开始---------------
		// Add the edges of the bucket
		var bb = new cp.BB(0, 0, winSize.width, 110);
		var radius = 5.0;

		var shape = space.addShape( new cp.SegmentShape(staticBody, cp.v(bb.l, bb.b), cp.v(bb.l, bb.t), radius));
		shape.setElasticity(1.0);
		shape.setFriction(1.0);

		shape = space.addShape( new cp.SegmentShape(staticBody, cp.v(bb.r, bb.b), cp.v(bb.r, bb.t), radius));
		shape.setElasticity(1.0);
		shape.setFriction(1.0);

		shape = space.addShape( new cp.SegmentShape(staticBody, cp.v(bb.l, bb.b), cp.v(bb.r, bb.b), radius));
		shape.setElasticity(1.0);
		shape.setFriction(1.0);

		// Add the sensor for the water.
		shape = space.addShape( new cp.BoxShape2(staticBody, bb) );
		shape.setSensor(true);
		shape.setCollisionType(1);

		//木块
//		var width = 20.0;
//		var height = 20.0;
//		var mass = 0.5*FLUID_DENSITY*width*height;
//		var moment = cp.momentForBox(mass, width, height);
//
//		body = space.addBody( new cp.Body(mass, moment));
//		body.setPos( cp.v(580, 250));
//		this.waterBoxBody = body;
//
//		shape = space.addShape( new cp.BoxShape(body, width, height));
//		shape.setFriction(0.8);
		//----------------水面结束---------------
	},
	
	throwBanana: function(){
		var width = 20.0;
		var height = 20.0;
		var mass = 0.5*FLUID_DENSITY*width*height;
		var moment = cp.momentForBox(mass, width, height);

		var body = this.space.addBody( new cp.Body(mass, moment));
		body.setPos( cc.p(580, 250));

		var shape = this.space.addShape( new cp.BoxShape(body, width, height));
		shape.setFriction(0.8);
		
		var speed = 20;
		var x = this.boxDirectionX * speed * Math.cos(110*Math.PI/180);
		var y = speed * Math.sin(60*Math.PI/180);
		body.applyImpulse(cp.v(x,y), cp.v(0, 0));
	},
	
	initDebugMode: function () {
		this._debugNode = cc.PhysicsDebugNode.create(this.space);
		this.addChild(this._debugNode);
	},
	
	onTouchBegan:function (touch, event) {
		return true;
	},
	onTouchMoved:function (touch, event) {

	},
	onTouchEnded:function (touch, event) {
		event.getCurrentTarget().laught();
		event.getCurrentTarget().throwBanana();
	},
	laught:function (){
		cc.log("laughing");
		this.spriteOwner.runAction(this.laughingAction);
		this.spriteEnemy.runAction(this.laughingAction2);
	},
	onExit:function() {
		this.laughingAction.release();
		this._super();
	},
	update: function (dt) {
		//这个必须有，物理世界对刚体的处理
		this.space.step(1/60.0);
	}
});