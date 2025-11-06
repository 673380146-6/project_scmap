<template>
  <div class="fullscreen-model-container">
    <div id="canvas3d-sc08" ref="viewerContainer" class="fullscreen-viewer"></div>
    
    <!-- Loading overlay -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner"></div>
      <p>กำลังโหลดโมเดล SC08...</p>
    </div>
    
    <!-- Navigation hint - แสดงเฉพาะเมื่อโหลดเสร็จ -->
    <div class="navigation-hint" v-if="!isLoading">
      <p>🏢 SC08 - ใช้เมาส์หมุนดูรอบๆ และซูมเข้า-ออกเพื่อสำรวจอาคาร</p>
    </div>
    
    <!-- Floor selector UI - มุมขวาล่าง -->
    <div class="floor-selector" v-if="!isLoading">
      <div class="floor-title">ชั้นของตึก SC08</div>
      <div class="floor-list">
        <div 
          class="floor-item" 
          :class="{ active: selectedFloor === floor.id }"
          v-for="floor in floors" 
          :key="floor.id"
          @click="selectFloor(floor.id)"
        >
          <div class="floor-number">{{ floor.number }}</div>
          <div class="floor-name">{{ floor.name }}</div>
        </div>
        
        <!-- แสดงสถานะเมื่อดูตึกใหญ่ -->
        <div class="building-view-info" v-if="selectedFloor === null">
          <div class="info-icon">🏢</div>
          <div class="info-text">มุมมองตึกใหญ่</div>
        </div>
      </div>
    </div>
    
    <!-- Floor Description UI - มุมซ้ายล่าง -->
    <div class="floor-description" v-if="!isLoading && selectedFloor !== null && currentFloorData">
      <div class="description-title">
        <span class="floor-badge">{{ getCurrentFloorNumber() }}</span>
        รายละเอียดชั้น
      </div>
      <div class="description-content">
        <div class="description-text" v-if="currentFloorData.description">
          {{ currentFloorData.description }}
        </div>
        <div class="description-text" v-else>
          ไม่มีข้อมูลรายละเอียดสำหรับชั้นนี้
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const viewerContainer = ref(null)
const isLoading = ref(true)
const selectedFloor = ref(null)

// ข้อมูลชั้นของตึก SC08
const floors = ref([
  { 
    id: 1, 
    number: "ชั้น 1", 
    name: "พื้นฐาน",
    description: "ชั้นล่างของอาคาร SC08 สำหรับห้องเรียนพื้นฐาน"
  },
  { 
    id: 2, 
    number: "ชั้น 2", 
    name: "ห้องปฏิบัติการ",
    description: "ห้องปฏิบัติการวิทยาศาสตร์และเทคโนโลยี"
  },
  { 
    id: 3, 
    number: "ชั้น 3", 
    name: "ห้องวิจัย",
    description: "ห้องวิจัยและห้องเรียนขั้นสูง"
  }
])

let scene, camera, renderer, controls, animationId, buildingModel, floorModels = {}

const currentFloorData = computed(() => {
  return floors.value.find(floor => floor.id === selectedFloor.value)
})

function getCurrentFloorNumber() {
  return currentFloorData.value ? currentFloorData.value.number : ''
}

function init3D() {
  const container = viewerContainer.value
  if (!container) return
  
  container.innerHTML = ''
  
  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)
  
  // Camera setup
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
  camera.position.set(10, 8, 15)
  
  // Renderer setup - ปรับปรุงประสิทธิภาพ
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: "high-performance",
    alpha: false,
    stencil: false,
    depth: true
  })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)
  
  // Controls - ปรับปรุงเพื่อความเรียบ
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08 // เพิ่มเป็น 0.08 เพื่อความเรียบมากขึ้น
  controls.maxPolarAngle = Math.PI / 2.2
  controls.rotateSpeed = 0.5 // ลดความเร็วการหมุน
  controls.autoRotate = false
  controls.screenSpacePanning = false
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(20, 20, 10)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)
  
  // Load 3D model
  loadModel()
  
  // Start animation loop
  animate()
}

function loadModel() {
  const loader = new GLTFLoader()
  
  // พยายามโหลดโมเดล SC08 ถ้าไม่มีก็ใช้โมเดลพื้นฐาน
  loader.load(
    '/models/sc08.glb', // หรือ '/models/sc08.gltf'
    (gltf) => {
      buildingModel = gltf.scene
      buildingModel.scale.setScalar(1)
      buildingModel.position.set(0, 0, 0)
      
      // Enable shadows
      buildingModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      
      scene.add(buildingModel)
      isLoading.value = false
      
      // ตั้งกล้องให้เหมาะสม
      fitCameraToObject()
    },
    (progress) => {
      console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%')
    },
    (error) => {
      console.error('Error loading model:', error)
      // ถ้าโหลดไม่ได้ ให้สร้างโมเดลพื้นฐาน
      createBasicBuilding()
    }
  )
}

