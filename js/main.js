// Initialize the game when the window loads
window.onload = function() {
    // Create the game instance
    const game = new Phaser.Game(config);
    
    // Make game instance globally accessible
    window.game = game;
    
    // Store game settings in the game registry
    game.registry.set('gameSettings', gameSettings);
    
    console.log("Game initialized");
};

// Helper function to get current game state
function getGameState() {
    if (!window.game) return gameSettings;
    return window.game.registry.get('gameSettings') || gameSettings;
}

// Helper function to update game state
function updateGameState(newState) {
    const currentState = getGameState();
    window.game.registry.set('gameSettings', {...currentState, ...newState});
}

// Helper function to reset game
function resetGame() {
    window.game.registry.set('gameSettings', gameSettings);
    window.game.scene.start('SplashScene');
}
