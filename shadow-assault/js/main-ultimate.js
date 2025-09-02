console.log('Starting Shadow Assault - Ultimate Edition...');

import * as THREE from 'https://unpkg.com/three@0.156.1/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.156.1/examples/jsm/controls/PointerLockControls.js';

// Game Configuration
const CONFIG = {
    MAP_SIZE: 200, // Much larger map
    ENEMY_COUNT: 15,
    ENEMY_ATTACK_RANGE: 25,
    ENEMY_ATTACK_DAMAGE: 15,
    ENEMY_ATTACK_COOLDOWN: 2000,
    PLAYER_SPEED: 0.3,
    SPRINT_MULTIPLIER: 1.8
};

// Enhanced Game State
const gameState = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    clock: new THREE.Clock(),
    player: {
        health: 100,
        maxHealth: 100,
        velocity: new THREE.Vector3(),
        isJumping: false,
        position: new THREE.Vector3(0, 1.6, 0),
        kills: 0,
        score: 0,
        lastDamaged: 0
    },
    weapons: {
        current: 'assault_rifle',
        assault_rifle: {
            name: 'AK-47',
            ammo: 30,
            maxAmmo: 30,
            reserveAmmo: 120,
            damage: 35,
            fireRate: 150,
            lastShot: 0,
            isReloading: false,
            reloadTime: 2500,
            model: null,
            muzzle: null
        },
        sniper: {
            name: 'AWP',
            ammo: 5,
            maxAmmo: 5,
            reserveAmmo: 25,
            damage: 90,
            fireRate: 1500,
            lastShot: 0,
            isReloading: false,
            reloadTime: 3000,
            model: null,
            muzzle: null
        },
        pistol: {
            name: 'Glock',
            ammo: 15,
            maxAmmo: 15,
            reserveAmmo: 60,
            damage: 25,
            fireRate: 200,
            lastShot: 0,
            isReloading: false,
            reloadTime: 1500,
            model: null,
            muzzle: null
        }
    },
    enemies: [],
    keys: { w: false, a: false, s: false, d: false, space: false, shift: false },
    mouse: { down: false, sensitivity: 0.002 },
    effects: [],
    sounds: {},
    materials: {},
    textures: {}
};

// Enhanced Audio System with Better Sounds
function initAudio() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        function createAdvancedSound(config) {
            return () => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                const filter = audioContext.createBiquadFilter();
                
                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
                oscillator.type = config.type || 'sine';
                
                if (config.frequencyChange) {
                    oscillator.frequency.exponentialRampToValueAtTime(
                        config.frequencyChange, 
                        audioContext.currentTime + config.duration
                    );
                }
                
                filter.type = config.filterType || 'lowpass';
                filter.frequency.setValueAtTime(config.filterFreq || 1000, audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(config.volume || 0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + config.duration);
            };
        }
        
        gameState.sounds = {
            shoot: createAdvancedSound({ frequency: 200, frequencyChange: 100, duration: 0.1, type: 'square', volume: 0.4 }),
            reload: createAdvancedSound({ frequency: 300, frequencyChange: 200, duration: 0.4, type: 'sawtooth', volume: 0.3 }),
            hit: createAdvancedSound({ frequency: 800, frequencyChange: 400, duration: 0.2, type: 'triangle', volume: 0.5 }),
            jump: createAdvancedSound({ frequency: 150, frequencyChange: 300, duration: 0.3, type: 'sine', volume: 0.2 }),
            weaponSwitch: createAdvancedSound({ frequency: 400, frequencyChange: 600, duration: 0.15, type: 'square', volume: 0.3 }),
            enemyAttack: createAdvancedSound({ frequency: 100, frequencyChange: 200, duration: 0.3, type: 'sawtooth', volume: 0.4 }),
            playerDamage: createAdvancedSound({ frequency: 600, frequencyChange: 200, duration: 0.5, type: 'triangle', volume: 0.6 })
        };
        
        console.log('Enhanced audio system initialized');
    } catch (error) {
        console.warn('Audio initialization failed:', error);
        // Fallback silent functions
        gameState.sounds = {
            shoot: () => {}, reload: () => {}, hit: () => {}, jump: () => {},
            weaponSwitch: () => {}, enemyAttack: () => {}, playerDamage: () => {}
        };
    }
}

// Enhanced Graphics with Better Visuals
function initGraphics() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
    });
    
    // Much better renderer settings
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x87CEEB); // Sky blue
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.physicallyCorrectLights = true;
    
    // Add fog for depth
    scene.fog = new THREE.Fog(0x87CEEB, 50, CONFIG.MAP_SIZE * 0.8);
    
    document.body.appendChild(renderer.domElement);
    
    gameState.scene = scene;
    gameState.camera = camera;
    gameState.renderer = renderer;
    
    console.log('Enhanced graphics system initialized');
}

