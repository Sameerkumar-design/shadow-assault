console.log('Starting Shadow Assault - Simple Fixed Version...');

import * as THREE from 'https://unpkg.com/three@0.156.1/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.156.1/examples/jsm/controls/PointerLockControls.js';

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    
    try {
        // Create scene, camera, renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x00BFFF); // Bright sky blue like Krunker
        document.body.appendChild(renderer.domElement);
        
        console.log('Basic Three.js setup complete');
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        scene.add(directionalLight);
        
        // Create floor
        const floorGeometry = new THREE.PlaneGeometry(50, 50);
        const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF7F });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);
        
        // Create walls
        const wallColors = [0xFF4081, 0x3F51B5, 0x009688, 0xFF5722];
        
        // Front wall
        const frontWall = new THREE.Mesh(
            new THREE.BoxGeometry(50, 5, 1), 
            new THREE.MeshLambertMaterial({ color: wallColors[0] })
        );
        frontWall.position.set(0, 2.5, -25);
        scene.add(frontWall);
        
        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(50, 5, 1), 
            new THREE.MeshLambertMaterial({ color: wallColors[1] })
        );
        backWall.position.set(0, 2.5, 25);
        scene.add(backWall);
        
        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(1, 5, 50), 
            new THREE.MeshLambertMaterial({ color: wallColors[2] })
        );
        leftWall.position.set(-25, 2.5, 0);
        scene.add(leftWall);
        
        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.BoxGeometry(1, 5, 50), 
            new THREE.MeshLambertMaterial({ color: wallColors[3] })
        );
        rightWall.position.set(25, 2.5, 0);
        scene.add(rightWall);
        
        // Create simple enemies
        const enemies = [];
        const enemyPositions = [
            { x: 15, z: 15 },
            { x: -15, z: -15 },
            { x: 10, z: -10 }
        ];
        
        const enemyColors = [0xFF1744, 0x00E676, 0x2979FF];
        
        enemyPositions.forEach((pos, index) => {
            const enemy = new THREE.Mesh(
                new THREE.BoxGeometry(1, 2, 0.6),
                new THREE.MeshLambertMaterial({ color: enemyColors[index] })
            );
            enemy.position.set(pos.x, 1, pos.z);
            scene.add(enemy);
            enemies.push({ model: enemy, health: 100 });
        });
        
        console.log('Level and enemies created');
        
        // Player setup
        const controls = new PointerLockControls(camera, document.body);
        scene.add(controls.getObject());
        
        // Position camera
        camera.position.set(0, 1.6, 0);
        
        // Controls
        const keys = { w: false, a: false, s: false, d: false, space: false };
        
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            console.log('Key down:', key);
            if (key === 'w') keys.w = true;
            if (key === 'a') keys.a = true;
            if (key === 's') keys.s = true;
            if (key === 'd') keys.d = true;
            if (key === ' ') { keys.space = true; e.preventDefault(); }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w') keys.w = false;
            if (key === 'a') keys.a = false;
            if (key === 's') keys.s = false;
            if (key === 'd') keys.d = false;
            if (key === ' ') keys.space = false;
        });
        
        // Click to enable controls
        document.addEventListener('click', () => {
            console.log('Click detected');
            if (!document.pointerLockElement) {
                console.log('Attempting to lock pointer...');
                controls.lock();
            }
        });
        
        // Add pointer lock event listeners
        controls.addEventListener('lock', () => {
            console.log('Pointer locked successfully!');
            const statusElement = document.getElementById('controls-status');
            if (statusElement) {
                statusElement.textContent = '🎮 Status: Controls ACTIVE! Use WASD + Mouse';
                statusElement.style.color = '#00FF00';
            }
        });
        
        controls.addEventListener('unlock', () => {
            console.log('Pointer unlocked');
            const statusElement = document.getElementById('controls-status');
            if (statusElement) {
                statusElement.textContent = '🎮 Status: Click to activate controls';
                statusElement.style.color = '#FF6600';
            }
        });
        
        // Movement variables
        const velocity = new THREE.Vector3();
        
        // Game loop
        function animate() {
            requestAnimationFrame(animate);
            
            if (controls.isLocked) {
                // Movement
                const moveSpeed = 0.1;
                const direction = new THREE.Vector3();
                
                controls.getDirection(direction);
                const sideways = new THREE.Vector3();
                sideways.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
                
                if (keys.w) velocity.add(direction.clone().multiplyScalar(moveSpeed));
                if (keys.s) velocity.add(direction.clone().multiplyScalar(-moveSpeed));
                if (keys.a) velocity.add(sideways.clone().multiplyScalar(-moveSpeed));
                if (keys.d) velocity.add(sideways.clone().multiplyScalar(moveSpeed));
                
                // Apply movement
                controls.moveRight(velocity.x);
                controls.moveForward(velocity.z);
                
                // Friction
                velocity.x *= 0.8;
                velocity.z *= 0.8;
                
                // Update UI
                if (document.getElementById('health')) {
                    document.getElementById('health').textContent = '🏥 Health: 100';
                }
                if (document.getElementById('ammo')) {
                    document.getElementById('ammo').textContent = '🔫 Ammo: 30/30';
                }
                if (document.getElementById('weapon')) {
                    document.getElementById('weapon').textContent = '⚡ Weapon: Pistol';
                }
            }
            
            renderer.render(scene, camera);
        }
        
        // Start the game
        animate();
        console.log('Game started successfully!');
        
        // Resize handler
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
    } catch (error) {
        console.error('Game initialization failed:', error);
        document.body.innerHTML = `<div style="color: white; padding: 20px; background: red;">Error: ${error.message}<br><br>Stack: ${error.stack}</div>`;
    }
});

console.log('Shadow Assault script loaded');