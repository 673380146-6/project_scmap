<template>
  <div class="fullscreen-model-container">
    <div id="canvas3d" ref="viewerContainer" class="fullscreen-viewer"></div>
    
    <!-- Loading overlay -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner"></div>
      <p>กำลังโหลดแผนที่ Science Map...</p>
    </div>
    
    <!-- Navigation hint - แสดงเฉพาะเมื่อโหลดเสร็จ -->
    <div class="navigation-hint" v-if="!isLoading">
      <p>🎯 ยินดีต้อนรับสู่ Science Map! ใช้เมาส์หมุนดูรอบๆ และซูมเข้า-ออกเพื่อสำรวจแผนที่</p>
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
  
  // Camera setup - ปรับตำแหน่งให้เหมาะกับโมเดล sc_all
  camera = new THREE.PerspectiveCamera(85, container.clientWidth / container.clientHeight, 0.1, 1000)
  camera.position.set(5, 3, 6) // ซูมเข้าไปใกล้มากๆ แบบเดินติดอาคาร
  
  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)
  
  // Lighting - เพิ่มความสว่างมากขึ้น
  const ambientLight = new THREE.AmbientLight(0x808080, 0.9) // เพิ่มเป็น 0x808080, 0.9
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.6) // เพิ่มเป็น 1.6
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
  
  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableZoom = true
  controls.enablePan = false // ปิดการขยับแผนที่
  
  // จำกัดการหมุนในแนวดิ่ง (Polar Angle) - ไม่ให้เห็นใต้แมพ
  controls.minPolarAngle = 0.1 // มองขึ้นได้เล็กน้อย
  controls.maxPolarAngle = Math.PI / 2.2 // ไม่ให้มองจากด้านล่างแมพ
  
  // ไม่จำกัดการหมุนรอบแกน Y (Azimuth) - หมุนได้ 360 องศา
  // controls.minAzimuthAngle และ controls.maxAzimuthAngle ไม่ต้องตั้งค่า
  
  controls.minDistance = 0.5 // ซูมเข้าได้ใกล้มากๆ แบบเดินติดอาคาร
  controls.maxDistance = 30 // ซูมออกได้เพื่อดูภาพรวม
  controls.zoomSpeed = 1.5 // ความเร็วซูมเร็วขึ้น
  
  // Load the real 3D model
  loadMainMapModel()
  
  // Start animation
  animate()
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize)
  
  isLoading.value = false
}

function loadMainMapModel() {
  const loader = new GLTFLoader()
  
  // โหลดโมเดลจากไฟล์จริง
  loader.load(
    '/models/sc_all.glb',
    (gltf) => {
      console.log('Model loaded successfully:', gltf)
      
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
      
      // จัดให้อยู่กึ่งกลาง
      model.position.sub(center.multiplyScalar(model.scale.x))
      
      // เพิ่ม shadow และ log ข้อมูลตึก
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          
          // Log ข้อมูลตำแหน่งและชื่อของแต่ละตึก
          console.log('Building found:', {
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
      
      // ปรับตำแหน่งกล้องให้ซูมเข้าใกล้
      const boundingBox = new THREE.Box3().setFromObject(model)
      const modelSize = boundingBox.getSize(new THREE.Vector3())
      const maxDimension = Math.max(modelSize.x, modelSize.y, modelSize.z)
      
      // ตั้งกล้องให้อยู่ใกล้มากๆ ในแผนที่
      camera.position.set(
        maxDimension * 0.3,  // ซูมเข้าใกล้มากๆ
        maxDimension * 0.2,  // ความสูงแบบเดินใกล้พื้น
        maxDimension * 0.4   // ระยะใกล้มากๆ แบบเดินติดอาคาร
      )
      camera.lookAt(model.position)
      
      // อัพเดท controls
      if (controls) {
        controls.target.copy(model.position)
        controls.update()
      }
      
      isLoading.value = false
      console.log('Model setup completed')
    },
    (progress) => {
      console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%')
    },
    (error) => {
      console.error('Error loading model:', error)
      isLoading.value = false
      
      // ถ้าโหลดไม่ได้ ให้สร้างโมเดลทดแทน
      createFallbackModel()
    }
  )
}

function createFallbackModel() {
  console.log('Creating fallback model...')
  
  // สร้างโมเดลง่ายๆ เป็น fallback
  const geometry = new THREE.BoxGeometry(10, 5, 10)
  const material = new THREE.MeshLambertMaterial({ color: 0x8A9BA8 })
  const cube = new THREE.Mesh(geometry, material)
  cube.position.y = 2.5
  cube.castShadow = true
  scene.add(cube)
  
  // เพิ่มพื้น
  const groundGeometry = new THREE.PlaneGeometry(50, 50)
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
  
  console.log('Fallback model created')
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
  background: rgba(33, 150, 243, 0.9);
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