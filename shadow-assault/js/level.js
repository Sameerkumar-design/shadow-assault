import * as THREE from 'https://unpkg.com/three@0.156.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.156.1/examples/jsm/loaders/GLTFLoader.js';

export function buildLevel(scene, textureLoader) {
    const levelObjects = [];

    // Create procedural floor texture
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const floorCtx = floorCanvas.getContext('2d');
    
    // Create a tiled floor pattern
    floorCtx.fillStyle = '#444444';
    floorCtx.fillRect(0, 0, 512, 512);
    floorCtx.fillStyle = '#666666';
    for (let x = 0; x < 512; x += 64) {
        for (let y = 0; y < 512; y += 64) {
            if ((x / 64 + y / 64) % 2 === 0) {
                floorCtx.fillRect(x, y, 64, 64);
            }
        }
    }
    const floorTexture = new THREE.CanvasTexture(floorCanvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4);
    
    console.log('Generated procedural floor texture');

    // Floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshLambertMaterial({map: floorTexture, side: THREE.DoubleSide}));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    levelObjects.push(floor);

    // Create procedural wall texture
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 512;
    wallCanvas.height = 512;
    const wallCtx = wallCanvas.getContext('2d');
    
    // Create a brick wall pattern
    wallCtx.fillStyle = '#8B4513';
    wallCtx.fillRect(0, 0, 512, 512);
    wallCtx.fillStyle = '#A0522D';
    for (let y = 0; y < 512; y += 32) {
        for (let x = 0; x < 512; x += 64) {
            const offsetX = (y / 32) % 2 === 0 ? 0 : 32;
            wallCtx.fillRect(x + offsetX, y, 60, 28);
        }
    }
    const wallTexture = new THREE.CanvasTexture(wallCanvas);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    
    console.log('Generated procedural wall texture');

    // Walls (simple boxes for corridors)
    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(50, 5, 1), new THREE.MeshLambertMaterial({map: wallTexture}));
    wall1.position.set(0, 2.5, -25);
    wall1.castShadow = true;
    wall1.receiveShadow = true;
    scene.add(wall1);
    levelObjects.push(wall1);
    
    // Add more walls for a basic room layout
    const wall2 = new THREE.Mesh(new THREE.BoxGeometry(50, 5, 1), new THREE.MeshLambertMaterial({map: wallTexture}));
    wall2.position.set(0, 2.5, 25);
    wall2.castShadow = true;
    wall2.receiveShadow = true;
    scene.add(wall2);
    levelObjects.push(wall2);
    
    const wall3 = new THREE.Mesh(new THREE.BoxGeometry(1, 5, 50), new THREE.MeshLambertMaterial({map: wallTexture}));
    wall3.position.set(-25, 2.5, 0);
    wall3.castShadow = true;
    wall3.receiveShadow = true;
    scene.add(wall3);
    levelObjects.push(wall3);
    
    const wall4 = new THREE.Mesh(new THREE.BoxGeometry(1, 5, 50), new THREE.MeshLambertMaterial({map: wallTexture}));
    wall4.position.set(25, 2.5, 0);
    wall4.castShadow = true;
    wall4.receiveShadow = true;
    scene.add(wall4);
    levelObjects.push(wall4);
    
    // Add some interior obstacles/cover
    const obstacle1 = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 3), new THREE.MeshLambertMaterial({color: 0x8B4513}));
    obstacle1.position.set(8, 1, -8);
    obstacle1.castShadow = true;
    obstacle1.receiveShadow = true;
    scene.add(obstacle1);
    levelObjects.push(obstacle1);
    
    const obstacle2 = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 2), new THREE.MeshLambertMaterial({color: 0x696969}));
    obstacle2.position.set(-12, 1.5, 10);
    obstacle2.castShadow = true;
    obstacle2.receiveShadow = true;
    scene.add(obstacle2);
    levelObjects.push(obstacle2);

    // Load modular corridor
    const loader = new GLTFLoader();
    loader.load('assets/models/corridor.glb', gltf => {
        const corridor = gltf.scene;
        corridor.position.set(0, 0, 0);
        scene.add(corridor);
        levelObjects.push(corridor);
    });

    return levelObjects;
}