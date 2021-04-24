export default class gameState extends Phaser.State {
    constructor() {
        super("gameState");
    }

    init(data) {
        //initialize data
        this._LEVEL = data.level;
        this._LEVELS = data.levels;
        this._NEWGAME = data.newGame;
        this.loadingLevel = false;
        //emit event to reset if game over occurs and new game starts, check to see if new game
        if(this._NEWGAME) {
            this.newGameSignal = new Phaser.Signal();
            this.newGameSignal.dispatch();
        }
    }
    
    create() {
        //set smoothing for canvas rendering
        Phaser.Canvas.setSmoothingEnabled(this, false);
        
        //activate physics and plugins
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.plugins.add(Phaser.Plugin.ArcadeSlopes);
    
        // Prefer the minimum Y offset globally
        this.game.slopes.preferY = true;
    
        //set gravity
        this.game.physics.arcade.gravity.y = 1500;
    
        //create tilemap
        this.makeMap();
    
        //parse Tiled object groups
        this.parseObjectGroups();
    
        //add hero
        this.addHero();
    
        //add anims
        this.createAnims();
    
        // Prefer the minimum Y offset globally
        this.game.slopes.preferY = true;
        //set world bounds
        this.game.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels+100);
        this.game.camera.setBoundsToWorld();
    
        
        //start follow
        this.game.camera.follow(this.hero);
        this.game.camera.focusOn(this.hero);
        //reset camera fade once complete
        this.game.camera.onFadeComplete.add(this.resetFade, this);
    
        //initiate keyboard controls
        this.addControls();
    }

    update() {
        //fade out and restart level if sprite falls outside world bounds y
        if (this.hero.body.position.y > this.map.heightInPixels) {
            this.game.camera.fade(0x000000, 2000);
            this.game.state.restart(true, false, { level: this._LEVEL, levels: this._LEVELS, newGame: false });
        }
        //platform collider
        this.game.physics.arcade.collide(this.hero, this.mapLayer);
    
        // run endgame function
        this.game.physics.arcade.overlap(this.hero, this.goal, this.onGoal, null, this);
    
        // run ledge finding function
        this.game.physics.arcade.overlap(this.hero, this.ledgesGroup, this.ledgeHit, null, this);
    
        //run portal function
        this.game.physics.arcade.overlap(this.hero, this.exitsGroup, this.exitStage, null, this);
    
        //run loot get function
        this.game.physics.arcade.overlap(this.hero, this.objectsGroup, this.getLoot, null, this);
    
        // run ledge climbing function
        this.ledgeClimb();
		
		this.hero.body.velocity.x = 0;
		
		var isOnGround = (this.hero.body.blocked.down || this.hero.body.touching.down);
		var isJumping = (!isOnGround && !this.hero.isGrabbing);
    
		//Running anims
		if (this.controls.left.isDown && this.controls.right.isUp && this.controls.down.isUp && this.controls.up.isUp) {
			this.hero.body.velocity.x -= 150;
			this.hero.animations.play('run-left');
		} else if (this.controls.right.isDown && this.controls.left.isUp && this.controls.down.isUp && this.controls.up.isUp) {
			this.hero.body.velocity.x += 150;
			this.hero.animations.play('run-right');
		} 
		
		if(this.runRight.isPlaying && (this.controls.down.isDown || this.controls.up.isDown) || isJumping) {
		   this.runRight.stop(false, true);
		} else if(this.runLeft.isPlaying && (this.controls.down.isDown || this.controls.up.isDown) || isJumping) {
		   this.runLeft.stop(false, true);
		}
    
        //Jumping
        if (this.controls.up.isDown && this.controls.up.justDown && isOnGround) {
            this.hero.body.velocity.y -= 400;
        }
		
		if (isJumping && this.hero.whichDirection == "left" && this.controls.left.isUp && this.controls.right.isUp) {
		this.hero.animations.play('up-left');
		} else if (isJumping && this.hero.whichDirection == "right" && this.controls.left.isUp && this.controls.right.isUp) {
		this.hero.animations.play('up-right');
		}
		
		if(this.upRight.isPlaying && isOnGround) {
		   this.upRight.stop(false, true);
		} else if(this.upLeft.isPlaying && isOnGround) {
		   this.upLeft.stop(false, true);
		}
		
		if(isJumping && this.hero.whichDirection == "left" && this.controls.left.justDown && this.controls.right.isUp) {
			this.hero.animations.play('jump-left');
			this.hero.body.velocity.x -= 200;
		} else if(isJumping && this.hero.whichDirection == "right" && this.controls.right.justDown && this.controls.left.isUp) {
			this.hero.animations.play('jump-right');
			this.hero.body.velocity.x += 200;
		}
    }

    makeMap() {
        this.map = this.game.add.tilemap(this._LEVELS[this._LEVEL]);
    
        //Multi-layer test
        this.tilesets = this.map.tilesets;
        //establish foreground & background tilesets
        for (let i = 0; i < this.tilesets.length; i++) {
            this.map.addTilesetImage(this.tilesets[i].name);
        }
        
        //render tile layers
        this.allLayers = this.map.layers;
        //initialize sorting group and add foregrounds to it
        this.sortGroup = this.game.add.group();
        for (let i = 0; i < this.allLayers.length; i++) {
            if (this.allLayers[i].name.includes('bg')) {
                this.backgroundLayer = this.map.createLayer(this.allLayers[i].name);
                this.backgroundLayer.sendToBack();
            } else if (this.allLayers[i].name.includes('platform-collides')) {
                this.mapLayer = this.map.createLayer(this.allLayers[i].name);
                this.mapLayer.alpha = 0;
            } else if (this.allLayers[i].name.includes('fg')) {
                this.foregroundLayer = this.map.createLayer(this.allLayers[i].name);
                this.sortGroup.add(this.foregroundLayer);
            }
        }
        //set collision with layer
        this.map.setCollisionBetween(1, 38, true, this.mapLayer);
    
        //convert tile layer to work with slopes plugin
        this.game.slopes.convertTilemapLayer(this.mapLayer, 'arcadeslopes');
        // mapLayer.debug = true;
    }
    
    parseObjectGroups() {
        //entry points
        this.entryPoints = this.map.objects.entryPortals;
        this.entrancesGroup = this.game.add.group();
        this.entrancesGroup.enableBody = true;
        this.entrancesGroup.physicsBodyType = Phaser.Physics.ARCADE;
        this.entryPoints.forEach(entryPt => {
            if(entryPt.type === 'levelentry' || entryPt.type === 'entryportal') {
                if (entryPt.width < entryPt.height) {
                    this.entrance = this.game.add.sprite(entryPt.x, entryPt.y, 'portal-v');
                } else if (entryPt.width > entryPt.height) {
                    this.entrance = this.game.add.sprite(entryPt.x, entryPt.y, 'portal-h');
                } else {
                    this.entrance = this.game.add.sprite(entryPt.x, entryPt.y, 'point');
                }
                this.entrance.name = entryPt.name;
                this.entrancesGroup.add(this.entrance);
                this.entrancesGroup.setAll('body.allowGravity', false);
            }
        });
    
        //exit points
        this.exitPoints = this.map.objects.exitPortals;
        this.exitsGroup = this.game.add.group();
        this.exitsGroup.enableBody = true;
        this.exitsGroup.physicsBodyType = Phaser.Physics.ARCADE;
        this.exitPoints.forEach(exitPt => {
            if (exitPt.type === 'goal') {
                this.goal = this.game.add.sprite(exitPt.x, exitPt.y, 'objects', 'house');
                this.goal.name = exitPt.name;
                this.game.physics.arcade.enable(this.goal);
                this.goal.position.y = this.goal.position.y - this.goal.body.height;
                this.goal.body.allowGravity = false;
                this.goal.body.immovable = true;
                this.goal.body.moves = false;
                this.sortGroup.add(this.goal);
            } else if (exitPt.type === 'exitportal') {
                //default cases for nonspecial exits
                if (exitPt.width < exitPt.height) {
                    this.exit = this.game.add.sprite(exitPt.x, exitPt.y, 'portal-v');
                    this.exitsGroup.add(this.exit);
                    this.exit.body.width = exitPt.width;
                    this.exit.body.height = exitPt.height;
                    this.exit.name = exitPt.name;
                } else if (exitPt.width > exitPt.height) {
                    this.exit = this.game.add.sprite(exitPt.x, exitPt.y, 'portal-h');
                    this.exitsGroup.add(this.exit);
                    this.exit.body.width = exitPt.width;
                    this.exit.body.height = exitPt.height;
                    this.exit.name = exitPt.name;
                }
            }
            this.exitsGroup.setAll('body.allowGravity', false);
        });
    
        //ledge points
        this.ledgePoints = this.map.objects.ledgePoints;
        this.ledgesGroup = this.game.add.group();
        this.ledgesGroup.enableBody = true;
        this.ledgesGroup.physicsBodyType = Phaser.Physics.ARCADE;
        this.ledgePoints.forEach(ledgePt => {
            if (ledgePt.type === 'ledge') {
                this.ledge = this.game.add.sprite(ledgePt.x, ledgePt.y, 'point');
                this.ledgesGroup.add(this.ledge);
                this.ledgesGroup.setAll('body.allowGravity', false);
            }
        });
    
        //loot objects
        this.mapObjects = this.map.objects.objects;
        this.objectsGroup = this.game.add.group();
        this.objectsGroup.enableBody = true;
        this.objectsGroup.physicsBodyType = Phaser.Physics.ARCADE;
        this.mapObjects.forEach(objectPt => {
            if (objectPt.type === 'loot') {
                this.map.createFromObjects('objects', objectPt.gid, 'objects', objectPt.name, true, false, this.objectsGroup);
                this.objectsGroup.setAll('body.allowGravity', false);
            }
        });
    }
    
    addHero() {
        //load sprite at entry point object in map data
        //iterate over available entrances
        this.entrancesGroup.forEach(entrance => {
            if (this._NEWGAME && this._LEVEL === 1) {
                //if newGame = true and loaded level is lvl1, load character at lvl1 starting pt
                if (entrance.name === 'stage1entry') { //change back to stage1entry after testing
                    this.hero = this.game.add.sprite(entrance.x, entrance.y, 'compiled-hero', 'idle-right-00-1.3');
                }
            } else if (!this._NEWGAME && this._LEVEL === 1) {
                if (entrance.name === 'portalfromcave') {
                    //if returning from cave, load sprite at return pt
                    this.hero = this.game.add.sprite(entrance.x, entrance.y, 'compiled-hero', 'idle-right-00-1.3');
                }
            } else { //otherwise, use whatever coordinates come back when function runs
                this.hero = this.game.add.sprite(entrance.x, entrance.y, 'compiled-hero', 'idle-right-00-1.3');
            }
        });
        
        //add hero to sorting group
        this.sortGroup.add(this.hero);
        this.sortGroup.sendToBack(this.hero);
        if (this._LEVEL === 4) {
            this.sortGroup.sendToBack(this.goal);
        }
    
        this.game.physics.arcade.enable(this.hero);
        this.hero.body.bounce.y = 0.3;
        this.hero.body.collideWorldBounds = true;
        this.hero.body.setSize(this.hero.body.halfWidth-10, this.hero.body.height-5, 18, 3);
		
        //enable hero for slopes
        this.game.slopes.enable(this.hero);
        // Prefer the minimum Y offset for this physics body
        this.hero.body.slopes.preferY = true;
        // Pull the player into downwards collisions with a velocity of 50
        this.hero.body.slopes.pullDown = 50;
    
        //set custom property to handle which direction the sprite is facing, default 'right'
        this.hero.whichDirection = 'right';
        //set custom property to handle whether player is grabbing a ledge at the moment, default 'no'
        this.hero.isGrabbing = false;
    }
    
    createAnims() {
        //Hero anims
        //idle
        this.idleRight = this.hero.animations.add('idle-right', Phaser.Animation.generateFrameNames('idle-right-', 0, 3, '-1.3', 2), 2, true, false);
        this.idleLeft = this.hero.animations.add('idle-left', Phaser.Animation.generateFrameNames('idle-left-', 0, 3, '-1.3', 2), 2, true, false);
    
        //run
        this.runRight = this.hero.animations.add('run-right', Phaser.Animation.generateFrameNames('run-right-', 0, 5, '-1.3', 2), 10, true, false);
        this.runLeft = this.hero.animations.add('run-left', Phaser.Animation.generateFrameNames('run-left-', 0, 5, '-1.3', 2), 10, true, false);
    
        //jump
        this.jumpRight = this.hero.animations.add('jump-right', Phaser.Animation.generateFrameNames('jump-right-', 0, 5, '-1.3', 2), 10, false, false);
        this.jumpLeft = this.hero.animations.add('jump-left', Phaser.Animation.generateFrameNames('jump-left-', 0, 5, '-1.3', 2), 10, false, false);
		
		//static jump
		this.upRight = this.hero.animations.add('up-right', Phaser.Animation.generateFrameNames('crnr-jmp-right-', 0, 1, '-1.3', 2), 10, true, false);
		this.upLeft = this.hero.animations.add('up-left', Phaser.Animation.generateFrameNames('crnr-jmp-left-', 0, 1, '-1.3', 2), 10, true, false);
    
        //grab
        this.grabLeft = this.hero.animations.add('grab-left', Phaser.Animation.generateFrameNames('crnr-grb-left-', 0, 3, '-1.3', 2), 3, true, false);
        this.grabRight = this.hero.animations.add('grab-right', Phaser.Animation.generateFrameNames('crnr-grb-right-', 0, 3, '-1.3', 2), 3, true, false);
    
        //climb
        this.climbLeft = this.hero.animations.add('climb-left', Phaser.Animation.generateFrameNames('crnr-clmb-left-', 0, 4, '-1.3', 2), 10, false, false);
        this.climbRight = this.hero.animations.add('climb-right', Phaser.Animation.generateFrameNames('crnr-clmb-right-', 0, 4, '-1.3', 2), 10, false, false);
    
        //animations settings
        this.jumpRight.onComplete.add(function() { this.hero.animations.play('idle-right'); }, this);
        this.jumpLeft.onComplete.add(function() { this.hero.animations.play('idle-left'); }, this);
		
        this.upRight.onComplete.add(function() { this.hero.animations.play('idle-right'); }, this);
        this.upLeft.onComplete.add(function() { this.hero.animations.play('idle-left'); }, this);
    
        this.grabLeft.onStart.add(function() { this.hero.body.immovable = true; this.hero.body.moves = false; this.hero.isGrabbing = true; }, this);
        this.grabRight.onStart.add(function() { this.hero.body.immovable = true; this.hero.body.moves = false; this.hero.isGrabbing = true; }, this);
    
        this.climbLeft.onStart.add(function() { 
            this.hero.body.enable = false;
            for (let index = 0; index < 18; index++) {
                this.hero.position.y--;
            }
        }, this);
        this.climbRight.onStart.add(function() { 
            this.hero.body.enable = false;
            for (let index = 0; index < 18; index++) {
                this.hero.position.y--;
            }
        }, this);
    
        this.climbLeft.onComplete.add(function() { this.hero.position.x-=10; this.hero.body.enable = true; this.hero.body.immovable = false; this.hero.body.moves = true; this.hero.animations.play('idle-left'); this.hero.isGrabbing = false; }, this);
        this.climbRight.onComplete.add(function() { this.hero.position.x+=10; this.hero.body.enable = true; this.hero.body.immovable = false; this.hero.body.moves = true; this.hero.animations.play('idle-right'); this.hero.isGrabbing = false; }, this);
    
        //play 'idle-right' by default
        this.hero.animations.play('idle-right');
    }
    
    addControls() {
        //initiate cursor keys
        this.controls = this.game.input.keyboard.createCursorKeys();
        //add special controls for grab and climb
        this.grabKey = this.game.input.keyboard.addKey(71); //'G'
        this.climbKey = this.game.input.keyboard.addKey(67); //'C'
    
        this.game.input.keyboard.addKeyCapture([37, 38, 39, 40 ]);
    
        //anim-specific settings
        this.controls.left.onUp.add(function() { this.hero.animations.play('idle-left'); }, this);
        this.controls.right.onUp.add(function() { this.hero.animations.play('idle-right'); }, this);
    
        this.controls.left.onDown.add(function() { this.hero.whichDirection = 'left' }, this);
        this.controls.right.onDown.add(function() { this.hero.whichDirection = 'right' }, this);
		
        //let go of ledge & reset isGrabbing if cursor keys pressed
        this.controls.left.onDown.add(function() {
            if (this.hero.body.immovable == true && this.hero.body.moves == false && this.hero.isGrabbing) {
                this.hero.body.immovable = false; 
                this.hero.body.moves = true;
                this.hero.isGrabbing = false;
            }
        }, this);
        this.controls.right.onDown.add(function() {
            if (this.hero.body.immovable == true && this.hero.body.moves == false && this.hero.isGrabbing) {
                this.hero.body.immovable = false; 
                this.hero.body.moves = true;
                this.hero.isGrabbing = false;
            }
        }, this);
    }
    
    onGoal(hero, goal) {
        this.game.camera.fade(0x000000, 2000);
        this.game.camera.onFadeComplete.add(()=>{
            //launch end cutscene
            var data = {level: 5, newGame: false, levels: this._LEVELS}
            this.game.state.start('NPC', true, false, data);
        }, this);
    }
    
    getLoot(hero, loot) {
        loot.destroy();
        var gotLootSignal = new Phaser.Signal();
        gotLootSignal.dispatch();
    }
    
    ledgeHit(hero, ledge) {
        //check difference between ledge coords and hero.left vs hero.right to determine which side ledge is on
        //coords match: sprite left & ledge right, sprite right & ledge left
        var heroLeft = hero.body.left;
        var heroRight = hero.body.right;
    
        var ledgeLeft = ledge.left;
        var ledgeRight = ledge.right;
    
        var diffLeft = this.game.math.difference(heroLeft, ledgeRight);
        var diffRight = this.game.math.difference(heroRight, ledgeLeft);
        
        // check if diff fits margin
        if (diffLeft < 10 && this.grabKey.isDown) {
            hero.animations.play('grab-left');
            hero.alignIn(ledge, Phaser.TOP_LEFT, 15, 5); //offset accounts for sprite bounding box
            hero.body.position.setTo(ledge.body.center.x, ledge.body.center.y);
        }
        if (diffRight < 10 && this.grabKey.isDown) {
            hero.animations.play('grab-right');
            hero.alignIn(ledge, Phaser.TOP_RIGHT, 15, 5); //offset accounts for sprite bounding box
            hero.body.position.setTo(ledge.body.center.x, ledge.body.center.y);
        }
    }
    
    ledgeClimb() {
        if (this.climbKey.isDown && this.hero.whichDirection == 'left' && this.hero.isGrabbing) {
            this.hero.animations.play('climb-left');
        }
        if (this.climbKey.isDown && this.hero.whichDirection == 'right' && this.hero.isGrabbing) {
            this.hero.animations.play('climb-right');
        }
    }
    
    exitStage(hero, portal) {
        if (portal.name === 'portaltocave') {
            this.game.state.restart(true, false, { level: 2, levels: this._LEVELS, newGame: false });
        } else if (portal.name === 'portaltotree') {
            this.game.state.restart(true, false, { level: 3, levels: this._LEVELS, newGame: false });
        } else if (portal.name === 'portaltocottage') {
            this.game.state.restart(true, false, { level: 4, levels: this._LEVELS, newGame: false });
        } else if (portal.name === 'portaltobridge') {
            this.game.state.restart(true, false, { level: 1, levels: this._LEVELS, newGame: false });
        }
    }
    
    resetFade() {
        this.game.camera.resetFX();
    }
    
}