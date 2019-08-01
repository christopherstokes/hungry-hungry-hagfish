	// title:  Hungry Hungry Hagfish
// author: Christopher Stokes
// desc:  	Eat your way through waves
//			of enemies
// script: js

// engine code

function getRandomInt(max, min) {
	var randomNum = (Math.floor(Math.random() * Math.floor(max)));
	if (min) {
		if (randomNum < min)
			randomNum += min;
	}	

	return randomNum;
}

function collides(entA, entB) {
	if (entA.x < entB.x + entB.wid &&
		entA.x + entA.wid > entB.x &&
		entA.y < entB.y + entB.hei &&
		entA.y + entA.hei > entB.y) {
		return true;
	} else {
		return false;
	}
}

var Animation = function (frames, speed, startFrame) {
	this.frames = frames || [];
	this.speed = speed || 10;
	this.currentFrame = startFrame || 0;
	this.isFlipped = false;
}

Animation.prototype.update = function (currentTime) {
	if (currentTime % this.speed == 0) {
		if (this.currentFrame < this.frames.length - 1) {
			this.currentFrame++;
		} else {
			this.currentFrame = 0;
		}
	}
}

Animation.prototype.draw = function (x, y) {
	var f = this.frames[this.currentFrame];

	spr(f.id, x, y, f.ck, f.scl, f.flp, f.rot, f.wid, f.hei);
}

Animation.prototype.flip = function () {
	for (var f = 0; f < this.frames.length; f++) {
		if (this.isFlipped == false) {
			this.frames[f].flp = 1;
		} else {
			this.frames[f].flp = 0;
		}
	}

	if (this.isFlipped == true) {
		this.isFlipped = false;
	} else {
		this.isFlipped = true;
	}
}

var Frame = function (id, wid, hei, ck, scl, flp, rot) {
	this.id = id;
	this.wid = wid || 1;
	this.hei = hei || 1;
	this.ck = ck || 0;
	this.scl = scl || 1;
	this.flp = flp || 0;
	this.rot = rot || 0;
}

var Entity = function (x, y, wid, hei, animations, currentAnimation) {
	this.x = x;
	this.y = y;
	this.wid = wid || 8;
	this.hei = hei || 8;
	this.animations = animations || {};
	this.ca = currentAnimation || 'idle';
}

Entity.prototype.update = function () {
	this.animations[this.ca].update(t);
}

Entity.prototype.draw = function () {
	this.animations[this.ca].draw(this.x, this.y);
}

var Particle = function(x, y, col, dx, dy, r, dr, dt) {
	this.x = x;
	this.y = y;
	this.col = col;
	this.dx = dx || 0; // change x
	this.dy = dy || 0; // change y
	this.r = r || 1;
	this.dr = dr || 0; // change radius
	this.dt = dt || 60; // expiration time (change time)
	this.alive = true;
}

Particle.prototype.update = function() {
	this.dt -= 1;
	if (this.dt <= 0 || this.r <= 0) {
		this.alive = false;
	} else {
		this.x += this.dx;
		this.y += this.dy;
		this.r += this.dr;
	}
}

Particle.prototype.draw = function() {
	circ(this.x, this.y, this.r, this.col);
}

// game variables
var entities = [];
var particles = [];


for (var x=0; x<=240; x+=16) {
	var s = new Entity(x, 104, 16, 32);
	s.animations['idle'] = new Animation([
		new Frame(17, 1, 2, 0, 2),
		new Frame(18, 1, 2, 0, 2),
		new Frame(19, 1, 2, 0, 2),
		new Frame(18, 1, 2, 0, 2),
		new Frame(20, 1, 2, 0, 2)
	], 15)

	s.type = "seaweed"
	
	entities.push(s)
}


var player = new Entity(96, 24, 16);

player.animations['idle'] = new Animation([
	new Frame(1, 2),
	new Frame(3, 2),
	new Frame(5, 2),
	new Frame(7, 2)
], 10);

player.controls = function () {
	if (btn(0)) {
		this.y--;
	}
	if (btn(1)) {
		this.y++;
	}
	if (btn(2)) {
		this.x--;
		if (!this.animations[this.ca].isFlipped) {
			this.animations[this.ca].flip(1);
		}
	}
	if (btn(3)) {
		this.x++;
		if (this.animations[this.ca].isFlipped) {
			this.animations[this.ca].flip(0);
		}
	}
}
entities.push(player);

// define camera -- use for offsetting player character for smoot movement
var cam = {'x': 120, 'y': 68}

var numDF = 10;

for (var df=0; df<numDF; df++) {
	var d = new Entity(getRandomInt(240-32), getRandomInt(136-32), 32, 32);
	var spotTaken = false;

	d.animations['idle'] = new Animation([
		new Frame(21, 2, 2, 0, 2),
		new Frame(23, 2, 2, 0, 2),
		new Frame(21, 2, 2, 0, 2),
		new Frame(25, 2, 2, 0, 2)
	])

	d.type = "food"

	for (var e=0; e<entities.length; e++) {
		if (entities[e].type == "food" && collides(d, entities[e])) {
			spotTaken = true;
			break;
		}
	}

	if (spotTaken) {
		break;
	}
	
	entities.push(d)
}