// Procedural Texture Creation for Better Visuals
function createTextures() {
    // Create canvas for procedural textures
    function createCanvasTexture(width, height, drawFunction) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        drawFunction(ctx, width, height);
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    // Sci-fi floor texture
    gameState.textures.floor = createCanvasTexture(256, 256, (ctx, w, h) => {
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, '#2C3E50');
        gradient.addColorStop(0.5, '#34495E');
        gradient.addColorStop(1, '#2C3E50');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        
        // Grid pattern
        ctx.strokeStyle = '#00BFFF';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7;
        const gridSize = 32;
        for (let i = 0; i <= w; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, h);
            ctx.stroke();
        }
        for (let j = 0; j <= h; j += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(w, j);
            ctx.stroke();
        }
        
        // Tech details
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#00FFFF';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            ctx.fillRect(x, y, 4, 4);
        }
    });
    
    // Wall texture
    gameState.textures.wall = createCanvasTexture(128, 128, (ctx, w, h) => {
        ctx.fillStyle = '#34495E';
        ctx.fillRect(0, 0, w, h);
        
        // Panel lines
        ctx.strokeStyle = '#00BCD4';
        ctx.lineWidth = 3;
        for (let i = 0; i < w; i += 16) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, h);
            ctx.stroke();
        }
        
        // Rivets
        ctx.fillStyle = '#FFD700';
        for (let i = 8; i < w; i += 16) {
            for (let j = 8; j < h; j += 16) {
                ctx.beginPath();
                ctx.arc(i, j, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
    
    console.log('Procedural textures created');
}

// Enhanced Lighting System
function initLighting() {
    // Brighter ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    gameState.scene.add(ambientLight);
    
    // Multiple directional lights for better illumination
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(100, 150, 100);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 400;
    sunLight.shadow.camera.left = -200;
    sunLight.shadow.camera.right = 200;
    sunLight.shadow.camera.top = 200;
    sunLight.shadow.camera.bottom = -200;
    gameState.scene.add(sunLight);
    
    // Secondary light for fill
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.4);
    fillLight.position.set(-50, 100, -50);
    gameState.scene.add(fillLight);
    
    // Dynamic colored lights around the map
    const colors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xFFD93D, 0x6BCF7F, 0xFF8A65, 0xBA68C8];
    for (let i = 0; i < 12; i++) {
        const light = new THREE.PointLight(colors[i % colors.length], 0.8, 60);
        const angle = (i / 12) * Math.PI * 2;
        const radius = CONFIG.MAP_SIZE * 0.4;
        light.position.set(
            Math.cos(angle) * radius,
            15,
            Math.sin(angle) * radius
        );
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        gameState.scene.add(light);
    }
    
    console.log('Enhanced lighting system with', colors.length, 'dynamic lights initialized');
}

// Create Much Larger Map
function createMap() {
    createTextures();
    
    // Much larger floor
    const floorGeometry = new THREE.PlaneGeometry(CONFIG.MAP_SIZE, CONFIG.MAP_SIZE, 50, 50);
    const floorMaterial = new THREE.MeshLambertMaterial({ 
        map: gameState.textures.floor,
        transparent: false
    });
    gameState.textures.floor.repeat.set(20, 20);
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    gameState.scene.add(floor);
    
    // Create multiple building complexes across the larger map
    const buildingCount = 8;
    for (let i = 0; i < buildingCount; i++) {
        const angle = (i / buildingCount) * Math.PI * 2;
        const distance = 40 + Math.random() * 40;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        createBuildingComplex(x, z);
    }
    
    // Add scattered cover objects
    for (let i = 0; i < 30; i++) {
        const x = (Math.random() - 0.5) * CONFIG.MAP_SIZE * 0.8;
        const z = (Math.random() - 0.5) * CONFIG.MAP_SIZE * 0.8;
        createCoverObject(x, z);
    }
    
    // Perimeter walls (much larger)
    const wallHeight = 15;
    const wallThickness = 2;
    const mapBoundary = CONFIG.MAP_SIZE / 2;
    
    const wallMaterial = new THREE.MeshLambertMaterial({ 
        map: gameState.textures.wall,
        transparent: false
    });
    gameState.textures.wall.repeat.set(10, 3);
    
    const wallPositions = [
        { pos: [0, wallHeight/2, mapBoundary], size: [CONFIG.MAP_SIZE, wallHeight, wallThickness] },
        { pos: [0, wallHeight/2, -mapBoundary], size: [CONFIG.MAP_SIZE, wallHeight, wallThickness] },
        { pos: [mapBoundary, wallHeight/2, 0], size: [wallThickness, wallHeight, CONFIG.MAP_SIZE] },
        { pos: [-mapBoundary, wallHeight/2, 0], size: [wallThickness, wallHeight, CONFIG.MAP_SIZE] }
    ];
    
    wallPositions.forEach((wall) => {
        const geometry = new THREE.BoxGeometry(...wall.size);
        const mesh = new THREE.Mesh(geometry, wallMaterial);
        mesh.position.set(...wall.pos);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        gameState.scene.add(mesh);
    });
    
    console.log(`Large map created with ${CONFIG.MAP_SIZE}x${CONFIG.MAP_SIZE} area`);
}

