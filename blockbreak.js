$(function() {
  var Q = window.Q = Quintus()
                     .include('Input,Sprites,Scenes,UI')
                     .setup();

  Q.input.keyboardControls();
  Q.input.mouseControls();
  Q.input.touchControls({ 
            controls:  [ ['left','mouseX' ],[],[],[],['right','mouseX' ] ]
  });

  Q.Sprite.extend("Paddle", {     // extend Sprite class to create Q.Paddle subclass
    init: function(p) {
      this._super(p, {
        sheet: 'paddle',
        speed: 200,
        x: 0,
      });
      this.p.x = Q.width - this.p.w;
      this.p.y = Q.height - this.p.h;
      if(Q.input.keypad.size) {
        this.p.y -= Q.input.keypad.size + this.p.h;
      }
    },

    step: function(dt) 
		{
		  this.p.x = Q.inputs['mouseX'];
		  //{ 
		  //  this.p.x -= dt * this.p.speed;
		  //} else if(Q.inputs['mouseX']) {
		   // this.p.x += dt * this.p.speed;
		  //}
					  if(this.p.x < this.p.w/2) 
						  { 
							this.p.x = this.p.w/2;
						  } 
						  else if(this.p.x > Q.width - this.p.w/2) 
						  { 
							this.p.x = Q.width - this.p.w/2;
						  }
	//      this._super(dt);	      // no need for this call anymore
		//}}
		}
	  }
  );

  Q.Sprite.extend("Ball", {
    init: function() {
      this._super({
        sheet: 'ball',
        speed: 200,
        dx: 1,
        dy: -1,
      });
      this.p.y = Q.height / 2 - this.p.h;
      this.p.x = Q.width / 2 + this.p.w / 2;
	  
	  this.on('hit', this, 'collision');  // Listen for hit event and call the collision method
	  
	  this.on('step', function(dt) {      // On every step, call this anonymous function
		  var p = this.p;
		  Q.stage().collide(this);   // tell stage to run collisions on this sprite

		  p.x += p.dx * p.speed * dt;
		  p.y += p.dy * p.speed * dt;

		  if(p.x < 0) { 
			p.x = 0;
			p.dx = 1;
		  } else if(p.x > Q.width - p.w) { 
			p.dx = -1;
			p.x = Q.width - p.w;
		  }

		  if(p.y < 0) {
			p.y = 0;
			p.dy = 1;
		  } else if(p.y > Q.height) { 
			Q.stageScene('lose');
		  }
	  });
    },
	
	collision: function(col) {                // collision method
		if (col.obj.isA("Paddle")) {
//			alert("collision with paddle");
			this.p.dy = -1;
		} else if (col.obj.isA("Block")) {
//			alert("collision with block");
			col.obj.destroy();
			this.p.dy *= -1;
			Q.stage().trigger('removeBlock');
		}
	}
  });

  Q.Sprite.extend("Block", {
    init: function(props) {
      this._super(_(props).extend({ sheet: 'block'}));
      this.on('collision',function(ball) { 
        this.destroy();
        ball.p.dy *= -1;
        Q.stage().trigger('removeBlock');
      });
    }
  });

//  Q.load(['blockbreak.png','blockbreak.json'], function() {
  Q.load(['blockbreak.png'], function() {
    // Q.compileSheets('blockbreak.png','blockbreak.json');  
	Q.sheet("ball", "blockbreak.png", { tilew: 20, tileh: 20, sy: 0, sx: 0 });
	Q.sheet("block", "blockbreak.png", { tilew: 40, tileh: 20, sy: 20, sx: 0 });
	Q.sheet("paddle", "blockbreak.png", { tilew: 60, tileh: 20, sy: 40, sx: 0 });		 	
    Q.scene('game',new Q.Scene(function(stage) {
      stage.insert(new Q.Paddle());
      stage.insert(new Q.Ball());

      var blockCount=0;
      for(var x=0;x<6;x++) {
        for(var y=0;y<5;y++) {
          stage.insert(new Q.Block({ x: x*50+35, y: y*30+10 }));
          blockCount++;
        }
      }
      stage.on('removeBlock',function() {
        blockCount--;
        if(blockCount == 0) {
          Q.stageScene('win');
        }
      });

    }));
Q.scene('lose', function (stage) 
	{
		// Add container
		var container = stage.insert(new Q.UI.Container(
		{
			x: Q.width / 2,
			y: Q.height / 4,
			fill: '#000'
		}));

    // Add death message
    container.insert(new Q.UI.Text(
	{
        label: 'You Died!',
        color: '#fff',
        x: 0,
        y: 0
    }));
});
Q.scene('win', function (stage) 
	{
		// Add container
		var container = stage.insert(new Q.UI.Container(
		{
			x: Q.width / 2,
			y: Q.height / 4,
			fill: '#000'
		}));

    // Add death message
    container.insert(new Q.UI.Text(
	{
        label: 'You Win!',
        color: '#fff',
        x: 0,
        y: 0
    }));
});
	Q.stageScene('game');
    });  
});