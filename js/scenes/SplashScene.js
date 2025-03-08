class SplashScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SplashScene' });
    }

    preload() {
        // Load splash screen assets
        this.load.image('logo', 'assets/images/logo.png');
        this.load.image('startButton', 'assets/images/start-button.png');
        this.load.image('backgroundPattern', 'assets/images/background-pattern.png');
        
        // Audio
        this.load.audio('buttonSound', 'assets/audio/button-click.mp3');
        this.load.audio('titleMusic', 'assets/audio/title-music.mp3');
    }

    create() {
        // Add background pattern
        const background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'backgroundPattern');
        background.setOrigin(0, 0);
        
        // Add animated background elements (office items)
        this.createBackgroundElements();
        
        // Add game logo
        const logo = this.add.image(this.cameras.main.width / 2, 150, 'logo');
        logo.setScale(0.8);
        
        // Add tagline
        const tagline = this.add.text(
            this.cameras.main.width / 2, 
            220, 
            'Turn the Tables on Management!', 
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        tagline.setOrigin(0.5);
        
        // Start button
        const startButton = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 80,
            'startButton'
        );
        startButton.setScale(0.6);
        startButton.setInteractive({ useHandCursor: true });
        
        // Add pulse animation to start button
        this.tweens.add({
            targets: startButton,
            scale: 0.65,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Start button event
        startButton.on('pointerdown', () => {
            // Play button sound
            this.sound.play('buttonSound');
            
            // Move to the input scene
            this.scene.start('InputScene');
        });
        
        // Check for saved game
        if (hasSavedGame()) {
            // Add continue button
            const continueButton = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 150,
                'Continue Previous Game',
                {
                    fontFamily: 'Arial',
                    fontSize: '18px',
                    color: '#ffffff',
                    backgroundColor: '#008800',
                    padding: {
                        left: 15,
                        right: 15,
                        top: 10,
                        bottom: 10
                    }
                }
            );
            continueButton.setOrigin(0.5);
            continueButton.setInteractive({ useHandCursor: true });
            
            continueButton.on('pointerdown', () => {
                // Play button sound
                this.sound.play('buttonSound');
                
                // Load saved game
                initializeStorage();
                
                // Determine which stage to start
                const gameSettings = getGameState();
                
                // Start the appropriate stage
                switch (gameSettings.currentStage) {
                    case 1:
                        this.scene.start('StageOneScene');
                        break;
                    case 2:
                        this.scene.start('StageTwoScene');
                        break;
                    case 3:
                        this.scene.start('StageThreeScene');
                        break;
                    default:
                        // If no valid stage, go to input
                        this.scene.start('InputScene');
                }
            });
        }
        
        // Play background music
        if (!this.sound.get('titleMusic')) {
            const music = this.sound.add('titleMusic', {
                volume: 0.5,
                loop: true
            });
            music.play();
        }
    }
    
    createBackgroundElements() {
        // Add some office-themed elements floating in the background
        const elements = [
            { key: 'coffee', x: 100, y: 500, speed: 0.5 },
            { key: 'document', x: 700, y: 300, speed: 0.7 },
            { key: 'stapler', x: 200, y: 400, speed: 0.3 },
            { key: 'pencil', x: 600, y: 150, speed: 0.6 }
        ];
        
        // Simulate these elements with simple shapes for now
        // In a full implementation, you'd replace these with actual sprites
        elements.forEach(element => {
            // Create a simple shape
            const graphics = this.add.graphics();
            graphics.fillStyle(0xffffff, 0.3);
            
            // Different shapes for different items
            switch(element.key) {
                case 'coffee':
                    graphics.fillCircle(0, 0, 20);
                    break;
                case 'document':
                    graphics.fillRect(-15, -20, 30, 40);
                    break;
                case 'stapler':
                    graphics.fillRect(-25, -10, 50, 20);
                    break;
                case 'pencil':
                    graphics.fillRect(-5, -30, 10, 60);
                    break;
            }
            
            // Position the element
            graphics.x = element.x;
            graphics.y = element.y;
            
            // Add floating animation
            this.tweens.add({
                targets: graphics,
                y: graphics.y - 50,
                duration: 2000 / element.speed,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Add slight rotation
            this.tweens.add({
                targets: graphics,
                angle: 10,
                duration: 3000 / element.speed,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }
}
