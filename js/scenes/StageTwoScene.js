class StageTwoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StageTwoScene' });
        
        // Game state
        this.score = 0;
        this.timeLeft = 0;
        this.gameOver = false;
        this.player = null;
        this.boss = null;
        this.coffeeOrders = [];
        this.coffeeCount = 0;
        this.coworkers = [];
        this.obstacles = [];
        this.cursors = null;
        this.deliveredCoffees = 0;
    }

    preload() {
        // Load game assets
        this.load.image('officeTiles', 'assets/images/office-tiles.png');
        this.load.image('playerChar', 'assets/images/player-character.png');
        this.load.image('coworker', 'assets/images/coworker.png');
        this.load.image('coffee', 'assets/images/coffee-cup.png');
        this.load.image('coffeeStation', 'assets/images/coffee-machine.png');
        this.load.image('desk', 'assets/images/desk.png');
        this.load.image('plant', 'assets/images/office-plant.png');
        this.load.image('copier', 'assets/images/copier.png');
        
        // Load boss texture if available
        const bossImage = this.game.registry.get('bossImage');
        if (bossImage) {
            const img = new Image();
            img.src = bossImage;
            img.onload = () => {
                this.textures.addImage('bossTexture', img);
            };
        }
        
        // Load sounds
        this.load.audio('coffeePickup', 'assets/audio/coffee-pickup.mp3');
        this.load.audio('coffeeDeliver', 'assets/audio/coffee-deliver.mp3');
        this.load.audio('caught', 'assets/audio/caught.mp3');
        this.load.audio('gameOverSound', 'assets/audio/game-over.mp3');
        this.load.audio('stageMusic', 'assets/audio/stage2-music.mp3');
    }

    create() {
        // Get game settings
        const gameSettings = getGameState();
        this.timeLeft = gameSettings.stageTwoSettings.gameDuration;
        this.coffeeCount = gameSettings.stageTwoSettings.coffeeOrders;
        
        // Setup office floor
        this.createOffice();
        
        // Create player
        this.createPlayer();
        
        // Create boss
        this.createBoss();
        
        // Create coworkers
        this.createCoworkers();
        
        // Create coffee station
        this.createCoffeeStation();
        
        // Create office obstacles
        this.createObstacles();
        
        // Setup input
        this.setupInput();
        
        // Create UI elements
        this.createUI();
        
        // Create coffee orders
        this.createCoffeeOrders();
        
        // Start game timer
        this.startGameTimer();
        
        // Play background music
        this.playBackgroundMusic();
        
        // Setup collisions
        this.setupCollisions();
    }
    
    update() {
        if (this.gameOver) return;
        
        // Update player movement
        this.updatePlayerMovement();
        
        // Update boss movement
        this.updateBossMovement();
        
        // Check for coffee pickups
        this.checkCoffeePickup();
        
        // Check for coffee deliveries
        this.checkCoffeeDelivery();
    }
    
    createOffice() {
        // Create simple office floor
        const floorBg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xeeeeee);
        floorBg.setOrigin(0, 0);
        
        // Add floor pattern
        for (let x = 0; x < this.cameras.main.width; x += 64) {
            for (let y = 0; y < this.cameras.main.height; y += 64) {
                // Add subtle tile pattern
                this.add.rectangle(x, y, 64, 64, 0xdddddd, 0.3).setOrigin(0, 0).setStrokeStyle(1, 0xcccccc, 0.5);
            }
        }
    }
    
    createPlayer() {
        // Create player sprite
        this.player = this.physics.add.sprite(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            'playerChar'
        );
        this.player.setScale(0.6);
        
        // Add player properties
        this.player.speed = getGameState().stageTwoSettings.playerSpeed;
        this.player.hasCoffee = false;
        this.player.coffeeSprite = null;
        
        // Set collision box
        this.player.body.setSize(32, 32);
    }
    
    createBoss() {
        // Create boss sprite using the uploaded or default image
        this.boss = this.physics.add.sprite(
            100, 
            100, 
            this.textures.exists('bossTexture') ? 'bossTexture' : 'defaultBoss1'
        );
        this.boss.setScale(0.4);
        
        // Set boss properties
        this.boss.speed = getGameState().stageTwoSettings.bossSpeed;
        this.boss.patrol = true;
        this.boss.patrolDirection = new Phaser.Math.Vector2(1, 0);
        this.boss.patrolDistance = 200;
        this.boss.startPosition = new Phaser.Math.Vector2(this.boss.x, this.boss.y);
        
        // Set collision box
        this.boss.body.setSize(40, 40);
    }
    
    createCoworkers() {
        // Create coworker group
        this.coworkerGroup = this.physics.add.group();
        
        // Create coworkers at desks
        const deskPositions = [
            { x: 150, y: 200 },
            { x: 400, y: 200 },
            { x: 650, y: 200 },
            { x: 150, y: 350 },
            { x: 400, y: 350 },
            { x: 650, y: 350 }
        ];
        
        deskPositions.forEach((pos, index) => {
            // Create desk
            const desk = this.physics.add.image(pos.x, pos.y, 'desk');
            desk.setScale(0.5);
            desk.setImmovable(true);
            
            // Add to obstacles
            this.obstacles.push(desk);
            
            // Create coworker
            if (index < this.coffeeCount) {
                const coworker = this.physics.add.sprite(pos.x, pos.y - 30, 'coworker');
                coworker.setScale(0.4);
                coworker.needsCoffee = true;
                coworker.deskPosition = pos;
                coworker.body.setImmovable(true);
                
                // Add to coworker group
                this.coworkerGroup.add(coworker);
                this.coworkers.push(coworker);
                
                // Add "needs coffee" indicator
                const coffeeIndicator = this.add.image(pos.x + 30, pos.y - 40, 'coffee');
                coffeeIndicator.setScale(0.3);
                coffeeIndicator.setAlpha(0.6);
                coworker.coffeeIndicator = coffeeIndicator;
                
                // Add animation to indicator
                this.tweens.add({
                    targets: coffeeIndicator,
                    y: coffeeIndicator.y - 10,
                    alpha: 1,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });
            }
        });
    }
    
    createCoffeeStation() {
        // Create coffee machine
        this.coffeeStation = this.physics.add.image(
            this.cameras.main.width - 100,
            this.cameras.main.height - 100,
            'coffeeStation'
        );
        this.coffeeStation.setScale(0.6);
        this.coffeeStation.body.setImmovable(true);
        
        // Add to obstacles
        this.obstacles.push(this.coffeeStation);
        
        // Add coffee machine indicator
        const stationLabel = this.add.text(
            this.coffeeStation.x,
            this.coffeeStation.y - 40,
            'Coffee',
            {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#000000',
                backgroundColor: '#ffffff',
                padding: {
                    left: 5,
                    right: 5,
                    top: 3,
                    bottom: 3
                }
            }
        );
        stationLabel.setOrigin(0.5);
    }
    
    createObstacles() {
        // Create obstacle group
        this.obstacleGroup = this.physics.add.group({
            immovable: true
        });
        
        // Add some plants and copiers as obstacles
        const obstaclePositions = [
            { x: 100, y: 100, type: 'plant' },
            { x: 700, y: 100, type: 'plant' },
            { x: 300, y: 450, type: 'copier' },
            { x: 500, y: 450, type: 'plant' }
        ];
        
        obstaclePositions.forEach(pos => {
            const obstacle = this.physics.add.image(pos.x, pos.y, pos.type);
            obstacle.setScale(0.5);
            obstacle.setImmovable(true);
            
            // Add to groups
            this.obstacleGroup.add(obstacle);
            this.obstacles.push(obstacle);
        });
    }
    
    setupInput() {
        // Create cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();
    }
    
    createUI() {
        // Score display
        this.scoreText = this.add.text(
            20, 
            20, 
            'Coffees: 0/' + this.coffeeCount, 
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#000000'
            }
        );
        
        // Timer display
        this.timeText = this.add.text(
            this.cameras.main.width - 150, 
            20, 
            `Time: ${this.timeLeft}`, 
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#000000'
            }
        );
        
        // Stage title
        this.stageTitle = this.add.text(
            this.cameras.main.width / 2, 
            20, 
            'Stage 2: Coffee Run Chaos', 
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#000000'
            }
        );
        this.stageTitle.setOrigin(0.5, 0);
        
        // Instructions (hidden after a few seconds)
        this.instructions = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            'Deliver coffee to coworkers while avoiding your boss!',
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: {
                    left: 15,
                    right: 15,
                    top: 10,
                    bottom: 10
                }
            }
        );
        this.instructions.setOrigin(0.5);
        
        // Hide instructions after 5 seconds
        this.time.delayedCall(5000, () => {
            this.instructions.setVisible(false);
        });
        
        // Coffee status indicator
        this.coffeeStatus = this.add.text(
            20,
            60,
            'No coffee',
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#000000'
            }
        );
    }
    
    createCoffeeOrders() {
        // No additional setup needed as coworkers were already created
    }
    
    startGameTimer() {
        // Start countdown timer
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }
    
    updateTimer() {
        // Reduce time remaining
        this.timeLeft--;
        
        // Update timer display
        this.timeText.setText(`Time: ${this.timeLeft}`);
        
        // Check if time's up
        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }
    
    updatePlayerMovement() {
        // Reset velocity
        this.player.body.setVelocity(0);
        
        // Handle horizontal movement
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-this.player.speed);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(this.player.speed);
            this.player.setFlipX(false);
        }
        
        // Handle vertical movement
        if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-this.player.speed);
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(this.player.speed);
        }
        
        // Normalize velocity for diagonal movement
        this.player.body.velocity.normalize().scale(this.player.speed);
        
        // Update coffee position if player has coffee
        if (this.player.hasCoffee && this.player.coffeeSprite) {
            this.player.coffeeSprite.x = this.player.x + 15;
            this.player.coffeeSprite.y = this.player.y - 15;
        }
    }
    
    updateBossMovement() {
        if (this.boss.patrol) {
            // Move boss along patrol path
            this.boss.x += this.boss.patrolDirection.x * this.boss.speed * (1/60);
            this.boss.y += this.boss.patrolDirection.y * this.boss.speed * (1/60);
            
            // Check if boss has reached end of patrol
            const distanceFromStart = Phaser.Math.Distance.Between(
                this.boss.startPosition.x,
                this.boss.startPosition.y,
                this.boss.x,
                this.boss.y
            );
            
            if (distanceFromStart >= this.boss.patrolDistance) {
                // Reverse direction
                this.boss.patrolDirection.x *= -1;
                this.boss.patrolDirection.y *= -1;
                
                // Update start position
                this.boss.startPosition.x = this.boss.x;
                this.boss.startPosition.y = this.boss.y;
                
                // Flip boss sprite if moving horizontally
                if (this.boss.patrolDirection.x !== 0) {
                    this.boss.setFlipX(!this.boss.flipX);
                }
            }
        } else {
            // If boss has spotted player, chase them
            const angle = Phaser.Math.Angle.Between(
                this.boss.x,
                this.boss.y,
                this.player.x,
                this.player.y
            );
            
            // Calculate velocity based on angle
            this.boss.body.setVelocity(
                Math.cos(angle) * this.boss.speed * 1.2,
                Math.sin(angle) * this.boss.speed * 1.2
            );
            
            // Flip boss sprite based on direction
            if (this.boss.body.velocity.x < 0) {
                this.boss.setFlipX(true);
            } else {
                this.boss.setFlipX(false);
            }
        }
        
        // Check if boss can see player
        const distanceToBoss = Phaser.Math.Distance.Between(
            this.boss.x,
            this.boss.y,
            this.player.x,
            this.player.y
        );
        
        if (distanceToBoss < 150) {
            // Boss can see player, start chasing
            this.boss.patrol = false;
            
            // Show alert indicator above boss
            if (!this.boss.alertIndicator) {
                this.boss.alertIndicator = this.add.text(
                    this.boss.x,
                    this.boss.y - 40,
                    '!',
                    {
                        fontFamily: 'Arial',
                        fontSize: '32px',
                        fontStyle: 'bold',
                        color: '#ff0000'
                    }
                );
                this.boss.alertIndicator.setOrigin(0.5);
                
                // Add animation to alert
                this.tweens.add({
                    targets: this.boss.alertIndicator,
                    scale: 1.5,
                    duration: 300,
                    yoyo: true,
                    repeat: -1
                });
            }
            
            // Update alert position
            if (this.boss.alertIndicator) {
                this.boss.alertIndicator.x = this.boss.x;
                this.boss.alertIndicator.y = this.boss.y - 40;
            }
        } else if (distanceToBoss > 300) {
            // Player is far away, go back to patrolling
            this.boss.patrol = true;
            
            // Remove alert indicator
            if (this.boss.alertIndicator) {
                this.boss.alertIndicator.destroy();
                this.boss.alertIndicator = null;
            }
        }
    }
    
    checkCoffeePickup() {
        // Check if player is at coffee station and doesn't have coffee
        if (!this.player.hasCoffee) {
            const distanceToCoffee = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                this.coffeeStation.x,
                this.coffeeStation.y
            );
            
            if (distanceToCoffee < 80) {
                // Player is at coffee station, give them coffee
                this.player.hasCoffee = true;
                
                // Create coffee sprite
                this.player.coffeeSprite = this.add.image(
                    this.player.x + 15,
                    this.player.y - 15,
                    'coffee'
                );
                this.player.coffeeSprite.setScale(0.3);
                
                // Update status
                this.coffeeStatus.setText('Has coffee');
                
                // Play pickup sound
                this.sound.play('coffeePickup');
            }
        }
    }
    
    checkCoffeeDelivery() {
        // Check if player has coffee and is near a coworker
        if (this.player.hasCoffee) {
            this.coworkers.forEach(coworker => {
                if (coworker.needsCoffee) {
                    const distanceToCoworker = Phaser.Math.Distance.Between(
                        this.player.x,
                        this.player.y,
                        coworker.x,
                        coworker.y
                    );
                    
                    if (distanceToCoworker < 80) {
                        // Deliver coffee to coworker
                        this.deliverCoffee(coworker);
                    }
                }
            });
        }
    }
    
    deliverCoffee(coworker) {
        // Mark coffee as delivered
        coworker.needsCoffee = false;
        
        // Remove coffee indicator
        if (coworker.coffeeIndicator) {
            coworker.coffeeIndicator.destroy();
        }
        
        // Add delivered coffee to coworker
        const deliveredCoffee = this.add.image(
            coworker.x + 15,
            coworker.y - 10,
            'coffee'
        );
        deliveredCoffee.setScale(0.25);
        
        // Remove coffee from player
        this.player.hasCoffee = false;
        if (this.player.coffeeSprite) {
            this.player.coffeeSprite.destroy();
        }
        
        // Update status
        this.coffeeStatus.setText('No coffee');
        
        // Increment score
        this.deliveredCoffees++;
        this.scoreText.setText(`Coffees: ${this.deliveredCoffees}/${this.coffeeCount}`);
        
        // Play delivery sound
        this.sound.play('coffeeDeliver');
        
        // Show feedback
        const feedbackText = this.add.text(
            coworker.x,
            coworker.y - 50,
            'Thanks!',
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#4CAF50'
            }
        );
        feedbackText.setOrigin(0.5);
        
        // Animate and remove feedback
        this.tweens.add({
            targets: feedbackText,
            y: feedbackText.y - 30,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                feedbackText.destroy();
            }
        });
        
        // Check if all coffees have been delivered
        if (this.deliveredCoffees >= this.coffeeCount) {
            this.winGame();
        }
    }
    
    setupCollisions() {
        // Add collisions between player and obstacles
        this.physics.add.collider(this.player, this.obstacleGroup);
        this.physics.add.collider(this.player, this.coffeeStation);
        this.physics.add.collider(this.player, this.coworkerGroup);
        
        // Add collision with boss
        this.physics.add.overlap(
            this.player,
            this.boss,
            this.handleBossCollision,
            null,
            this
        );
        
        // Add collisions for boss
        this.physics.add.collider(this.boss, this.obstacleGroup);
        this.physics.add.collider(this.boss, this.coffeeStation);
    }
    
    handleBossCollision() {
        if (this.gameOver) return;
        
        // Player got caught by boss
        this.sound.play('caught');
        
        // Pause game momentarily
        this.physics.pause();
        
        // Flash player
        this.tweens.add({
            targets: this.player,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                // Resume physics
                this.physics.resume();
                
                // Player loses coffee if they had it
                if (this.player.hasCoffee) {
                    this.player.hasCoffee = false;
                    
                    if (this.player.coffeeSprite) {
                        this.player.coffeeSprite.destroy();
                    }
                    
                    // Update status
                    this.coffeeStatus.setText('No coffee');
                    
                    // Show feedback
                    const feedbackText = this.add.text(
                        this.player.x,
                        this.player.y - 50,
                        'Coffee Spilled!',
                        {
                            fontFamily: 'Arial',
                            fontSize: '18px',
                            color: '#F44336'
                        }
                    );
                    feedbackText.setOrigin(0.5);
                    
                    // Animate and remove feedback
                    this.tweens.add({
                        targets: feedbackText,
                        y: feedbackText.y - 30,
                        alpha: 0,
                        duration: 1500,
                        onComplete: () => {
                            feedbackText.destroy();
                        }
                    });
                }
                
                // Move boss away
                this.boss.patrol = true;
            }
        });
    }
    
    winGame() {
        if (this.gameOver) return;
        
        // Set game over flag
        this.gameOver = true;
        
        // Stop timers
        this.timerEvent.remove();
        
        // Display win message
        this.showGameResults(true);
    }
    
    endGame() {
        if (this.gameOver) return;
        
        // Set game over flag
        this.gameOver = true;
        
        // Stop timers
        this.timerEvent.remove();
        
        // Play game over sound
        this.sound.play('gameOverSound');
        
        // Display results
        this.showGameResults(false);
    }
    
    showGameResults(success) {
        // Create results panel
        const resultsBg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            400,
            300,
            0x000000,
            0.8
        );
        
        const resultsTitle = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 100,
            success ? 'Stage Complete!' : 'Stage Failed!',
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                fontStyle: 'bold',
                color: success ? '#4CAF50' : '#F44336'
            }
        );
        resultsTitle.setOrigin(0.5);
        
        const deliveryText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 30,
            `Coffees Delivered: ${this.deliveredCoffees}/${this.coffeeCount}`,
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff'
            }
        );
        deliveryText.setOrigin(0.5);
        
        // Calculate score based on deliveries and time
        const score = this.deliveredCoffees * 100 + (success ? this.timeLeft * 10 : 0);
        
        const scoreText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 10,
            `Score: ${score}`,
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff'
            }
        );
        scoreText.setOrigin(0.5);
        
        // Add button to continue
        const continueButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 80,
            success ? 'Continue to Next Stage' : 'Try Again',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                fontStyle: 'bold',
                backgroundColor: success ? '#4CAF50' : '#2196F3',
                padding: {
                    left: 20,
                    right: 20,
                    top: 10,
                    bottom: 10
                }
            }
        );
        continueButton.setOrigin(0.5);
        continueButton.setInteractive({ useHandCursor: true });
        
        continueButton.on('pointerdown', () => {
            // Update game state
            if (success) {
                // Go to next stage
                updateGameState({
                    currentStage: 3,
                    totalScore: getGameState().totalScore + score
                });
                
                // Save progress
                saveGameProgress();
                
                // Start next stage
                this.scene.start('StageThreeScene');
            } else {
                // Retry this stage
                this.scene.restart();
            }
        });
    }
    
    playBackgroundMusic() {
        // Play background music
        if (!this.sound.get('stageMusic')) {
            const music = this.sound.add('stageMusic', {
                volume: 0.3,
                loop: true
            });
            music.play();
        }
    }
}
