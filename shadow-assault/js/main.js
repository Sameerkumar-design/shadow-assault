import * as THREE from 'https://unpkg.com/three@0.156.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.156.1/examples/jsm/loaders/GLTFLoader.js';
import { initPlayer, updatePlayer } from './player.js?v=1756825000';
import { initWeapons, updateWeapons } from './weapons.js?v=1756825000';
import { initEnemies, updateEnemies } from './enemies.js?v=1756825000';
import { buildLevel } from './level.js?v=1756825000';
import { updateUI } from './ui.js?v=1756825000';

console.log('Starting Shadow Assault Game...');

// Wait for page to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

function initGame() {
    try {
        console.log('Initializing game...');
        
        // Create scene
        const scene = new THREE.Scene();
        console.log('Scene created');
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        console.log('Camera created');
        
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x87CEEB); // Sky blue background
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);
        console.log('Renderer created and added to DOM');
        
        // Add a simple test cube to verify rendering
        const testGeometry = new THREE.BoxGeometry(2, 2, 2);
        const testMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const testCube = new THREE.Mesh(testGeometry, testMaterial);
        testCube.position.set(0, 1, -5);
        scene.add(testCube);
        console.log('Test cube added');
        
        // Position camera
        camera.position.set(0, 2, 0);
        camera.lookAt(0, 1, -5);
        console.log('Camera positioned');
        
        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);
        console.log('Lights added');
        
        // Test render
        renderer.render(scene, camera);
        console.log('Initial test render completed');
        
        // Global variables
        let player, weapons, enemies = [], levelObjects = [], pickups = [];
        let score = 0;
        let ambientAudio;
        window.score = 0;
        
        // Load assets and initialize
        const loader = new GLTFLoader();
        const textureLoader = new THREE.TextureLoader();
        
        // Load sounds
        const audioListener = new THREE.AudioListener();
        camera.add(audioListener);
        ambientAudio = new THREE.Audio(audioListener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('assets/sounds/ambient.mp3', buffer => {
            ambientAudio.setBuffer(buffer);
            ambientAudio.setLoop(true);
            ambientAudio.setVolume(0.3);
            ambientAudio.play();
        }).catch(e => console.log('Audio loading failed:', e));
        
        // Build level
        try {
            levelObjects = buildLevel(scene, textureLoader);
            console.log('Level built with', levelObjects.length, 'objects');
        } catch (e) {
            console.error('Level building failed:', e);
            levelObjects = [];
        }
        
        // Init player
        try {
            player = initPlayer(camera, scene);
            console.log('Player initialized');
        } catch (e) {
            console.error('Player initialization failed:', e);
        }
        
        // Init weapons
        try {
            weapons = initWeapons(scene, camera, audioListener);
            console.log('Weapons initialized');
        } catch (e) {
            console.error('Weapons initialization failed:', e);
            weapons = { current: 'pistol', pistol: { ammo: 15, maxAmmo: 15 } };
        }
        
        // Init enemies with better placement
        try {
            enemies = initEnemies(scene, loader, audioListener, [
                { position: new THREE.Vector3(15, 0, 15), patrol: [new THREE.Vector3(15,0,15), new THREE.Vector3(20,0,20)] },
                { position: new THREE.Vector3(-15, 0, -15), patrol: [new THREE.Vector3(-15,0,-15), new THREE.Vector3(-20,0,-20)] },
                { position: new THREE.Vector3(10, 0, -10), patrol: [new THREE.Vector3(10,0,-10), new THREE.Vector3(15,0,-15)] }
            ]);
            console.log('Enemies initialized:', enemies.length);
        } catch (e) {
            console.error('Enemies initialization failed:', e);
            enemies = [];
        }
        
        // Add pickups
        const ammoPickup = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,1), 
            new THREE.MeshLambertMaterial({color: 0xffff00})
        );
        ammoPickup.position.set(8, 0.5, 8);
        ammoPickup.castShadow = true;
        scene.add(ammoPickup);
        pickups.push(ammoPickup);
        
        // Game loop
        function animate() {
            requestAnimationFrame(animate);
            
            // Rotate test cube
            testCube.rotation.x += 0.01;
            testCube.rotation.y += 0.01;
            
            try {
                if (player && weapons && enemies) {
                    // Update modules
                    updatePlayer(player, camera, levelObjects, pickups, weapons);
                    updateWeapons(weapons, camera, enemies, scene);
                    updateEnemies(enemies, player.position, weapons[weapons.current], player);
                    updateUI(
                        player.health, 
                        weapons[weapons.current] ? weapons[weapons.current].ammo : 0, 
                        weapons[weapons.current] ? weapons[weapons.current].maxAmmo : 0, 
                        window.score, 
                        weapons.current
                    );
                    
                    // Check for pickups collision
                    pickups.forEach((pickup, index) => {
                        if (player.position.distanceTo(pickup.position) < 2) {
                            if (weapons[weapons.current]) {
                                weapons[weapons.current].ammo = weapons[weapons.current].maxAmmo;
                            }
                            scene.remove(pickup);
                            pickups.splice(index, 1);
                        }
                    });
                    
                    // Update score
                    score = window.score;
                }
            } catch (e) {
                console.error('Game loop error:', e);
            }
            
            renderer.render(scene, camera);
        }
        
        // Start the game
        animate();
        
        // Resize handler
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        console.log('Shadow Assault initialized successfully');
        
    } catch (error) {
        console.error('Game initialization failed:', error);
        document.body.innerHTML = '<h1 style="color: white; text-align: center; margin-top: 50px;">Game failed to load. Check console for errors.</h1>';
    }
}