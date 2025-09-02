import * as THREE from 'https://unpkg.com/three@0.156.1/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.156.1/examples/jsm/controls/PointerLockControls.js';

export function initPlayer(camera, scene) {
    const player = {
        position: new THREE.Vector3(0, 1, 0), // Start pos, eye height 1
        velocity: new THREE.Vector3(),
        health: 100,
        isJumping: false,
        isCrouching: false,
        height: 1.8, // Normal height
        controls: null
    };

    // Pointer lock for mouse look
    const controls = new PointerLockControls(camera, document.body);
    scene.add(controls.getObject());
    
    // Click to enable controls
    document.addEventListener('click', () => {
        if (!document.pointerLockElement) {
            controls.lock();
        }
    });
    
    // Show instructions when pointer lock is disabled
    controls.addEventListener('lock', () => {
        console.log('Controls enabled - use WASD to move, mouse to look');
    });
    
    controls.addEventListener('unlock', () => {
        console.log('Click to enable controls');
    });

    // Movement keys
    const keys = { w: false, a: false, s: false, d: false, space: false, c: false, shift: false };
    
    document.addEventListener('keydown', e => {
        const key = e.key.toLowerCase();
        if (key === 'w') keys.w = true;
        if (key === 'a') keys.a = true;
        if (key === 's') keys.s = true;
        if (key === 'd') keys.d = true;
        if (key === ' ') { keys.space = true; e.preventDefault(); }
        if (key === 'c') keys.c = true;
        if (key === 'shift') keys.shift = true;
    });
    
    document.addEventListener('keyup', e => {
        const key = e.key.toLowerCase();
        if (key === 'w') keys.w = false;
        if (key === 'a') keys.a = false;
        if (key === 's') keys.s = false;
        if (key === 'd') keys.d = false;
        if (key === ' ') keys.space = false;
        if (key === 'c') keys.c = false;
        if (key === 'shift') keys.shift = false;
    });

    // Footsteps audio
    const footsteps = new THREE.Audio(camera.children.find(child => child.type === 'AudioListener') || new THREE.AudioListener());
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('assets/sounds/footsteps.mp3', buffer => {
        footsteps.setBuffer(buffer);
        footsteps.setLoop(true);
        footsteps.setVolume(0.3);
    }).catch(e => console.log('Footsteps sound loading failed, continuing without audio'));

    player.keys = keys;
    player.controls = controls;
    player.footsteps = footsteps;
    
    console.log('Player initialized with pointer lock controls');
    return player;
}

export function updatePlayer(player, camera, levelObjects, pickups, weapons) {
    const moveSpeed = 0.15;
    const sprintSpeed = 0.25;
    const jumpSpeed = 0.25;
    const gravity = -0.01;
    const controls = player.controls;
    
    if (!controls.isLocked) return; // Don't move if controls aren't locked

    // Get movement direction based on camera orientation
    const direction = new THREE.Vector3();
    const sideways = new THREE.Vector3();
    
    controls.getDirection(direction);
    sideways.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
    
    // Apply movement based on keys
    const currentSpeed = player.keys.shift ? sprintSpeed : moveSpeed;
    
    if (player.keys.w) {
        player.velocity.add(direction.clone().multiplyScalar(currentSpeed));
    }
    if (player.keys.s) {
        player.velocity.add(direction.clone().multiplyScalar(-currentSpeed));
    }
    if (player.keys.a) {
        player.velocity.add(sideways.clone().multiplyScalar(-currentSpeed));
    }
    if (player.keys.d) {
        player.velocity.add(sideways.clone().multiplyScalar(currentSpeed));
    }

    // Jump/Crouch
    if (player.keys.space && !player.isJumping) {
        player.velocity.y = jumpSpeed;
        player.isJumping = true;
    }
    
    if (player.keys.c) {
        player.height = 1.0; // Crouch height
        player.isCrouching = true;
    } else {
        player.height = 1.8;
        player.isCrouching = false;
    }

    // Apply gravity
    player.velocity.y += gravity;

    // Ground collision (simple)
    if (controls.getObject().position.y <= 1 + (player.isCrouching ? 0.8 : 0)) {
        controls.getObject().position.y = 1 + (player.isCrouching ? 0.8 : 0);
        player.velocity.y = 0;
        player.isJumping = false;
    }
    
    // Apply velocity to controls object
    controls.moveRight(player.velocity.x);
    controls.moveForward(player.velocity.z);
    controls.getObject().position.y += player.velocity.y;
    
    // Update player position from controls
    player.position.copy(controls.getObject().position);

    // Simple collision with level objects
    levelObjects.forEach(obj => {
        if (!obj.geometry) return;
        
        const playerBox = new THREE.Box3().setFromCenterAndSize(
            player.position, 
            new THREE.Vector3(1, player.height, 1)
        );
        const objBox = new THREE.Box3().setFromObject(obj);
        
        if (playerBox.intersectsBox(objBox)) {
            // Simple push-back collision resolution
            const overlap = playerBox.intersect(objBox);
            const overlapSize = overlap.getSize(new THREE.Vector3());
            
            if (overlapSize.x < overlapSize.z) {
                // Push on X axis
                const pushDirection = player.position.x > objBox.getCenter(new THREE.Vector3()).x ? 1 : -1;
                controls.getObject().position.x += pushDirection * (overlapSize.x + 0.1);
            } else {
                // Push on Z axis
                const pushDirection = player.position.z > objBox.getCenter(new THREE.Vector3()).z ? 1 : -1;
                controls.getObject().position.z += pushDirection * (overlapSize.z + 0.1);
            }
            player.velocity.multiplyScalar(0.1); // Reduce velocity on collision
        }
    });

    // Apply friction
    player.velocity.x *= 0.8;
    player.velocity.z *= 0.8;

    // Play footsteps if moving
    const isMoving = player.keys.w || player.keys.a || player.keys.s || player.keys.d;
    if (isMoving && !player.isJumping && player.footsteps.buffer) {
        if (!player.footsteps.isPlaying) player.footsteps.play();
    } else {
        if (player.footsteps.isPlaying) player.footsteps.pause();
    }

    // Game over check
    if (player.health <= 0) {
        console.log('Game Over - Player died!');
        // Could add restart logic here
    }
}