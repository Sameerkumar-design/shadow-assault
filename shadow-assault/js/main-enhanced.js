console.log('Starting Shadow Assault - Enhanced Krunker.io Style...');

import * as THREE from 'https://unpkg.com/three@0.156.1/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.156.1/examples/jsm/controls/PointerLockControls.js';

// Game State
const gameState = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    player: {
        health: 100,
        maxHealth: 100,
        velocity: new THREE.Vector3(),
        isJumping: false,
        position: new THREE.Vector3(0, 1.6, 0),
        kills: 0,
        score: 0
    },
    weapons: {
        current: 'assault_rifle',
        assault_rifle: {
            name: 'AK-47',
            ammo: 30,
            maxAmmo: 30,
            reserveAmmo: 90,
            damage: 35,
            fireRate: 150, // ms between shots
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
            reserveAmmo: 20,
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
            reserveAmmo: 45,
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
    sounds: {}
};

// Audio System
function initAudio() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    function createSound(frequency, duration, type = 'sine') {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    gameState.sounds = {
        shoot: () => createSound(800, 0.1, 'square'),
        reload: () => createSound(400, 0.3, 'sawtooth'),
        hit: () => createSound(600, 0.2, 'triangle'),
        jump: () => createSound(300, 0.2, 'sine'),
        weaponSwitch: () => createSound(500, 0.1, 'square')
    };
}

// Enhanced Graphics Setup
function initGraphics() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
    });
    
    // Enhanced renderer settings
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x87CEEB); // Sky blue
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    document.body.appendChild(renderer.domElement);
    
    gameState.scene = scene;
    gameState.camera = camera;
    gameState.renderer = renderer;
    
    console.log('Enhanced graphics initialized');
}

// Improved Lighting System
function initLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    gameState.scene.add(ambientLight);
    
    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    gameState.scene.add(sunLight);
    
    // Colored accent lights for atmosphere
    const colors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xFFD93D, 0x6BCF7F];
    for (let i = 0; i < 5; i++) {
        const light = new THREE.PointLight(colors[i], 0.5, 50);
        const angle = (i / 5) * Math.PI * 2;
        light.position.set(
            Math.cos(angle) * 30,
            8,
            Math.sin(angle) * 30
        );
        gameState.scene.add(light);
    }
    
    console.log('Enhanced lighting system initialized');
}

