/*
The Game Project 7
Make it Awesome!
*/

var floor_posY;
var level_length;
var trees;
var clouds_front;
var clouds_back;
var mountains;
var items;
var canyons;
var boards;
var enemies;
var bullets;

function setup(){
	createCanvas(1280, 720);
	floor_posY = height * 0.8;
	player.lives = 3;
	level_length = 3000;
	trees = [];
	clouds_front = [];
	clouds_back = [];
	mountains = [];
	items = [];
	canyons = [];
	boards = [];
	enemies = [];
	bullets = [];

	for(let i=0; i<level_length/500; i++){
		let n = new canyon(random(100, level_length-100), random(60, 100));
		canyons[i] = n;
		if(i>0){
			for(let j=0; j<i; j++){
				if(abs(n.posX-canyons[j].posX)<(n.width+canyons[j].width)){
					i--;
					break;
				}
			}
		}
	}
	for(let i=0; i<level_length/300; i++){
		clouds_back[i] = new cloud(random(-100, level_length), random(height/7, height/3), random(50, 100), random(200, 255));
	}
	for(let i=0; i<level_length/200; i++){
		mountains[i] = new mountain(random(-100,level_length), random(height/11, height), random(width/5, width/2.5), random(110,140));
	}
	for(let i=0; i<level_length/400; i++){
		clouds_front[i] = new cloud(random(-100, level_length), random(height/11, height/3), random(40, 90), random(210, 255));
	}
	for(let i=0; i<level_length/50; i++){
		let n = new tree(random(-100, level_length-100), random(height/4.5, height/8), random(width/10, width/14), random(80, 130));
		trees[i] = n;
		for(let j=0; j<canyons.length; j++){
			if(abs(n.posX-canyons[j].posX)<canyons[j].width){
				i--;
				break;
			}
		}
	}
	for(let i=0; i<level_length/250; i++){
		let n = new item(random(100, level_length-100), floor_posY);
		items[i] = n;
		for(let j=0; j<canyons.length; j++){
			if(abs(n.posX-canyons[j].posX)<canyons[j].width){
				i--;
				break;
			}
		}
	}
	for(let i=0; i<level_length/200; i++){
		let n = new board(random(150, level_length-150), random(100, floor_posY-100), random(70, 200));
		boards[i] = n;
	}
	for(let i=0; i<boards.length/2; i++){
		let n = new item(random(boards[i].posX-boards[i].width/2, boards[i].posX+boards[i].width/2), boards[i].posY);
		items.push(n);
	}
	for(let i=0; i<level_length/100; i++){
		let n = new enemy(random(120, level_length-120), random(120, floor_posY+20), random(), random());
		enemies[i] = n;
	}
	startGame();
}

function startGame(){
	player.posX = 0;
	player.posY = floor_posY+20;
	player.jumping = false;
	player.dropping = false;
	player.velocity = 0;
	player.alive = true;
	flag.posX = level_length;
	flag.posY = 20;
	flag.reached = false;
	counter.posX = 50;
	counter.posY = 50;
}

function draw(){
	background(100,155,255);
	noStroke();
	fill(80,135,0);
	rect(0, floor_posY, width, height - floor_posY); 
	push();
	translate(width/4-player.posX, 0);
	for(let i=0; i<clouds_back.length; i++){
		clouds_back[i].draw();
	}
	for(let i=0; i<mountains.length; i++){
		mountains[i].draw();
	}
	for(let i=0; i<clouds_front.length; i++){
		clouds_front[i].draw();
	}
	for(let i=0; i<trees.length; i++){
		trees[i].draw();
	}
	player.inCanyon = false;
	for(let i=0; i<canyons.length; i++){
		canyons[i].draw();
		player.inCanyon = Boolean(player.inCanyon || canyons[i].check());
	}
	counter.score = 0;
	for(let i=0; i<items.length; i++){
		if(!items[i].found){
			items[i].check();
			items[i].draw();
		}
		else{
			counter.score++;
		}
	}
	player.onBoard = false;
	for(let i=0; i<boards.length; i++){
		boards[i].draw();
		player.onBoard = Boolean(player.onBoard || boards[i].check());
	}
	player.attacked = false;
	for(let i=0; i<enemies.length; i++){
		enemies[i].draw();
		enemies[i].move();
		player.attacked = Boolean(player.attacked || enemies[i].check());
	}
	for(let i=bullets.length-1; i>=0; i--){
		bullets[i].draw();
		bullets[i].move();
		bullets[i].check();
		if(bullets[i].lifetime<0){
			bullets.splice(i,1);
		}
	}
	player.draw();
	player.move();
	player.check();
	flag.draw();
	flag.check();
	pop();
	counter.draw();
	instruction.draw();
}

