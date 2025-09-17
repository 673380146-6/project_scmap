<template>
  <div ref="viewerContainer" class="viewer-container"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const props = defineProps({
  modelPath: String
})

const viewerContainer = ref(null)

onMounted(() => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, viewerContainer.value.clientWidth / viewerContainer.value.clientHeight, 0.1, 1000)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(viewerContainer.value.clientWidth, viewerContainer.value.clientHeight)
  viewerContainer.value.appendChild(renderer.domElement)

  const light = new THREE.HemisphereLight(0xffffff, 0x444444)
  light.position.set(0, 200, 0)
  scene.add(light)

  const loader = new GLTFLoader()
  loader.load(props.modelPath, (gltf) => {
    scene.add(gltf.scene)
  }, undefined, (error) => {
    console.error('โหลดโมเดลล้มเหลว:', error)
  })

  camera.position.z = 5

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

  animate()
})
</script>

<style scoped>
.viewer-container {
  width: 100%;
  height: 600px;
  border: 2px dashed #ccc;
  margin-top: 20px;
}
</style>