// Modern Map Creation
function createMap() {
    // Stylized floor with grid pattern
    const floorGeometry = new THREE.PlaneGeometry(100, 100, 20, 20);
    const floorMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x2C3E50,
        transparent: true,
        opacity: 0.9
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    gameState.scene.add(floor);
    
    // Add grid lines for visual appeal
    const gridHelper = new THREE.GridHelper(100, 50, 0x34495E, 0x34495E);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    gameState.scene.add(gridHelper);
    
    // Create cover objects with varied heights and colors
    const coverData = [
        { pos: [15, 1.5, 15], size: [2, 3, 2], color: 0xE74C3C },
        { pos: [-15, 1, -15], size: [3, 2, 3], color: 0x3498DB },
        { pos: [20, 2, -10], size: [1.5, 4, 1.5], color: 0x2ECC71 },
        { pos: [-10, 1.5, 20], size: [2.5, 3, 2.5], color: 0xF39C12 },
        { pos: [0, 1, -25], size: [4, 2, 4], color: 0x9B59B6 },
        { pos: [25, 2.5, 0], size: [2, 5, 2], color: 0x1ABC9C },
        { pos: [-25, 1.5, 5], size: [3, 3, 2], color: 0xE67E22 }
    ];
    
    coverData.forEach(cover => {
        const geometry = new THREE.BoxGeometry(...cover.size);
        const material = new THREE.MeshLambertMaterial({ 
            color: cover.color,
            transparent: true,
            opacity: 0.8
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...cover.pos);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        gameState.scene.add(mesh);
    });
    
    // Perimeter walls
    const wallHeight = 8;
    const wallThickness = 1;
    const mapSize = 50;
    
    const wallPositions = [
        { pos: [0, wallHeight/2, mapSize], size: [mapSize*2, wallHeight, wallThickness] },
        { pos: [0, wallHeight/2, -mapSize], size: [mapSize*2, wallHeight, wallThickness] },
        { pos: [mapSize, wallHeight/2, 0], size: [wallThickness, wallHeight, mapSize*2] },
        { pos: [-mapSize, wallHeight/2, 0], size: [wallThickness, wallHeight, mapSize*2] }
    ];
    
    wallPositions.forEach((wall, index) => {
        const geometry = new THREE.BoxGeometry(...wall.size);
        const material = new THREE.MeshLambertMaterial({ 
            color: [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xFFD93D][index]
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...wall.pos);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        gameState.scene.add(mesh);
    });
    
    console.log('Modern map created');
}

// Enhanced Enemy System
function createEnemies() {
    const enemyData = [
        { pos: [20, 0, 20], color: 0xFF4757, type: 'aggressive' },
        { pos: [-20, 0, -20], color: 0x5352ED, type: 'defensive' },
        { pos: [30, 0, -15], color: 0x00D2D3, type: 'sniper' },
        { pos: [-15, 0, 25], color: 0xFF6348, type: 'patrol' },
        { pos: [0, 0, 35], color: 0x7BED9F, type: 'aggressive' },
        { pos: [35, 0, 0], color: 0xFFD93D, type: 'defensive' },
        { pos: [-30, 0, 10], color: 0xFF6B6B, type: 'sniper' }
    ];
    
    enemyData.forEach((data, index) => {
        const enemy = createEnemy(data.pos, data.color, data.type, index);
        gameState.enemies.push(enemy);
    });
    
    console.log(`Created ${gameState.enemies.length} enhanced enemies`);
}

function createEnemy(position, color, type, id) {
    const group = new THREE.Group();
    
    // Main body - more detailed
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.8, 0.5);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);
    
    // Head with visor effect
    const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const headMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color(color).multiplyScalar(1.2)
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.1;
    head.castShadow = true;
    group.add(head);
    
    // Glowing visor
    const visorGeometry = new THREE.PlaneGeometry(0.5, 0.2);
    const visorMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00FFFF,
        transparent: true,
        opacity: 0.8,
        emissive: 0x004444
    });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.position.set(0, 2.1, 0.31);
    group.add(visor);
    
    // Weapon
    const weaponGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.6);
    const weaponMaterial = new THREE.MeshLambertMaterial({ color: 0x2C3E50 });
    const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
    weapon.position.set(0.4, 1.5, 0.3);
    weapon.rotation.y = -Math.PI / 4;
    group.add(weapon);
    
    // Health bar
    const healthBarBg = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 0.1),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    healthBarBg.position.set(0, 2.8, 0);
    group.add(healthBarBg);
    
    const healthBarFg = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 0.08),
        new THREE.MeshBasicMaterial({ color: 0x00FF00 })
    );
    healthBarFg.position.set(0, 2.8, 0.01);
    group.add(healthBarFg);
    
    group.position.set(...position);
    gameState.scene.add(group);
    
    return {
        id: id,
        model: group,
        health: 100,
        maxHealth: 100,
        type: type,
        color: color,
        position: new THREE.Vector3(...position),
        target: new THREE.Vector3(),
        lastSeen: 0,
        alertLevel: 0,
        healthBarFg: healthBarFg,
        visor: visor,
        weapon: weapon,
        lastShot: 0,
        isAlive: true
    };
}

