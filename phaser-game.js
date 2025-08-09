/* Open-Road Racer MVP — Phaser 3 (no external assets) */
class RoadScene extends Phaser.Scene {
    constructor() {
      super('road');
      this.lanes = [220, 320, 420]; // x positions for 3 lanes
      this.currentLaneIndex = 1;
      this.speed = 260;            // world scroll speed (px/s)
      this.maxSpeed = 520;
      this.distance = 0;
      this.nitro = { ready: true, active: false, timer: 0, cooldown: 4500, duration: 1200 };
      this.gameOver = false;
      this.dayNight = { t: 0, dir: 1 };
    }
  
    preload() {}
  
    create() {
      const { width, height } = this.scale;
  
      // Generate simple textures
      this.makeTextures();
  
      // Scrolling road
      this.road = this.add.tileSprite(width/2, height/2, 360, height, 'road');
      this.road.setOrigin(0.5, 0.5);
  
      // Lane stripes (visual guides)
      this.laneLines = [
        this.add.tileSprite(270, height/2, 6, height, 'stripe'),
        this.add.tileSprite(370, height/2, 6, height, 'stripe')
      ];
  
      // Player
      this.player = this.physics.add.sprite(this.lanes[this.currentLaneIndex], height - 120, 'car');
      this.player.setDepth(10).setCollideWorldBounds(true);
      this.player.body.setSize(36, 64).setOffset(6, 2);
  
      // Groups
      this.traffic = this.physics.add.group();
      this.checkpoints = this.physics.add.group();
  
      // Colliders
      this.physics.add.overlap(this.player, this.traffic, () => this.crash(), null, this);
      this.physics.add.overlap(this.player, this.checkpoints, (_, cp) => this.collectCheckpoint(cp), null, this);
  
      // UI
      this.scoreText = this.add.text(16, 12, 'DIST 0 | x1.0', { fontFamily: 'monospace', fontSize: 18, color: '#ffffff' }).setScrollFactor(0).setDepth(20);
      this.statusText = this.add.text(16, 36, 'Arrows/A,D to move | Shift for Nitro | R to restart', { fontFamily: 'monospace', fontSize: 14, color: '#c8d6e5' });
  
      // Input
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
      this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  
      // Timers
      this.time.addEvent({ delay: 700, loop: true, callback: () => this.spawnTraffic() });
      this.time.addEvent({ delay: 2000, loop: true, callback: () => this.spawnCheckpoint() });
      this.time.addEvent({ delay: 1200, loop: true, callback: () => this.rampDifficulty() });
  
      // Camera tint (day/night vibe)
      this.tintRect = this.add.rectangle(width/2, height/2, width, height, 0x001133, 0.15).setDepth(15).setBlendMode('MULTIPLY').setScrollFactor(0);
    }
  
    makeTextures() {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
  
      // Road
      g.fillStyle(0x1f2a35, 1).fillRect(0, 0, 360, 720);
      g.lineStyle(6, 0x0b0e13, 1).strokeRect(0, 0, 360, 720);
      g.generateTexture('road', 360, 720);
      g.clear();
  
      // Lane stripe
      g.fillStyle(0xf5f6fa, 1).fillRect(0, 0, 6, 720);
      g.generateTexture('stripe', 6, 720);
      g.clear();
  
      // Player car (simple rounded rect)
      g.fillStyle(0x24c6dc, 1).fillRoundedRect(0, 0, 48, 68, 10);
      // windshield
      g.fillStyle(0x0b0e13, 1).fillRoundedRect(6, 8, 36, 20, 6);
      // tail lights
      g.fillStyle(0xff4d4f, 1).fillRect(8, 60, 12, 6).fillRect(28, 60, 12, 6);
      g.generateTexture('car', 48, 68);
      g.clear();
  
      // Traffic car
      g.fillStyle(0xffc857, 1).fillRoundedRect(0, 0, 48, 68, 10);
      g.fillStyle(0x0b0e13, 1).fillRoundedRect(6, 8, 36, 20, 6);
      g.fillStyle(0x333, 1).fillRect(8, 60, 12, 6).fillRect(28, 60, 12, 6);
      g.generateTexture('traffic', 48, 68);
      g.clear();
  
      // Checkpoint token
      g.fillStyle(0x2ed573, 1).fillCircle(16, 16, 16);
      g.fillStyle(0x0b0e13, 1).fillCircle(16, 16, 8);
      g.generateTexture('checkpoint', 32, 32);
    }
  
    rampDifficulty() {
      if (this.gameOver) return;
      this.speed = Math.min(this.speed + 8, this.maxSpeed);
    }
  
    spawnTraffic() {
      if (this.gameOver) return;
      const lane = Phaser.Utils.Array.GetRandom(this.lanes);
      const car = this.traffic.create(lane, -80, 'traffic');
      car.setVelocityY(this.speed + Phaser.Math.Between(20, 120));
      car.setDepth(5);
      car.body.setSize(36, 64).setOffset(6, 2);
      car.setData('despawn', true);
    }
  
