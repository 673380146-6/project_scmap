<template>
  <div class="fullscreen-model-container">
    <div id="canvas3d-sc09" ref="viewerContainer" class="fullscreen-viewer"></div>
    
    <!-- Loading overlay -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner"></div>
      <p>กำลังโหลดโมเดล SC09...</p>
    </div>
    
    <!-- Navigation hint - แสดงเฉพาะเมื่อโหลดเสร็จ -->
    <div class="navigation-hint" v-if="!isLoading">
      <p>🏢 SC09 - ใช้เมาส์หมุนดูรอบๆ และซูมเข้า-ออกเพื่อสำรวจอาคาร</p>
    </div>
    
    <!-- Floor selector UI - มุมขวาล่าง -->
    <div class="floor-selector" v-if="!isLoading">
      <div class="floor-title">ชั้นของตึก SC09</div>
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
        <div class="description-facilities" v-if="currentFloorData.facilities && currentFloorData.facilities.length > 0">
          <div class="facilities-title">สิ่งอำนวยความสะดวก:</div>
          <div class="facilities-list">
            <span class="facility-item" v-for="facility in currentFloorData.facilities" :key="facility">
              {{ facility }}
            </span>
          </div>
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
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore'

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAmfunEqGUmZHabiPKYwCuay3JCRVXa_DU",
  authDomain: "project-web-f9a73.firebaseapp.com",
  projectId: "project-web-f9a73",
  storageBucket: "project-web-f9a73.appspot.com",
  messagingSenderId: "809705005062",
  appId: "1:809705005062:web:f4736c194fc7cf68c5e387",
  measurementId: "G-BK760T9XCW"
}
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const viewerContainer = ref(null)
const isLoading = ref(true)
const selectedFloor = ref(null) // เริ่มต้นที่หน้าตึกใหญ่
const floorDescriptions = ref({}) // เก็บข้อมูล description จาก Firestore
const currentFloorData = ref(null) // ข้อมูลชั้นปัจจุบัน

// ข้อมูลชั้นของตึก SC09
const floors = ref([
  { id: 1, number: '1F', name: 'ชั้นล่าง', model: 'cp9_01.glb' },
  { id: 2, number: '2F', name: 'ชั้น 2', model: 'cp9_02.glb' },
  { id: 3, number: '3F', name: 'ชั้น 3', model: 'cp9_03.glb' },
  { id: 4, number: '4F', name: 'ชั้น 4', model: 'cp9_04.glb' },
  { id: 5, number: '5F', name: 'ชั้นบน', model: 'cp9_05.glb' }
])

let scene, camera, renderer, controls, animationId
let currentModel = null // เก็บโมเดลปัจจุบัน

function init3D() {
  const container = viewerContainer.value
  if (!container) return
  
  container.innerHTML = ''
  
  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff) // White background
  
  // Camera setup - สำหรับโมเดล SC09
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
  camera.position.set(5, 4, 6) // ซูมออกมากขึ้น
  
  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)
  
  // Lighting - เพิ่มความสว่างมากขึ้น
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2) // เพิ่มเป็นสีขาวและสว่างขึ้น
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0) // เพิ่มความสว่าง
  directionalLight.position.set(100, 100, 50)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 0.1
  directionalLight.shadow.camera.far = 500
  directionalLight.shadow.camera.left = -50
  directionalLight.shadow.camera.right = 50
  directionalLight.shadow.camera.top = 50
  directionalLight.shadow.camera.bottom = -50
  scene.add(directionalLight)
  
  // เพิ่มแสงเสริมอีกด้าน
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.2)
  directionalLight2.position.set(-100, 80, -50)
  scene.add(directionalLight2)
  
  // เพิ่มแสงจากด้านล่าง
  const bottomLight = new THREE.DirectionalLight(0xffffff, 0.8)
  bottomLight.position.set(0, -50, 0)
  scene.add(bottomLight)
  
  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableZoom = false // ปิดการซูม - คงมุมกล้องไว้
  controls.enablePan = false // ปิดการขยับแผนที่
  
  // จำกัดการหมุนในแนวดิ่ง (Polar Angle) - ไม่ให้เห็นใต้แมพ
  controls.minPolarAngle = 0.1 // มองขึ้นได้เล็กน้อย
  controls.maxPolarAngle = Math.PI / 2.2 // ไม่ให้มองจากด้านล่างแมพ
  
  // ไม่จำกัดการหมุนรอบแกน Y (Azimuth) - หมุนได้ 360 องศา
  
  // Load the default building model (ตึกใหญ่)
  loadFloorModel('CP09.glb')
  
  // Start animation
  animate()
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize)
  
  isLoading.value = false
}

