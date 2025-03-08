class InputScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InputScene' });
    }

    preload() {
        // Load necessary assets
        this.load.html('inputForm', 'assets/html/input-form.html');
        
        // Load default avatar images
        this.load.image('defaultBoss1', 'assets/images/default-boss-1.png');
        this.load.image('defaultBoss2', 'assets/images/default-boss-2.png');
        this.load.image('defaultBoss3', 'assets/images/default-boss-3.png');
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
        
        // Create a container for the input form
        const formContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
        
        // We'll build a custom form to get the inputs instead of relying on HTML form
        // This gives better control over the appearance and functionality
        
        // Player name input
        this.createLabel(formContainer, -150, -120, 'Your Name:');
        const playerNameInput = this.createInput(formContainer, 0, -90, 'Enter your name');
        
        // Job title dropdown
        this.createLabel(formContainer, -150, -50, 'Your Job Title:');
        const jobTitles = ['Employee', 'Intern', 'Manager', 'Developer', 'Designer', 'Sales Rep'];
        const jobTitleSelect = this.createDropdown(formContainer, 0, -20, jobTitles);
        
        // Boss name input
        this.createLabel(formContainer, -150, 20, 'Boss Name:');
        const bossNameInput = this.createInput(formContainer, 0, 50, 'Enter boss name');
        
        // Boss avatar selection
        this.createLabel(formContainer, -150, 90, 'Boss Avatar:');
        
        // Create image upload button
        const uploadButton = this.add.text(
            0, 
            120, 
            'Upload Image', 
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                backgroundColor: '#3498db',
                padding: {
                    left: 10,
                    right: 10,
                    top: 5,
                    bottom: 5
                }
            }
        );
        uploadButton.setOrigin(0.5);
        uploadButton.setInteractive({ useHandCursor: true });
        formContainer.add(uploadButton);
        
        // Set up file input (hidden)
        this.setupFileInput(uploadButton);
        
        // Default avatars
        this.createDefaultAvatars(formContainer);
        
        // Start Game button
        const startButton = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height - 80, 
            'Start Game', 
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                fontStyle: 'bold',
                backgroundColor: '#27ae60',
                padding: {
                    left: 20,
                    right: 20,
                    top: 10,
                    bottom: 10
                }
            }
        );
        startButton.setOrigin(0.5);
        startButton.setInteractive({ useHandCursor: true });
        
        startButton.on('pointerdown', () => {
            // Get input values
            const playerName = playerNameInput.text || 'Player';
            const bossName = bossNameInput.text || 'Boss';
            
            // Get selected boss image (or use default)
            let bossImage = this.registry.get('selectedBossImage');
            if (!bossImage) {
                bossImage = ImageProcessor.generateDefaultBossImage(this, bossName);
            }
            
            // Update game settings
            updateGameState({
                playerName: playerName,
                bossName: bossName,
                currentStage: 1
            });
            
            // Store boss image
            this.game.registry.set('bossImage', bossImage);
            
            // Save game progress
            saveGameProgress();
            
            // Start the first stage
            this.scene.start('StageOneScene');
        });
    }
    
    createLabel(container, x, y, text) {
        const label = this.add.text(
            x, 
            y, 
            text, 
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff'
            }
        );
        container.add(label);
        return label;
    }
    
    createInput(container, x, y, placeholder) {
        // Create background for input
        const inputBg = this.add.rectangle(x, y, 300, 40, 0xffffff);
        inputBg.setOrigin(0.5);
        
        // Create text object for input
        const input = this.add.text(
            x - 140, 
            y - 15, 
            '', 
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#000000',
                fixedWidth: 280
            }
        );
        
        // Add placeholder
        const placeholder_text = this.add.text(
            x - 140, 
            y - 15, 
            placeholder, 
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#999999',
                fixedWidth: 280
            }
        );
        
        // Make input interactive
        inputBg.setInteractive();
        inputBg.on('pointerdown', () => {
            // This would normally hook into a keyboard input
            // For demonstration, we'll use a prompt
            const value = prompt(placeholder, input.text);
            if (value !== null) {
                input.setText(value);
                // Hide placeholder if there's text
                placeholder_text.setVisible(!value);
            }
        });
        
        container.add(inputBg);
        container.add(input);
        container.add(placeholder_text);
        
        return input;
    }
    
    createDropdown(container, x, y, options) {
        // Create background for dropdown
        const dropdownBg = this.add.rectangle(x, y, 300, 40, 0xffffff);
        dropdownBg.setOrigin(0.5);
        
        // Create text object to show selected option
        const selected = this.add.text(
            x - 140, 
            y - 15, 
            options[0], 
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#000000',
                fixedWidth: 280
            }
        );
        
        // Add dropdown arrow
        const arrow = this.add.text(
            x + 130, 
            y - 15, 
            '▼', 
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#000000'
            }
        );
        
        // Make dropdown interactive
        dropdownBg.setInteractive();
        dropdownBg.on('pointerdown', () => {
            // This would normally open a dropdown menu
            // For demonstration, we'll use a simple cycling through options
            const currentIndex = options.indexOf(selected.text);
            const nextIndex = (currentIndex + 1) % options.length;
            selected.setText(options[nextIndex]);
        });
        
        container.add(dropdownBg);
        container.add(selected);
        container.add(arrow);
        
        return selected;
    }
    
    setupFileInput(uploadButton) {
        // Create a hidden file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        // Handle file selection
        fileInput.addEventListener('change', (event) => {
            if (fileInput.files && fileInput.files[0]) {
                // Process the selected image
                ImageProcessor.processBossImage(fileInput.files[0], (processedImage) => {
                    // Store the processed image
                    this.registry.set('selectedBossImage', processedImage);
                    
                    // Show a preview
                    this.showImagePreview(processedImage);
                    
                    // Update UI to show image selected
                    uploadButton.setText('Image Selected ✓');
                    uploadButton.setStyle({ backgroundColor: '#27ae60' });
                });
            }
        });
        
        // Trigger file dialog when button is clicked
        uploadButton.on('pointerdown', () => {
            fileInput.click();
        });
    }
    
    showImagePreview(imageData) {
        // Remove previous preview if exists
        if (this.imagePreview) {
            this.imagePreview.destroy();
        }
        
        // Create an image element to preview
        const img = new Image();
        img.src = imageData;
        
        img.onload = () => {
            // Add the texture to the game
            this.textures.addImage('bossPreview', img);
            
            // Create the preview sprite
            this.imagePreview = this.add.sprite(
                this.cameras.main.width - 100,
                this.cameras.main.height - 150,
                'bossPreview'
            );
            this.imagePreview.setScale(0.5);
            
            // Add a label
            const previewLabel = this.add.text(
                this.cameras.main.width - 100,
                this.cameras.main.height - 200,
                'Preview:',
                {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    color: '#ffffff'
                }
            );
            previewLabel.setOrigin(0.5);
        };
    }
    
    createDefaultAvatars(container) {
        // Create container for default avatars
        const avatarsContainer = this.add.container(0, 150);
        container.add(avatarsContainer);
        
        // Create default avatar options
        const spacing = 90;
        const defaultAvatars = ['defaultBoss1', 'defaultBoss2', 'defaultBoss3'];
        
        defaultAvatars.forEach((avatar, index) => {
            const x = (index - 1) * spacing;
            
            // Create avatar image
            const sprite = this.add.sprite(x, 0, avatar);
            sprite.setScale(0.4);
            sprite.setInteractive({ useHandCursor: true });
            
            // Handle selection
            sprite.on('pointerdown', () => {
                // Set as selected
                this.selectDefaultAvatar(sprite, avatarsContainer);
                
                // Use this avatar
                const textureManager = this.textures.get(avatar);
                const source = textureManager.getSourceImage();
                
                // Convert to base64
                const canvas = document.createElement('canvas');
                canvas.width = source.width;
                canvas.height = source.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(source, 0, 0);
                
                const imageData = canvas.toDataURL('image/png');
                this.registry.set('selectedBossImage', imageData);
                
                // Show preview
                this.showImagePreview(imageData);
            });
            
            avatarsContainer.add(sprite);
        });
    }
    
    selectDefaultAvatar(selected, container) {
        // Reset all avatars
        container.each(sprite => {
            sprite.setTint(0xbbbbbb);
        });
        
        // Highlight selected avatar
        selected.clearTint();
        selected.setScale(0.45);
        
        // Add animation
        this.tweens.add({
            targets: selected,
            scale: 0.4,
            duration: 200,
            yoyo: true
        });
    }
}