function createBuildingComplex(centerX, centerZ) {
    const colors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xFFD93D, 0x6BCF7F, 0xFF8A65];
    const buildingColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Main building
    const mainHeight = 8 + Math.random() * 12;
    const mainBuilding = new THREE.Mesh(
        new THREE.BoxGeometry(12, mainHeight, 12),
        new THREE.MeshLambertMaterial({ color: buildingColor, transparent: true, opacity: 0.9 })
    );
    mainBuilding.position.set(centerX, mainHeight/2, centerZ);
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    gameState.scene.add(mainBuilding);
    
    // Smaller connected buildings
    for (let i = 0; i < 3; i++) {
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetZ = (Math.random() - 0.5) * 20;
        const height = 4 + Math.random() * 8;
        
        const building = new THREE.Mesh(
            new THREE.BoxGeometry(6, height, 6),
            new THREE.MeshLambertMaterial({ 
                color: new THREE.Color(buildingColor).multiplyScalar(0.8 + Math.random() * 0.4)
            })
        );
        building.position.set(centerX + offsetX, height/2, centerZ + offsetZ);
        building.castShadow = true;
        building.receiveShadow = true;
        gameState.scene.add(building);
    }
}

function createCoverObject(x, z) {
    const types = ['box', 'cylinder', 'wall'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF39C12, 0x9B59B6, 0x1ABC9C];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    let geometry, height;
    
    switch (type) {
        case 'box':
            height = 2 + Math.random() * 3;
            geometry = new THREE.BoxGeometry(2, height, 2);
            break;
        case 'cylinder':
            height = 2 + Math.random() * 4;
            geometry = new THREE.CylinderGeometry(1, 1, height);
            break;
        case 'wall':
            height = 3 + Math.random() * 2;
            geometry = new THREE.BoxGeometry(6, height, 1);
            break;
    }
    
    const material = new THREE.MeshLambertMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, height/2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    gameState.scene.add(mesh);
}

// Enhanced Enemy System with Combat AI
function createEnemies() {
    for (let i = 0; i < CONFIG.ENEMY_COUNT; i++) {
        // Spread enemies across the larger map
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * (CONFIG.MAP_SIZE * 0.3);
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        const enemy = createEnemy([x, 0, z], i);
        gameState.enemies.push(enemy);
    }
    
    console.log(`Created ${CONFIG.ENEMY_COUNT} attacking enemies across large map`);
}

function createEnemy(position, id) {
    const group = new THREE.Group();
    
    const enemyTypes = ['aggressive', 'sniper', 'patrol', 'guard'];
    const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const colors = [0xFF4757, 0x5352ED, 0x00D2D3, 0xFF6348, 0x7BED9F, 0xFFD93D, 0xFF6B6B];
    const color = colors[id % colors.length];
    
    // More detailed enemy body
    const bodyGeometry = new THREE.BoxGeometry(1, 2.5, 0.8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.25;
    body.castShadow = true;
    group.add(body);
    
    // Head with aggressive styling
    const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color(color).multiplyScalar(1.3)
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.9;
    head.castShadow = true;
    group.add(head);
    
    // Glowing aggressive eyes
    const leftEye = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshBasicMaterial({ 
            color: 0xFF0000,
            emissive: 0xFF0000,
            emissiveIntensity: 0.8
        })
    );
    leftEye.position.set(-0.2, 2.9, 0.35);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshBasicMaterial({ 
            color: 0xFF0000,
            emissive: 0xFF0000,
            emissiveIntensity: 0.8
        })
    );
    rightEye.position.set(0.2, 2.9, 0.35);
    group.add(rightEye);
    
    // Weapon that can actually attack
    const weaponGeometry = new THREE.BoxGeometry(0.15, 0.15, 1.2);
    const weaponMaterial = new THREE.MeshLambertMaterial({ color: 0x2C3E50 });
    const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
    weapon.position.set(0.6, 2, 0.5);
    weapon.rotation.y = -Math.PI / 6;
    group.add(weapon);
    
    // Health bar
    const healthBarBg = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 0.15),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    healthBarBg.position.set(0, 3.8, 0);
    group.add(healthBarBg);
    
    const healthBarFg = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 0.12),
        new THREE.MeshBasicMaterial({ color: 0x00FF00 })
    );
    healthBarFg.position.set(0, 3.8, 0.01);
    group.add(healthBarFg);
    
    group.position.set(...position);
    gameState.scene.add(group);
    
    return {
        id: id,
        model: group,
        health: 100,
        maxHealth: 100,
        type: enemyType,
        color: color,
        position: new THREE.Vector3(...position),
        targetPosition: new THREE.Vector3(...position),
        rotation: 0,
        targetRotation: 0,
        lastAttack: 0,
        attackCooldown: CONFIG.ENEMY_ATTACK_COOLDOWN,
        moveSpeed: 0.02 + Math.random() * 0.03,
        detectionRange: CONFIG.ENEMY_ATTACK_RANGE + Math.random() * 10,
        alertLevel: 0,
        healthBarFg: healthBarFg,
        leftEye: leftEye,
        rightEye: rightEye,
        weapon: weapon,
        isAlive: true,
        patrolTarget: new THREE.Vector3(
            position[0] + (Math.random() - 0.5) * 40,
            0,
            position[2] + (Math.random() - 0.5) * 40
        )
    };
}

