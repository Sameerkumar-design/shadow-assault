import * as THREE from 'https://unpkg.com/three@0.156.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.156.1/examples/jsm/loaders/GLTFLoader.js';

console.log('Starting Shadow Assault...');

// Create basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Configure renderer
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87CEEB); // Sky blue
document.body.appendChild(renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Create a simple test scene
const floorGeometry = new THREE.PlaneGeometry(50, 50);
const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Add some test cubes
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const redMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const testCube = new THREE.Mesh(cubeGeometry, redMaterial);
testCube.position.set(0, 0.5, -5);
scene.add(testCube);

const greenMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const testCube2 = new THREE.Mesh(cubeGeometry, greenMaterial);
testCube2.position.set(3, 0.5, -3);
scene.add(testCube2);

// Position camera
camera.position.set(0, 2, 0);
camera.lookAt(0, 0, -5);

// Simple controls (basic movement)
const keys = { w: false, a: false, s: false, d: false };
document.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case 'w': keys.w = true; break;
        case 'a': keys.a = true; break;
        case 's': keys.s = true; break;
        case 'd': keys.d = true; break;
    }
});
document.addEventListener('keyup', (e) => {
    switch(e.key.toLowerCase()) {
        case 'w': keys.w = false; break;
        case 'a': keys.a = false; break;
        case 's': keys.s = false; break;
        case 'd': keys.d = false; break;
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Simple camera movement
    const speed = 0.1;
    if (keys.w) camera.position.z -= speed;
    if (keys.s) camera.position.z += speed;
    if (keys.a) camera.position.x -= speed;
    if (keys.d) camera.position.x += speed;
    
    // Rotate test cubes
    testCube.rotation.y += 0.01;
    testCube2.rotation.x += 0.01;
    
    renderer.render(scene, camera);
}

// Start the game
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log('Shadow Assault initialized successfully');