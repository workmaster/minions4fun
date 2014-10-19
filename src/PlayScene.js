var PlayScene = cc.Scene.extend({
	space:null,
	
	onEnter:function () {
		this._super();
		this.space = new cp.Space();
		
		//add three layer in the right order
		this.addChild(new BackgroundLayer());
		this.addChild(new TestPhysicsLayer());
		this.addChild(new AnimationLayer(this.space));
		this.addChild(new StatusLayer());
	}
});