// Fixed Controls System
function initControls() {
    const controls = new PointerLockControls(gameState.camera, document.body);
    gameState.scene.add(controls.getObject());
    gameState.controls = controls;
    
    // More reliable key handling
    const handleKeyDown = (e) => {
        const key = e.key.toLowerCase();
        console.log('Key pressed:', key);
        
        if (key === 'w') gameState.keys.w = true;
        if (key === 'a') gameState.keys.a = true;
        if (key === 's') gameState.keys.s = true;
        if (key === 'd') gameState.keys.d = true;
        if (key === ' ') { gameState.keys.space = true; e.preventDefault(); }
        if (key === 'shift') gameState.keys.shift = true;
        
        // Weapon switching
        if (key === '1') switchWeapon('assault_rifle');
        if (key === '2') switchWeapon('sniper');
        if (key === '3') switchWeapon('pistol');
        
        // Reload
        if (key === 'r') reloadWeapon();
    };
    
    const handleKeyUp = (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w') gameState.keys.w = false;
        if (key === 'a') gameState.keys.a = false;
        if (key === 's') gameState.keys.s = false;
        if (key === 'd') gameState.keys.d = false;
        if (key === ' ') gameState.keys.space = false;
        if (key === 'shift') gameState.keys.shift = false;
    };
    
    // Multiple event listeners for better compatibility
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Mouse controls
    document.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            gameState.mouse.down = true;
            console.log('Mouse down');
        }
    });
    
    document.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            gameState.mouse.down = false;
            console.log('Mouse up');
        }
    });
    
    // Pointer lock with better feedback
    const requestPointerLock = () => {
        console.log('Requesting pointer lock...');
        controls.lock();
    };
    
    document.addEventListener('click', requestPointerLock);
    document.body.addEventListener('click', requestPointerLock);
    gameState.renderer.domElement.addEventListener('click', requestPointerLock);
    
    controls.addEventListener('lock', () => {
        console.log('✓ Controls activated!');
        updateUI();
    });
    
    controls.addEventListener('unlock', () => {
        console.log('Controls deactivated');
        updateUI();
    });
    
    console.log('Fixed controls system initialized');
}

// Weapon System
function createWeapons() {
    Object.keys(gameState.weapons).forEach(weaponKey => {
        if (weaponKey === 'current') return;
        
        const weapon = gameState.weapons[weaponKey];
        const weaponGroup = new THREE.Group();
        
        let bodyGeometry, bodyColor, barrelLength, scope = null;
        
        switch (weaponKey) {
            case 'assault_rifle':
                bodyGeometry = new THREE.BoxGeometry(0.2, 0.12, 1.2);
                bodyColor = 0x2C3E50;
                barrelLength = 0.8;
                break;
            case 'sniper':
                bodyGeometry = new THREE.BoxGeometry(0.15, 0.1, 1.6);
                bodyColor = 0x34495E;
                barrelLength = 1.2;
                // Add scope
                scope = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.04, 0.04, 0.4),
                    new THREE.MeshLambertMaterial({ color: 0x1C2833 })
                );
                scope.rotation.x = Math.PI / 2;
                scope.position.set(0, 0.1, -0.3);
                break;
            case 'pistol':
                bodyGeometry = new THREE.BoxGeometry(0.1, 0.08, 0.5);
                bodyColor = 0x2C3E50;
                barrelLength = 0.3;
                break;
        }
        
        const body = new THREE.Mesh(bodyGeometry, 
            new THREE.MeshLambertMaterial({ color: bodyColor }));
        body.position.set(0, 0, -0.4);
        weaponGroup.add(body);
        
        // Barrel
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, barrelLength),
            new THREE.MeshLambertMaterial({ color: 0x1C2833 })
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.03, -0.8 - barrelLength/2);
        weaponGroup.add(barrel);
        
        if (scope) weaponGroup.add(scope);
        
        // Muzzle flash
        const muzzle = new THREE.Mesh(
            new THREE.SphereGeometry(0.08),
            new THREE.MeshBasicMaterial({ 
                color: 0xFFD700, 
                transparent: true, 
                opacity: 0 
            })
        );
        muzzle.position.set(0, 0.03, -0.8 - barrelLength);
        weaponGroup.add(muzzle);
        
        // Position weapons
        switch (weaponKey) {
            case 'assault_rifle':
                weaponGroup.position.set(0.3, -0.3, -0.8);
                break;
            case 'sniper':
                weaponGroup.position.set(0.2, -0.35, -1.0);
                break;
            case 'pistol':
                weaponGroup.position.set(0.4, -0.25, -0.6);
                break;
        }
        
        gameState.camera.add(weaponGroup);
        weapon.model = weaponGroup;
        weapon.muzzle = muzzle;
        
        // Hide all except current
        if (weaponKey !== gameState.weapons.current) {
            weaponGroup.visible = false;
        }
    });
    
    console.log('Professional weapon system created');
}

function switchWeapon(weaponKey) {
    if (gameState.weapons[weaponKey] && weaponKey !== gameState.weapons.current) {
        // Hide current
        if (gameState.weapons[gameState.weapons.current].model) {
            gameState.weapons[gameState.weapons.current].model.visible = false;
        }
        
        // Show new
        gameState.weapons.current = weaponKey;
        if (gameState.weapons[weaponKey].model) {
            gameState.weapons[weaponKey].model.visible = true;
        }
        
        gameState.sounds.weaponSwitch();
        updateWeaponUI();
        console.log(`Switched to ${gameState.weapons[weaponKey].name}`);
    }
}