function keyPressed(){
	if(keyCode == 65 && !player.dropping && !player.attacked){
		player.left = true;
	}
	if(keyCode == 68 && !player.dropping && !player.attacked){
		player.right = true;
	}
	if(keyCode == 87 && !player.jumping && !player.dropping && !player.attacked){
		player.jumping = true;
		player.velocity = -14;
	}
	if(keyCode == 73){
		instruction.noticeMode = true;
	}
	if(keyCode == 83 && player.onBoard){
		player.posY += 10;
		player.onBoard = false;
	}
	if(keyCode == 32 && !player.dropping && !player.attacked){
		let m = 1;
		if(player.left){
			m = -1;
		}
		n = new bullet(player.posX, player.posY-40, 100, m);
		bullets.push(n);
	}
	if(keyCode == 84 && player.retriable){
		startGame();
	}
}

function keyReleased(){
	if(keyCode == 65){
		player.left = false;
	}
	if(keyCode == 68){
		player.right = false;
	}
	if(keyCode == 82){
		setup();
	}
	if(keyCode == 73){
		instruction.noticeMode = false;
	}
}

function cloud(posX, posY, size, brightness){
	this.posX = posX;
	this.posY = posY;
	this.size = size;
	this.brightness = brightness;
	this.draw = function(){
		noStroke();
		fill(this.brightness);
		ellipse(this.posX, this.posY, this.size);
		ellipse(this.posX-this.size/2, this.posY+this.size/8, this.size/1.4);
		ellipse(this.posX+this.size/2, this.posY+this.size/8, this.size/1.4);
	}
}

function mountain(posX, height, width, brightness){
	this.posX = posX;
	this.height = height;
	this.width = width;
	this.brightness = brightness;
	this.draw = function(){
		noStroke();
		fill(this.brightness);
		triangle(
			this.posX, floor_posY-this.height, 
			this.posX-this.width/4, floor_posY, 
			this.posX+this.width/4, floor_posY
			);
		triangle(
			this.posX-this.width/4, floor_posY-this.height*0.75, 
			this.posX-this.width/2, floor_posY, 
			this.posX, floor_posY
			);
		triangle(
			this.posX+this.width/4, floor_posY-this.height*0.75, 
			this.posX, floor_posY, 
			this.posX+this.width/2, floor_posY
			);
	}
}

function tree(posX, height, width, brightness){
	this.posX = posX;
	this.height = height;
	this.width = width;
	this.brightness = brightness;
	this.draw = function(){
		noStroke();
		fill(this.brightness*1.2, this.brightness*0.9, 0);
		rect(posX-this.width/18, floor_posY-this.height/5, this.width/9, this.height/5);
		fill(0, this.brightness, 0);
		triangle(
			this.posX, floor_posY-this.height*0.6, 
			this.posX-this.width/2.5, floor_posY-this.height*0.2, 
			this.posX+this.width/2.5, floor_posY-this.height*0.2
		);
		triangle(
			this.posX, floor_posY-this.height*0.8, 
			this.posX-this.width/3, floor_posY-this.height*0.4, 
			this.posX+this.width/3, floor_posY-this.height*0.4
		);
		triangle(
			this.posX, floor_posY-this.height, 
			this.posX-this.width/4, floor_posY-this.height*0.6, 
			this.posX+this.width/4, floor_posY-this.height*0.6
		);
	}
}