// Professional Weapon System
function createWeapons() {
    Object.keys(gameState.weapons).forEach(weaponKey => {
        if (weaponKey === 'current') return;
        
        const weapon = gameState.weapons[weaponKey];
        const weaponGroup = new THREE.Group();
        
        // Weapon body - more detailed based on type
        let bodyGeometry, bodyColor, barrelLength;
        
        switch (weaponKey) {
            case 'assault_rifle':
                bodyGeometry = new THREE.BoxGeometry(0.15, 0.1, 1.0);
                bodyColor = 0x2C3E50;
                barrelLength = 0.6;
                break;
            case 'sniper':
                bodyGeometry = new THREE.BoxGeometry(0.12, 0.08, 1.4);
                bodyColor = 0x34495E;
                barrelLength = 1.0;
                break;
            case 'pistol':
                bodyGeometry = new THREE.BoxGeometry(0.08, 0.06, 0.4);
                bodyColor = 0x2C3E50;
                barrelLength = 0.2;
                break;
        }
        
        const body = new THREE.Mesh(bodyGeometry, 
            new THREE.MeshLambertMaterial({ color: bodyColor }));
        body.position.set(0, 0, -0.3);
        weaponGroup.add(body);
        
        // Barrel
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, barrelLength),
            new THREE.MeshLambertMaterial({ color: 0x1C2833 })
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.02, -0.6 - barrelLength/2);
        weaponGroup.add(barrel);
        
        // Scope for sniper
        if (weaponKey === 'sniper') {
            const scope = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 0.3),
                new THREE.MeshLambertMaterial({ color: 0x1C2833 })
            );
            scope.rotation.x = Math.PI / 2;
            scope.position.set(0, 0.08, -0.4);
            weaponGroup.add(scope);
        }
        
        // Muzzle flash
        const muzzle = new THREE.Mesh(
            new THREE.SphereGeometry(0.05),
            new THREE.MeshBasicMaterial({ 
                color: 0xFFD700, 
                transparent: true, 
                opacity: 0 
            })
        );
        muzzle.position.set(0, 0.02, -0.6 - barrelLength);
        weaponGroup.add(muzzle);
        
        // Position based on weapon type
        switch (weaponKey) {
            case 'assault_rifle':
                weaponGroup.position.set(0.3, -0.25, -0.8);
                break;
            case 'sniper':
                weaponGroup.position.set(0.2, -0.3, -1.0);
                break;
            case 'pistol':
                weaponGroup.position.set(0.4, -0.2, -0.5);
                break;
        }
        
        gameState.camera.add(weaponGroup);
        weapon.model = weaponGroup;
        weapon.muzzle = muzzle;
        
        // Hide all weapons except current
        if (weaponKey !== gameState.weapons.current) {
            weaponGroup.visible = false;
        }
    });
    
    console.log('Professional weapon system created');
}

// Enhanced Controls System
function initControls() {
    const controls = new PointerLockControls(gameState.camera, document.body);
    gameState.scene.add(controls.getObject());
    gameState.controls = controls;
    
    // Enhanced key handling
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        
        // Movement keys
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
    });
    
    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w') gameState.keys.w = false;
        if (key === 'a') gameState.keys.a = false;
        if (key === 's') gameState.keys.s = false;
        if (key === 'd') gameState.keys.d = false;
        if (key === ' ') gameState.keys.space = false;
        if (key === 'shift') gameState.keys.shift = false;
    });
    
    // Mouse controls
    document.addEventListener('mousedown', (e) => {
        if (e.button === 0) gameState.mouse.down = true;
    });
    
    document.addEventListener('mouseup', (e) => {
        if (e.button === 0) gameState.mouse.down = false;
    });
    
    // Pointer lock
    document.addEventListener('click', () => {
        if (!document.pointerLockElement) {
            controls.lock();
        }
    });
    
    controls.addEventListener('lock', () => {
        console.log('Controls activated');
        updateUI();
    });
    
    controls.addEventListener('unlock', () => {
        console.log('Controls deactivated');
        updateUI();
    });
    
    console.log('Enhanced controls initialized');
}

// Weapon Management
function switchWeapon(weaponKey) {
    if (gameState.weapons[weaponKey] && weaponKey !== gameState.weapons.current) {
        // Hide current weapon
        if (gameState.weapons[gameState.weapons.current].model) {
            gameState.weapons[gameState.weapons.current].model.visible = false;
        }
        
        // Show new weapon
        gameState.weapons.current = weaponKey;
        if (gameState.weapons[weaponKey].model) {
            gameState.weapons[weaponKey].model.visible = true;
        }
        
        gameState.sounds.weaponSwitch();
        updateUI();
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
        
        console.log(`${weapon.name} reloaded. Ammo: ${weapon.ammo}/${weapon.maxAmmo}`);
        updateUI();
    }, weapon.reloadTime);
    
    updateUI();
}

function canShoot() {
    const weapon = gameState.weapons[gameState.weapons.current];
    const now = Date.now();
    
    return !weapon.isReloading && 
           weapon.ammo > 0 && 
           (now - weapon.lastShot) >= weapon.fireRate;
}

