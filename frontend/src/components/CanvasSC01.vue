<template>
  <div class="fullscreen-model-container">
    <div id="canvas3d-sc01" ref="viewerContainer" class="fullscreen-viewer"></div>
    
    <!-- Loading overlay -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner"></div>
      <p>กำลังโหลดโมเดล SC01...</p>
    </div>
    
    <!-- Navigation hint - แสดงเฉพาะเมื่อโหลดเสร็จ -->
    <div class="navigation-hint" v-if="!isLoading">
      <p>🏛️ SC01 - ใช้เมาส์หมุนดูรอบๆ และซูมเข้า-ออกเพื่อสำรวจอาคาร</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const viewerContainer = ref(null)
const isLoading = ref(true)

let scene, camera, renderer, controls, animationId

function init3D() {
  const container = viewerContainer.value
  if (!container) return
  
  container.innerHTML = ''
  
  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff) // White background
  
  // Camera setup - สำหรับโมเดล SC01
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
  
  // Load the SC01 model
  loadSC01Model()
  
  // Start animation
  animate()
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize)
  
  isLoading.value = false
}

function loadSC01Model() {
  const loader = new GLTFLoader()
  
  // โหลดโมเดล ตึกกลม.glb
  loader.load(
    '/models/ตึกกลม.glb',
    (gltf) => {
      console.log('SC01 Model loaded successfully:', gltf)
      
      const model = gltf.scene
      
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
          
          // Log ข้อมูลตำแหน่งและชื่อของแต่ละส่วนใน SC01
          console.log('SC01 Building part found:', {
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
      
      console.log('SC01 Model center:', modelCenter)
      console.log('SC01 Model size:', modelSize)
      
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
      console.log('SC01 Model setup completed')
    },
    (progress) => {
      console.log('SC01 Loading progress:', (progress.loaded / progress.total * 100) + '%')
    },
    (error) => {
      console.error('Error loading SC01 model:', error)
      isLoading.value = false
      
      // ถ้าโหลดไม่ได้ ให้สร้างโมเดลทดแทน
      createFallbackModel()
    }
  )
}

function createFallbackModel() {
  console.log('Creating SC01 fallback model...')
  
  // สร้างโมเดลทรงกลมง่ายๆ เป็น fallback สำหรับ SC01
  const geometry = new THREE.SphereGeometry(8, 32, 16) // ทรงกลม
  const material = new THREE.MeshLambertMaterial({ color: 0xFF6B35 }) // สีส้ม
  const building = new THREE.Mesh(geometry, material)
  building.position.y = 8
  building.castShadow = true
  scene.add(building)
  
  // เพิ่มพื้น
  const groundGeometry = new THREE.PlaneGeometry(50, 50)
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
  
  console.log('SC01 Fallback model created')
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

onMounted(() => {
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
  border-top: 6px solid #FF6B35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  color: #FF6B35;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.navigation-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 107, 53, 0.9);
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
}
</style>