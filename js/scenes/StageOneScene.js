class StageOneScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StageOneScene' });
        this.score = 0;
        this.timeLeft = 60;
        this.gameOver = false;
        this.papers = [];
        this.paperTypes = ['memo', 'report', 'invoice', 'form', 'letter'];
        this.selectedPaper = null;
    }

    create() {
        // Background
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000).setOrigin(0, 0);
        
        // Create grid background (10x10 grid)
        this.createGrid();
        
        // Create boss character
        const bossImage = this.game.registry.get('bossImage');
        this.boss = this.add.rectangle(100, 100, 60, 60, 0xff0000);
        
        // Add simple face to boss
        this.add.circle(100, 100, 20, 0xffcc88);
        this.add.circle(90, 95, 5, 0x000000);
        this.add.circle(110, 95, 5, 0x000000);
        this.add.arc(100, 110, 10, 0.2, Math.PI-0.2, false, 0x000000);
        
        // Set boss movement
        this.boss.moveDirection = new Phaser.Math.Vector2(1, 0.5);
        this.boss.speed = 1;
        
        // Create UI
        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '24px', color: '#ffffff' });
        this.timeText = this.add.text(this.cameras.main.width - 120, 20, 'Time: ' + this.timeLeft, { fontSize: '24px', color: '#ffffff' });
        
        // Title
        this.add.text(this.cameras.main.width / 2, 20, 'Stage 1: Paper Avalanche', { 
            fontSize: '28px', 
            color: '#ffffff' 
        }).setOrigin(0.5, 0);
        
        // Start spawning papers
        this.spawnPaperTimer = this.time.addEvent({
            delay: 2000,
            callback: this.spawnPaper,
            callbackScope: this,
            loop: true
        });
        
        // Start game timer
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
        
        // Setup keyboard input for testing
        this.input.keyboard.on('keydown-SPACE', () => {
            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);
        });
    }
    
    update() {
        if (this.gameOver) return;
        
        // Update boss movement
        this.updateBoss();
        
        // Update papers
        for (let i = 0; i < this.papers.length; i++) {
            const paper = this.papers[i];
            if (paper.falling) {
                paper.y += 2;
                
                // Check if paper has fallen off screen
                if (paper.y > this.cameras.main.height) {
                    paper.destroy();
                    this.papers.splice(i, 1);
                    i--;
                }
            }
        }
    }
    
    createGrid() {
        // Draw grid lines
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x444444, 0.5);
        
        // Horizontal lines
        for (let y = 100; y < this.cameras.main.height - 100; y += 50) {
            graphics.moveTo(50, y);
            graphics.lineTo(this.cameras.main.width - 50, y);
        }
        
        // Vertical lines
        for (let x = 50; x < this.cameras.main.width - 50; x += 50) {
            graphics.moveTo(x, 100);
            graphics.lineTo(x, this.cameras.main.height - 100);
        }
        
        graphics.strokePath();
        
        // Add green highlight border
        const border = this.add.rectangle(
            this.cameras.main.width/2, 
            this.cameras.main.height/2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x00ff00
        );
        border.setStrokeStyle(10, 0x00ff00);
    }
    
    spawnPaper() {
        // Create a paper at a random position at the top
        const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
        const paperType = Phaser.Math.Between(0, 4);
        
        // Create paper (small rectangle)
        const paper = this.add.rectangle(x, 50, 30, 30, this.getColorForPaperType(paperType));
        paper.falling = true;
        paper.paperType = paperType;
        
        // Make interactive
        paper.setInteractive();
        
        // Handle clicking
        paper.on('pointerdown', () => {
            this.score += 5;
            this.scoreText.setText('Score: ' + this.score);
            paper.destroy();
            
            // Remove from array
            const index = this.papers.indexOf(paper);
            if (index > -1) {
                this.papers.splice(index, 1);
            }
        });
        
        this.papers.push(paper);
    }
    
    getColorForPaperType(paperType) {
        const colors = [0xffffff, 0xffcccc, 0xccffcc, 0xccccff, 0xffffcc];
        return colors[paperType];
    }
    
    updateBoss() {
        // Move boss around
        this.boss.x += this.boss.moveDirection.x * this.boss.speed;
        this.boss.y += this.boss.moveDirection.y * this.boss.speed;
        
        // Update boss face components
        this.children.getAll().forEach(child => {
            if (child !== this.boss && 
                Math.abs(child.x - this.boss.x) < 30 && 
                Math.abs(child.y - this.boss.y) < 30) {
                child.x += this.boss.moveDirection.x * this.boss.speed;
                child.y += this.boss.moveDirection.y * this.boss.speed;
            }
        });
        
        // Bounce off edges
        if (this.boss.x < 50 || this.boss.x > this.cameras.main.width - 50) {
            this.boss.moveDirection.x *= -1;
        }
        
        if (this.boss.y < 50 || this.boss.y > this.cameras.main.height - 50) {
            this.boss.moveDirection.y *= -1;
        }
        
        // Occasionally spawn a paper from boss
        if (Phaser.Math.Between(1, 200) === 1) {
            this.spawnPaperFromBoss();
        }
    }
    
    spawnPaperFromBoss() {
        const paperType = Phaser.Math.Between(0, 4);
        
        // Create paper at boss position
        const paper = this.add.rectangle(this.boss.x, this.boss.y, 30, 30, this.getColorForPaperType(paperType));
        paper.falling = true;
        paper.paperType = paperType;
        
        // Make interactive
        paper.setInteractive();
        
        // Handle clicking
        paper.on('pointerdown', () => {
            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);
            paper.destroy();
            
            // Remove from array
            const index = this.papers.indexOf(paper);
            if (index > -1) {
                this.papers.splice(index, 1);
            }
        });
        
        this.papers.push(paper);
    }
    
    updateTimer() {
        this.timeLeft--;
        this.timeText.setText('Time: ' + this.timeLeft);
        
        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.spawnPaperTimer.remove();
        
        // Check if player has achieved the target score
        const targetScore = 100;
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
        
        const title = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 100,
            success ? 'Stage Complete!' : 'Stage Failed!',
            {
                fontSize: '32px',
                color: success ? '#00ff00' : '#ff0000'
            }
        ).setOrigin(0.5);
        
        const scoreResult = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 20,
            `Score: ${this.score} / Target: ${targetScore}`,
            {
                fontSize: '24px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
        
        const continueButton = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 80,
            250,
            60,
            success ? 0x00aa00 : 0x0088ff
        );
        
        const continueText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 80,
            success ? 'Continue to Next Stage' : 'Try Again',
            {
                fontSize: '20px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
        
        continueButton.setInteractive();
        
        continueButton.on('pointerdown', () => {
            if (success) {
                // Update game state and go to next stage
                updateGameState({
                    currentStage: 2,
                    totalScore: getGameState().totalScore + this.score
                });
                this.scene.start('StageTwoScene');
            } else {
                // Retry this stage
                this.scene.restart();
            }
        });
    }
}