for (var x=0; x<=240; x+=16) {
	var s = new Entity(x, 104, 16, 32);
	s.animations['idle'] = new Animation([
		new Frame(17, 1, 2, 0, 2),
		new Frame(18, 1, 2, 0, 2),
		new Frame(19, 1, 2, 0, 2),
		new Frame(18, 1, 2, 0, 2),
		new Frame(20, 1, 2, 0, 2)
	], 15)

	s.type = "seaweed"
	
	entities.push(s)
}



var t = 0

function TIC() {
	player.controls();

	cls(8);

	if (entities.length > 0) {
		for (var e = entities.length-1; e>=0; e--) {
			ent = entities[e];
			ent.update();
			ent.draw();
			
			if (ent !== player){
				if (collides(player, ent)) {
					if (ent.type == "seaweed" && (t % 15 == 0) && (getRandomInt(200) > 150)) {
						var par = new Particle(player.x + (player.wid/2), player.y + (player.hei/2), 15, 0, -1, 3, -0.05, 120);
						particles.push(par);
					} else if (ent.type == "food" && (t % 5 == 0) && (getRandomInt(200) > 125)) {
						var blood;
						if (player.animations[player.ca].isFlipped) {
							blood = new Particle(player.x, player.y+player.hei, 6, 0, -0.5, getRandomInt(3, 2), -0.05, 90);
						} else {
							blood = new Particle(player.x+player.wid, player.y+player.hei, 6, 0, -0.5, getRandomInt(3, 2), -0.05, 90);
						}
						particles.push(blood);
					}
				}
			}
		}
	}

	if (particles.length > 0) {
		for (var p=particles.length-1; p>=0; p--) {
			particles[p].update();
			particles[p].draw();
	
			if (!particles[p].alive) {
				particles.splice(p, 1);
			}
		}
	}

	t++;
}

// <TILES>
// 001:000000000000000090099000999c99999c999999c990009c9900000990000000
// 002:000099990009ffff000ff1f1000999999999c939999c99909999000000000000
// 003:0000000090000000999009009c999999c99c999c99c990999000000000000000
// 004:00000000000099990009ffff990ff1f199999999999cc9990099999000000000
// 005:90000000990000009c900009c99000999999999c900c99900009900000000000
// 006:00000000000000009990999999999999999ff1f1000c99990000c93900009990
// 007:00000000900000009c900900c9999999999c999c999990999000000000000000
// 008:0000000000009999000999999909999999999999999cc9390099999000000000
// 017:0000000000050000000500000005005000050050000500500005005000050050
// 018:0000000000000000000500000050000000500050005005000050050000500500
// 019:0000000000000000000000000050000005000000050005000500500005005000
// 020:0000000000000000005000000005000000050500000500500005005000050050
// 021:000000000ccccccc0ccccccc0ccccc1c0cccc1110ccccc1c0ccccccc00cccccc
// 022:0000000000000000c0000000cc000000ccc00000cccc0000ccccc000ccccc000
// 023:00000000000000000ccccccc0ccccccc0ccccc1c0cccc1110ccccc1c0ccccccc
// 024:000000000000000000000000c0000000cc000000ccc00000cccc0000ccccc000
// 025:0ccccccc0ccccccc0ccccc1c0cccc1110ccccc1c0ccccccc00cccccc000ccccc
// 026:00000000c0000000cc000000ccc00000cccc0000ccccc000ccccc000ccccc000
// 033:0005005000050050000500500005005000050050000500500005005055555555
// 034:0050050000500500005005000050050000500500005005000005005055555555
// 035:0500500005005000050050000500500005005000005005000005005055555555
// 036:0005005000050050000500500005005000050050000500500005005055555555
// 037:000ccccc0000cccc00000ccc000000cc00000000000000000000000000000000
// 038:ccccc000ccccc000ccccccc0ccccccc000ccccc000ccc00000ccc00000000000
// 039:00cccccc000ccccc0000cccc00000ccc000000cc000000000000000000000000
// 040:ccccc000ccccc000ccccc000ccccccc0ccccccc000ccccc000ccc00000ccc000
// 041:0000cccc00000ccc000000cc0000000000000000000000000000000000000000
// 042:ccccc000ccccccc0ccccccc000ccccc000ccc00000ccc0000000000000000000
// </TILES>

// <WAVES>
// 000:00000000ffffffff00000000ffffffff
// 001:0123456789abcdeffedcba9876543210
// 002:0123456789abcdef0123456789abcdef
// </WAVES>

// <SFX>
// 000:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000304000000000
// </SFX>

// <PALETTE>
// 000:140c1c44243430346d4e4a4e854c30346524d04648757161597dced27d2c8595a16daa2cd2aa996dc2cadad45edeeed6
// </PALETTE>