function loadFloorModel(modelFileName) {
  // ลบโมเดลเก่าออกก่อน
  if (currentModel) {
    scene.remove(currentModel)
    currentModel = null
  }
  
  const loader = new GLTFLoader()
  
  // โหลดโมเดลชั้นที่เลือก
  loader.load(
    `/models/${modelFileName}`,
    (gltf) => {
      console.log('Floor model loaded successfully:', modelFileName, gltf)
      
      const model = gltf.scene
      currentModel = model // เก็บ reference ของโมเดลปัจจุบัน
      
      // ปรับขนาดโมเดลถ้าจำเป็น
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3()).length()
      const center = box.getCenter(new THREE.Vector3())
      
      // ปรับขนาดให้เหมาะสม
      const maxSize = 50 // ขนาดสูงสุดที่ต้องการ
      if (size > maxSize) {
        const scale = maxSize / size
        model.scale.multiplyScalar(scale)
      }
      
      // จัดให้อยู่กึ่งกลาง - ใช้จุดศูนย์กลางของโมเดล
      model.position.sub(center.multiplyScalar(model.scale.x))
      
      // เพิ่ม shadow และ log ข้อมูลตึก
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          
          // Log ข้อมูลตำแหน่งและชื่อของแต่ละส่วนในชั้น
          console.log('Floor building part found:', {
            name: child.name,
            position: {
              x: child.position.x,
              y: child.position.y,
              z: child.position.z
            },
            scale: {
              x: child.scale.x,
              y: child.scale.y,
              z: child.scale.z
            },
            material: child.material ? child.material.name : 'No material name'
          })
          
          // ปรับปรุง material พื้นฐาน
          if (child.material) {
            child.material.needsUpdate = true
          }
        }
      })
      
      scene.add(model)
      
      // ใช้จุดศูนย์กลางของโมเดลทั้งหมด
      const boundingBox = new THREE.Box3().setFromObject(model)
      const modelCenter = boundingBox.getCenter(new THREE.Vector3())
      const modelSize = boundingBox.getSize(new THREE.Vector3())
      const maxDimension = Math.max(modelSize.x, modelSize.y, modelSize.z)
      
      console.log('Model center:', modelCenter)
      console.log('Model size:', modelSize)
      
      // ตั้งกล้องให้ซูมออกมากขึ้น
      camera.position.set(
        modelCenter.x + maxDimension * 0.4,   // ซูมออกมากขึ้น
        modelCenter.y + maxDimension * 0.25,  // สูงขึ้น
        modelCenter.z + maxDimension * 0.5    // ไกลออกมากขึ้น
      )
      camera.lookAt(modelCenter)
      
      // อัพเดท controls ให้หมุนรอบจุดศูนย์กลางโมเดล
      if (controls) {
        controls.target.copy(modelCenter)
        controls.update()
      }
      
      isLoading.value = false
      console.log('Floor model setup completed:', modelFileName)
    },
    (progress) => {
      console.log('Floor model loading progress:', modelFileName, (progress.loaded / progress.total * 100) + '%')
    },
    (error) => {
      console.error('Error loading floor model:', modelFileName, error)
      isLoading.value = false
      
      // ถ้าโหลดไม่ได้ ให้สร้างโมเดลทดแทน
      createFallbackModel()
    }
  )
}