function reloadWeapon() {
    const weapon = gameState.weapons[gameState.weapons.current];
    
    if (weapon.isReloading || weapon.ammo === weapon.maxAmmo || weapon.reserveAmmo === 0) {
        return;
    }
    
    weapon.isReloading = true;
    gameState.sounds.reload();
    console.log(`Reloading ${weapon.name}...`);
    
    setTimeout(() => {
        const ammoNeeded = weapon.maxAmmo - weapon.ammo;
        const ammoToReload = Math.min(ammoNeeded, weapon.reserveAmmo);
        
        weapon.ammo += ammoToReload;
        weapon.reserveAmmo -= ammoToReload;
        weapon.isReloading = false;
        
        console.log(`${weapon.name} reloaded: ${weapon.ammo}/${weapon.maxAmmo}`);
        updateUI();
    }, weapon.reloadTime);
    
    updateUI();
}

function canShoot() {
    const weapon = gameState.weapons[gameState.weapons.current];
    const now = Date.now();
    return !weapon.isReloading && weapon.ammo > 0 && (now - weapon.lastShot) >= weapon.fireRate;
}

function shoot() {
    if (!canShoot()) return;
    
    const weapon = gameState.weapons[gameState.weapons.current];
    const now = Date.now();
    
    weapon.lastShot = now;
    weapon.ammo--;
    gameState.sounds.shoot();
    
    // Enhanced muzzle flash
    if (weapon.muzzle) {
        weapon.muzzle.material.opacity = 1;
        weapon.muzzle.scale.set(3, 3, 3);
        setTimeout(() => {
            weapon.muzzle.material.opacity = 0;
            weapon.muzzle.scale.set(1, 1, 1);
        }, 80);
    }
    
    // Stronger weapon recoil
    if (weapon.model) {
        const originalZ = weapon.model.position.z;
        weapon.model.position.z += 0.08;
        weapon.model.rotation.x += 0.02;
        setTimeout(() => {
            weapon.model.position.z = originalZ;
            weapon.model.rotation.x = 0;
        }, 120);
    }
    
    // Raycast for hits
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3(0, 0, -1);
    gameState.camera.getWorldDirection(direction);
    raycaster.set(gameState.camera.position, direction);
    
    const targets = gameState.enemies.filter(e => e.isAlive).map(e => e.model);
    const intersects = raycaster.intersectObjects(targets, true);
    
    if (intersects.length > 0) {
        const hitEnemy = gameState.enemies.find(e => 
            e.isAlive && (intersects[0].object === e.model || 
            e.model.children.includes(intersects[0].object))
        );
        
        if (hitEnemy) {
            hitEnemy.health -= weapon.damage;
            hitEnemy.alertLevel = 1;
            gameState.sounds.hit();
            
            createHitEffect(intersects[0].point, hitEnemy.color);
            
            // Update health bar
            if (hitEnemy.healthBarFg) {
                const healthPercent = Math.max(0, hitEnemy.health / hitEnemy.maxHealth);
                hitEnemy.healthBarFg.scale.x = healthPercent;
                hitEnemy.healthBarFg.material.color.setHex(
                    healthPercent > 0.6 ? 0x00FF00 : 
                    healthPercent > 0.3 ? 0xFFFF00 : 0xFF0000
                );
            }
            
            if (hitEnemy.health <= 0) {
                killEnemy(hitEnemy);
            }
        }
    }
    
    // Auto-reload
    if (weapon.ammo === 0 && weapon.reserveAmmo > 0) {
        setTimeout(() => reloadWeapon(), 300);
    }
    
    updateUI();
}

function createHitEffect(position, color) {
    const effect = new THREE.Mesh(
        new THREE.SphereGeometry(0.5),
        new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.9
        })
    );
    
    effect.position.copy(position);
    gameState.scene.add(effect);
    
    let scale = 0.1;
    const animate = () => {
        scale += 0.4;
        effect.scale.set(scale, scale, scale);
        effect.material.opacity -= 0.06;
        
        if (effect.material.opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            gameState.scene.remove(effect);
        }
    };
    animate();
}

function killEnemy(enemy) {
    enemy.isAlive = false;
    gameState.player.kills++;
    gameState.player.score += 150;
    
    // Bigger death effect
    const deathEffect = new THREE.Mesh(
        new THREE.SphereGeometry(3),
        new THREE.MeshBasicMaterial({
            color: enemy.color,
            transparent: true,
            opacity: 0.8
        })
    );
    
    deathEffect.position.copy(enemy.position);
    gameState.scene.add(deathEffect);
    
    let scale = 0.1;
    const animate = () => {
        scale += 0.5;
        deathEffect.scale.set(scale, scale, scale);
        deathEffect.material.opacity -= 0.04;
        
        if (deathEffect.material.opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            gameState.scene.remove(deathEffect);
        }
    };
    animate();
    
    setTimeout(() => {
        gameState.scene.remove(enemy.model);
    }, 3000);
    
    console.log(`Enemy eliminated! Score: ${gameState.player.score}`);
}

