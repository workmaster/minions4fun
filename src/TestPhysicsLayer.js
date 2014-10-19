var FLUID_DENSITY = 0.00014;
var FLUID_DRAG = 2.0;

var TestPhysicsLayer = cc.Layer.extend({
	_debugNode: null,           //测试NODE
	space: null,                //物理世界
	box: null,                 
	boxDirectionX: 1,          //飞的方向 -1为向左飞 1为向右飞
	waterBoxBody: null,
	
	ctor:function () {
		this._super();
		this.init();
	},
	
	init:function () {
		this._super();
		//初始化物理世界
		this.space = new cp.Space();
		this.initPhysics();
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
		var width = 20.0;
		var height = 20.0;
		var mass = 0.5*FLUID_DENSITY*width*height;
		var moment = cp.momentForBox(mass, width, height);

		body = space.addBody( new cp.Body(mass, moment));
		body.setPos( cp.v(580, 250));
		body.setVel( cp.v(0, -100));
		body.setAngVel( 1 );
		this.waterBoxBody = body;

		shape = space.addShape( new cp.BoxShape(body, width, height));
		shape.setFriction(0.8);
		space.addCollisionHandler( 1, 0, null, this.waterPreSolve, null, null);
		//----------------水面结束---------------
	},
	
	doForceBox: function () {
		this.scheduleUpdate();

		var speed = 20;
		var x = this.boxDirectionX * speed * Math.cos(110*Math.PI/180);
		var y = speed * Math.sin(60*Math.PI/180);
//		this.box.getBody().setVel(cp.v(0,0));
//		this.box.getBody().applyImpulse(cp.v(x,y), cp.v(0, 0));

		this.waterBoxBody.applyImpulse(cp.v(x,y), cp.v(0, 0));
	},

	initDebugMode: function () {
		this._debugNode = cc.PhysicsDebugNode.create(this.space);
		this.addChild(this._debugNode);
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
					event.getCurrentTarget().processEvent( event );
				}
			}, this);
		}

		//物理世界更新
//		this.scheduleUpdate();
	},
	
	//事件处理
	processEvent: function (event) {
		this.doForceBox(); 
	},
	
	update: function (dt) {
		//这个必须有，物理世界对刚体的处理
		this.space.step(1/60.0);
	},
});

TestPhysicsLayer.prototype.waterPreSolve = function(arb, space) {
	var shapes = arb.getShapes();
	var water = shapes[0];
	var poly = shapes[1];

	var body = poly.getBody();

	// Get the top of the water sensor bounding box to use as the water level.
	var level = water.getBB().t;

	// Clip the polygon against the water level
	var count = poly.getNumVerts();

	var clipped = [];

	var j=count-1;
	for(var i=0; i<count; i++) {
		var a = body.local2World( poly.getVert(j));
		var b = body.local2World( poly.getVert(i));

		if(a.y < level){
			clipped.push( a.x );
			clipped.push( a.y );
		}

		var a_level = a.y - level;
		var b_level = b.y - level;

		if(a_level*b_level < 0.0){
			var t = Math.abs(a_level)/(Math.abs(a_level) + Math.abs(b_level));

			var v = cp.v.lerp(a, b, t);
			clipped.push(v.x);
			clipped.push(v.y);
		}
		j=i;
	}

	// Calculate buoyancy from the clipped polygon area
	var clippedArea = cp.areaForPoly(clipped);

	var displacedMass = clippedArea*FLUID_DENSITY;
	var centroid = cp.centroidForPoly(clipped);
	var r = cp.v.sub(centroid, body.getPos());

	var dt = space.getCurrentTimeStep();
	var g = space.gravity;

	// Apply the buoyancy force as an impulse.
	body.applyImpulse( cp.v.mult(g, -displacedMass*dt), r);

	// Apply linear damping for the fluid drag.
	var v_centroid = cp.v.add(body.getVel(), cp.v.mult(cp.v.perp(r), body.w));
	var k = 1; //k_scalar_body(body, r, cp.v.normalize_safe(v_centroid));
	var damping = clippedArea*FLUID_DRAG*FLUID_DENSITY;
	var v_coef = Math.exp(-damping*dt*k); // linear drag
//	var v_coef = 1.0/(1.0 + damping*dt*cp.v.len(v_centroid)*k); // quadratic drag
	body.applyImpulse( cp.v.mult(cp.v.sub(cp.v.mult(v_centroid, v_coef), v_centroid), 1.0/k), r);

	// Apply angular damping for the fluid drag.
	var w_damping = cp.momentForPoly(FLUID_DRAG*FLUID_DENSITY*clippedArea, clipped, cp.v.neg(body.p));
	body.w *= Math.exp(-w_damping*dt* (1/body.i));

//	cc.log("waterPreSolve"+body.getMass());
	body.setMass(body.getMass()+0.00015);
	return true;
};