function createFallbackModel() {
  console.log('Creating floor fallback model...')
  
  // สร้างโมเดลง่ายๆ เป็น fallback สำหรับชั้น
  const geometry = new THREE.BoxGeometry(15, 3, 12) // ทำให้เป็นชั้นเดียว
  const material = new THREE.MeshLambertMaterial({ color: 0x4A90E2 }) // สีน้ำเงิน
  const building = new THREE.Mesh(geometry, material)
  building.position.y = 1.5
  building.castShadow = true
  scene.add(building)
  currentModel = building
  
  // เพิ่มพื้น
  const groundGeometry = new THREE.PlaneGeometry(50, 50)
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
  
  console.log('Floor fallback model created')
}

function animate() {
  animationId = requestAnimationFrame(animate)
  
  if (controls) {
    controls.update()
  }
  
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

function onWindowResize() {
  const container = viewerContainer.value
  if (!container || !camera || !renderer) return
  
  camera.aspect = container.clientWidth / container.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.clientWidth, container.clientHeight)
}

async function loadFloorDescriptions() {
  try {
    console.log('Loading floor descriptions from Firestore...')
    const descriptionsRef = collection(db, 'sc09_floor_descriptions')
    const snapshot = await getDocs(descriptionsRef)
    
    const descriptions = {}
    snapshot.forEach((doc) => {
      const data = doc.data()
      descriptions[data.floorId] = {
        floorId: data.floorId,
        description: data.description || '',
        facilities: data.facilities || [],
        lastUpdated: data.lastUpdated || null
      }
    })
    
    floorDescriptions.value = descriptions
    console.log('Floor descriptions loaded:', descriptions)
  } catch (error) {
    console.error('Error loading floor descriptions:', error)
    // ใช้ข้อมูล fallback
    floorDescriptions.value = {
      1: { floorId: 1, description: 'ชั้นล่าง - พื้นที่โถงและแผนกต้อนรับ', facilities: ['ลิฟต์', 'บันได', 'แผนกต้อนรับ'] },
      2: { floorId: 2, description: 'ชั้น 2 - ห้องเรียนและห้องประชุม', facilities: ['ห้องเรียน', 'ห้องประชุม', 'ห้องน้ำ'] },
      3: { floorId: 3, description: 'ชั้น 3 - ห้องปฏิบัติการ', facilities: ['ห้องแล็บ', 'ห้องคอมพิวเตอร์', 'ห้องเก็บอุปกรณ์'] },
      4: { floorId: 4, description: 'ชั้น 4 - ห้องสำนักงานและห้องประชุม', facilities: ['ห้องสำนักงาน', 'ห้องประชุมใหญ่', 'ห้องพักอาจารย์'] },
      5: { floorId: 5, description: 'ชั้นบน - ห้องประชุมและพื้นที่พิเศษ', facilities: ['ห้องประชุมบอร์ด', 'ห้องพิเศษ', 'ระเบียง'] }
    }
  }
}

function getCurrentFloorNumber() {
  const floor = floors.value.find(f => f.id === selectedFloor.value)
  return floor ? floor.number : ''
}

function selectFloor(floorId) {
  const floor = floors.value.find(f => f.id === floorId)
  
  // ถ้ากดชั้นเดิมซ้ำ ให้กลับไปหน้าตึกใหญ่
  if (selectedFloor.value === floorId) {
    console.log('กดชั้นซ้ำ - กลับไปหน้าตึกใหญ่')
    selectedFloor.value = null
    currentFloorData.value = null
    isLoading.value = true
    loadFloorModel('CP09.glb') // โหลดโมเดลตึกใหญ่
  } else {
    // เลือกชั้นใหม่
    selectedFloor.value = floorId
    console.log('เลือกชั้น:', floor.number, '-', floor.name, 'โมเดล:', floor.model)
    currentFloorData.value = floorDescriptions.value[floorId] || null
    isLoading.value = true
    loadFloorModel(floor.model)
  }
}

