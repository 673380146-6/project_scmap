
<template>
  <div>
    <div id="canvas3d" ref="viewerContainer" class="viewer-container"></div>
    <div id="info">{{ info }}</div>
    <button @click="toggleSubmenu">Toggle Submenu</button>
    <div id="building-submenu" :class="{ visible: submenuVisible }">
      <button @click="showInfo('SC01')">SC01</button>
      <button @click="showInfo('SC02')">SC02</button>
      <button @click="loadModel('webmodel.obj.glb')">Load Model</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

let scene, camera, renderer, controls
const info = ref('')
const submenuVisible = ref(false)
const viewerContainer = ref(null)

function toggleSubmenu() {
  submenuVisible.value = !submenuVisible.value
}

function showInfo(name) {
  info.value = name
  if (viewerContainer.value) viewerContainer.value.innerHTML = ''
}

function loadModel(name) {
  info.value = `โหลดโมเดล: ${name}`
  init3D()
}

function init3D() {
  const container = viewerContainer.value
  if (!container) return
  container.innerHTML = ''
  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)
  // Camera
  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000)
  camera.position.set(2, 2, 5)
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)
  // Light
  const light = new THREE.HemisphereLight(0xffffff, 0x444444)
  scene.add(light)
  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  // Load Model
  const loader = new GLTFLoader()
  loader.load('webmodel.obj.glb', (gltf) => {
    const model = gltf.scene
    model.position.set(0, 0, 0)
    scene.add(model)
    animate()
  })
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
</script>

<style scoped>
#canvas3d.viewer-container {
  width: 100%;
  height: 600px;
  border: 2px dashed #ccc;
  margin-top: 20px;
}
#building-submenu {
  display: none;
}
#building-submenu.visible {
  display: block;
}
</style>
