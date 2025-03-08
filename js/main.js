// Initialize the game when the window loads
window.onload = function() {
    // Create the game instance
    const game = new Phaser.Game(config);
    
    // Make game instance globally accessible
    window.game = game;
    
    // Store game settings in the game registry
    game.registry.set('gameSettings', gameSettings);
    
    // Initialize storage
    initializeStorage();
    
    // Handle window resize
    window.addEventListener('resize', function() {
        game.scale.refresh();
    });
    
    // Handle visibility change (pause/resume)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Pause game if tab is not visible
            game.scene.getScenes(true).forEach(function(scene) {
                if (scene.scene.isActive()) {
                    scene.scene.pause();
                }
            });
        } else {
            // Resume game when tab becomes visible again
            game.scene.getScenes(true).forEach(function(scene) {
                if (scene.scene.isPaused()) {
                    scene.scene.resume();
                }
            });
        }
    });
};

// Helper function to get current game state
function getGameState() {
    return window.game.registry.get('gameSettings');
}

// Helper function to update game state
function updateGameState(newState) {
    const currentState = getGameState();
    window.game.registry.set('gameSettings', {...currentState, ...newState});
    
    // Save to local storage
    saveGameProgress();
}

// Helper function to reset game
function resetGame() {
    window.game.registry.set('gameSettings', gameSettings);
    clearGameProgress();
    window.game.scene.start('SplashScene');
}