function cleanup() {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  window.removeEventListener('resize', onWindowResize)
  
  if (renderer) {
    renderer.dispose()
  }
  
  if (scene) {
    scene.clear()
  }
}

onMounted(async () => {
  // โหลดข้อมูล description ก่อน
  await loadFloorDescriptions()
  
  setTimeout(() => {
    init3D()
  }, 100)
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.fullscreen-model-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #ffffff;
  overflow: hidden;
}

.fullscreen-viewer {
  width: 100%;
  height: 100%;
  background: #ffffff;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
  z-index: 10;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #e3f2fd;
  border-top: 6px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  color: #1976d2;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.navigation-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(74, 144, 226, 0.9);
  backdrop-filter: blur(10px);
  padding: 15px 20px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.navigation-hint p {
  color: white;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

/* Floor selector UI */
.floor-selector {
  position: absolute;
  bottom: 80px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 100;
}

.floor-title {
  font-size: 16px;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 12px;
  text-align: center;
  border-bottom: 2px solid #e3f2fd;
  padding-bottom: 8px;
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
  transition: all 0.3s ease;
  background: rgba(243, 248, 255, 0.5);
  border: 2px solid transparent;
}

.floor-item:hover {
  background: rgba(33, 150, 243, 0.1);
  border-color: rgba(33, 150, 243, 0.3);
  transform: translateX(2px);
}

.floor-item.active {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  border-color: #1976d2;
  color: white;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.4);
}

.floor-number {
  font-size: 18px;
  font-weight: 800;
  min-width: 30px;
  text-align: center;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 6px;
  padding: 4px 8px;
}

.floor-item.active .floor-number {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.floor-name {
  font-size: 14px;
  font-weight: 500;
}

.building-view-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  margin-top: 8px;
  background: linear-gradient(135deg, #4caf50, #388e3c);
  border-radius: 8px;
  color: white;
  text-align: center;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.info-icon {
  font-size: 20px;
}

.info-text {
  font-size: 14px;
  font-weight: 600;
}

/* Floor Description UI */
.floor-description {
  position: absolute;
  bottom: 80px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 350px;
  z-index: 100;
}

.description-title {
  font-size: 16px;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 2px solid #e3f2fd;
  padding-bottom: 8px;
}

.floor-badge {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  font-size: 12px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  min-width: 30px;
  text-align: center;
}

.description-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.description-text {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  background: rgba(243, 248, 255, 0.7);
  padding: 10px;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.description-facilities {
  margin-top: 8px;
}

.facilities-title {
  font-size: 13px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 6px;
}

.facilities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.facility-item {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #1976d2;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid rgba(33, 150, 243, 0.2);
}

/* Responsive design */
@media (max-width: 768px) {
  .navigation-hint {
    padding: 12px 15px;
  }
  
  .navigation-hint p {
    font-size: 12px;
  }
  
  .loading-overlay p {
    font-size: 16px;
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border-width: 5px;
  }
  
  .floor-selector {
    bottom: 70px;
    right: 15px;
    min-width: 180px;
    padding: 12px;
  }
  
  .floor-title {
    font-size: 14px;
  }
  
  .floor-number {
    font-size: 16px;
    min-width: 25px;
  }
  
  .floor-name {
    font-size: 12px;
  }
  
  .floor-description {
    bottom: 70px;
    left: 15px;
    max-width: 280px;
    padding: 12px;
  }
  
  .description-title {
    font-size: 14px;
  }
  
  .description-text {
    font-size: 12px;
    padding: 8px;
  }
  
  .facilities-title {
    font-size: 12px;
  }
  
  .facility-item {
    font-size: 11px;
    padding: 3px 6px;
  }
}
</style>