function shoot() {
    if (!canShoot()) return;
    
    const weapon = gameState.weapons[gameState.weapons.current];
    const now = Date.now();
    
    weapon.lastShot = now;
    weapon.ammo--;
    
    gameState.sounds.shoot();
    
    // Muzzle flash
    if (weapon.muzzle) {
        weapon.muzzle.material.opacity = 1;
        weapon.muzzle.scale.set(2, 2, 2);
        setTimeout(() => {
            weapon.muzzle.material.opacity = 0;
            weapon.muzzle.scale.set(1, 1, 1);
        }, 50);
    }
    
    // Weapon recoil
    if (weapon.model) {
        const originalZ = weapon.model.position.z;
        weapon.model.position.z += 0.05;
        setTimeout(() => {
            weapon.model.position.z = originalZ;
        }, 100);
    }
    
    // Raycast for hit detection
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
            gameState.sounds.hit();
            
            // Hit effect
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
            
            console.log(`Hit enemy ${hitEnemy.id} for ${weapon.damage} damage`);
        }
    }
    
    // Auto-reload when empty
    if (weapon.ammo === 0 && weapon.reserveAmmo > 0) {
        setTimeout(() => reloadWeapon(), 500);
    }
    
    updateUI();
}

function createHitEffect(position, color) {
    const effect = new THREE.Mesh(
        new THREE.SphereGeometry(0.3),
        new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.8
        })
    );
    
    effect.position.copy(position);
    gameState.scene.add(effect);
    
    let scale = 0.1;
    const animate = () => {
        scale += 0.3;
        effect.scale.set(scale, scale, scale);
        effect.material.opacity -= 0.05;
        
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
    gameState.player.score += 100;
    
    // Death effect
    const deathEffect = new THREE.Mesh(
        new THREE.SphereGeometry(2),
        new THREE.MeshBasicMaterial({
            color: enemy.color,
            transparent: true,
            opacity: 0.6
        })
    );
    
    deathEffect.position.copy(enemy.position);
    gameState.scene.add(deathEffect);
    
    let scale = 0.1;
    const animate = () => {
        scale += 0.4;
        deathEffect.scale.set(scale, scale, scale);
        deathEffect.material.opacity -= 0.03;
        
        if (deathEffect.material.opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            gameState.scene.remove(deathEffect);
        }
    };
    animate();
    
    // Hide enemy after delay
    setTimeout(() => {
        gameState.scene.remove(enemy.model);
    }, 2000);
    
    console.log(`Enemy ${enemy.id} eliminated! Score: ${gameState.player.score}`);
}

// Enhanced UI System
function updateUI() {
    const weapon = gameState.weapons[gameState.weapons.current];
    const isLocked = document.pointerLockElement !== null;
    
    // Update HUD elements
    const healthEl = document.getElementById('health');
    const ammoEl = document.getElementById('ammo');
    const weaponEl = document.getElementById('weapon');
    const scoreEl = document.getElementById('score');
    const statusEl = document.getElementById('controls-status');
    const reloadEl = document.getElementById('reload-status');
    
    if (healthEl) {
        healthEl.textContent = `❤️ Health: ${gameState.player.health}`;
        healthEl.style.color = gameState.player.health > 60 ? '#00FF00' : 
                              gameState.player.health > 30 ? '#FFD700' : '#FF4444';
    }
    
    if (ammoEl) {
        if (weapon.isReloading) {
            ammoEl.textContent = `🔄 Reloading...`;
            ammoEl.style.color = '#FFD700';
        } else {
            ammoEl.textContent = `🔫 ${weapon.ammo}/${weapon.reserveAmmo}`;
            ammoEl.style.color = weapon.ammo > 5 ? '#00FF00' : '#FF4444';
        }
    }
    
    if (weaponEl) {
        weaponEl.textContent = `⚡ ${weapon.name}`;
    }
    
    if (scoreEl) {
        scoreEl.textContent = `💀 Kills: ${gameState.player.kills} | Score: ${gameState.player.score}`;
    }
    
    if (statusEl) {
        if (isLocked) {
            statusEl.textContent = '🎮 PLAYING | 1-3: Weapons | R: Reload';
            statusEl.style.color = '#00FF00';
        } else {
            statusEl.textContent = '🎮 Click to Play';
            statusEl.style.color = '#FF6600';
        }
    }
}

