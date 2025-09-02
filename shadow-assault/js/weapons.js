import * as THREE from 'https://unpkg.com/three@0.156.1/build/three.module.js';
import { OBJLoader } from 'https://unpkg.com/three@0.156.1/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://unpkg.com/three@0.156.1/examples/jsm/loaders/MTLLoader.js';

export function initWeapons(scene, camera, audioListener) {
    const weapons = {
        current: 'pistol',
        pistol: { model: null, ammo: 15, maxAmmo: 15, damage: 20, fireRate: 0.5, lastShot: 0, sound: new THREE.Audio(audioListener) },
        rifle: { model: null, ammo: 30, maxAmmo: 30, damage: 10, fireRate: 0.1, lastShot: 0, sound: new THREE.Audio(audioListener) },
        shotgun: { model: null, ammo: 8, maxAmmo: 8, damage: 30, fireRate: 0.8, lastShot: 0, sound: new THREE.Audio(audioListener) },
        sniper: { model: null, ammo: 5, maxAmmo: 5, damage: 80, fireRate: 2.0, lastShot: 0, sound: new THREE.Audio(audioListener) },
        grenade: { model: null, ammo: 5, maxAmmo: 5, damage: 50, fireRate: 1, lastShot: 0, sound: new THREE.Audio(audioListener) }
    };

    // Create simple weapon models using basic geometry for now
    // This ensures weapons are immediately visible
    
    // Pistol - simple box shape
    const pistolGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.6);
    const pistolMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    weapons.pistol.model = new THREE.Mesh(pistolGeometry, pistolMaterial);
    weapons.pistol.model.position.set(0.3, -0.3, -0.8);
    weapons.pistol.model.rotation.x = -0.1;
    camera.add(weapons.pistol.model);
    
    // Rifle - longer box
    const rifleGeometry = new THREE.BoxGeometry(0.12, 0.08, 1.2);
    const rifleMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    weapons.rifle.model = new THREE.Mesh(rifleGeometry, rifleMaterial);
    weapons.rifle.model.position.set(0.25, -0.25, -1.0);
    weapons.rifle.model.rotation.x = -0.1;
    weapons.rifle.model.visible = false;
    camera.add(weapons.rifle.model);
    
    // Shotgun - wider, shorter
    const shotgunGeometry = new THREE.BoxGeometry(0.18, 0.12, 0.9);
    const shotgunMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    weapons.shotgun.model = new THREE.Mesh(shotgunGeometry, shotgunMaterial);
    weapons.shotgun.model.position.set(0.3, -0.3, -0.9);
    weapons.shotgun.model.rotation.x = -0.1;
    weapons.shotgun.model.visible = false;
    camera.add(weapons.shotgun.model);
    
    // Sniper - very long and thin
    const sniperGeometry = new THREE.BoxGeometry(0.1, 0.06, 1.5);
    const sniperMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F2F });
    weapons.sniper.model = new THREE.Mesh(sniperGeometry, sniperMaterial);
    weapons.sniper.model.position.set(0.2, -0.2, -1.2);
    weapons.sniper.model.rotation.x = -0.1;
    weapons.sniper.model.visible = false;
    camera.add(weapons.sniper.model);
    
    // Grenade - sphere
    const grenadeGeometry = new THREE.SphereGeometry(0.08);
    const grenadeMaterial = new THREE.MeshLambertMaterial({ color: 0x556B2F });
    weapons.grenade.model = new THREE.Mesh(grenadeGeometry, grenadeMaterial);
    weapons.grenade.model.position.set(0.4, -0.4, -0.6);
    weapons.grenade.model.visible = false;
    camera.add(weapons.grenade.model);
    
    console.log('Basic weapon models created and attached to camera');
    
    // Try to load OBJ models asynchronously (enhancement)
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();
    
    // Load pistol (fallback to basic model if loading fails)
    mtlLoader.load('assets/models/pistol.mtl', materials => {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load('assets/models/pistol.obj', obj => {
            // Replace basic model with loaded model
            camera.remove(weapons.pistol.model);
            weapons.pistol.model = obj;
            obj.scale.set(0.3, 0.3, 0.3);
            obj.position.set(0.5, -0.5, -1);
            obj.rotation.y = Math.PI;
            camera.add(obj);
            console.log('Pistol OBJ model loaded');
        }, undefined, error => {
            console.log('Failed to load pistol OBJ, using basic model');
        });
    }, undefined, error => {
        console.log('Failed to load pistol MTL, using basic model');
    });
    
    // Similar for other weapons but keep basic models as fallback
    // This ensures immediate functionality while allowing for enhanced visuals

    // Load sounds
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('assets/sounds/gunshot.mp3', buffer => {
        weapons.pistol.sound.setBuffer(buffer);
        weapons.rifle.sound.setBuffer(buffer);
        weapons.shotgun.sound.setBuffer(buffer);
        weapons.sniper.sound.setBuffer(buffer);
    }).catch(e => console.log('Gunshot sound loading failed, continuing without audio'));
    
    audioLoader.load('assets/sounds/explosion.mp3', buffer => {
        weapons.grenade.sound.setBuffer(buffer);
    }).catch(e => console.log('Explosion sound loading failed, continuing without audio'));

    // Key for switching
    document.addEventListener('keydown', e => {
        if (e.key === '1') switchWeapon(weapons, 'pistol');
        if (e.key === '2') switchWeapon(weapons, 'rifle');
        if (e.key === '3') switchWeapon(weapons, 'shotgun');
        if (e.key === '4') switchWeapon(weapons, 'sniper');
        if (e.key === '5') switchWeapon(weapons, 'grenade');
        if (e.key === 'r' || e.key === 'R') reload(weapons);
    });

    return weapons;
}

