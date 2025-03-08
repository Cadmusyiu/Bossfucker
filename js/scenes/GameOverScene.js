class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        // Set background
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x333333).setOrigin(0, 0);
        
        // Create title text
        const titleText = this.add.text(
            this.cameras.main.width / 2,
            80,
            'Congratulations! You Beat the Boss!',
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                fontStyle: 'bold',
                color: '#FFD700'
            }
        );
        titleText.setOrigin(0.5);
        
        // Display score
        const scoreText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Final Score: 0',
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#4CAF50'
            }
        );
        scoreText.setOrigin(0.5);
        
        // Play again button
        const playAgainButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            'Play Again',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#4CAF50',
                padding: { left: 15, right: 15, top: 10, bottom: 10 }
            }
        );
        playAgainButton.setOrigin(0.5);
        playAgainButton.setInteractive({ useHandCursor: true });
        
        playAgainButton.on('pointerdown', () => {
            this.scene.start('SplashScene');
        });
    }
}
