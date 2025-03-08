// Local storage key
const STORAGE_KEY = 'boss_challenger_progress';

// Initialize storage
function initializeStorage() {
    // Check if there's saved progress
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    
    if (savedProgress) {
        try {
            // Parse saved data
            const savedData = JSON.parse(savedProgress);
            
            // Update game settings with saved data (except the boss image which is handled separately)
            const { bossImage, ...otherSettings } = savedData;
            
            // Update game registry
            const currentSettings = window.game.registry.get('gameSettings');
            window.game.registry.set('gameSettings', {
                ...currentSettings,
                ...otherSettings
            });
            
            // Handle boss image separately (it's base64 encoded)
            if (bossImage) {
                window.game.registry.set('bossImage', bossImage);
            }
            
            console.log('Game progress loaded successfully');
        } catch (error) {
            console.error('Error loading saved game:', error);
            // If there's an error, clear the corrupt data
            localStorage.removeItem(STORAGE_KEY);
        }
    }
}

// Save game progress
function saveGameProgress() {
    // Get current game state
    const gameSettings = window.game.registry.get('gameSettings');
    const bossImage = window.game.registry.get('bossImage');
    
    // Create save data object
    const saveData = {
        ...gameSettings,
        bossImage: bossImage
    };
    
    // Save to local storage
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
        console.log('Game progress saved successfully');
    } catch (error) {
        console.error('Error saving game:', error);
    }
}

// Clear game progress
function clearGameProgress() {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Game progress cleared');
}

// Check if there's a saved game
function hasSavedGame() {
    return localStorage.getItem(STORAGE_KEY) !== null;
}
