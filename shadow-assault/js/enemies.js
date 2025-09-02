import * as THREE from 'https://unpkg.com/three@0.156.1/build/three.module.js';

export function initEnemies(scene, loader, audioListener, placements) {
    const enemies = [];
    placements.forEach((placement, index) => {
        const enemy = {
            model: null,
            health: 50,
            maxHealth: 50,
            position: placement.position,
            patrolPoints: placement.patrol,
            currentPatrol: 0,
            state: 'patrol', // patrol, chase, attack
            detectionRadius: 15,
            attackRadius: 3,
            attackDamage: 10,
            lastAttack: 0,
            sound: new THREE.Audio(audioListener) // Attack sound if needed
        };

        // Create a distinctive enemy model using basic geometry
        const enemyGroup = new THREE.Group();
        
        // Body (main cube)
        const bodyGeometry = new THREE.BoxGeometry(1.2, 1.8, 0.8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 }); // Dark red
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.9;
        body.castShadow = true;
        enemyGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.3);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4500 }); // Orange red
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.1;
        head.castShadow = true;
        enemyGroup.add(head);
        
        // Eyes (glowing effect)
        const eyeGeometry = new THREE.SphereGeometry(0.05);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000, emissive: 0xFF0000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 2.1, 0.25);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1, 2.1, 0.25);
        enemyGroup.add(leftEye);
        enemyGroup.add(rightEye);
        
        // Arms
        const armGeometry = new THREE.BoxGeometry(0.3, 1.2, 0.3);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0x800000 }); // Maroon
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.75, 1.2, 0);
        leftArm.castShadow = true;
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.75, 1.2, 0);
        rightArm.castShadow = true;
        enemyGroup.add(leftArm);
        enemyGroup.add(rightArm);
        
        // Health bar background
        const healthBarBg = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 0.2),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        healthBarBg.position.set(0, 2.8, 0);
        healthBarBg.lookAt(0, 2.8, 1); // Face camera
        enemyGroup.add(healthBarBg);
        
        // Health bar foreground
        const healthBarFg = new THREE.Mesh(
            new THREE.PlaneGeometry(1.4, 0.15),
            new THREE.MeshBasicMaterial({ color: 0x00FF00 })
        );
        healthBarFg.position.set(0, 2.8, 0.01);
        healthBarFg.lookAt(0, 2.8, 1); // Face camera
        enemyGroup.add(healthBarFg);
        
        enemy.healthBarFg = healthBarFg;
        enemy.healthBarBg = healthBarBg;
        
        // Position the enemy
        enemyGroup.position.copy(enemy.position);
        scene.add(enemyGroup);
        
        enemy.model = enemyGroup;
        enemies.push(enemy);
        
        console.log(`Enemy ${index + 1} created at:`, enemy.position);
    });
    return enemies;
}

export function updateEnemies(enemies, playerPos, currentWeapon, player) {
    const time = performance.now() / 1000;
    enemies.forEach((enemy, index) => {
        if (!enemy.model) return; // Skip if model not loaded yet
        
        const distToPlayer = enemy.position.distanceTo(playerPos);

        // State machine
        if (distToPlayer < enemy.detectionRadius) {
            enemy.state = 'chase';
            if (distToPlayer < enemy.attackRadius) enemy.state = 'attack';
        } else {
            enemy.state = 'patrol';
        }

        if (enemy.state === 'patrol') {
            // Move to next patrol point
            const target = enemy.patrolPoints[enemy.currentPatrol];
            const direction = target.clone().sub(enemy.position).normalize();
            enemy.position.add(direction.multiplyScalar(0.5)); // Slower patrol
            
            if (enemy.position.distanceTo(target) < 1) {
                enemy.currentPatrol = (enemy.currentPatrol + 1) % enemy.patrolPoints.length;
            }
            
            // Make enemy look in movement direction
            if (enemy.model) {
                enemy.model.lookAt(target);
            }
        } else if (enemy.state === 'chase') {
            // Chase player more aggressively
            const direction = playerPos.clone().sub(enemy.position).normalize();
            enemy.position.add(direction.multiplyScalar(1.5)); // Faster chase
            
            // Make enemy look at player
            if (enemy.model) {
                enemy.model.lookAt(playerPos);
            }
        } else if (enemy.state === 'attack' && time - enemy.lastAttack > 1.5) {
            // Attack: Damage player
            if (player) {
                player.health -= enemy.attackDamage;
                console.log('Player hit! Health:', player.health);
            }
            enemy.lastAttack = time;
            
            // Attack animation - make enemy "lunge"
            if (enemy.model) {
                const originalY = enemy.model.position.y;
                enemy.model.position.y += 0.5;
                setTimeout(() => {
                    if (enemy.model) enemy.model.position.y = originalY;
                }, 200);
            }
        }
        
        // Update health bar
        if (enemy.healthBarFg && enemy.healthBarBg) {
            const healthPercent = enemy.health / enemy.maxHealth;
            enemy.healthBarFg.scale.x = healthPercent;
            enemy.healthBarFg.material.color.setHex(
                healthPercent > 0.6 ? 0x00FF00 : // Green
                healthPercent > 0.3 ? 0xFFFF00 : // Yellow
                0xFF0000 // Red
            );
            
            // Make health bars face camera
            const camera = player?.camera || enemy.model?.parent?.camera;
            if (camera) {
                enemy.healthBarBg.lookAt(camera.position);
                enemy.healthBarFg.lookAt(camera.position);
            }
        }
        
        // Bob animation for idle/patrol
        if (enemy.state === 'patrol') {
            enemy.model.position.y = 0.1 + Math.sin(time * 2 + index) * 0.05;
        }
        
        // Update model position
        if (enemy.model) {
            enemy.model.position.x = enemy.position.x;
            enemy.model.position.z = enemy.position.z;
        }
        
        // Remove dead enemies
        if (enemy.health <= 0) {
            if (enemy.model) {
                enemy.model.parent.remove(enemy.model);
            }
            enemies.splice(index, 1);
            window.score = (window.score || 0) + 10;
            console.log('Enemy defeated! Score:', window.score);
        }
    });
}