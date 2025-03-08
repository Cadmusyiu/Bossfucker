# Boss Challenger

A fun browser-based game where players challenge their boss through three different mini-games.

## Game Overview

Boss Challenger is a game that lets players personalize their experience by inputting their name and their boss's name and photo. Players then progress through three entertaining mini-games:

1. **Paper Avalanche** - A match-3 style game where players organize falling documents before they pile up.
2. **Coffee Run Chaos** - Players deliver coffee to colleagues while avoiding the boss.
3. **Presentation Panic** - A rhythm game where players must time button presses to give a perfect presentation.

## Setup Instructions

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Local web server (for development)

### Installation

1. Clone the repository or download the source code
2. Set up asset directories:

```
/boss-challenger/
  ├── assets/
  │   ├── images/
  │   ├── audio/
  │   └── html/
```

3. Place the following files in the `html` directory:
   - `input-form.html`

4. Add required image assets to the `images` directory:
   - `logo.png`
   - `start-button.png`
   - `background-pattern.png`
   - `default-boss-1.png`
   - `default-boss-2.png`
   - `default-boss-3.png`
   - (plus other required game assets)

5. Add required audio assets to the `audio` directory:
   - `button-click.mp3`
   - `title-music.mp3`
   - (plus other required game sounds)

6. Launch the game with a local server

### Running the Game

For a simple local server, you can use Python:

```bash
# If you have Python 3
python -m http.server

# If you have Python 2
python -m SimpleHTTPServer
```

Then open your browser and navigate to: `http://localhost:8000`

## Development Guide

### Game Structure

The game is built with the Phaser 3 framework and follows a scene-based structure:

- **BootScene**: Loads initial assets and shows loading progress
- **SplashScene**: Displays title screen with start button
- **InputScene**: Gathers player name and boss information
- **StageOneScene**: Paper Avalanche game
- **StageTwoScene**: Coffee Run Chaos game  
- **StageThreeScene**: Presentation Panic game
- **GameOverScene**: Shows final results and offers replay

### Key Game Classes

- **Player.js**: Handles player properties and actions
- **Boss.js**: Controls boss character behavior
- **ImageProcessor.js**: Processes uploaded boss images
- **Storage.js**: Manages game state persistence

### Adding New Features

To add a new mini-game:

1. Create a new scene class (e.g., `StageFourScene.js`)
2. Add it to the scene list in `config.js`
3. Update progression logic in the previous stage
4. Add relevant assets to the assets folders

## Credits

- Game concept and development: [Your Name]
- Game framework: [Phaser 3](https://phaser.io/)
- Sound effects: [Source] 
- Music: [Source]

## License

This project is licensed under the MIT License - see the LICENSE file for details.
