var GameState = function(game) {

};

GameState.prototype.preload = function() {
  this.game.load.spritesheet("ship", "game/assets/ship.png", 32, 32);
  this.game.load.image("player", "game/assets/player.png");
  this.game.load.image("ground", "game/assets/platform.png");
};

GameState.prototype.create = function() {
  this.game.stage.backgroundColor = 0x4488cc;

  this.MAX_SPEED = 400;
  this.ACCELERATION = 1200;
  this.DRAG = 900;
  this.GRAVITY = 2600;
  this.JUMP_SPEED = -500;

  this.player = this.game.add.sprite(this.game.width/2, this.game.height - 64, "player");
  this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

  this.player.body.collideWorldBounds = true;

  this.player.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10);

  this.player.body.drag.setTo(this.DRAG, 0);

  this.game.physics.arcade.gravity.y = this.GRAVITY;

  this.canDoubleJump = true;
  this.canVariableJump = true;

  this.ground = this.game.add.group();
  for(var x = 0; x < this.game.width; x += 32) {
    // Add the ground blocks, enable physics on each, make them immovable
    var groundBlock = this.game.add.sprite(x, this.game.height - 32, 'ground');
    this.game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
    groundBlock.body.immovable = true;
    groundBlock.body.allowGravity = false;
    this.ground.add(groundBlock);
  }

  this.game.input.keyboard.addKeyCapture([
    Phaser.Keyboard.LEFT,
    Phaser.Keyboard.RIGHT,
    Phaser.Keyboard.UP,
    Phaser.Keyboard.DOWN
  ]);

  this.drawHeightMarkers();

  this.game.time.advancedTiming = true;
  this.fpsText = this.game.add.text(
    20, 20, "", { font: "16px Arial", fill: "#fff" }
  );
};

GameState.prototype.drawHeightMarkers = function() {
  var bitmap = this.game.add.bitmapData(this.game.width, this.game.height);

  for (y = this.game.height - 32; y >= 64; y -= 32) {
    bitmap.context.beginPath();
    bitmap.context.strokStyle = "rgba(255, 255, 255, 0.2)";
    bitmap.context.moveTo(0, y);
    bitmap.context.lineTo(this.game.width, y);
    bitmap.context.stroke();
  }

  this.game.add.image(0, 0, bitmap);
}

GameState.prototype.update = function() {
  if (this.game.time.fps !== 0)
    this.fpsText.setText(this.game.time.fps + " FPS");

  this.game.physics.arcade.collide(this.player, this.ground);

  if (this.leftInputIsActive()) {
    this.player.body.acceleration.x = -this.ACCELERATION;
  } else if (this.rightInputIsActive()) {
    this.player.body.acceleration.x = this.ACCELERATION;
  } else {
    this.player.body.acceleration.x = 0;
  }

  var onTheGround = this.player.body.touching.down;
  if (onTheGround) this.canDoubleJump = true;

  if (this.upInputIsActive(5)) {
    if (this.canDoubleJump) this.canVariableJump = true;

    if (this.canDoubleJump || onTheGround) {
      this.player.body.velocity.y = this.JUMP_SPEED;

      if (!onTheGround) this.canDoubleJump = false;
    }
  }

  if (this.canVariableJump && this.upInputIsActive(150)) {
    this.player.body.velocity.y = this.JUMP_SPEED;
  }

  if (!this.upInputIsActive()) {
    this.canVariableJump = false;
  }
};

GameState.prototype.leftInputIsActive = function() {
  var isActive = false;

  isActive = this.input.keyboard.isDown(Phaser.Keyboard.LEFT);
  isActive |= (this.game.input.activePointer.isDown &&
        this.game.input.activePointer.x < this.game.width/4);

  return isActive;
};

GameState.prototype.rightInputIsActive = function() {
  var isActive = false;

  isActive = this.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
  isActive |= (this.game.input.activePointer.isDown  &&
        this.game.input.activePointer.x > this.game.width/2 + this.game.width/4);

  return isActive;
};

GameState.prototype.upInputIsActive = function(duration) {
  var isActive = false;

    isActive = this.input.keyboard.justPressed(Phaser.Keyboard.UP, duration);
    isActive |= (this.game.input.activePointer.justPressed(duration + 1000/60) &&
        this.game.input.activePointer.x > this.game.width/4 &&
        this.game.input.activePointer.x < this.game.width/2 + this.game.width/4);

    return isActive;
};

var game = new Phaser.Game(848, 450, Phaser.AUTO, "game");
game.state.add("game", GameState, true);