    spawnCheckpoint() {
      if (this.gameOver) return;
      const lane = Phaser.Utils.Array.GetRandom(this.lanes);
      const cp = this.checkpoints.create(lane, -40, 'checkpoint');
      cp.setVelocityY(this.speed * 0.9);
      cp.setDepth(8);
    }
  
    collectCheckpoint(cp) {
      cp.destroy();
      this.distance += 150; // bonus
      this.flashUI('#2ed573');
    }
  
    crash() {
      if (this.gameOver) return;
      this.gameOver = true;
      this.statusText.setText('Crashed! Press R to restart.');
      this.flashUI('#ff4d4f');
      this.physics.world.timeScale = 0.0;
      this.time.delayedCall(50, () => {
        this.physics.world.timeScale = 1.0;
      });
    }
  
    tryLaneChange(dir) {
      const next = Phaser.Math.Clamp(this.currentLaneIndex + dir, 0, this.lanes.length - 1);
      if (next !== this.currentLaneIndex) {
        this.currentLaneIndex = next;
        this.tweens.add({
          targets: this.player,
          x: this.lanes[this.currentLaneIndex],
          duration: 120,
          ease: 'Sine.easeOut'
        });
      }
    }
  
    flashUI(hex) {
      const c = this.add.rectangle(this.scale.width/2, this.scale.height/2, this.scale.width, this.scale.height, Phaser.Display.Color.HexStringToColor(hex).color, 0.12).setDepth(25);
      this.tweens.add({ targets: c, alpha: 0, duration: 220, onComplete: () => c.destroy() });
    }
  
    handleNitro(time, delta) {
      if (this.nitro.active) {
        this.nitro.timer += delta;
        if (this.nitro.timer >= this.nitro.duration) {
          this.nitro.active = false;
          this.nitro.timer = 0;
          this.speed *= 0.7; // fall back a bit after boost
          this.speed = Math.max(this.speed, 220);
        }
      } else if (!this.nitro.ready) {
        this.nitro.timer += delta;
        if (this.nitro.timer >= this.nitro.cooldown) {
          this.nitro.ready = true;
          this.nitro.timer = 0;
          this.flashUI('#24c6dc');
        }
      }
  
      // Trigger
      if (Phaser.Input.Keyboard.JustDown(this.keyShift) && this.nitro.ready && !this.gameOver) {
        this.nitro.active = true;
        this.nitro.ready = false;
        this.nitro.timer = 0;
        this.speed = Math.min(this.speed * 1.45, this.maxSpeed * 1.05);
      }
    }
  
    update(time, delta) {
      if (Phaser.Input.Keyboard.JustDown(this.keyR) && this.gameOver) {
        this.scene.restart();
        return;
      }
      if (this.gameOver) return;
  
      // Controls
      if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keyA)) {
        this.tryLaneChange(-1);
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keyD)) {
        this.tryLaneChange(1);
      }
  
      // Nitro handling
      this.handleNitro(time, delta);
  
      // Scroll visuals
      const scroll = (this.speed / 1000) * delta * 1.2;
      this.road.tilePositionY -= scroll * 1.1;
      this.laneLines.forEach(l => l.tilePositionY -= scroll * 1.1);
  
      // Move entities & cleanup
      this.traffic.children.iterate(c => {
        if (!c) return;
        // clamp to current speed envelope (gives “flow”)
        c.setVelocityY(Math.max(c.body.velocity.y, this.speed * 0.8));
        if (c.y > this.scale.height + 80) c.destroy();
      });
      this.checkpoints.children.iterate(cp => {
        if (!cp) return;
        if (cp.y > this.scale.height + 40) cp.destroy();
      });
  
      // Day/Night tint oscillation
      this.dayNight.t += (delta / 1000) * this.dayNight.dir * 0.12;
      if (this.dayNight.t > 1 || this.dayNight.t < 0) this.dayNight.dir *= -1;
      const alpha = Phaser.Math.Linear(0.05, 0.25, this.dayNight.t);
      this.tintRect.setFillStyle(0x001133, alpha);
  
      // Distance scoring
      this.distance += (this.speed / 1000) * delta * 0.6;
      const mult = this.nitro.active ? 1.2 : 1.0;
      const shown = Math.floor(this.distance * mult);
      const nitroTxt = this.nitro.active ? 'NITRO!' : (this.nitro.ready ? 'Ready' : 'Cooling');
      this.scoreText.setText(`DIST ${shown} | ${nitroTxt}`);
    }
  }
  
  const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 640,
    height: 960,
    backgroundColor: '#0b0e13',
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [RoadScene],
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
  };
  
  window.addEventListener('load', () => {
    new Phaser.Game(config);
  });
  