// Enhanced Movement System
function updateMovement() {
    if (!gameState.controls.isLocked) return;
    
    const deltaTime = gameState.clock.getDelta();
    const moveSpeed = gameState.keys.shift ? 
        CONFIG.PLAYER_SPEED * CONFIG.SPRINT_MULTIPLIER : CONFIG.PLAYER_SPEED;
    
    const direction = new THREE.Vector3();
    const sideways = new THREE.Vector3();
    
    gameState.controls.getDirection(direction);
    sideways.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
    
    // Apply movement with deltaTime for smooth motion
    const speedMultiplier = deltaTime * 60; // Normalize for 60fps
    
    if (gameState.keys.w) gameState.player.velocity.add(direction.clone().multiplyScalar(moveSpeed * speedMultiplier));
    if (gameState.keys.s) gameState.player.velocity.add(direction.clone().multiplyScalar(-moveSpeed * speedMultiplier));
    if (gameState.keys.a) gameState.player.velocity.add(sideways.clone().multiplyScalar(-moveSpeed * speedMultiplier));
    if (gameState.keys.d) gameState.player.velocity.add(sideways.clone().multiplyScalar(moveSpeed * speedMultiplier));
    
    // Enhanced jumping
    if (gameState.keys.space && !gameState.player.isJumping) {
        gameState.player.velocity.y = 0.35;
        gameState.player.isJumping = true;
        gameState.sounds.jump();
    }
    
    // Gravity
    gameState.player.velocity.y -= 0.02 * speedMultiplier;
    
    // Ground collision
    if (gameState.controls.getObject().position.y <= 1.6) {
        gameState.controls.getObject().position.y = 1.6;
        gameState.player.velocity.y = 0;
        gameState.player.isJumping = false;
    }
    
    // Apply movement
    gameState.controls.moveRight(gameState.player.velocity.x);
    gameState.controls.moveForward(gameState.player.velocity.z);
    gameState.controls.getObject().position.y += gameState.player.velocity.y;
    
    // Better friction
    gameState.player.velocity.x *= 0.82;
    gameState.player.velocity.z *= 0.82;
    
    // Update player position
    gameState.player.position.copy(gameState.controls.getObject().position);
}

// Aggressive Enemy AI that Actually Attacks
function updateEnemies() {
    const playerPos = gameState.player.position;
    const time = performance.now() / 1000;
    const deltaTime = gameState.clock.getDelta();
    
    gameState.enemies.forEach((enemy, index) => {
        if (!enemy.isAlive) return;
        
        const distanceToPlayer = enemy.position.distanceTo(playerPos);
        const directionToPlayer = new THREE.Vector3().subVectors(playerPos, enemy.position).normalize();
        
        // Dynamic animations
        enemy.model.position.y = enemy.position.y + Math.sin(time * 2 + index) * 0.1;
        
        // Pulsing aggressive eyes
        if (enemy.leftEye && enemy.rightEye) {
            const intensity = 0.5 + 0.5 * Math.sin(time * 4 + index);
            enemy.leftEye.material.emissiveIntensity = intensity;
            enemy.rightEye.material.emissiveIntensity = intensity;
            
            // Eyes glow brighter when player is close
            if (distanceToPlayer < enemy.detectionRange) {
                enemy.leftEye.material.color.setHex(0xFF0000);
                enemy.rightEye.material.color.setHex(0xFF0000);
                enemy.leftEye.scale.setScalar(1.2 + intensity * 0.3);
                enemy.rightEye.scale.setScalar(1.2 + intensity * 0.3);
            }
        }
        
        // AI Behavior based on distance and type
        if (distanceToPlayer < enemy.detectionRange) {
            enemy.alertLevel = Math.min(1, enemy.alertLevel + deltaTime * 2);
            
            // Face player aggressively
            const targetAngle = Math.atan2(
                playerPos.x - enemy.position.x,
                playerPos.z - enemy.position.z
            );
            enemy.model.rotation.y = THREE.MathUtils.lerp(enemy.model.rotation.y, targetAngle, 0.1);
            
            // ENEMY ATTACKS!
            const now = Date.now();
            if (distanceToPlayer < CONFIG.ENEMY_ATTACK_RANGE && 
                (now - enemy.lastAttack) > enemy.attackCooldown) {
                
                attackPlayer(enemy, distanceToPlayer);
                enemy.lastAttack = now;
            }
            
            // Move towards player for different enemy types
            switch (enemy.type) {
                case 'aggressive':
                    if (distanceToPlayer > 8) {
                        enemy.position.add(directionToPlayer.clone().multiplyScalar(enemy.moveSpeed * 2));
                        enemy.model.position.copy(enemy.position);
                    }
                    break;
                    
                case 'sniper':
                    // Snipers try to maintain distance
                    if (distanceToPlayer < 15) {
                        enemy.position.add(directionToPlayer.clone().multiplyScalar(-enemy.moveSpeed));
                        enemy.model.position.copy(enemy.position);
                    }
                    break;
                    
                case 'guard':
                    // Guards move closer but keep some distance
                    if (distanceToPlayer > 12 && distanceToPlayer < 20) {
                        enemy.position.add(directionToPlayer.clone().multiplyScalar(enemy.moveSpeed));
                        enemy.model.position.copy(enemy.position);
                    }
                    break;
            }
            
            // Change color when alert
            enemy.model.children.forEach(child => {
                if (child.material && child.material.color && child !== enemy.healthBarFg) {
                    const alertColor = new THREE.Color(enemy.color).lerp(
                        new THREE.Color(0xFF0000),
                        enemy.alertLevel
                    );
                    child.material.color.copy(alertColor);
                }
            });
            
        } else {
            // Patrol behavior when player not detected
            enemy.alertLevel = Math.max(0, enemy.alertLevel - deltaTime);
            
            switch (enemy.type) {
                case 'patrol':
                    // Move towards patrol target
                    const distanceToPatrol = enemy.position.distanceTo(enemy.patrolTarget);
                    if (distanceToPatrol < 3) {
                        // Set new patrol target
                        enemy.patrolTarget.set(
                            enemy.position.x + (Math.random() - 0.5) * 40,
                            0,
                            enemy.position.z + (Math.random() - 0.5) * 40
                        );
                    } else {
                        const patrolDirection = new THREE.Vector3().subVectors(enemy.patrolTarget, enemy.position).normalize();
                        enemy.position.add(patrolDirection.multiplyScalar(enemy.moveSpeed * 0.5));
                        enemy.model.position.copy(enemy.position);
                        
                        // Face patrol direction
                        const patrolAngle = Math.atan2(patrolDirection.x, patrolDirection.z);
                        enemy.model.rotation.y = THREE.MathUtils.lerp(enemy.model.rotation.y, patrolAngle, 0.02);
                    }
                    break;
                    
                default:
                    // Slow rotation when idle
                    enemy.model.rotation.y += 0.005;
                    break;
            }
        }
    });
}