function item(posX, posY){
	this.posX = posX;
	this.posY = posY;
	this.found = false;
	this.check = function(){
		if(dist(player.posX, player.posY, this.posX, this.posY) < 60){
			this.found = true;
		}
	}
	this.draw =  function(){
		strokeWeight(0.5);
		stroke(255);
		fill(180, 210, 255);
		triangle(
			this.posX, this.posY, 
			this.posX-width/40, this.posY-width/40, 
			this.posX+width/40, this.posY-width/40
		);
		triangle(
			this.posX, this.posY, 
			this.posX-width/120, this.posY-width/40, 
			this.posX+width/120, this.posY-width/40
		);
		triangle(
			this.posX, this.posY-width/40, 
			this.posX-width/80, this.posY-width/80*3, 
			this.posX+width/80, this.posY-width/80*3
		);
		triangle(
			this.posX, this.posY-width/40, 
			this.posX-width/80, this.posY-width/80*3, 
			this.posX-width/40, this.posY-width/40
		);
		triangle(
			this.posX, this.posY-width/40, 
			this.posX+width/80, this.posY-width/80*3, 
			this.posX+width/40, this.posY-width/40
		);
	}
}

function canyon(posX, width){
	this.posX = posX;
	this.width = width;
	this.check = function(){
		if(abs(player.posX-this.posX)<this.width/2-10){
			return true;
		}
		else{
			return false;
		}
	}
	this.draw = function(){
		noStroke();
		fill(60, 80, 0);
		rect(this.posX-this.width/2, floor_posY, this.width, height-floor_posY);
	}
}

function board(posX, posY, width){
	this.posX = posX;
	this.posY = posY;
	this.width = width;
	this.check = function(){
		if(abs(player.posX-this.posX)<this.width/2 && abs(player.posY-(this.posY+20))<8 && player.velocity>=0){
			player.jumping = false;
			player.velocity = 0;
			player.posY = this.posY + 20;
			return true;
		}
	},
	this.draw = function(){
		stroke(60, 40, 0);
		strokeWeight(2);
		fill(130, 80, 0);
		rect(this.posX-this.width/2, this.posY, width, 10);
	}
}

function enemy(posX, posY, veloX, veloY){
	this.posX = posX;
	this.posY = posY;
	this.touched = false
	this.direcX = 1;
	this.direcY = 1;
	this.veloX = veloX;
	this.veloY = veloY;
	this.check = function(){
		if(dist(this.posX, this.posY, player.posX, player.posY)<20){
			this.touched = true;
			return true;
		}
		else{
			this.touched = false;
			return false;
		}
	}
	this.move = function(){
		if(!this.touched){
			if(random()>0.999 || this.posX>level_length-50 || this.posX<100){
				this.direcX *= random(-0.8, -1.25);
			}
			if(random()>0.999 || this.posY>floor_posY+20 || this.posY<100){
				this.direcY *= random(-0.8, -1.25);
			}
			this.posX += this.direcX * veloX;
			this.posY += this.direcY * veloY;
		}
	}
	this.draw = function(){
			stroke(0);
			fill(200, 20, 0);
			strokeWeight(1);
			ellipse(this.posX, this.posY-40, 30);
			line(this.posX-3, this.posY-33, this.posX+3, this.posY-33);
			strokeWeight(3);
			point(this.posX-6, this.posY-44);
			point(this.posX+6, this.posY-44);
			strokeWeight(1);
	}
}

function bullet(posX, posY, lifetime, direction){
	this.posX = posX;
	this.posY = posY;
	this.velocity = 0;
	this.direction = direction;
	this.lifetime = lifetime;
	this.hit = false;
	this.check = function(){
		for(let i=0; i<enemies.length; i++){
			if(dist(this.posX, this.posY, enemies[i].posX, enemies[i].posY)<50){
				this.hit = true;
				enemies.splice(i, 1);
			}
		}
	}
	this.move = function(){
		this.velocity += 0.2 * this.direction;
		this.posX += this.velocity;
		this.lifetime -= 1;
	}
	this.draw = function(){
		stroke(200);
		strokeWeight(2);
		fill(200, 200, 100);
		ellipse(this.posX, this.posY, 30);
	}
}

