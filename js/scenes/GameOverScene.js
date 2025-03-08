class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    preload() {
        // Load victory/ending assets
        this.load.image('confetti', 'assets/images/confetti.png');
        this.load.image('trophy', 'assets/images/trophy.png');
        this.load.audio('victoryMusic', 'assets/audio/victory-music.mp3');
    }

    create() {
        // Get game settings and final score
        const gameSettings = getGameState();
        const playerName = gameSettings.playerName || 'Player';
        const bossName = gameSettings.bossName || 'Boss';
        const totalScore = gameSettings.totalScore || 0;
        
        // Set background
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x333333).setOrigin(0, 0);
        
        // Create confetti particles
        this.createConfetti();
        
        // Trophy image
        const trophy = this.add.image(this.cameras.main.width / 2, 180, 'trophy');
        trophy.setScale(0.6);
        
        // Add golden glow to trophy
        const glowFx = trophy.preFX.addGlow(0xffcc00, 16, 0, false, 0.1, 16);
        
        // Animate trophy
        this.tweens.add({
            targets: trophy,
            y: 160,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.tweens.add({
            targets: glowFx,
            outerStrength: 4,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Create title text
        const titleText = this.add.text(
            this.cameras.main.width / 2,
            80,
            'Congratulations! You Beat the Boss!',
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                fontStyle: 'bold',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 6
            }
        );
        titleText.setOrigin(0.5);
        
        // Create results container
        const resultsContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2 + 20);
        
        // Results background
        const resultsBg = this.add.rectangle(0, 0, 500, 200, 0x000000, 0.7);
        resultsBg.setStrokeStyle(2, 0xffffff);
        
        // Results text
        const victoryText = this.add.text(
            0,
            -70,
            `${playerName} has successfully challenged ${bossName}!`,
            {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff',
                align: 'center'
            }
        );
        victoryText.setOrigin(0.5);
        
        const scoreText = this.add.text(
            0,
            -20,
            `Final Score: ${totalScore}`,
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#4CAF50'
            }
        );
        scoreText.setOrigin(0.5);
        
        // Add encouragement based on score
        let encouragement = '';
        if (totalScore > 5000) {
            encouragement = 'Incredible! You're a true boss challenger!';
        } else if (totalScore > 3000) {
            encouragement = 'Well done! You handled that boss perfectly!';
        } else if (totalScore > 1000) {
            encouragement = 'Good job! You showed that boss who's in charge!';
        } else {
            encouragement = 'You did it! There's room to improve next time!';
        }
        
        const encouragementText = this.add.text(
            0,
            20,
            encouragement,
            {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff',
                align: 'center'
            }
        );
        encouragementText.setOrigin(0.5);
        
        // Show boss image if available
        if (this.textures.exists('bossTexture')) {
            const defeatedBoss = this.add.image(-180, 0, 'bossTexture');
            defeatedBoss.setScale(0.4);
            
            // Add sad face overlay to boss
            const sadFace = this.add.text(
                defeatedBoss.x,
                defeatedBoss.y,
                "😢",
                {
                    fontSize: '32px'
                }
            );
            sadFace.setOrigin(0.5);
            
            resultsContainer.add(defeatedBoss);
            resultsContainer.add(sadFace);
        }
        
        // Add all elements to container
        resultsContainer.add(resultsBg);
        resultsContainer.add(victoryText);
        resultsContainer.add(scoreText);
        resultsContainer.add(encouragementText);
        
        // Buttons container
        const buttonsContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height - 100);
        
        // Play again button
        const playAgainButton = this.add.text(
            -100,
            0,
            'Play Again',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#4CAF50',
                padding: {
                    left: 15,
                    right: 15,
                    top: 10,
                    bottom: 10
                }
            }
        );
        playAgainButton.setOrigin(0.5);
        playAgainButton.setInteractive({ useHandCursor: true });
        
        playAgainButton.on('pointerdown', () => {
            // Reset game and go to input screen
            resetGame();
        });
        
        // Main menu button
        const mainMenuButton = this.add.text(
            100,
            0,
            'Main Menu',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#2196F3',
                padding: {
                    left: 15,
                    right: 15,
                    top: 10,
                    bottom: 10
                }
            }
        );
        mainMenuButton.setOrigin(0.5);
        mainMenuButton.setInteractive({ useHandCursor: true });
        
        mainMenuButton.on('pointerdown', () => {
            // Reset game and go to splash screen
            resetGame();
            this.scene.start('SplashScene');
        });
        
        // Add buttons to container
        buttonsContainer.add(playAgainButton);
        buttonsContainer.add(mainMenuButton);
        
        // Credits text
        const creditsText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 40,
            '© 2025 Boss Challenger - Thanks for playing!',
            {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#aaaaaa'
            }
        );
        creditsText.setOrigin(0.5);
        
        // Play victory music
        this.sound.play('victoryMusic', { volume: 0.5 });
    }
    
    createConfetti() {
        // Create particle emitter for confetti
        const particles = this.add.particles(0, 0, 'confetti', {
            x: { min: 0, max: this.cameras.main.width },
            y: -50,
            angle: { min: 0, max: 360 },
            speed: { min: 150, max: 250 },
            gravityY: 300,
            lifespan: { min: 3000, max: 6000 },
            scale: { min: 0.1, max: 0.5 },
            rotate: { start: 0, end: 360 },
            frequency: 50,
            tint: [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF],
            emitCallback: function(particle) {
                // Random rotation speed
                particle.rotateRate = Phaser.Math.Between(-100, 100);
            },
            deathCallback: function(particle) {
                // Fade out as particles die
                particle.alpha = 0;
            }
        });
    }
}