// Main Game Loop
function gameLoop() {
    requestAnimationFrame(gameLoop);
    
    // Update all game systems
    updateMovement();
    updateEnemies();
    
    // Handle shooting
    if (gameState.mouse.down && gameState.controls.isLocked) {
        shoot();
    }
    
    // Update UI less frequently for performance
    if (Math.random() < 0.05) {
        updateUI();
    }
    
    // Render the scene
    gameState.renderer.render(gameState.scene, gameState.camera);
}

// Game Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Ultimate Shadow Assault...');
    
    try {
        // Initialize all systems
        initAudio();
        initGraphics();
        initLighting();
        createMap();
        createEnemies();
        initControls();
        createWeapons();
        
        // Position camera at spawn
        gameState.camera.position.set(0, 1.6, 0);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            gameState.camera.aspect = window.innerWidth / window.innerHeight;
            gameState.camera.updateProjectionMatrix();
            gameState.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Start the main game loop
        gameLoop();
        
        // Initial UI update
        updateUI();
        
        // Expose functions globally for UI interaction
        window.switchWeapon = switchWeapon;
        window.reloadWeapon = reloadWeapon;
        window.gameState = gameState;
        
        console.log('✓ Ultimate Shadow Assault initialized!');
        console.log(`✓ Map size: ${CONFIG.MAP_SIZE}x${CONFIG.MAP_SIZE}`);
        console.log(`✓ Enemies: ${CONFIG.ENEMY_COUNT} aggressive AI`);
        console.log('✓ Enhanced graphics and combat system ready!');
        
    } catch (error) {
        console.error('Game initialization failed:', error);
        document.body.innerHTML = `
            <div style="
                color: white; 
                padding: 40px; 
                background: linear-gradient(135deg, #FF4444, #CC0000); 
                font-family: Arial; 
                text-align: center;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border-radius: 15px;
                box-shadow: 0 0 30px rgba(255,68,68,0.5);
            ">
                <h2 style="margin-bottom: 20px; font-size: 32px;">⚠️ Game Failed to Load</h2>
                <p style="font-size: 18px; margin-bottom: 15px;">Error: ${error.message}</p>
                <p style="font-size: 16px; color: #FFE0E0;">Please refresh the page and try again.</p>
                <p style="font-size: 14px; color: #FFE0E0; margin-top: 20px;">Make sure you're using a modern browser with WebGL support.</p>
            </div>
        `;
    }
});

console.log('Ultimate Shadow Assault script loaded - Ready for combat!');

// Export for debugging
if (typeof window !== 'undefined') {
    window.debugGame = () => {
        console.log('Game State:', gameState);
        console.log('Player Position:', gameState.player.position);
        console.log('Enemies:', gameState.enemies.filter(e => e.isAlive).length, 'alive');
        console.log('Current Weapon:', gameState.weapons[gameState.weapons.current]);
    };
}

