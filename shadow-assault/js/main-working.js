console.log('Starting Shadow Assault - Working Version...');

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
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);
        
        console.log('Basic Three.js setup complete');
        
        // Add lights with color cycling like Krunker
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(10, 15, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);
        
        // Add colored spotlights for atmosphere
        const spotlight1 = new THREE.SpotLight(0xFF4081, 0.8, 50, Math.PI / 6);
        spotlight1.position.set(-20, 10, -20);
        spotlight1.target.position.set(0, 0, 0);
        scene.add(spotlight1);
        scene.add(spotlight1.target);
        
        const spotlight2 = new THREE.SpotLight(0x00BCD4, 0.8, 50, Math.PI / 6);
        spotlight2.position.set(20, 10, 20);
        spotlight2.target.position.set(0, 0, 0);
        scene.add(spotlight2);
        scene.add(spotlight2.target);
        
        // Create floor with vibrant pattern
        const floorGeometry = new THREE.PlaneGeometry(50, 50, 10, 10);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x00FF7F, // Bright green like Krunker maps
            transparent: true,
            opacity: 0.9
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);
        
        // Add colorful floor tiles
        for (let x = -20; x <= 20; x += 10) {
            for (let z = -20; z <= 20; z += 10) {
                const tileColors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xFFA07A, 0x98D8C8, 0xF7DC6F];
                const randomColor = tileColors[Math.floor(Math.random() * tileColors.length)];
                const tile = new THREE.Mesh(
                    new THREE.PlaneGeometry(8, 8),
                    new THREE.MeshLambertMaterial({ color: randomColor, transparent: true, opacity: 0.3 })
                );
                tile.rotation.x = -Math.PI / 2;
                tile.position.set(x, 0.01, z);
                scene.add(tile);
            }
        }
        
        // Create colorful walls like Krunker
        const wallColors = [0xFF4081, 0x3F51B5, 0x009688, 0xFF5722];
        
        // Front wall - Pink
        const frontWall = new THREE.Mesh(
            new THREE.BoxGeometry(50, 5, 1), 
            new THREE.MeshLambertMaterial({ color: wallColors[0] })
        );
        frontWall.position.set(0, 2.5, -25);
        frontWall.castShadow = true;
        scene.add(frontWall);
        
        // Back wall - Blue  
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(50, 5, 1), 
            new THREE.MeshLambertMaterial({ color: wallColors[1] })
        );
        backWall.position.set(0, 2.5, 25);
        backWall.castShadow = true;
        scene.add(backWall);
        
        // Left wall - Teal
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(1, 5, 50), 
            new THREE.MeshLambertMaterial({ color: wallColors[2] })
        );
        leftWall.position.set(-25, 2.5, 0);
        leftWall.castShadow = true;
        scene.add(leftWall);
        
        // Right wall - Orange
        const rightWall = new THREE.Mesh(
            new THREE.BoxGeometry(1, 5, 50), 
            new THREE.MeshLambertMaterial({ color: wallColors[3] })
        );
        rightWall.position.set(25, 2.5, 0);
        rightWall.castShadow = true;
        scene.add(rightWall);
        
        // Add colorful obstacles like Krunker cover
        const obstacleColors = [0xE91E63, 0x2196F3, 0x4CAF50, 0xFF9800, 0x9C27B0];
        
        const obstacle1 = new THREE.Mesh(
            new THREE.BoxGeometry(3, 2, 3),
            new THREE.MeshLambertMaterial({ color: obstacleColors[0] }) // Pink
        );
        obstacle1.position.set(8, 1, -8);
        obstacle1.castShadow = true;
        scene.add(obstacle1);
        
        const obstacle2 = new THREE.Mesh(
            new THREE.CylinderGeometry(1.5, 1.5, 3),
            new THREE.MeshLambertMaterial({ color: obstacleColors[1] }) // Blue
        );
        obstacle2.position.set(-12, 1.5, 10);
        obstacle2.castShadow = true;
        scene.add(obstacle2);
        
        // Add more varied obstacles
        const obstacle3 = new THREE.Mesh(
            new THREE.BoxGeometry(2, 4, 2),
            new THREE.MeshLambertMaterial({ color: obstacleColors[2] }) // Green
        );
        obstacle3.position.set(0, 2, -15);
        obstacle3.castShadow = true;
        scene.add(obstacle3);
        
        const obstacle4 = new THREE.Mesh(
            new THREE.BoxGeometry(4, 1, 4),
            new THREE.MeshLambertMaterial({ color: obstacleColors[3] }) // Orange
        );
        obstacle4.position.set(-8, 0.5, -5);
        obstacle4.castShadow = true;
        scene.add(obstacle4);
        
        console.log('Level geometry created');
        
        // Create vibrant enemies like Krunker
        const enemies = [];
        const enemyPositions = [
            { x: 15, z: 15 },
            { x: -15, z: -15 },
            { x: 10, z: -10 },
            { x: -8, z: 8 },
            { x: 18, z: -5 }
        ];
        
        const enemyColors = [0xFF1744, 0x00E676, 0x2979FF, 0xFF6D00, 0xE040FB];
        
        enemyPositions.forEach((pos, index) => {
            const enemyGroup = new THREE.Group();
            const enemyColor = enemyColors[index % enemyColors.length];
            
            // Main body - more angular like Krunker
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1, 2, 0.6),
                new THREE.MeshLambertMaterial({ color: enemyColor })
            );
            body.position.y = 1;
            body.castShadow = true;
            enemyGroup.add(body);
            
            // Head - cube style
            const head = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.8, 0.8),
                new THREE.MeshLambertMaterial({ color: enemyColor, transparent: true, opacity: 0.9 })
            );
            head.position.y = 2.4;
            head.castShadow = true;
            enemyGroup.add(head);
            
            // Glowing eyes
            const leftEye = new THREE.Mesh(
                new THREE.SphereGeometry(0.08),
                new THREE.MeshBasicMaterial({ color: 0x00FFFF, emissive: 0x00FFFF })
            );
            leftEye.position.set(-0.15, 2.4, 0.35);
            enemyGroup.add(leftEye);
            
            const rightEye = new THREE.Mesh(
                new THREE.SphereGeometry(0.08),
                new THREE.MeshBasicMaterial({ color: 0x00FFFF, emissive: 0x00FFFF })
            );
            rightEye.position.set(0.15, 2.4, 0.35);
            enemyGroup.add(rightEye);
            
            // Arms
            const leftArm = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 1.2, 0.3),
                new THREE.MeshLambertMaterial({ color: enemyColor })
            );
            leftArm.position.set(-0.65, 1.4, 0);
            leftArm.castShadow = true;
            enemyGroup.add(leftArm);
            
            const rightArm = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 1.2, 0.3),
                new THREE.MeshLambertMaterial({ color: enemyColor })
            );
            rightArm.position.set(0.65, 1.4, 0);
            rightArm.castShadow = true;
            enemyGroup.add(rightArm);
            
            // Health bar background
            const healthBarBg = new THREE.Mesh(
                new THREE.PlaneGeometry(1.5, 0.2),
                new THREE.MeshBasicMaterial({ color: 0x000000 })
            );
            healthBarBg.position.set(0, 3.2, 0);
            enemyGroup.add(healthBarBg);
            
            // Health bar foreground
            const healthBarFg = new THREE.Mesh(
                new THREE.PlaneGeometry(1.4, 0.15),
                new THREE.MeshBasicMaterial({ color: 0x00FF00 })
            );
            healthBarFg.position.set(0, 3.2, 0.01);
            enemyGroup.add(healthBarFg);
            
            enemyGroup.position.set(pos.x, 0, pos.z);
            scene.add(enemyGroup);
            
            enemies.push({
                model: enemyGroup,
                health: 100,
                maxHealth: 100,
                position: new THREE.Vector3(pos.x, 0, pos.z),
                state: 'patrol',
                color: enemyColor,
                healthBarFg: healthBarFg,
                leftEye: leftEye,
                rightEye: rightEye
            });
        });
        
        console.log('Enemies created:', enemies.length);
        
        // Player setup
        const controls = new PointerLockControls(camera, document.body);
        scene.add(controls.getObject());
        
        const player = {
            health: 100,
            velocity: new THREE.Vector3(),
            isJumping: false,
            position: new THREE.Vector3(0, 1, 0)
        };
        
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
            console.log('Click detected, pointer lock element:', document.pointerLockElement);
            if (!document.pointerLockElement) {
                console.log('Attempting to lock pointer...');
                controls.lock();
            }
        });
        
        // Also add click listener to canvas specifically
        renderer.domElement.addEventListener('click', () => {
            console.log('Canvas clicked!');
            if (!document.pointerLockElement) {
                console.log('Attempting to lock pointer from canvas...');
                controls.lock();
            }
        });
        
        // Add pointer lock event listeners for better feedback
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
        
        // Weapon system
        const weapons = {
            current: 'pistol',
            pistol: { ammo: 15, maxAmmo: 15, damage: 20, model: null }
        };
        
        // Create modern weapon like Krunker
        const weaponGroup = new THREE.Group();
        
        // Main weapon body - sleek design
        const weaponBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.08, 0.8),
            new THREE.MeshLambertMaterial({ color: 0x2C3E50 }) // Dark blue-gray
        );
        weaponBody.position.set(0, 0, -0.4);
        weaponGroup.add(weaponBody);
        
        // Weapon barrel
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.3),
            new THREE.MeshLambertMaterial({ color: 0x34495E })
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.02, -0.9);
        weaponGroup.add(barrel);
        
        // Weapon grip
        const grip = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.15, 0.2),
            new THREE.MeshLambertMaterial({ color: 0x1ABC9C }) // Teal accent
        );
        grip.position.set(0, -0.1, -0.2);
        weaponGroup.add(grip);
        
        // Muzzle flash point
        const muzzle = new THREE.Mesh(
            new THREE.SphereGeometry(0.03),
            new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0 })
        );
        muzzle.position.set(0, 0.02, -1.05);
        weaponGroup.add(muzzle);
        
        weaponGroup.position.set(0.3, -0.3, -0.8);
        camera.add(weaponGroup);
        weapons.pistol.model = weaponGroup;
        weapons.pistol.muzzle = muzzle;
        
        console.log('Player and weapons setup complete');
        
        // Game variables
        let score = 0;
        let mouseDown = false;
        
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) mouseDown = true;
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) mouseDown = false;
        });
        
        // Game loop
        function animate() {
            requestAnimationFrame(animate);
            
            if (controls.isLocked) {
                // Movement
                const moveSpeed = 0.15;
                const direction = new THREE.Vector3();
                const sideways = new THREE.Vector3();
                
                controls.getDirection(direction);
                sideways.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
                
                if (keys.w) player.velocity.add(direction.clone().multiplyScalar(moveSpeed));
                if (keys.s) player.velocity.add(direction.clone().multiplyScalar(-moveSpeed));
                if (keys.a) player.velocity.add(sideways.clone().multiplyScalar(-moveSpeed));
                if (keys.d) player.velocity.add(sideways.clone().multiplyScalar(moveSpeed));
                
                // Jump
                if (keys.space && !player.isJumping) {
                    player.velocity.y = 0.25;
                    player.isJumping = true;
                }
                
                // Gravity
                player.velocity.y -= 0.01;
                
                // Ground collision
                if (controls.getObject().position.y <= 1) {
                    controls.getObject().position.y = 1;
                    player.velocity.y = 0;
                    player.isJumping = false;
                }
                
                // Apply movement
                controls.moveRight(player.velocity.x);
                controls.moveForward(player.velocity.z);
                controls.getObject().position.y += player.velocity.y;
                
                // Friction
                player.velocity.x *= 0.8;
                player.velocity.z *= 0.8;
                
                // Update player position
                player.position.copy(controls.getObject().position);
                
                // Shooting with visual effects
                if (mouseDown && weapons.pistol.ammo > 0) {
                    try {
                        const raycaster = new THREE.Raycaster();
                        const shootDirection = new THREE.Vector3(0, 0, -1);
                        camera.getWorldDirection(shootDirection);
                        raycaster.set(camera.position, shootDirection);
                        
                        const intersects = raycaster.intersectObjects(
                            enemies.map(e => e.model).filter(Boolean), true
                        );
                        
                        // Muzzle flash effect
                        if (weapons.pistol.muzzle) {
                            weapons.pistol.muzzle.material.opacity = 1;
                            weapons.pistol.muzzle.scale.set(3, 3, 3);
                            setTimeout(() => {
                                weapons.pistol.muzzle.material.opacity = 0;
                                weapons.pistol.muzzle.scale.set(1, 1, 1);
                            }, 100);
                        }
                        
                        // Weapon recoil
                        if (weapons.pistol.model) {
                            const originalZ = weapons.pistol.model.position.z;
                            weapons.pistol.model.position.z += 0.05;
                            setTimeout(() => {
                                weapons.pistol.model.position.z = originalZ;
                            }, 100);
                        }
                        
                        if (intersects.length > 0) {
                            // Find hit enemy
                            const hitEnemy = enemies.find(e => 
                                e && e.model && (
                                    intersects[0].object === e.model ||
                                    intersects[0].object.parent === e.model ||
                                    (e.model.children && e.model.children.includes(intersects[0].object))
                                )
                            );
                        
                            if (hitEnemy) {
                                hitEnemy.health -= weapons.pistol.damage;
                                console.log('Enemy hit! Health:', hitEnemy.health);
                                
                                // Hit effect - colorful explosion
                                const hitEffect = new THREE.Mesh(
                                    new THREE.SphereGeometry(0.3),
                                    new THREE.MeshBasicMaterial({ 
                                        color: 0xFF4444, 
                                        transparent: true, 
                                        opacity: 0.8 
                                    })
                                );
                                hitEffect.position.copy(intersects[0].point);
                                scene.add(hitEffect);
                                
                                // Animate hit effect
                                let scale = 0.1;
                                const animateHit = () => {
                                    scale += 0.2;
                                    hitEffect.scale.set(scale, scale, scale);
                                    hitEffect.material.opacity -= 0.1;
                                    if (hitEffect.material.opacity > 0) {
                                        requestAnimationFrame(animateHit);
                                    } else {
                                        scene.remove(hitEffect);
                                    }
                                };
                                animateHit();
                                
                                // Update health bar
                                if (hitEnemy.healthBarFg && hitEnemy.healthBarFg.material && hitEnemy.healthBarFg.material.color) {
                                    const healthPercent = hitEnemy.health / hitEnemy.maxHealth;
                                    hitEnemy.healthBarFg.scale.x = healthPercent;
                                    hitEnemy.healthBarFg.material.color.setHex(
                                        healthPercent > 0.6 ? 0x00FF00 : 
                                        healthPercent > 0.3 ? 0xFFFF00 : 0xFF0000
                                    );
                                }
                                
                                if (hitEnemy.health <= 0) {
                                    // Death effect
                                    const deathEffect = new THREE.Mesh(
                                        new THREE.SphereGeometry(2),
                                        new THREE.MeshBasicMaterial({ 
                                            color: hitEnemy.color, 
                                            transparent: true, 
                                            opacity: 0.6 
                                        })
                                    );
                                    deathEffect.position.copy(hitEnemy.position);
                                    scene.add(deathEffect);
                                    
                                    // Animate death effect
                                    let deathScale = 0.1;
                                    const animateDeath = () => {
                                        deathScale += 0.3;
                                        deathEffect.scale.set(deathScale, deathScale, deathScale);
                                        deathEffect.material.opacity -= 0.05;
                                        if (deathEffect.material.opacity > 0) {
                                            requestAnimationFrame(animateDeath);
                                        } else {
                                            scene.remove(deathEffect);
                                        }
                                    };
                                    animateDeath();
                                    
                                    scene.remove(hitEnemy.model);
                                    const index = enemies.indexOf(hitEnemy);
                                    enemies.splice(index, 1);
                                    score += 10;
                                    console.log('Enemy defeated! Score:', score);
                                }
                            }
                        }
                        
                        weapons.pistol.ammo--;
                        mouseDown = false; // Prevent rapid fire
                    } catch (error) {
                        console.warn('Error in shooting logic:', error);
                    }
                }
                
                // Update UI
                if (document.getElementById('health')) {
                    document.getElementById('health').textContent = `🏥 Health: ${player.health}`;
                }
                if (document.getElementById('ammo')) {
                    document.getElementById('ammo').textContent = `🔫 Ammo: ${weapons.pistol.ammo}/${weapons.pistol.maxAmmo}`;
                }
                if (document.getElementById('score')) {
                    document.getElementById('score').textContent = `💀 Kills: ${Math.floor(score / 10)}`;
                }
                if (document.getElementById('weapon')) {
                    document.getElementById('weapon').textContent = `⚡ Weapon: Pistol`;
                }
            }
            
            // Animate enemies with more dynamic effects
            const time = performance.now() / 1000;
            enemies.forEach((enemy, index) => {
                try {
                    if (enemy && enemy.model) {
                        // Dynamic bobbing with color changes
                        enemy.model.position.y = Math.sin(time * 3 + index) * 0.15;
                        
                        // Pulsing eyes effect
                        if (enemy.leftEye && enemy.rightEye && enemy.leftEye.material && enemy.rightEye.material) {
                            const eyeIntensity = 0.5 + 0.5 * Math.sin(time * 4 + index);
                            if (enemy.leftEye.material.emissive) enemy.leftEye.material.emissive.setHex(0x00FFFF);
                            if (enemy.rightEye.material.emissive) enemy.rightEye.material.emissive.setHex(0x00FFFF);
                            enemy.leftEye.scale.setScalar(1 + eyeIntensity * 0.3);
                            enemy.rightEye.scale.setScalar(1 + eyeIntensity * 0.3);
                        }
                        
                        // Rotate towards player with smooth animation
                        if (enemy.position && player.position) {
                            const distanceToPlayer = enemy.position.distanceTo(player.position);
                            if (distanceToPlayer < 20) {
                                const targetRotation = Math.atan2(
                                    player.position.x - enemy.position.x,
                                    player.position.z - enemy.position.z
                                );
                                enemy.model.rotation.y = THREE.MathUtils.lerp(
                                    enemy.model.rotation.y, 
                                    targetRotation, 
                                    0.05
                                );
                                
                                // Change color when player is close
                                if (enemy.model && enemy.model.children) {
                                    enemy.model.children.forEach(child => {
                                        if (child.material && child.material.color && typeof child.material.color.copy === 'function') {
                                            const alertColor = new THREE.Color(enemy.color).lerp(
                                                new THREE.Color(0xFF0000), 
                                                Math.max(0, 1 - distanceToPlayer / 10)
                                            );
                                            child.material.color.copy(alertColor);
                                        }
                                    });
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.warn('Error animating enemy:', error);
                }
            });
            
            renderer.render(scene, camera);
        }
        
        // Start the game
        animate();
        console.log('Game loop started successfully!');
        
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