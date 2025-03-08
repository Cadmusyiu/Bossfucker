class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading text
        const loadingText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            'Loading...',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff'
            }
        );
        loadingText.setOrigin(0.5);
        
        // Create progress bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(
            this.cameras.main.width / 2 - 160,
            this.cameras.main.height / 2,
            320,
            50
        );
        
        // Register progress event listeners
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x00ff00, 1);
            progressBar.fillRect(
                this.cameras.main.width / 2 - 150,
                this.cameras.main.height / 2 + 10,
                300 * value,
                30
            );
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
        
        // Load essential assets
        this.load.image('logo', 'assets/images/logo.png');
        this.load.image('start-button', 'assets/images/start-button.png');
        this.load.image('background-pattern', 'assets/images/background-pattern.png');
        
        // Load common audio
        this.load.audio('button-click', 'assets/audio/button-click.mp3');
        this.load.audio('title-music', 'assets/audio/title-music.mp3');
        
        // Load default boss assets
        this.load.image('defaultBoss1', 'assets/images/default-boss-1.png');
        this.load.image('defaultBoss2', 'assets/images/default-boss-2.png');
        this.load.image('defaultBoss3', 'assets/images/default-boss-3.png');
    }

    create() {
        // Initialize game data if not already present
        if (!this.registry.get('gameInitialized')) {
            this.registry.set('gameInitialized', true);
            
            // Set initial game settings
            this.registry.set('gameSettings', gameSettings);
        }
        
        // Move to splash screen
        this.scene.start('SplashScene');
    }
}