// Enhanced Movement System
function updateMovement() {
    if (!gameState.controls.isLocked) return;
    
    const moveSpeed = gameState.keys.shift ? 0.25 : 0.15; // Sprint
    const direction = new THREE.Vector3();
    const sideways = new THREE.Vector3();
    
    gameState.controls.getDirection(direction);
    sideways.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
    
    // Apply movement
    if (gameState.keys.w) gameState.player.velocity.add(direction.clone().multiplyScalar(moveSpeed));
    if (gameState.keys.s) gameState.player.velocity.add(direction.clone().multiplyScalar(-moveSpeed));
    if (gameState.keys.a) gameState.player.velocity.add(sideways.clone().multiplyScalar(-moveSpeed));
    if (gameState.keys.d) gameState.player.velocity.add(sideways.clone().multiplyScalar(moveSpeed));
    
    // Jumping
    if (gameState.keys.space && !gameState.player.isJumping) {
        gameState.player.velocity.y = 0.3;
        gameState.player.isJumping = true;
        gameState.sounds.jump();
    }
    
    // Gravity
    gameState.player.velocity.y -= 0.015;
    
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
    
    // Friction
    gameState.player.velocity.x *= 0.85;
    gameState.player.velocity.z *= 0.85;
    
    // Update player position
    gameState.player.position.copy(gameState.controls.getObject().position);
}

// Enhanced Enemy AI
function updateEnemies() {
    const playerPos = gameState.player.position;
    const time = performance.now() / 1000;
    
    gameState.enemies.forEach((enemy, index) => {
        if (!enemy.isAlive) return;
        
        // Dynamic animation
        enemy.model.position.y = Math.sin(time * 2 + index) * 0.1;
        
        // Pulsing visor
        if (enemy.visor) {
            const intensity = 0.5 + 0.5 * Math.sin(time * 3 + index);
            enemy.visor.material.opacity = 0.3 + intensity * 0.5;
        }
        
        // AI behavior based on type
        const distanceToPlayer = enemy.position.distanceTo(playerPos);
        
        switch (enemy.type) {
            case 'aggressive':
                if (distanceToPlayer < 25) {
                    // Face player
                    const angle = Math.atan2(
                        playerPos.x - enemy.position.x,
                        playerPos.z - enemy.position.z
                    );
                    enemy.model.rotation.y = THREE.MathUtils.lerp(enemy.model.rotation.y, angle, 0.05);
                    
                    // Change color when alert
                    enemy.model.children.forEach(child => {
                        if (child.material && child.material.color) {
                            const alertColor = new THREE.Color(enemy.color).lerp(
                                new THREE.Color(0xFF0000),
                                Math.max(0, 1 - distanceToPlayer / 15)
                            );
                            child.material.color.copy(alertColor);
                        }
                    });
                }
                break;
                
            case 'patrol':
                // Simple patrol movement
                enemy.model.rotation.y += 0.01;
                break;
                
            case 'sniper':
                // Always face player if in range
                if (distanceToPlayer < 40) {
                    const angle = Math.atan2(
                        playerPos.x - enemy.position.x,
                        playerPos.z - enemy.position.z
                    );
                    enemy.model.rotation.y = THREE.MathUtils.lerp(enemy.model.rotation.y, angle, 0.02);
                }
                break;
        }
    });
}

// Main Game Loop
function gameLoop() {
    requestAnimationFrame(gameLoop);
    
    // Update game systems
    updateMovement();
    updateEnemies();
    
    // Handle shooting
    if (gameState.mouse.down && gameState.controls.isLocked) {
        shoot();
    }
    
    // Update UI periodically
    if (Math.random() < 0.1) { // 10% chance each frame
        updateUI();
    }
    
    // Render
    gameState.renderer.render(gameState.scene, gameState.camera);
}

// Game Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Enhanced Shadow Assault...');
    
    try {
        initAudio();
        initGraphics();
        initLighting();
        createMap();
        createEnemies();
        initControls();
        createWeapons();
        
        // Position camera
        gameState.camera.position.set(0, 1.6, 0);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            gameState.camera.aspect = window.innerWidth / window.innerHeight;
            gameState.camera.updateProjectionMatrix();
            gameState.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Start game loop
        gameLoop();
        
        // Initial UI update
        updateUI();
        
        // Expose global functions for UI
        window.switchWeapon = switchWeapon;
        window.reloadWeapon = reloadWeapon;
        window.gameState = gameState;
        
        console.log('Enhanced Shadow Assault initialized successfully!');
        
    } catch (error) {
        console.error('Game initialization failed:', error);
        document.body.innerHTML = `
            <div style="color: white; padding: 20px; background: red; font-family: Arial;">
                <h2>Game Failed to Load</h2>
                <p>Error: ${error.message}</p>
                <p>Please refresh the page and try again.</p>
            </div>
        `;
    }
});

console.log('Enhanced Shadow Assault script loaded');