// Enemy Attack Function - DAMAGES PLAYER!
function attackPlayer(enemy, distance) {
    console.log(`Enemy ${enemy.id} attacking player!`);
    gameState.sounds.enemyAttack();
    
    // Visual attack effect
    const attackEffect = new THREE.Mesh(
        new THREE.SphereGeometry(1),
        new THREE.MeshBasicMaterial({
            color: 0xFF4444,
            transparent: true,
            opacity: 0.8
        })
    );
    
    const attackPos = new THREE.Vector3().copy(enemy.position);
    attackPos.y += 2;
    attackEffect.position.copy(attackPos);
    gameState.scene.add(attackEffect);
    
    // Animate attack effect
    let scale = 0.1;
    const animate = () => {
        scale += 0.3;
        attackEffect.scale.set(scale, scale, scale);
        attackEffect.material.opacity -= 0.08;
        
        if (attackEffect.material.opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            gameState.scene.remove(attackEffect);
        }
    };
    animate();
    
    // Weapon muzzle flash
    if (enemy.weapon) {
        const originalColor = enemy.weapon.material.color.clone();
        enemy.weapon.material.color.setHex(0xFFD700);
        enemy.weapon.material.emissive.setHex(0xFF4444);
        setTimeout(() => {
            enemy.weapon.material.color.copy(originalColor);
            enemy.weapon.material.emissive.setHex(0x000000);
        }, 150);
    }
    
    // DAMAGE PLAYER based on distance and enemy type
    let damage = CONFIG.ENEMY_ATTACK_DAMAGE;
    if (enemy.type === 'sniper') damage *= 1.5;
    if (enemy.type === 'aggressive') damage *= 1.2;
    
    // Reduce damage based on distance
    const damageMultiplier = Math.max(0.3, 1 - (distance / CONFIG.ENEMY_ATTACK_RANGE));
    damage = Math.floor(damage * damageMultiplier);
    
    gameState.player.health = Math.max(0, gameState.player.health - damage);
    gameState.player.lastDamaged = Date.now();
    
    gameState.sounds.playerDamage();
    
    // Screen damage effect
    showDamageEffect();
    
    console.log(`Player took ${damage} damage! Health: ${gameState.player.health}`);
    
    if (gameState.player.health <= 0) {
        gameOver();
    }
    
    updateUI();
}

function showDamageEffect() {
    const damageOverlay = document.createElement('div');
    damageOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, transparent 40%, rgba(255,0,0,0.5) 100%);
        pointer-events: none;
        z-index: 1000;
        animation: damageFlash 0.5s ease-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes damageFlash {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(damageOverlay);
    
    setTimeout(() => {
        document.body.removeChild(damageOverlay);
        document.head.removeChild(style);
    }, 500);
}

function gameOver() {
    console.log('GAME OVER!');
    
    const gameOverDiv = document.createElement('div');
    gameOverDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: 'Orbitron', monospace;
        font-size: 48px;
        z-index: 2000;
    `;
    
    gameOverDiv.innerHTML = `
        <div style="color: #FF4444; font-size: 64px; margin-bottom: 20px;">GAME OVER</div>
        <div style="font-size: 24px; margin-bottom: 10px;">Final Score: ${gameState.player.score}</div>
        <div style="font-size: 24px; margin-bottom: 30px;">Kills: ${gameState.player.kills}</div>
        <div style="font-size: 18px; color: #AAA;">Refresh to play again</div>
    `;
    
    document.body.appendChild(gameOverDiv);
    
    // Stop the game
    gameState.controls.unlock();
}

// Enhanced UI System
function updateUI() {
    const weapon = gameState.weapons[gameState.weapons.current];
    const isLocked = document.pointerLockElement !== null;
    
    const healthEl = document.getElementById('health');
    const ammoEl = document.getElementById('ammo');
    const weaponEl = document.getElementById('weapon');
    const scoreEl = document.getElementById('score');
    const statusEl = document.getElementById('controls-status');
    
    if (healthEl) {
        healthEl.innerHTML = `<span class="hud-icon">❤️</span><span>Health: ${gameState.player.health}</span>`;
        healthEl.style.color = gameState.player.health > 60 ? '#00FF00' : 
                              gameState.player.health > 30 ? '#FFD700' : '#FF4444';
    }
    
    if (ammoEl) {
        if (weapon.isReloading) {
            ammoEl.innerHTML = `<span class="hud-icon">🔄</span><span>Reloading...</span>`;
            ammoEl.style.color = '#FFD700';
        } else {
            ammoEl.innerHTML = `<span class="hud-icon">🔫</span><span>${weapon.ammo}/${weapon.reserveAmmo}</span>`;
            ammoEl.style.color = weapon.ammo > 5 ? '#00FF00' : '#FF4444';
        }
    }
    
    if (weaponEl) {
        weaponEl.innerHTML = `<span class="hud-icon">⚡</span><span>${weapon.name}</span>`;
    }
    
    if (scoreEl) {
        scoreEl.innerHTML = `💀 Kills: ${gameState.player.kills} | Score: ${gameState.player.score}`;
    }
    
    if (statusEl) {
        if (isLocked) {
            statusEl.innerHTML = `<span class="hud-icon">🎮</span><span>COMBAT MODE | 1-3: Weapons | R: Reload</span>`;
            statusEl.style.color = '#00FF00';
        } else {
            statusEl.innerHTML = `<span class="hud-icon">🎮</span><span>Click to Enter Combat</span>`;
            statusEl.style.color = '#FF6600';
        }
    }
    
    updateWeaponUI();
}

function updateWeaponUI() {
    const weaponSlots = document.querySelectorAll('.weapon-slot');
    weaponSlots.forEach(slot => {
        slot.classList.remove('active');
        if (slot.dataset.weapon === gameState.weapons.current) {
            slot.classList.add('active');
        }
    });
}