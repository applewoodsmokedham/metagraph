/**
 * WebGL-based runestone visualizer using Three.js
 */
class RunestoneWebGLVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.objects = [];
    this.animationId = null;
    this.runestoneData = null;
    
    this.init();
  }
  
  /**
   * Initialize the 3D scene
   */
  init() {
    // Create the scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    
    // Set up the camera
    const { width, height } = this.container.getBoundingClientRect();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 5;
    
    // Set up the renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.container.appendChild(this.renderer.domElement);
    
    // Add orbit controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
    
    // Add a grid for reference
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    this.scene.add(gridHelper);
    
    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Start animation loop
    this.animate();
  }
  
  /**
   * Handle window resize
   */
  onWindowResize() {
    const { width, height } = this.container.getBoundingClientRect();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  /**
   * Animation loop
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    
    // Animate objects
    this.objects.forEach(obj => {
      if (obj.rotation) {
        obj.rotation.x += 0.003;
        obj.rotation.y += 0.005;
      }
    });
  }
  
  /**
   * Clear all objects from the scene
   */
  clearScene() {
    while(this.objects.length > 0) {
      const obj = this.objects.pop();
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }
  }
  
  /**
   * Visualize a single runestone
   * @param {Object} runestoneData The decoded runestone data
   */
  visualizeSingle(runestoneData) {
    this.clearScene();
    this.runestoneData = runestoneData;
    
    // Create a central sphere for the runestone
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0xe94560,
      shininess: 30,
      emissive: 0x220000
    });
    const sphere = new THREE.Mesh(geometry, material);
    this.scene.add(sphere);
    this.objects.push(sphere);
    
    // Check if we have protocol data (0x7fff)
    if (runestoneData.data && runestoneData.data.protocolField) {
      const protocol = runestoneData.data.protocolField;
      const protocolValues = protocol.values || [];
      
      // Create small spheres for each protocol value
      for (let i = 0; i < protocolValues.length; i++) {
        const angle = (i / protocolValues.length) * Math.PI * 2;
        const radius = 2;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        const smallGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const smallMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x3498db,
          shininess: 30
        });
        const smallSphere = new THREE.Mesh(smallGeometry, smallMaterial);
        smallSphere.position.set(x, y, 0);
        
        this.scene.add(smallSphere);
        this.objects.push(smallSphere);
        
        // Add a line connecting to the central sphere
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(x, y, 0)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: 0x3498db,
          transparent: true,
          opacity: 0.7
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        
        this.scene.add(line);
        this.objects.push(line);
      }
    }
    
    // Visualize protostones
    if (runestoneData.data && runestoneData.data.protostones) {
      const protostones = runestoneData.data.protostones;
      
      for (let i = 0; i < protostones.length && i < 10; i++) {
        const protostone = protostones[i];
        const values = protostone.values || [];
        
        // Create a cube for each protostone
        const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const cubeMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x2ecc71,
          transparent: true,
          opacity: 0.9,
          shininess: 30
        });
        
        // Position cubes in a spiral around the central sphere
        const angle = (i / 5) * Math.PI * 2;
        const yOffset = (i % 5) * 0.4 - 1;
        const radius = 3;
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(x, yOffset, z);
        
        this.scene.add(cube);
        this.objects.push(cube);
        
        // For each value in the protostone, create a small sphere
        for (let j = 0; j < values.length && j < 3; j++) {
          const smallGeometry = new THREE.SphereGeometry(0.1, 8, 8);
          const smallMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xf39c12,
            shininess: 30
          });
          
          const offsetX = x + ((j % 3) * 0.2 - 0.2);
          const offsetY = yOffset + 0.4;
          const offsetZ = z + (Math.floor(j / 3) * 0.2 - 0.1);
          
          const smallSphere = new THREE.Mesh(smallGeometry, smallMaterial);
          smallSphere.position.set(offsetX, offsetY, offsetZ);
          
          this.scene.add(smallSphere);
          this.objects.push(smallSphere);
        }
      }
    }
    
    // Center and adjust the view
    this.camera.position.set(0, 0, 7);
    this.controls.update();
  }
  
  /**
   * Visualize a summary of multiple runestones
   * @param {Array} runestones Array of decoded runestone data
   */
  visualizeSummary(runestones) {
    this.clearScene();
    
    if (!runestones || runestones.length === 0) {
      console.warn('No runestones to visualize');
      return;
    }
    
    // Group runestones by protocol
    const protocolGroups = {};
    for (const runestone of runestones) {
      const protocolName = runestone.data?.protocolName || 'Unknown';
      if (!protocolGroups[protocolName]) {
        protocolGroups[protocolName] = [];
      }
      protocolGroups[protocolName].push(runestone);
    }
    
    // Create cubes for each protocol group
    const protocols = Object.keys(protocolGroups);
    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6];
    
    for (let i = 0; i < protocols.length; i++) {
      const protocol = protocols[i];
      const runestonesInProtocol = protocolGroups[protocol];
      
      // Calculate the size based on the number of runestones
      const size = Math.max(0.5, Math.min(2, runestonesInProtocol.length / 10));
      
      // Create a cube for this protocol
      const cubeGeometry = new THREE.BoxGeometry(size, size, size);
      const cubeMaterial = new THREE.MeshPhongMaterial({ 
        color: colors[i % colors.length],
        shininess: 30
      });
      
      // Position in a circle
      const angle = (i / protocols.length) * Math.PI * 2;
      const radius = 3;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.position.set(x, 0, z);
      
      this.scene.add(cube);
      this.objects.push(cube);
      
      // Add a text sprite for the protocol name
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 128;
      
      context.fillStyle = '#000000';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      context.font = 'Bold 24px Arial';
      context.fillStyle = '#ffffff';
      context.textAlign = 'center';
      context.fillText(protocol, canvas.width / 2, 40);
      context.fillText(`${runestonesInProtocol.length} runestones`, canvas.width / 2, 80);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true
      });
      
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(x, size + 0.5, z);
      sprite.scale.set(2, 1, 1);
      
      this.scene.add(sprite);
      this.objects.push(sprite);
    }
    
    // Add a central sphere representing all runestones
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x1abc9c,
      shininess: 30,
      emissive: 0x001a1a
    });
    const sphere = new THREE.Mesh(geometry, material);
    this.scene.add(sphere);
    this.objects.push(sphere);
    
    // Add connecting lines from the center to each protocol cube
    for (let i = 0; i < protocols.length; i++) {
      const angle = (i / protocols.length) * Math.PI * 2;
      const radius = 3;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, 0, z)
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0.7
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      
      this.scene.add(line);
      this.objects.push(line);
    }
    
    // Center and adjust the view
    this.camera.position.set(0, 5, 10);
    this.controls.update();
  }
  
  /**
   * Clean up resources when the visualizer is no longer needed
   */
  dispose() {
    this.clearScene();
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    if (this.controls) {
      this.controls.dispose();
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }
    
    window.removeEventListener('resize', () => this.onWindowResize());
  }
}
