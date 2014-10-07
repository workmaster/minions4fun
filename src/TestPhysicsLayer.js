var TestPhysicsLayer = cc.Layer.extend({
	_debugNode: null,           //测试NODE

	space: null,                //物理世界

	blockBatchNode: null,

	box: null,                 //
	downUpAction: null,     //开场时，上下移动的动画
	boxDirectionX: 1,          //飞的方向 -1为向左飞 1为向右飞

	titleLabel: null,           //标题
	scoreLabel: null,           //分数

	leftBlockArray: null,       //左侧出来的BLOCK
	rightBlockArray: null,      //右侧出来的BLOCK
	leftBodyArray: null,        //左侧出来的BLOCK物体
	rightBodyArray: null,       //右侧出来的BLOCK物体
	
	ctor:function () {
		this._super();
		this.init();
	},
	
	init:function () {
		this._super();
		//初始化物理世界
		this.space = new cp.Space();
		this.initPhysics();
		this.initBoxWithBody();
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

		// Walls--四个边界
		var walls = [ new cp.SegmentShape( staticBody, cp.v(0,0-1), cp.v(winSize.width,0), 0-1 ),                // bottom
		              new cp.SegmentShape( staticBody, cp.v(0,winSize.height), cp.v(winSize.width,winSize.height), 0),    // top
		              new cp.SegmentShape( staticBody, cp.v(0,0), cp.v(0,winSize.height), 0),                // left
		              new cp.SegmentShape( staticBody, cp.v(winSize.width,0), cp.v(winSize.width,winSize.height), 0)    // right
		];
		for( var i=0; i < walls.length; i++ ) {
			var shape = walls[i];
			shape.setElasticity(1);         //弹性
			shape.setFriction(0);           //摩擦
			//space.addStaticShape( shape );
			space.addShape( shape );
			if(i >= 2){
				shape.setCollisionType(3);
			}
			shape.setLayers(1);
		}
	},
	

	initDebugMode: function () {
		this._debugNode = cc.PhysicsDebugNode.create(this.space);
		this.addChild(this._debugNode);
	},
	
	initBoxWithBody: function () {
		var winSize = cc.director.getWinSize();
		//物体的定义
		var mass = 1;
		var boxWidth = 32;

		var body = new cp.Body(mass, cp.momentForBox(mass, boxWidth, boxWidth) );
		body.setPos( cc.p(winSize.width/2, winSize.height/2) );
		this.space.addBody( body );
		var shape = new cp.BoxShape( body, boxWidth, boxWidth);
		shape.setElasticity( 0.5 );
		shape.setFriction( 0.3 );
		shape.setCollisionType(1);
		shape.setLayers(3);
		this.space.addShape( shape );

		//创建一个箱子
		this.box = cc.PhysicsSprite.create(res.CloseNormal_png,cc.rect(0,0,boxWidth,boxWidth));
		this.box.setBody(body);
		this.addChild(this.box,1);
		this.box.setTag(101);

		//上下移动
		var moveTo1 = cc.MoveTo.create(0.5, winSize.width / 2, this.box.y + 40);
		var moveTo2 = cc.MoveTo.create(0.5, winSize.width / 2, this.box.y - 40);
//		this.downUpAction = cc.RepeatForever.create(cc.Sequence.create(moveTo1,moveTo2));
//		this.box.runAction(this.downUpAction);
	},
	
	onEnter: function () {
		this._super();
		cc.log("onEnter");

		cc.sys.dumpRoot();
		cc.sys.garbageCollect();

		//事件处理
		if( 'touches' in cc.sys.capabilities ){
			cc.eventManager.addListener({
				event: cc.EventListener.TOUCH_ALL_AT_ONCE,
				onTouchesEnded: function(touches, event){
					event.getCurrentTarget().processEvent( touches[0] );
				}
			}, this);
		} else if( 'mouse' in cc.sys.capabilities ){
			cc.eventManager.addListener({
				event: cc.EventListener.MOUSE,
				onMouseDown: function(event){
					
				}
			}, this);
		}

		//
		this.scheduleUpdate();

		//添加碰撞监听事件
		// 1 & 2 检测box和上下BLOCK碰撞
		this.space.addCollisionHandler( 1, 2,
				this.collisionBegin.bind(this),
				this.collisionPre.bind(this),
				this.collisionPost.bind(this),
				this.collisionSeparate.bind(this)
		);
		// 1 & 3 检测box和左右边界碰撞
		this.space.addCollisionHandler( 1, 3,
				this.collisionBegin.bind(this),
				this.collisionPre.bind(this),
				this.collisionPost.bind(this),
				this.collisionSeparate.bind(this)
		);
		// 1 & 4 检测box和左右BLOCK碰撞
		this.space.addCollisionHandler( 1, 4,
				this.collisionBegin.bind(this),
				this.collisionPre.bind(this),
				this.collisionPost.bind(this),
				this.collisionSeparate.bind(this)
		);
	},
	
	collisionBegin : function ( arbiter, space ) {

		var shapes = arbiter.getShapes();

		var shapeA = shapes[0];
		var shapeB = shapes[1];

		var collTypeA = shapeA.collision_type;
		var collTypeB = shapeB.collision_type;

		if(collTypeB == 3){
			console.log( 'Collision Type A:' + collTypeA );
			console.log( 'end Collision Type B:' + collTypeB );

			this.boxDirectionX = -this.boxDirectionX;

			this.space.addPostStepCallback(function () {
				this.updateBoxAndBlocks();
			}.bind(this));
		}else if(collTypeB == 2 || collTypeB == 4)
		{//碰到上下墙壁 或者 左右出来的BLOCKS 就Gameover
			this.gameOver();
		}

		return true;
	},

	collisionPre : function ( arbiter, space ) {
		//console.log('collision pre');
		return true;
	},

	collisionPost : function ( arbiter, space ) {
		//console.log('collision post');
	},

	collisionSeparate : function ( arbiter, space ) {
		//console.log('collision separate');
	},
	
	update: function (dt) {
		//这个必须有，物理世界对刚体的处理
		this.space.step(1/60.0);
	},
});