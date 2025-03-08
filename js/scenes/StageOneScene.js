class StageOneScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StageOneScene' });
        
        // Game state
        this.score = 0;
        this.timeLeft = 0;
        this.gameOver = false;
        this.paperGroup = null;
        this.papers = [];
        this.paperColors = [0xffffff, 0xfff8e1, 0xe3f2fd, 0xf1f8e9, 0xffebee];
        this.paperTypes = ['memo', 'report', 'invoice', 'form', 'letter'];
        this.matchGrid = [];
        this.gridSize = { cols: 8, rows: 10 };
        this.cellSize = 60;
        this.selectedPaper = null;
    }

    preload() {
        // Load game assets
        this.load.image('paperBg', 'assets/images/paper-bg.png');
        this.load.image('desk', 'assets/images/desk-texture.png');
        this.load.spritesheet('papers', 'assets/images/paper-types.png', { 
            frameWidth: 60, 
            frameHeight: 60 
        });
        this.load.image('trashBin', 'assets/images/trash-bin.png');
        this.load.image('inTray', 'assets/images/in-tray.png');
        this.load.image('outTray', 'assets/images/out-tray.png');
        
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
        this.load.audio('paperSound', 'assets/audio/paper-shuffle.mp3');
        this.load.audio('matchSound', 'assets/audio/match-success.mp3');
        this.load.audio('gameOverSound', 'assets/audio/game-over.mp3');
        this.load.audio('stageMusic', 'assets/audio/stage1-music.mp3');
    }

    create() {
        // Get game settings
        const gameSettings = getGameState();
        this.timeLeft = gameSettings.stageOneSettings.gameDuration;
        
        // Setup background
        this.add.image(0, 0, 'desk').setOrigin(0, 0).setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Create the paper grid background
        this.createGridBackground();
        
        // Create the paper matching grid
        this.createMatchGrid();
        
        // Create trays
        this.createTrays();
        
        // Create boss character that moves around and adds papers
        this.createBoss();
        
        // Create UI elements
        this.createUI();
        
        // Start spawning papers
        this.startPaperSpawning();
        
        // Start game timer
        this.startGameTimer();
        
        // Play background music
        this.playBackgroundMusic();
    }
    
    update() {
        if (this.gameOver) return;
        
        // Update boss movement
        this.updateBoss();
        
        // Update falling papers
        this.updatePapers();
        
        // Check for game over conditions
        this.checkGameOver();
    }
    
    createGridBackground() {
        // Create a background for the paper grid
        const gridBg = this.add.graphics();
        gridBg.fillStyle(0x9e9e9e, 0.3);
        gridBg.fillRect(
            this.cameras.main.width / 2 - (this.gridSize.cols * this.cellSize) / 2,
            100,
            this.gridSize.cols * this.cellSize,
            this.gridSize.rows * this.cellSize
        );
        
        // Add grid lines
        gridBg.lineStyle(1, 0x757575, 0.5);
        
        // Vertical lines
        for (let col = 0; col <= this.gridSize.cols; col++) {
            const x = this.cameras.main.width / 2 - (this.gridSize.cols * this.cellSize) / 2 + col * this.cellSize;
            gridBg.lineBetween(x, 100, x, 100 + this.gridSize.rows * this.cellSize);
        }
        
        // Horizontal lines
        for (let row = 0; row <= this.gridSize.rows; row++) {
            const y = 100 + row * this.cellSize;
            gridBg.lineBetween(
                this.cameras.main.width / 2 - (this.gridSize.cols * this.cellSize) / 2,
                y,
                this.cameras.main.width / 2 + (this.gridSize.cols * this.cellSize) / 2,
                y
            );
        }
    }
    
    createMatchGrid() {
        // Initialize empty grid
        this.matchGrid = Array(this.gridSize.rows).fill().map(() => Array(this.gridSize.cols).fill(null));
        
        // Create a group for the papers
        this.paperGroup = this.add.group();
    }
    
    createTrays() {
        // Add in-tray at the top
        this.inTray = this.add.image(
            this.cameras.main.width / 2,
            50,
            'inTray'
        ).setScale(0.6);
        
        // Add out-tray/trash bin at the bottom
        this.trashBin = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            'trashBin'
        ).setScale(0.6);
    }
    
    createBoss() {
        // Create boss character using the uploaded or default image
        this.boss = this.add.sprite(
            100, 
            150, 
            this.textures.exists('bossTexture') ? 'bossTexture' : 'defaultBoss1'
        );
        this.boss.setScale(0.5);
        
        // Setup boss movement
        this.boss.moveDirection = new Phaser.Math.Vector2(1, 0.5);
        this.boss.moveSpeed = 80;
        this.boss.lastPaperTime = 0;
        this.boss.paperInterval = 3000; // Drop paper every 3 seconds
    }
    
    createUI() {
        // Score display
        this.scoreText = this.add.text(
            20, 
            20, 
            'Score: 0', 
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
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
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        
        // Stage title
        this.stageTitle = this.add.text(
            this.cameras.main.width / 2, 
            20, 
            'Stage 1: Paper Avalanche', 
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        this.stageTitle.setOrigin(0.5, 0);
        
        // Instructions (hidden after a few seconds)
        this.instructions = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            'Match 3 or more papers of the same type to clear them!',
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
    }
    
    startPaperSpawning() {
        // Start spawning papers at the top
        this.spawnPaperEvent = this.time.addEvent({
            delay: 1000,
            callback: this.spawnPaper,
            callbackScope: this,
            loop: true
        });
    }
    
    spawnPaper() {
        // Determine a random column to spawn in
        const col = Phaser.Math.Between(0, this.gridSize.cols - 1);
        
        // Determine paper type
        const paperType = Phaser.Math.Between(0, this.paperTypes.length - 1);
        
        // Calculate position
        const gridX = this.cameras.main.width / 2 - (this.gridSize.cols * this.cellSize) / 2 + col * this.cellSize + this.cellSize / 2;
        const gridY = 100 - this.cellSize;
        
        // Create paper sprite
        const paper = this.add.sprite(gridX, gridY, 'papers', paperType);
        paper.setInteractive();
        paper.paperType = paperType;
        paper.gridCol = col;
        paper.gridRow = -1;
        paper.falling = true;
        
        // Set a slight random rotation
        paper.setAngle(Phaser.Math.Between(-5, 5));
        
        // Add to tracking arrays
        this.papers.push(paper);
        this.paperGroup.add(paper);
        
        // Setup dragging
        this.input.setDraggable(paper);
        
        // Handle paper clicking/dragging
        paper.on('pointerdown', (pointer) => {
            // Select this paper
            if (this.selectedPaper) {
                this.selectedPaper.setTint(0xffffff);
            }
            this.selectedPaper = paper;
            paper.setTint(0xffff00);
            
            // Play paper sound
            this.sound.play('paperSound', { volume: 0.5 });
        });
        
        paper.on('drag', (pointer, dragX, dragY) => {
            // Update position while dragging
            paper.x = dragX;
            paper.y = dragY;
        });
        
        paper.on('dragend', () => {
            // Find the closest grid position
            const gridPos = this.getGridPosition(paper.x, paper.y);
            
            // Check if position is valid
            if (this.isValidGridPosition(gridPos.col, gridPos.row)) {
                // Place in grid if empty
                if (!this.matchGrid[gridPos.row][gridPos.col]) {
                    // Update grid
                    if (paper.gridRow >= 0 && paper.gridCol >= 0) {
                        this.matchGrid[paper.gridRow][paper.gridCol] = null;
                    }
                    
                    // Place in new position
                    paper.gridCol = gridPos.col;
                    paper.gridRow = gridPos.row;
                    this.matchGrid[gridPos.row][gridPos.col] = paper;
                    
                    // Update paper position
                    paper.x = this.cameras.main.width / 2 - (this.gridSize.cols * this.cellSize) / 2 + gridPos.col * this.cellSize + this.cellSize / 2;
                    paper.y = 100 + gridPos.row * this.cellSize + this.cellSize / 2;
                    
                    // Stop falling
                    paper.falling = false;
                    
                    // Check for matches
                    this.checkMatches();
                } else {
                    // Position already filled, return to original position
                    if (paper.gridRow >= 0 && paper.gridCol >= 0) {
                        paper.x = this.cameras.main.width / 2 - (this.gridSize.cols * this.cellSize) / 2 + paper.gridCol * this.cellSize + this.cellSize / 2;
                        paper.y = 100 + paper.gridRow * this.cellSize + this.cellSize / 2;
                    } else {
                        // If it was a falling paper, continue falling
                        paper.falling = true;
                    }
                }
            } else {
                // Outside of grid, return to original position or keep falling
                if (paper.gridRow >= 0 && paper.gridCol >= 0) {
                    paper.x = this.cameras.main.width / 2 - (this.gridSize.cols * this.cellSize) / 2 + paper.gridCol * this.cellSize + this.cellSize / 2;
                    paper.y = 100 + paper.gridRow * this.cellSize + this.cellSize / 2;
                } else {
                    // If it was a falling paper, continue falling
                    paper.falling = true;
                }
            }
            
            // Clear selection
            if (this.selectedPaper) {
                this.selectedPaper.setTint(0xffffff);
                this.selectedPaper = null;
            }
        });
    }
    
    getGridPosition(x, y) {
        // Convert screen position to grid position
        const gridX = this.cameras.main.width / 2 - (this.gridSize.cols * this.cellSize) / 2;
        const gridY = 100;
        
        const col = Math.floor((x - gridX) / this.cellSize);
        const row = Math.floor((y - gridY) / this.cellSize);
        
        return { col, row };
    }
    
    isValidGridPosition(col, row) {
        // Check if position is within grid bounds
        return col >= 0 && col < this.gridSize.cols && row >= 0 && row < this.gridSize.rows;
    }
    
    checkMatches() {
        // Check for horizontal matches
        let matchFound = false;
        const matchedPapers = [];
        
        // Horizontal matches
        for (let row = 0; row < this.gridSize.rows; row++) {
            let currentType = -1;
            let currentCount = 0;
            let matchStart = 0;
            
            for (let col = 0; col < this.gridSize.cols; col++) {
                const paper = this.matchGrid[row][col];
                
                if (paper && paper.paperType === currentType) {
                    currentCount++;
                } else {
                    // Check if previous sequence was a match
                    if (currentCount >= 3) {
                        matchFound = true;
                        for (let i = matchStart; i < col; i++) {
                            matchedPapers.push(this.matchGrid[row][i]);
                        }
                    }
                    
                    // Start new sequence
                    if (paper) {
                        currentType = paper.paperType;
                        currentCount = 1;
                        matchStart = col;
                    } else {
                        currentType = -1;
                        currentCount = 0;
                    }
                }
            }
            
            // Check for match at end of row
            if (currentCount >= 3) {
                matchFound = true;
                for (let i = matchStart; i < this.gridSize.cols; i++) {
                    matchedPapers.push(this.matchGrid[row][i]);
                }
            }
        }
        
        // Vertical matches
        for (let col = 0; col < this.gridSize.cols; col++) {
            let currentType = -1;
            let currentCount = 0;
            let matchStart = 0;
            
            for (let row = 0; row < this.gridSize.rows; row++) {
                const paper = this.matchGrid[row][col];
                
                if (paper && paper.paperType === currentType) {
                    currentCount++;
                } else {
                    // Check if previous sequence was a match
                    if (currentCount >= 3) {
                        matchFound = true;
                        for (let i = matchStart; i < row; i++) {
                            matchedPapers.push(this.matchGrid[i][col]);
                        }
                    }
                    
                    // Start new sequence
                    if (paper) {
                        currentType = paper.paperType;
                        currentCount = 1;
                        matchStart = row;
                    } else {
                        currentType = -1;
                        currentCount = 0;
                    }
                }
            }
            
            // Check for match at end of column
            if (currentCount >= 3) {
                matchFound = true;
                for (let i = matchStart; i < this.gridSize.rows; i++) {
                    matchedPapers.push(this.matchGrid[i][col]);
                }
            }
        }
        
        // Process matches
        if (matchFound) {
            // Remove duplicates
            const uniqueMatches = [...new Set(matchedPapers)];
            
            // Play match sound
            this.sound.play('matchSound');
            
            // Clear matched papers
            uniqueMatches.forEach(paper => {
                // Remove from grid
                this.matchGrid[paper.gridRow][paper.gridCol] = null;
                
                // Add score
                this.score += 10;
                
                // Update UI
                this.scoreText.setText(`Score: ${this.score}`);
                
                // Animate removal
                this.tweens.add({
                    targets: paper,
                    alpha: 0,
                    scale: 1.5,
                    duration: 300,
                    onComplete: () => {
                        // Remove from arrays
                        const index = this.papers.indexOf(paper);
                        if (index > -1) {
                            this.papers.splice(index, 1);
                        }
                        
                        // Destroy the paper sprite
                        paper.destroy();
                    }
                });
            });
            
            // Drop floating papers
            this.dropFloatingPapers();
        }
    }
    
    dropFloatingPapers() {
        // Check each column from bottom to top
        for (let col = 0; col < this.gridSize.cols; col++) {
            let emptyRowCount = 0;
            
            // Start from the bottom
            for (let row = this.gridSize.rows - 1; row >= 0; row--) {
                if (!this.matchGrid[row][col]) {
                    emptyRowCount++;
                } else if (emptyRowCount > 0) {
                    // Move this paper down
                    const paper = this.matchGrid[row][col];
                    
                    // Update grid
                    this.matchGrid[row][col] = null;
                    this.matchGrid[row + emptyRowCount][col] = paper;
                    
                    // Update paper properties
                    paper.gridRow = row + emptyRowCount;
                    
                    // Animate movement
                    this.tweens.add({
                        targets: paper,
                        y: 100 + paper.gridRow * this.cellSize + this.cellSize / 2,
                        duration: 300,
                        ease: 'Bounce.easeOut'
                    });
                }
            }
        }
    }
    
    updatePapers() {
        // Update falling papers
        for (let i = 0; i < this.papers.length; i++) {
            const paper = this.papers[i];
            
            if (paper.falling) {
                // Move paper down
                paper.y += 2;
                
                // Check if paper has reached a grid position
                const gridPos = this.getGridPosition(paper.x, paper.y);
                
                if (this.isValidGridPosition(gridPos.col, gridPos.row)) {
                    // Check if position is empty
                    if (!this.matchGrid[gridPos.row][gridPos.col]) {
                        // Land the paper here
                        paper.falling = false;
                        paper.gridCol = gridPos.col;
                        paper.gridRow = gridPos.row;
                        this.matchGrid[gridPos.row][gridPos.col] = paper;
                        
                        // Snap to grid position
                        paper.x = this.cameras.main.width / 2 - (this.gridSize.cols * this.cellSize) / 2 + gridPos.col * this.cellSize + this.cellSize / 2;
                        paper.y = 100 + gridPos.row * this.cellSize + this.cellSize / 2;
                        
                        // Check for matches
                        this.checkMatches();
                    }
                } else if (paper.y > this.cameras.main.height) {
                    // Paper fell off screen, remove it
                    paper.destroy();
                    this.papers.splice(i, 1);
                    i--;
                }
            }
        }
    }
    
    updateBoss() {
        // Move boss around
        this.boss.x += this.boss.moveDirection.x * this.boss.moveSpeed * (1/60);
        this.boss.y += this.boss.moveDirection.y * this.boss.moveSpeed * (1/60);
        
        // Bounce off edges
        if (this.boss.x < 50 || this.boss.x > this.cameras.main.width - 50) {
            this.boss.moveDirection.x *= -1;
            this.boss.scaleX *= -1; // Flip sprite
        }
        
        if (this.boss.y < 50 || this.boss.y > this.cameras.main.height - 150) {
            this.boss.moveDirection.y *= -1;
        }
        
        // Occasionally drop papers
        if (this.time.now > this.boss.lastPaperTime + this.boss.paperInterval) {
            this.spawnBossPaper();
            this.boss.lastPaperTime = this.time.now;
            
            // Randomize next interval
            this.boss.paperInterval = Phaser.Math.Between(2000, 5000);
        }
    }
    
    spawnBossPaper() {
        // Spawn a paper at the boss's position
        // Determine paper type
        const paperType = Phaser.Math.Between(0, this.paperTypes.length - 1);
        
        // Create paper sprite
        const paper = this.add.sprite(this.boss.x, this.boss.y, 'papers', paperType);
        paper.setInteractive();
        paper.paperType = paperType;
        paper.falling = true;
        paper.gridCol = -1;
        paper.gridRow = -1;
        
        // Set a random angle
        paper.setAngle(Phaser.Math.Between(-10, 10));
        
        // Add to tracking arrays
        this.papers.push(paper);
        this.paperGroup.add(paper);
        
        // Setup dragging
        this.input.setDraggable(paper);
        
        // Apply same event handlers as regular papers
        paper.on('pointerdown', (pointer) => {
            // Select this paper
            if (this.selectedPaper) {
                this.selectedPaper.setTint(0xffffff);
            }
            this.selectedPaper = paper;
            paper.setTint(0xffff00);
            
            // Play paper sound
            this.sound.play('paperSound', { volume: 0.5 });
        });
        
        paper.on('drag', (pointer, dragX, dragY) => {
            // Update position while dragging
            paper.x = dragX;
            paper.y = dragY;
        });
        
        paper.on('dragend', () => {
            // Find the closest grid position
            const gridPos = this.getGridPosition(paper.x, paper.y);
            
            // Check if position is valid
            if (this.isValidGridPosition(gridPos.col, gridPos.row)) {
                // Place in grid if empty
                if (!this.matchGrid[gridPos.row][gridPos.col]) {
                    // Update grid
                    if (paper.gridRow >= 0 && paper.gridCol >= 0) {
                        this.matchGrid[paper.gridRow][paper.gridCol] = null;
                    }
                    
                    // Place in new position
                    paper.gridCol = gridPos.col;
                    paper.gridRow = gridPos.row;
                    this.matchGrid[gridPos.row][gridPos.col] = paper;
                    
                    // Update paper position
                    paper.x = this.cameras.main.width / 2 - (this.gridSize.cols * this.cellSize) / 2 + gridPos.col * this.cellSize + this.cellSize / 2;
                    paper.y = 100 + gridPos.row * this.cellSize + this.cellSize / 2;
                    
                    // Stop falling
                    paper.falling = false;
                    
                    // Check for matches
                    this.checkMatches();
                } else {
                    // Position already filled, return to original position
                    if (paper.gridRow >= 0 && paper.gridCol >= 0) {
                        paper.x = this.cameras.main.width / 2 - (this.gridSize.cols * this.cellSize) / 2 + paper.gridCol * this.cellSize + this.cellSize / 2;
                        paper.y = 100 + paper.gridRow * this.cellSize + this.cellSize / 2;
                    } else {
                        // If it was a falling paper, continue falling
                        paper.falling = true;
                    }
                }
            } else {
                // Outside of grid, return to original position or keep falling
                if (paper.gridRow >= 0 && paper.gridCol >= 0) {
                    paper.x = this.cameras.main.width / 2 - (this.gridSize.cols * this.cellSize) / 2 + paper.gridCol * this.cellSize + this.cellSize / 2;
                    paper.y = 100 + paper.gridRow * this.cellSize + this.cellSize / 2;
                } else {
                    // If it was a falling paper, continue falling
                    paper.falling = true;
                }
            }
            
            // Clear selection
            if (this.selectedPaper) {
                this.selectedPaper.setTint(0xffffff);
                this.selectedPaper = null;
            }
        });
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
    
    checkGameOver() {
        // Check if grid is full
        let gridFull = true;
        
        for (let col = 0; col < this.gridSize.cols; col++) {
            if (!this.matchGrid[0][col]) {
                gridFull = false;
                break;
            }
        }
        
        if (gridFull) {
            this.endGame();
        }
    }
    
    endGame() {
        if (this.gameOver) return;
        
        // Set game over flag
        this.gameOver = true;
        
        // Stop timers
        this.timerEvent.remove();
        if (this.spawnPaperEvent) this.spawnPaperEvent.remove();
        
        // Play game over sound
        this.sound.play('gameOverSound');
        
        // Display results
        const gameSettings = getGameState();
        const targetScore = gameSettings.stageOneSettings.targetScore;
        const success = this.score >= targetScore;
        
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
        
        const scoreText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 40,
            `Your Score: ${this.score}`,
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff'
            }
        );
        scoreText.setOrigin(0.5);
        
        const targetText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `Target Score: ${targetScore}`,
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff'
            }
        );
        targetText.setOrigin(0.5);
        
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
                    currentStage: 2,
                    totalScore: getGameState().totalScore + this.score
                });
                
                // Save progress
                saveGameProgress();
                
                // Start next stage
                this.scene.start('StageTwoScene');
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