var flag = {
	posX: 0,
	posY: 0,
	reached: false,
	check: function(){
		if(player.posX > this.posX){
			this.reached = true;
		}
		if(this.reached){
			this.posY += 3;
		}
		this.posY = min(260, this.posY);
	},
	draw: function(){
		strokeWeight(3);
		stroke(60);
		line(this.posX, floor_posY-2, this.posX, floor_posY-300);
		fill(60);
		triangle(this.posX, floor_posY-10, this.posX-5, floor_posY, this.posX+5, floor_posY);
		fill(200, 200, 0);
		triangle(
			this.posX, floor_posY-this.posY, 
			this.posX, floor_posY-40-this.posY, 
			this.posX+40, floor_posY-20-this.posY
		);
	}
}

var counter = {
	posX: 0,
	posY: 0,
	score: 0,
	lives: 0,
	draw: function(){
		fill(255);
		noStroke();
		textSize(30);
		text('Score: ' + this.score, this.posX, this.posY);
		text('Lives: ', this.posX, this.posY+40);
		for(let i=0; i<player.lives; i++){
			ellipse(150+20*i, 80, 15);
		}
	}
}

var instruction = {
	completed: 'Great job. Press R to restart.',
	over: 'Game over. Press R to restart.',
	dead: 'Oops. Press T to try again.',
	attacked: "Don't touch them. Use your weapon next time. Press T to try again.",
	notice: 'Collect diamonds and reach the endpoint! Take care of the enemies and canyons. Good luck!',
	noticeMode: false,
	draw: function(){
		stroke(5);
		textSize(20);
		text('Press I for the instruction.', 20, height-10);
		text('Press T to retry the same level. Press R to regenerate the level.', 20, height-30);
		text('Press Space to fire.', 20, height-50);
		text('Press A to move left, D to move right, W to jump, S to go downward.', 20, height-70);
		textSize(40);
		if(this.noticeMode){
			fill(200);
			rect(width/4-50, height/4-50, width/2+50, height/2+50);
			fill(30);
			text(this.notice, width/4, height/4, width/2, height/2);
		}
		else{
			fill(255);
			if(flag.reached){
				text(this.completed, width/3, height/2);
			}
			else if(player.lives<1){
				text(this.over, width/3, height/2);
			}
			else if(player.dropping){
				text(this.dead, width/3, height/2);
			}
			else if(player.attacked){
				text(this.attacked, width/7, height/2);
			}
		}
	}
}

