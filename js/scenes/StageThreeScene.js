class StageThreeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StageThreeScene' });
        
        // Game state
        this.score = 0;
        this.timeLeft = 0;
        this.gameOver = false;
        this.notes = [];
        this.noteLanes = 4;
        this.laneWidth = 100;
        this.noteSpeed = 300;
        this.hitZoneY = 500;
        this.hitAccuracy = 40;
        this.noteInterval = 1000;
        this.lastNoteTime = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.totalNotes = 0;
        this.hitNotes = 0;
        this.keys = [];
        this.keyButtons = [];
        this.bossQuestions = [];
        this.audience = [];
        this.audienceApproval = 50; // 0-100 approval rating
    }

    preload() {
        // Load game assets
        this.load.image('presentationBg', 'assets/images/presentation-bg.png');
        this.load.image('podium', 'assets/images/podium.png');
        this.load.image('slideScreen', 'assets/images/slide-screen.png');
        this.load.image('audienceMember', 'assets/images/audience-member.png');
        this.load.image('note', 'assets/images/presentation-note.png');
        this.load.image('hitZone', 'assets/images/hit-zone.png');
        this.load.image('keyButton', 'assets/images/key-button.png');
        
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
        this.load.audio('notePerfect', 'assets/audio/note-perfect.mp3');
        this.load.audio('noteGood', 'assets/audio/note-good.mp3');
        this.load.audio('noteMiss', 'assets/audio/note-miss.mp3');
        this.load.audio('bossQuestion', 'assets/audio/boss-question.mp3');
        this.load.audio('applause', 'assets/audio/applause.mp3');
        this.load.audio('stageMusic', 'assets/audio/stage3-music.mp3');
    }

    create() {
        // Get game settings
        const gameSettings = getGameState();
        this.timeLeft = gameSettings.stageThreeSettings.gameDuration;
        this.noteInterval = 1000 / gameSettings.stageThreeSettings.notesPerSecond;
        
        // Setup presentation room
        this.createPresentationRoom();
        
        // Create note lanes
        this.createNoteLanes();
        
        // Create audience
        this.createAudience();
        
        // Create boss
        this.createBoss();
        
        // Setup input
        this.setupInput();
        
        // Create UI elements
        this.createUI();
        
        // Create boss questions
        this.createBossQuestions();
        
        // Start game timer
        this.startGameTimer();
        
        // Play background music
        this.playBackgroundMusic();
        
        // Start spawning notes
        this.spawnNoteEvent = this.time.addEvent({
            delay: this.noteInterval,
            callback: this.spawnNote,
            callbackScope: this,
            loop: true
        });
    }
    
    update(time, delta) {
        if (this.gameOver) return;
        
        // Update notes movement
        this.updateNotes(delta);
        
        // Check for key presses
        this.checkKeyPresses();
        
        // Check for expired notes
        this.checkExpiredNotes();
        
        // Update boss behavior
        this.updateBoss(time);
        
        // Update audience reaction
        this.updateAudience();
    }
    
    createPresentationRoom() {
        // Create presentation room background
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x333333).setOrigin(0, 0);
        
        // Create slide screen backdrop
        this.slideScreen = this.add.image(this.cameras.main.width / 2, 150, 'slideScreen');
        this.slideScreen.setScale(0.7);
        
        // Create podium
        this.podium = this.add.image(this.cameras.main.width / 2, 450, 'podium');
        this.podium.setScale(0.5);
        
        // Create player character at podium
        this.player = this.add.rectangle(this.cameras.main.width / 2, 420, 40, 80, 0x3498db);
        
        // Create slide content (could be more elaborate in a full game)
        this.slideTitle = this.add.text(
            this.cameras.main.width / 2,
            100,
            'Quarterly Results Presentation',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff'
            }
        );
        this.slideTitle.setOrigin(0.5);
    }
    
    createNoteLanes() {
        // Calculate lane positions
        const startX = (this.cameras.main.width - (this.noteLanes * this.laneWidth)) / 2 + this.laneWidth / 2;
        
        // Create lane backgrounds
        for (let i = 0; i < this.noteLanes; i++) {
            const laneX = startX + i * this.laneWidth;
            
            // Lane background
            const lane = this.add.rectangle(laneX, this.cameras.main.height / 2, this.laneWidth - 10, 400, 0x222222, 0.5);
            
            // Hit zone
            const hitZone = this.add.rectangle(laneX, this.hitZoneY, this.laneWidth - 10, 10, 0x4CAF50, 0.8);
            
            // Key button
            const keyButton = this.add.image(laneX, this.hitZoneY, 'keyButton');
            keyButton.setScale(0.7);
            keyButton.setTint(0xbbbbbb);
            this.keyButtons.push(keyButton);
            
            // Key label
            const keyLabels = ['A', 'S', 'D', 'F'];
            const keyLabel = this.add.text(
                laneX,
                this.hitZoneY,
                keyLabels[i],
                {
                    fontFamily: 'Arial',
                    fontSize: '24px',
                    fontStyle: 'bold',
                    color: '#ffffff'
                }
            );
            keyLabel.setOrigin(0.5);
        }
    }
    
    createAudience() {
        // Create a row of audience members
        const audienceY = this.cameras.main.height - 80;
        const spacing = 60;
        
        for (let i = 0; i < 12; i++) {
            const x = spacing + i * spacing;
            
            const audience = this.add.rectangle(x, audienceY, 40, 60, 0x555555);
            audience.approval = 50 + Phaser.Math.Between(-10, 10); // Initial approval varies
            audience.originalY = audienceY;
            
            this.audience.push(audience);
        }
    }
    
    createBoss() {
        // Create boss character
        this.boss = this.add.image(
            100, 
            this.cameras.main.height - 100, 
            this.textures.exists('bossTexture') ? 'bossTexture' : 'defaultBoss1'
        );
        this.boss.setScale(0.4);
        
        // Boss state
        this.boss.questionTimer = 0;
        this.boss.questionInterval = 1000 * gameSettings.stageThreeSettings.bossInterruptionFrequency;
        this.boss.isQuestioning = false;
    }
    
    setupInput() {
        // Setup keyboard input
        this.keys.push(
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        );
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
                color: '#ffffff'
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
                color: '#ffffff'
            }
        );
        
        // Stage title
        this.stageTitle = this.add.text(
            this.cameras.main.width / 2, 
            20, 
            'Stage 3: Presentation Panic', 
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#ffffff'
            }
        );
        this.stageTitle.setOrigin(0.5, 0);
        
        // Combo display
        this.comboText = this.add.text(
            this.cameras.main.width / 2,
            60,
            'Combo: 0',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#FFD700'
            }
        );
        this.comboText.setOrigin(0.5);
        
        // Audience approval meter
        this.approvalBg = this.add.rectangle(
            this.cameras.main.width - 50,
            this.cameras.main.height / 2,
            30,
            300,
            0x555555
        );
        
        this.approvalMeter = this.add.rectangle(
            this.cameras.main.width - 50,
            this.cameras.main.height / 2 + 150 - (this.audienceApproval * 3 / 2),
            25,
            this.audienceApproval * 3,
            0x4CAF50
        );
        this.approvalMeter.setOrigin(0.5, 0);
        
        // Approval label
        this.approvalLabel = this.add.text(
            this.cameras.main.width - 50,
            this.cameras.main.height / 2 - 170,
            'Approval',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff'
            }
        );
        this.approvalLabel.setOrigin(0.5);
        
        // Instructions (hidden after a few seconds)
        this.instructions = this.add.text(
            this.cameras.main.width / 2,
            this.hitZoneY - 80,
            'Press A, S, D, F keys when notes reach the green line!',
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
    
    createBossQuestions() {
        // Questions the boss might ask during presentation
        this.bossQuestions = [
            "What about last quarter's metrics?",
            "Can you explain that drop in Q2?",
            "Those numbers don't look right to me.",
            "I disagree with your conclusion.",
            "What's our ROI on this project?",
            "How does this compare to our competitors?",
            "I need more details on this point.",
            "Can you back up that claim with data?"
        ];
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
    
    spawnNote() {
        if (this.gameOver) return;
        
        // Choose a random lane
        const lane = Phaser.Math.Between(0, this.noteLanes - 1);
        const laneX = (this.cameras.main.width - (this.noteLanes * this.laneWidth)) / 2 + this.laneWidth / 2 + lane * this.laneWidth;
        
        // Create note
        const note = this.add.rectangle(laneX, 0, 50, 20, 0xFFD700);
        note.lane = lane;
        note.hit = false;
        
        // Add to notes array
        this.notes.push(note);
        this.totalNotes++;
    }
    
    updateNotes(delta) {
        // Move all notes down
        const speed = this.noteSpeed * (delta / 1000);
        
        this.notes.forEach(note => {
            if (!note.hit) {
                note.y += speed;
            }
        });
    }
    
    checkKeyPresses() {
        // Check each key
        for (let i = 0; i < this.keys.length; i++) {
            if (Phaser.Input.Keyboard.JustDown(this.keys[i])) {
                this.processKeyPress(i);
            }
        }
    }
    
    processKeyPress(lane) {
        // Flash key button
        this.flashKeyButton(lane);
        
        // Find closest note in this lane
        let closestNote = null;
        let closestDistance = Infinity;
        
        this.notes.forEach(note => {
            if (note.lane === lane && !note.hit) {
                const distance = Math.abs(note.y - this.hitZoneY);
                if (distance < closestDistance) {
                    closestNote = note;
                    closestDistance = distance;
                }
            }
        });
        
        // Check if a note was hit
        if (closestNote && closestDistance <= this.hitAccuracy) {
            this.hitNote(closestNote, closestDistance);
        } else {
            // Missed - no note in range
            this.missedNote();
        }
    }
    
    flashKeyButton(lane) {
        // Flash the key button to give visual feedback
        const button = this.keyButtons[lane];
        
        // Reset tint
        button.setTint(0xffffff);
        
        // Add flash animation
        this.tweens.add({
            targets: button,
            scale: 0.8,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                button.setTint(0xbbbbbb);
            }
        });
    }
    
    hitNote(note, distance) {
        // Mark note as hit
        note.hit = true;
        this.hitNotes++;
        
        // Determine accuracy
        let accuracy = 'GOOD';
        let points = 100;
        let color = 0x00ff00;
        
        if (distance < this.hitAccuracy / 2) {
            accuracy = 'PERFECT';
            points = 200;
            color = 0xffff00;
            
            // Play perfect sound
            this.sound.play('notePerfect');
            
            // Increase audience approval more
            this.changeApproval(2);
        } else {
            // Play good sound
            this.sound.play('noteGood');
            
            // Increase audience approval slightly
            this.changeApproval(1);
        }
        
        // Increment combo
        this.combo++;
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        
        // Update combo text
        this.comboText.setText(`Combo: ${this.combo}`);
        
        // Apply combo multiplier to score
        const comboMultiplier = Math.min(Math.floor(this.combo / 10) + 1, 5);
        const totalPoints = points * comboMultiplier;
        
        // Add points to score
        this.score += totalPoints;
        this.scoreText.setText(`Score: ${this.score}`);
        
        // Show feedback text
        this.showFeedback(note.x, note.y, accuracy, totalPoints, color);
        
        // Animate note hit and remove
        this.tweens.add({
            targets: note,
            scale: 1.5,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                note.destroy();
                const index = this.notes.indexOf(note);
                if (index > -1) {
                    this.notes.splice(index, 1);
                }
            }
        });
    }
    
    missedNote() {
        // Play miss sound
        this.sound.play('noteMiss');
        
        // Reset combo
        this.combo = 0;
        this.comboText.setText(`Combo: 0`);
        
        // Decrease audience approval
        this.changeApproval(-3);
        
        // Show feedback
        this.showFeedback(
            this.cameras.main.width / 2,
            this.hitZoneY,
            'MISS',
            0,
            0xff0000
        );
    }
    
    checkExpiredNotes() {
        // Check for notes that have passed the hit zone and weren't hit
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            
            if (!note.hit && note.y > this.hitZoneY + this.hitAccuracy) {
                // Note was missed
                this.combo = 0;
                this.comboText.setText(`Combo: 0`);
                
                // Decrease audience approval
                this.changeApproval(-2);
                
                // Show feedback
                this.showFeedback(
                    note.x,
                    note.y,
                    'MISS',
                    0,
                    0xff0000
                );
                
                // Remove note
                note.destroy();
                this.notes.splice(i, 1);
            }
        }
    }
    
    showFeedback(x, y, text, points, color) {
        // Create feedback text
        const feedback = this.add.text(
            x,
            y,
            text + (points > 0 ? `\n+${points}` : ''),
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                fontStyle: 'bold',
                color: this.rgbToHex(color),
                align: 'center'
            }
        );
        feedback.setOrigin(0.5);
        
        // Animate and remove
        this.tweens.add({
            targets: feedback,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                feedback.destroy();
            }
        });
    }
    
    rgbToHex(color) {
        // Convert RGB integer to hex string
        return '#' + color.toString(16).padStart(6, '0');
    }
    
    updateBoss(time) {
        // Check if it's time for boss to ask a question
        if (!this.boss.isQuestioning && time > this.boss.questionTimer) {
            this.askBossQuestion();
        }
    }
    
    askBossQuestion() {
        if (this.gameOver) return;
        
        // Set boss to questioning state
        this.boss.isQuestioning = true;
        
        // Play boss question sound
        this.sound.play('bossQuestion');
        
        // Get random question
        const question = this.bossQuestions[Phaser.Math.Between(0, this.bossQuestions.length - 1)];
        
        // Show question bubble
        const questionBubble = this.add.rectangle(
            this.boss.x + 100,
            this.boss.y - 50,
            300,
            80,
            0xffffff,
            1
        );
        questionBubble.setStrokeStyle(2, 0x000000);
        
        const questionText = this.add.text(
            questionBubble.x,
            questionBubble.y,
            question,
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#000000',
                wordWrap: { width: 280 }
            }
        );
        questionText.setOrigin(0.5);
        
        // Interrupt the presentation
        this.spawnNoteEvent.paused = true;
        
        // Spawn a sequence of quick notes to answer the question
        const quickNoteCount = 5;
        const quickNoteDelay = 500;
        
        // Create a special sequence
        for (let i = 0; i < quickNoteCount; i++) {
            this.time.delayedCall(i * quickNoteDelay, () => {
                if (!this.gameOver) {
                    // Spawn note in sequence pattern
                    const lane = i % this.noteLanes;
                    const laneX = (this.cameras.main.width - (this.noteLanes * this.laneWidth)) / 2 + this.laneWidth / 2 + lane * this.laneWidth;
                    
                    // Create note
                    const note = this.add.rectangle(laneX, 0, 50, 20, 0xff0000); // Red for boss questions
                    note.lane = lane;
                    note.hit = false;
                    note.isBossNote = true;
                    
                    // Add to notes array
                    this.notes.push(note);
                }
            });
        }
        
        // Resume normal notes after question sequence
        this.time.delayedCall(quickNoteCount * quickNoteDelay + 1000, () => {
            if (!this.gameOver) {
                // Remove question bubble
                this.tweens.add({
                    targets: [questionBubble, questionText],
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        questionBubble.destroy();
                        questionText.destroy();
                    }
                });
                
                // Resume normal gameplay
                this.spawnNoteEvent.paused = false;
                this.boss.isQuestioning = false;
                
                // Set next question time
                this.boss.questionTimer = this.time.now + this.boss.questionInterval;
            }
        });
    }
    
    updateAudience() {
        // Update audience members based on approval rating
        this.audience.forEach(member => {
            // Adjust member position based on approval
            const targetY = member.originalY - (member.approval / 100) * 20;
            
            // Smoothly move towards target
            member.y = Phaser.Math.Linear(member.y, targetY, 0.1);
            
            // Change color based on approval
            if (member.approval > 70) {
                member.fillColor = 0x4CAF50; // Green
            } else if (member.approval > 40) {
                member.fillColor = 0xFFC107; // Yellow/amber
            } else {
                member.fillColor = 0xF44336; // Red
            }
        });
        
        // Update approval meter
        this.approvalMeter.height = this.audienceApproval * 3;
        this.approvalMeter.y = this.cameras.main.height / 2 + 150 - this.approvalMeter.height;
        
        // Change meter color based on approval
        if (this.audienceApproval > 70) {
            this.approvalMeter.fillColor = 0x4CAF50; // Green
        } else if (this.audienceApproval > 40) {
            this.approvalMeter.fillColor = 0xFFC107; // Yellow/amber
        } else {
            this.approvalMeter.fillColor = 0xF44336; // Red
        }
    }
    
    changeApproval(amount) {
        // Change the audience approval rating
        this.audienceApproval = Phaser.Math.Clamp(this.audienceApproval + amount, 0, 100);
        
        // Update audience members individual approval
        this.audience.forEach(member => {
            member.approval = Phaser.Math.Clamp(member.approval + amount, 0, 100);
        });
    }
    
    endGame() {
        if (this.gameOver) return;
        
        // Set game over flag
        this.gameOver = true;
        
        // Stop timers
        this.timerEvent.remove();
        this.spawnNoteEvent.remove();
        
        // Calculate final results
        const accuracyRate = this.hitNotes / this.totalNotes;
        const passed = this.audienceApproval >= 50;
        
        // Play finish sound
        if (passed) {
            this.sound.play('applause');
        } else {
            this.sound.play('gameOverSound');
        }
        
        // Create results panel
        const resultsBg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            400,
            350,
            0x000000,
            0.8
        );
        
        const resultsTitle = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 140,
            passed ? 'Presentation Complete!' : 'Presentation Failed!',
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                fontStyle: 'bold',
                color: passed ? '#4CAF50' : '#F44336'
            }
        );
        resultsTitle.setOrigin(0.5);
        
        // Performance stats
        const statsY = this.cameras.main.height / 2 - 70;
        const statsSpacing = 30;
        
        this.add.text(
            this.cameras.main.width / 2,
            statsY,
            `Score: ${this.score}`,
            {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
        
        this.add.text(
            this.cameras.main.width / 2,
            statsY + statsSpacing,
            `Accuracy: ${Math.round(accuracyRate * 100)}%`,
            {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
        
        this.add.text(
            this.cameras.main.width / 2,
            statsY + statsSpacing * 2,
            `Max Combo: ${this.maxCombo}`,
            {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
        
        this.add.text(
            this.cameras.main.width / 2,
            statsY + statsSpacing * 3,
            `Audience Approval: ${Math.round(this.audienceApproval)}%`,
            {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: this.audienceApproval >= 50 ? '#4CAF50' : '#F44336'
            }
        ).setOrigin(0.5);
        
        // Add button to continue
        const continueButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            passed ? 'Complete Game' : 'Try Again',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                fontStyle: 'bold',
                backgroundColor: passed ? '#4CAF50' : '#2196F3',
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
            if (passed) {
                // Game complete - go to game over scene
                updateGameState({
                    totalScore: getGameState().totalScore + this.score
                });
                
                // Save progress
                saveGameProgress();
                
                // Start game over scene
                this.scene.start('GameOverScene');
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
