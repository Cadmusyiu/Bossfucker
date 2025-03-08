class SplashScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SplashScene' });
    }

    create() {
        // Add background
        const background = this.add.rectangle(0, 0, 
            this.cameras.main.width, this.cameras.main.height, 
            0x0066aa).setOrigin(0, 0);
        
        // Add game logo (text instead of image)
        const logo = this.add.text(
            this.cameras.main.width / 2, 150,
            'BOSS Fucker!',
            {
                fontFamily: 'Arial',
                fontSize: '48px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }
        );
        logo.setOrigin(0.5);
        
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
        
        // Start button (rectangle + text instead of image)
        const startButtonBg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 80,
            200, 60,
            0x4CAF50
        );
        
        const startButtonText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 80,
            'START',
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#ffffff'
            }
        );
        startButtonText.setOrigin(0.5);
        
        // Make button interactive
        startButtonBg.setInteractive({ useHandCursor: true });
        
        // Add pulse animation to start button
        this.tweens.add({
            targets: startButtonBg,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Start button event
        startButtonBg.on('pointerdown', () => {
            // Move to the input scene
            this.scene.start('InputScene');
        });
        
        // Add floating shapes in background
        this.createBackgroundElements();
    }
    
    createBackgroundElements() {
        // Add some office-themed elements floating in the background
        const elements = [
            { key: 'coffee', x: 100, y: 500, speed: 0.5 },
            { key: 'document', x: 700, y: 300, speed: 0.7 },
            { key: 'stapler', x: 200, y: 400, speed: 0.3 },
            { key: 'pencil', x: 600, y: 150, speed: 0.6 }
        ];
        
        // Create simple shapes
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
        });
    }
}
