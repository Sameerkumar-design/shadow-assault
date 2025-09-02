console.log('Loading minimal test version...');

// Basic Three.js test
import * as THREE from 'https://unpkg.com/three@0.156.1/build/three.module.js';

console.log('Three.js imported:', THREE);

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting Three.js test...');
    
    try {
        // Create basic scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x0077ff); // Blue background
        document.body.appendChild(renderer.domElement);
        
        console.log('Renderer added to DOM');
        
        // Create a simple cube
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        
        // Position camera
        camera.position.z = 5;
        
        console.log('Scene setup complete');
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            
            renderer.render(scene, camera);
        }
        
        // Start animation
        animate();
        console.log('Animation started - you should see a green rotating cube');
        
        // Add text overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '10px';
        overlay.style.left = '10px';
        overlay.style.color = 'white';
        overlay.style.fontFamily = 'Arial';
        overlay.style.fontSize = '16px';
        overlay.innerHTML = 'Three.js Test Working!<br>You should see a green rotating cube.';
        document.body.appendChild(overlay);
        
    } catch (error) {
        console.error('Three.js test failed:', error);
        document.body.innerHTML = `
            <div style="color: white; padding: 20px; font-family: Arial;">
                <h2>Three.js Test Failed</h2>
                <p>Error: ${error.message}</p>
                <p>Check the browser console for more details.</p>
            </div>
        `;
    }
});

console.log('Minimal test script loaded');