class InputScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InputScene' });
        this.playerName = 'Player';
        this.bossName = 'Boss';
    }

    create() {
        // Background
        const background = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x3498db);
        background.setOrigin(0, 0);
        
        // Title text
        const titleText = this.add.text(
            this.cameras.main.width / 2, 
            50, 
            'Player Setup', 
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center'
            }
        );
        titleText.setOrigin(0.5);
        
        // Player name field
        this.createSimpleInputField(
            this.cameras.main.width / 2,
            180,
            'Your Name: Player',
            (name) => { this.playerName = name || 'Player'; }
        );
        
        // Boss name field
        this.createSimpleInputField(
            this.cameras.main.width / 2,
            240,
            'Boss Name: Boss',
            (name) => { this.bossName = name || 'Boss'; }
        );
        
        // Boss avatar (just a colored rectangle for now)
        this.add.text(
            this.cameras.main.width / 2,
            300,
            'Boss Avatar',
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // Simple avatar preview (colored rectangle)
        this.bossAvatar = this.add.rectangle(
            this.cameras.main.width / 2,
            360,
            100, 100,
            0xff0000
        );
        
        // Start Game button
        const startButton = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height - 80,
            200, 60,
            0x27ae60
        );
        
        const startButtonText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 80,
            'Start Game',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff'
            }
        );
        startButtonText.setOrigin(0.5);
        
        startButton.setInteractive({ useHandCursor: true });
        
        startButton.on('pointerdown', () => {
            // Update game settings
            updateGameState({
                playerName: this.playerName,
                bossName: this.bossName,
                currentStage: 1
            });
            
            // Create a simple boss image
            const bossImage = this.generateBossImage();
            
            // Store boss image
            this.game.registry.set('bossImage', bossImage);
            
            // Save game progress
            saveGameProgress();
            
            // Start the first stage
            this.scene.start('StageOneScene');
        });
    }
    
    createSimpleInputField(x, y, placeholder, callback) {
        // Create input rectangle
        const inputBg = this.add.rectangle(x, y, 300, 40, 0xffffff);
        inputBg.setInteractive({ useHandCursor: true });
        
        // Create text
        const text = this.add.text(
            x,
            y,
            placeholder,
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#000000'
            }
        );
        text.setOrigin(0.5);
        
        // Handle input
        inputBg.on('pointerdown', () => {
            const userInput = prompt(placeholder.split(':')[0], placeholder.split(': ')[1]);
            if (userInput !== null) {
                text.setText(`${placeholder.split(':')[0]}: ${userInput}`);
                callback(userInput);
            }
        });
    }
    
    generateBossImage() {
        // Create a canvas to generate a boss image
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw a simple face
        ctx.fillStyle = '#ffcc88';
        ctx.beginPath();
        ctx.arc(64, 64, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw eyes
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(50, 55, 5, 0, Math.PI * 2);
        ctx.arc(78, 55, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Return as data URL
        return canvas.toDataURL('image/png');
    }
}
