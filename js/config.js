// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    backgroundColor: '#4488aa',
    scene: [
        BootScene,
        SplashScene,
        InputScene,
        StageOneScene,
        StageTwoScene, 
        StageThreeScene,
        GameOverScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Game settings
const gameSettings = {
    // General game settings
    playerName: '',
    bossName: '',
    bossImage: null,
    currentStage: 0,
    totalScore: 0,
    
    // Stage-specific settings
    stageOneSettings: {
        gameDuration: 60,
        targetScore: 1000,
        paperTypes: 5,
        fallSpeed: 100
    },
    
    stageTwoSettings: {
        gameDuration: 90,
        coffeeOrders: 8,
        bossSpeed: 100,
        playerSpeed: 150
    },
    
    stageThreeSettings: {
        gameDuration: 120,
        notesPerSecond: 1.5,
        bossInterruptionFrequency: 10
    }
};