function switchWeapon(weapons, type) {
    if (weapons[weapons.current].model) {
        weapons[weapons.current].model.visible = false;
    }
    weapons.current = type;
    if (weapons[type].model) {
        weapons[type].model.visible = true;
    }
}

function reload(weapons) {
    const w = weapons[weapons.current];
    w.ammo = w.maxAmmo;
    // Add animation delay if desired
}

export function updateWeapons(weapons, camera, enemies, scene) {
    const time = performance.now() / 1000;
    const w = weapons[weapons.current];

    // Shooting on left click
    if (document.pointerLockElement && mouseDown) {
        if (time - w.lastShot > w.fireRate && w.ammo > 0) {
            w.ammo--;
            w.lastShot = time;
            
            // Play sound if available
            if (w.sound.buffer) {
                w.sound.stop(); // Stop previous sound
                w.sound.play();
            }
            
            // Weapon recoil animation
            if (w.model) {
                const originalZ = w.model.position.z;
                w.model.position.z += 0.05;
                setTimeout(() => {
                    if (w.model) w.model.position.z = originalZ;
                }, 100);
            }

            // Special handling for different weapons
            if (weapons.current === 'shotgun') {
                // Shotgun fires multiple pellets
                for (let i = 0; i < 5; i++) {
                    const spread = (Math.random() - 0.5) * 0.3;
                    const raycaster = new THREE.Raycaster();
                    const direction = new THREE.Vector3(spread, spread * 0.5, -1).normalize();
                    raycaster.set(camera.position, direction);
                    
                    const intersects = raycaster.intersectObjects(
                        enemies.map(e => e.model).filter(Boolean), true
                    );
                    
                    if (intersects.length > 0) {
                        const hitEnemy = enemies.find(e => e.model && 
                            (intersects[0].object === e.model || 
                             intersects[0].object.parent === e.model ||
                             e.model.children.includes(intersects[0].object))
                        );
                        if (hitEnemy) {
                            hitEnemy.health -= w.damage / 5; // Distribute damage across pellets
                            console.log('Shotgun hit enemy, health:', hitEnemy.health);
                        }
                    }
                }
            } else if (weapons.current === 'grenade') {
                // Launch projectile
                const grenade = new THREE.Mesh(
                    new THREE.SphereGeometry(0.1), 
                    new THREE.MeshLambertMaterial({color: 0x4B4B4B})
                );
                grenade.position.copy(camera.position);
                grenade.velocity = new THREE.Vector3();
                camera.getWorldDirection(grenade.velocity);
                grenade.velocity.multiplyScalar(15);
                grenade.velocity.y += 2; // Arc
                grenade.castShadow = true;
                scene.add(grenade);
                
                // Store grenade for physics update
                if (!window.grenades) window.grenades = [];
                window.grenades.push({
                    mesh: grenade,
                    velocity: grenade.velocity.clone(),
                    life: 3.0 // 3 seconds until explosion
                });
                
                console.log('Grenade launched');
            } else {
                // Regular raycast for other weapons
                const raycaster = new THREE.Raycaster();
                const direction = new THREE.Vector3(0, 0, -1);
                camera.getWorldDirection(direction);
                raycaster.set(camera.position, direction);
                
                const intersects = raycaster.intersectObjects(
                    enemies.map(e => e.model).filter(Boolean), true
                );
                
                if (intersects.length > 0) {
                    const hitEnemy = enemies.find(e => e.model && 
                        (intersects[0].object === e.model || 
                         intersects[0].object.parent === e.model ||
                         e.model.children.includes(intersects[0].object))
                    );
                    if (hitEnemy) {
                        hitEnemy.health -= w.damage;
                        console.log(`${weapons.current} hit enemy, health:`, hitEnemy.health);
                        
                        // Create hit effect
                        const hitEffect = new THREE.Mesh(
                            new THREE.SphereGeometry(0.2),
                            new THREE.MeshBasicMaterial({color: 0xFF0000})
                        );
                        hitEffect.position.copy(intersects[0].point);
                        scene.add(hitEffect);
                        setTimeout(() => scene.remove(hitEffect), 200);
                    }
                }
            }
        }
    }
    
    // Update grenade physics if any exist
    if (window.grenades) {
        window.grenades.forEach((grenade, index) => {
            grenade.velocity.y -= 0.02; // Gravity
            grenade.mesh.position.add(grenade.velocity.clone().multiplyScalar(0.016));
            grenade.life -= 0.016;
            
            // Explode when timer runs out or hits ground
            if (grenade.life <= 0 || grenade.mesh.position.y <= 0) {
                // Create explosion effect
                const explosion = new THREE.Mesh(
                    new THREE.SphereGeometry(3),
                    new THREE.MeshBasicMaterial({color: 0xFF4500, transparent: true, opacity: 0.6})
                );
                explosion.position.copy(grenade.mesh.position);
                scene.add(explosion);
                
                // Damage nearby enemies
                enemies.forEach(enemy => {
                    const distance = enemy.position.distanceTo(grenade.mesh.position);
                    if (distance < 5) {
                        const damage = Math.max(10, 50 - distance * 8);
                        enemy.health -= damage;
                        console.log('Grenade damaged enemy:', damage);
                    }
                });
                
                // Remove explosion effect after animation
                setTimeout(() => scene.remove(explosion), 500);
                
                // Remove grenade
                scene.remove(grenade.mesh);
                window.grenades.splice(index, 1);
            }
        });
    }
}

// Add global mousedown tracking
let mouseDown = false;
document.addEventListener('mousedown', e => { 
    if (e.button === 0) { // Left click
        mouseDown = true;
        e.preventDefault();
    }
});
document.addEventListener('mouseup', e => { 
    if (e.button === 0) { // Left click
        mouseDown = false;
        e.preventDefault();
    }
});

// Prevent context menu on right click
document.addEventListener('contextmenu', e => e.preventDefault());

console.log('Weapon system initialized with mouse controls');