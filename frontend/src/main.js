let scene, camera, renderer, controls;

function toggleSubmenu() {
  document.getElementById('building-submenu').classList.toggle('visible');
}

function showInfo(name) {
  document.getElementById('info').innerText = name;
  document.getElementById('canvas3d').innerHTML = ''; // เคลียร์
}

function loadModel(name) {
  document.getElementById('info').innerText = `โหลดโมเดล: ${name}`;
  init3D();
}

function init3D() {
  const container = document.getElementById('canvas3d');
  container.innerHTML = ''; // ล้างเก่า

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Camera
  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(2, 2, 5);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Light
  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  scene.add(light);

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Load Model
  const loader = new THREE.GLTFLoader();
  loader.load('webmodel.obj.glb', (gltf) => {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    scene.add(model);
    animate();
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
