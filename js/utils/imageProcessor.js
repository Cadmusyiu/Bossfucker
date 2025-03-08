// Image processing utilities
const ImageProcessor = {
    // Canvas for image processing
    canvas: document.getElementById('processing-canvas'),
    
    // Initialize the canvas
    init: function() {
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'processing-canvas';
            this.canvas.style.display = 'none';
            document.body.appendChild(this.canvas);
        }
        this.ctx = this.canvas.getContext('2d');
    },
    
    // Process the uploaded boss image
    processBossImage: function(file, callback) {
        this.init();
        
        // Create a FileReader
        const reader = new FileReader();
        
        reader.onload = (event) => {
            // Create an image object
            const img = new Image();
            
            img.onload = () => {
                // Set canvas dimensions
                this.canvas.width = 128;  // Target width
                this.canvas.height = 128; // Target height
                
                // Clear canvas
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Draw image with face detection (simplified version)
                this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                
                // Get the base64 data
                const processedImageData = this.canvas.toDataURL('image/png');
                
                // Send processed image back through callback
                callback(processedImageData);
            };
            
            // Set image source from file reader
            img.src = event.target.result;
        };
        
        // Read the file as DataURL
        reader.readAsDataURL(file);
    },
    
    // Create a sprite from the boss image data
    createBossSprite: function(scene, x, y, imageData) {
        // Add image to the game cache
        if (!scene.textures.exists('bossTexture')) {
            const img = new Image();
            img.src = imageData;
            
            img.onload = () => {
                scene.textures.addImage('bossTexture', img);
                
                // Create sprite with the new texture
                const sprite = scene.add.sprite(x, y, 'bossTexture');
                sprite.setOrigin(0.5);
                return sprite;
            };
        } else {
            // Texture already exists, create sprite directly
            const sprite = scene.add.sprite(x, y, 'bossTexture');
            sprite.setOrigin(0.5);
            return sprite;
        }
    },
    
    // Generate a default boss image if none provided
    generateDefaultBossImage: function(scene, bossName) {
        this.init();
        
        // Set canvas dimensions
        this.canvas.width = 128;
        this.canvas.height = 128;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fill background
        this.ctx.fillStyle = '#4466aa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw a simple face
        this.ctx.fillStyle = '#ffcc88';
        this.ctx.beginPath();
        this.ctx.arc(64, 64, 40, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw eyes
        this.ctx.fillStyle = '#333333';
        this.ctx.beginPath();
        this.ctx.arc(50, 55, 5, 0, Math.PI * 2);
        this.ctx.arc(78, 55, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw mouth
        this.ctx.beginPath();
        this.ctx.arc(64, 80, 20, 0.1 * Math.PI, 0.9 * Math.PI);
        this.ctx.stroke();
        
        // Add text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(bossName || 'BOSS', 64, 20);
        
        // Get the base64 data
        return this.canvas.toDataURL('image/png');
    }
};
