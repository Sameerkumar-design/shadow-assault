# Shadow Assault

## Overview
Shadow Assault is a 3D action game that immerses players in a thrilling combat experience. Players navigate through various levels, utilizing different weapons to defeat enemies while managing their health and resources.

## Recent Updates
- **Weapon Pack Integration**: Integrated Kenney's Weapon Pack with high-quality 3D models
- **Multiple Weapons**: Added 5 different weapons with unique characteristics
- **Enhanced UI**: Added weapon display and control instructions
- **Improved Weapon System**: Better hit detection and weapon switching

## Weapons Available
1. **Pistol** (Key: 1) - Balanced weapon, 15 rounds, moderate damage
2. **Rifle/Machine Gun** (Key: 2) - High fire rate, 30 rounds, lower damage per shot
3. **Shotgun** (Key: 3) - High damage, 8 rounds, spread shot pattern
4. **Sniper** (Key: 4) - Very high damage, 5 rounds, slow fire rate
5. **Grenade** (Key: 5) - Explosive projectile, 5 grenades, area damage

## Project Structure
The project is organized as follows:

```
shadow-assault
├── index.html          // Main HTML file with canvas and script imports
├── js/
│   ├── main.js         // Entry point: Sets up scene, renderer, loads modules
│   ├── player.js       // Player mechanics: Movement, camera, health
│   ├── weapons.js      // Weapon system: Pistol, Rifle, Grenade logic
│   ├── enemies.js      // Enemy AI: Patrol, chase, attack
│   ├── level.js        // Level setup: Geometry, obstacles, pickups
│   └── ui.js           // UI elements: HUD, crosshair
├── assets/
├── assets/
│   ├── models/         // 3D models from Kenney's Weapon Pack
│   │   ├── pistol.obj/.mtl     // Pistol model and materials
│   │   ├── machinegun.obj/.mtl // Rifle/Machine gun model
│   │   ├── shotgun.obj/.mtl    // Shotgun model
│   │   ├── sniper.obj/.mtl     // Sniper rifle model
│   │   ├── grenade.obj/.mtl    // Grenade model
│   │   ├── uzi.obj/.mtl        // Additional SMG model
│   │   ├── knife_sharp.obj/.mtl// Melee weapon model
│   │   ├── enemy.glb   // LowPoly Animated Monster from OpenGameArt
│   │   └── corridor.glb// Modular corridor from Sketchfab Dungeon Pack
│   ├── textures/       // Textures from Poly Haven
│   │   ├── floor.jpg   // Indoor floor texture
│   │   └── wall.jpg    // Wall texture
│   └── sounds/         // Audio files
│       ├── gunshot.mp3 // Pistol/Rifle sound from Mixkit
│       ├── explosion.mp3 // Grenade sound from Mixkit
│       ├── footsteps.mp3 // Footsteps from Mixkit
│       └── ambient.mp3 // Dungeon ambient from Pixabay
└── three.module.js     // Three.js library (download or CDN)
```

## Setup Instructions
1. Clone the repository or download the project files.
2. Open `index.html` in a web browser to start the game.
3. Ensure that all assets are correctly linked in the HTML file.

## Gameplay
- Players control a character that can move around the environment, interact with objects, and engage in combat with enemies.
- Utilize various weapons to defeat enemies and navigate through levels filled with obstacles and pickups.
- Manage health and resources to survive against enemy attacks.

## Controls
- **WASD** - Movement
- **Mouse** - Look around
- **Left Click** - Shoot
- **Space** - Jump
- **C** - Crouch
- **R** - Reload
- **1-5** - Switch weapons (Pistol, Rifle, Shotgun, Sniper, Grenade)
- **Click to start** - Click anywhere to enable pointer lock controls

## Asset Credits
- **Weapon Models**: Kenney's Weapon Pack (CC0 License) - www.kenney.nl
- **Three.js**: 3D graphics library - threejs.org
- **Additional Models**: Various CC0 and open-source assets

## Technical Features
- OBJ/MTL model loading with Three.js
- Multiple weapon system with realistic characteristics
- Raycast-based hit detection
- Spread pattern for shotgun
- Projectile physics for grenades
- Dynamic crosshair and HUD
- Pointer lock controls for FPS experience

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.