function createBasicBuilding() {
  // สร้างโมเดลอาคาร SC08 แบบพื้นฐาน
  const buildingGroup = new THREE.Group()
  
  // อาคารหลัก
  const buildingGeometry = new THREE.BoxGeometry(12, 15, 8)
  const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc })
  const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
  building.position.y = 7.5
  building.castShadow = true
  building.receiveShadow = true
  buildingGroup.add(building)
  
  // หลังคา
  const roofGeometry = new THREE.ConeGeometry(8, 3, 4)
  const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 })
  const roof = new THREE.Mesh(roofGeometry, roofMaterial)
  roof.position.y = 16.5
  roof.rotation.y = Math.PI / 4
  roof.castShadow = true
  buildingGroup.add(roof)
  
  // หน้าต่าง
  for (let floor = 0; floor < 3; floor++) {
    for (let i = 0; i < 3; i++) {
      const windowGeometry = new THREE.PlaneGeometry(1.5, 2)
      const windowMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.7
      })
      const window = new THREE.Mesh(windowGeometry, windowMaterial)
      window.position.set(-4 + i * 4, 3 + floor * 4, 4.1)
      buildingGroup.add(window)
    }
  }
  
  // ป้าย SC08
  const textGeometry = new THREE.PlaneGeometry(4, 1)
  const textMaterial = new THREE.MeshLambertMaterial({ color: 0x2E8B57 })
  const textPlane = new THREE.Mesh(textGeometry, textMaterial)
  textPlane.position.set(0, 12, 4.1)
  buildingGroup.add(textPlane)
  
  // พื้น
  const groundGeometry = new THREE.PlaneGeometry(30, 30)
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  buildingGroup.add(ground)
  
  buildingModel = buildingGroup
  scene.add(buildingModel)
  isLoading.value = false
  
  fitCameraToObject()
}

function fitCameraToObject() {
  if (!buildingModel) return
  
  const box = new THREE.Box3().setFromObject(buildingModel)
  const size = box.getSize(new THREE.Vector3()).length()
  const center = box.getCenter(new THREE.Vector3())
  
  camera.position.copy(center)
  camera.position.x += size / 2
  camera.position.y += size / 3
  camera.position.z += size / 2
  camera.lookAt(center)
  
  controls.target.copy(center)
  controls.update()
}

function selectFloor(floorId) {
  selectedFloor.value = selectedFloor.value === floorId ? null : floorId
  
  if (selectedFloor.value === null) {
    // แสดงมุมมองตึกทั้งหมด
    showFullBuilding()
  } else {
    // แสดงชั้นที่เลือก
    showSpecificFloor(floorId)
  }
}

function showFullBuilding() {
  if (buildingModel) {
    buildingModel.visible = true
  }
  fitCameraToObject()
}

function showSpecificFloor(floorId) {
  // ซ่อนตัวอาคารหลักและแสดงเฉพาะชั้นที่เลือก
  console.log(`แสดงชั้น ${floorId} ของ SC08`)
  
  // สำหรับตอนนี้ให้แสดงตัวอาคารและซูมเข้าไปที่ชั้นนั้น
  if (buildingModel && camera) {
    const floorHeight = (floorId - 1) * 5 + 2.5
    const targetPosition = new THREE.Vector3(0, floorHeight, 0)
    
    // ปรับตำแหน่งกล้องให้ซูมเข้าไปที่ชั้นนั้น
    camera.position.set(15, floorHeight + 2, 15)
    camera.lookAt(targetPosition)
    controls.target.copy(targetPosition)
    controls.update()
  }
}

function animate() {
  animationId = requestAnimationFrame(animate)
  
  if (controls) {
    controls.update()
  }
  
  if (renderer && scene && camera) {
    // เพิ่ม performance optimization
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.render(scene, camera)
  }
}

function handleResize() {
  const container = viewerContainer.value
  if (!container || !camera || !renderer) return
  
  camera.aspect = container.clientWidth / container.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.clientWidth, container.clientHeight)
}

onMounted(() => {
  init3D()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<style scoped>
.fullscreen-model-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.fullscreen-viewer {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.navigation-hint {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  z-index: 100;
  pointer-events: none;
}

.floor-selector {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 100;
}

.floor-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #2c3e50;
  font-size: 16px;
}

.floor-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.floor-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.floor-item:hover {
  background: #f8f9fa;
  transform: translateX(2px);
}

.floor-item.active {
  background: #e3f2fd;
  border-color: #2196f3;
}

.floor-number {
  font-weight: 600;
  color: #1976d2;
  min-width: 60px;
}

.floor-name {
  color: #555;
  font-size: 14px;
}

.building-view-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #e8f5e8;
  border-radius: 6px;
  margin-top: 8px;
}

.info-icon {
  font-size: 18px;
}

.info-text {
  color: #2e7d32;
  font-weight: 500;
  font-size: 14px;
}

.floor-description {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 300px;
  z-index: 100;
}

.description-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

.floor-badge {
  background: #2196f3;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.description-content {
  color: #555;
  font-size: 14px;
  line-height: 1.4;
}

.description-text {
  margin-bottom: 8px;
}
</style>