var player = {
	posX: 0,
	posY: 0,
	lives: 0,
	velocity: 0,
	inCanyon:false,
	onBoard: false,
	attacked: false,
	alive: true,
	retriable: false,
	left: false,
	right: false,
	jumping: false,
	dropping: false,
	check: function(){
		if(this.posY>=floor_posY+20){
			if(!this.inCanyon){
				this.jumping = false;
				this.posY = floor_posY+20;
				this.velocity = 0;
			}
			else{
				this.dropping = true;
			}
		}
		else if(!this.onBoard){
			this.jumping = true;
		}
		if((this.posY>height*2 || this.attacked) && !flag.reached && this.alive){
			this.alive = false;
			this.lives -= 1;
			this.lives = max(0, this.lives);
			if(this.lives>0){
				this.retriable = true;
			}
		}
	},
	move: function(){
		if(this.left){
			this.posX -= 3;
			for(let i=0; i<clouds_front.length; i++){
				clouds_front[i].posX -= 0.3;
			}
			for(let i=0; i<mountains.length; i++){
				mountains[i].posX -= 0.7;
			}
			for(let i=0; i<clouds_back.length; i++){
				clouds_back[i].posX -= 1;
			}
		}
		if(this.right){
			this.posX += 3;
			for(let i=0; i<clouds_front.length; i++){
				clouds_front[i].posX += 0.3;
			}
			for(let i=0; i<mountains.length; i++){
				mountains[i].posX += 0.7;
			}
			for(let i=0; i<clouds_back.length; i++){
				clouds_back[i].posX += 1;
			}
		}
		if(this.jumping){
			this.posY += this.velocity;
			this.velocity += 0.3;
			this.velocity = min(100, this.velocity);
		}
		if(this.dropping){
			this.left = false;
			this.right = false;
			this.posY += this.velocity;
			this.velocity += 0.3;
			this.posY = min(10000, this.posY);
			this.velocity = min(100, this.velocity);
		}
		if(this.attacked){
			this.left = false;
			this.right = false;
			this.velocity = 0;
		}
	},
	draw: function(){
		if(this.left && this.jumping){
			stroke(0);
			fill(255);
			strokeWeight(1);
			ellipse(this.posX, this.posY-40, 30);
			line(this.posX+5, this.posY-40, this.posX, this.posY-45);
			line(this.posX-5, this.posY-25, this.posX-7, this.posY-20);
			line(this.posX+5, this.posY-25, this.posX+7, this.posY-20);
			line(this.posX-6, this.posY-33, this.posX-12, this.posY-33);
			strokeWeight(3);
			point(this.posX-6, this.posY-44);
			strokeWeight(1);
		}
		else if(this.right && this.jumping){
			stroke(0);
			fill(255);
			strokeWeight(1);
			ellipse(this.posX, this.posY-40, 30);
			line(this.posX-5, this.posY-40, this.posX, this.posY-45);
			line(this.posX-5, this.posY-25, this.posX-7, this.posY-20);
			line(this.posX+5, this.posY-25, this.posX+7, this.posY-20);
			line(this.posX+6, this.posY-33, this.posX+12, this.posY-33);
			strokeWeight(3);
			point(this.posX+6, this.posY-44);
			strokeWeight(1);
		}
		else if(this.left && !this.right){
			stroke(0);
			fill(255);
			strokeWeight(1);
			ellipse(this.posX, this.posY-40, 30);
			line(this.posX+5, this.posY-40, this.posX+5, this.posY-35);
			line(this.posX-5, this.posY-25, this.posX-5, this.posY-20);
			line(this.posX+5, this.posY-25, this.posX+5, this.posY-20);
			line(this.posX-6, this.posY-33, this.posX-12, this.posY-33);
			strokeWeight(3);
			point(this.posX-6, this.posY-44);
			strokeWeight(1);
		}
		else if(this.right && !this.left){
			stroke(0);
			fill(255);
			strokeWeight(1);
			ellipse(this.posX, this.posY-40, 30);
			line(this.posX-5, this.posY-40, this.posX-5, this.posY-35);
			line(this.posX-5, this.posY-25, this.posX-5, this.posY-20);
			line(this.posX+5, this.posY-25, this.posX+5, this.posY-20);
			line(this.posX+6, this.posY-33, this.posX+12, this.posY-33);
			strokeWeight(3);
			point(this.posX+6, this.posY-44);
			strokeWeight(1);
		}
		else if(this.jumping || this.dropping){
			stroke(0);
			fill(255);
			strokeWeight(1);
			ellipse(this.posX, this.posY-40, 30);
			line(this.posX-15, this.posY-40, this.posX-20, this.posY-45);
			line(this.posX+15, this.posY-40, this.posX+20, this.posY-45);
			line(this.posX-5, this.posY-25, this.posX-7, this.posY-20);
			line(this.posX+5, this.posY-25, this.posX+7, this.posY-20);
			line(this.posX-3, this.posY-33, this.posX+3, this.posY-33);
			strokeWeight(3);
			point(this.posX-6, this.posY-44);
			point(this.posX+6, this.posY-44);
			strokeWeight(1);
		}
		else{
			stroke(0);
			fill(255);
			strokeWeight(1);
			ellipse(this.posX, this.posY-40, 30);
			line(this.posX-15, this.posY-40, this.posX-20, this.posY-35);
			line(this.posX+15, this.posY-40, this.posX+20, this.posY-35);
			line(this.posX-5, this.posY-25, this.posX-5, this.posY-20);
			line(this.posX+5, this.posY-25, this.posX+5, this.posY-20);
			line(this.posX-3, this.posY-33, this.posX+3, this.posY-33);
			strokeWeight(3);
			point(this.posX-6, this.posY-44);
			point(this.posX+6, this.posY-44);
			strokeWeight(1);
		}
	}
}