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
import { ref, onMounted, onUnmounted, watch, watchEffect } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// นำเข้า Three.js utilities
import { createSquareBlock, createParkingArea } from '../utils/three/index.js'

// Props สำหรับรับข้อมูล marker
const props = defineProps({
  showMarker: {
    type: Boolean,
    default: false
  },
  markerPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0, z: 0 })
  },
  selectedRoom: {
    type: Object,
    default: null
  }
})

const viewerContainer = ref(null)
const isLoading = ref(true)
const showMotorcycleParkingZones = ref(false) // สำหรับเปิด/ปิดโซนจอดมอไซค์

let scene, camera, renderer, controls, animationId, markerGroup, markerMesh

// Watch สำหรับการเปลี่ยนแปลง props
watch(() => props.showMarker, (newVal) => {
  updateMarker()
})

watch(() => props.selectedRoom, (newRoom) => {
  if (newRoom) {
    console.log('Room selected for marker:', newRoom)
    console.log('Room position:', newRoom.position)
    updateMarker()
  }
}, { deep: true })

// Force update marker เมื่อมีการเปลี่ยนแปลงใน code
watch(() => props.showMarker, () => {
  if (props.showMarker && markerMesh) {
    setTimeout(() => updateMarker(), 100) // delay เล็กน้อยให้ marker พร้อม
  }
})

// ฟังก์ชันสำหรับปรับแต่งพิกัดตามโมเดลจริง
function adjustPositionForBuilding(room) {
  if (!room || !room.position) return { x: 0, y: 5, z: 0 }
  
  let adjustedPosition = { ...room.position }
  
  // ปรับแต่งพิกัดตามแต่ละตึก รวมทั้งความสูง
  switch (room.building) {
    case 'SC01':
      // ตึก SC01 อยู่ทางซ้ายของแผนที่ (ตึกกลมๆ)
      adjustedPosition.x = -8 + (adjustedPosition.x * 0.3)  // ขยับไปทางซ้ายมากขึ้น
      adjustedPosition.y = adjustedPosition.y - 0.2         // ความสูง marker
      adjustedPosition.z = 1 + (adjustedPosition.z * 0.3)   // ขึ้น 8 หน่วย (8-8 = 0)
      break
    case 'SC08':
      // ตึก SC08 คือตึกสูงๆ ข้างๆ SC01
      adjustedPosition.x = -5 + (adjustedPosition.x * 0.5)  // อยู่ข้างๆ SC01 
      adjustedPosition.y = adjustedPosition.y + 6.0         // ความสูง marker สำหรับตึกสูง
      adjustedPosition.z = 0 + (adjustedPosition.z * 0.5)   // ใกล้กับ SC01
      break
    case 'SC09':
      // ตึก SC09 อยู่ตรงกลางของแผนที่ (ตึกสีเทา)
      adjustedPosition.x = 6 + (adjustedPosition.x * 0.5)   // เลื่อนขวามากขึ้น
      adjustedPosition.y = adjustedPosition.y + 2.0         // ความสูง marker
      adjustedPosition.z = -2  // ตรงกลาง
      break
  }
  
  return adjustedPosition
}



function init3D() {
  const container = viewerContainer.value
  if (!container) return
  
  container.innerHTML = ''
  
  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff) // กลับมาใช้สีขาวสวย
  scene.fog = new THREE.Fog(0xffffff, 80, 300) // fog สีขาวและไกลขึ้น
  
  // Camera setup - ปรับตำแหน่งให้เหมาะกับโมเดล sc_all
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 100) // ลด far plane
  camera.position.set(5, 3, 6) // ซูมเข้าไปใกล้มากๆ แบบเดินติดอาคาร
  
  // Renderer setup - ปรับปรุงประสิทธิภาพสูงสุด
  renderer = new THREE.WebGLRenderer({ 
    antialias: window.devicePixelRatio <= 1, // ปิด antialias บนหน้าจอ high-DPI
    powerPreference: "high-performance",
    alpha: false,
    stencil: false,
    depth: true,
    logarithmicDepthBuffer: false,
    precision: "mediump" // ใช้ precision ต่ำกว่าเพื่อประสิทธิภาพ
  })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // ลด pixel ratio เพิ่มเติม
  
  // ปรับปรุง shadow settings
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap // กลับมาใช้ soft shadow ที่สวย
  renderer.shadowMap.autoUpdate = true // เปิด auto update shadow
  
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping // กลับมาใช้ tone mapping ที่สวย
  renderer.toneMappingExposure = 1.0
  
  // เพิ่มการจำกัด rendering
  renderer.info.autoReset = false
  container.appendChild(renderer.domElement)
  
  // Lighting - คืนความสวยงาม
  const ambientLight = new THREE.AmbientLight(0x808080, 0.6) // ลดแสง ambient เพื่อให้เงาชัดขึ้น
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2) // เพิ่มความเข้มกลับมา
  directionalLight.position.set(100, 100, 50)
  directionalLight.castShadow = true
  
  // คืน shadow quality ที่สวย
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 0.1
  directionalLight.shadow.camera.far = 200
  directionalLight.shadow.camera.left = -50
  directionalLight.shadow.camera.right = 50
  directionalLight.shadow.camera.top = 50
  directionalLight.shadow.camera.bottom = -50
  directionalLight.shadow.bias = -0.0001
  scene.add(directionalLight)
  
  // Controls - ปรับปรุงเพื่อความเรียบ
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08 // เพิ่มเป็น 0.08 เพื่อความเรียบมากขึ้น
  controls.enableZoom = true
  controls.enablePan = false // ปิดการขยับแผนที่
  
  // จำกัดการหมุนในแนวดิ่ง (Polar Angle) - ไม่ให้เห็นใต้แมพ
  controls.minPolarAngle = 0.1 // มองขึ้นได้เล็กน้อย
  controls.maxPolarAngle = Math.PI / 2.2 // ไม่ให้มองจากด้านล่างแมพ
  
  // ไม่จำกัดการหมุนรอบแกน Y (Azimuth) - หมุนได้ 360 องศา
  // controls.minAzimuthAngle และ controls.maxAzimuthAngle ไม่ต้องตั้งค่า
  
  controls.minDistance = 0.5 // ซูมเข้าได้ใกล้มากๆ แบบเดินติดอาคาร
  controls.maxDistance = 30 // ซูมออกได้เพื่อดูภาพรวม
  controls.zoomSpeed = 0.8 // ลดความเร็วซูมเพื่อความเรียบ
  
  // เพิ่ม smooth controls
  controls.rotateSpeed = 0.5 // ลดความเร็วการหมุน
  controls.autoRotate = false
  controls.screenSpacePanning = false
  
  // Load the real 3D model
  loadMainMapModel()
  
  // สร้าง marker สำหรับแสดงห้อง
  createMarker()
  
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
      
      // Log ข้อมูลขนาดโมเดลเพื่อช่วยปรับตำแหน่งโซนจอดรถ
      console.log('Model bounding box:', {
        min: { x: box.min.x, y: box.min.y, z: box.min.z },
        max: { x: box.max.x, y: box.max.y, z: box.max.z },
        size: { x: box.max.x - box.min.x, y: box.max.y - box.min.y, z: box.max.z - box.min.z },
        center: { x: center.x, y: center.y, z: center.z }
      })
      
      // ปรับขนาดให้เหมาะสม
      const maxSize = 50 // ขนาดสูงสุดที่ต้องการ
      if (size > maxSize) {
        const scale = maxSize / size
        model.scale.multiplyScalar(scale)
      }
      
      // จัดให้อยู่กึ่งกลาง
      model.position.sub(center.multiplyScalar(model.scale.x))
      
      // เพิ่ม shadow และปรับปรุง material เพื่อประสิทธิภาพ
      model.traverse((child) => {
        if (child.isMesh) {
          // ปิด shadow สำหรับ object เล็กๆ เพื่อประสิทธิภาพ
          child.castShadow = child.geometry.boundingBox && 
                            child.geometry.boundingBox.getSize(new THREE.Vector3()).length() > 2
          child.receiveShadow = true
          
          // ปรับปรุง material เพื่อประสิทธิภาพ
          if (child.material) {
            // ลด reflection และ metalness เพื่อประสิทธิภาพ
            if (child.material.isMeshStandardMaterial) {
              child.material.roughness = Math.max(child.material.roughness, 0.8)
              child.material.metalness = Math.min(child.material.metalness, 0.2)
            }
            
            // ปิด features ที่ไม่จำเป็น
            child.material.transparent = false
            child.material.alphaTest = 0
            
            // ใช้ flat shading สำหรับ object ง่ายๆ
            if (child.geometry.attributes.position.count < 1000) {
              child.material.flatShading = true
            }
            
            child.material.needsUpdate = true
          }
          
          // LOD - ลด geometry detail สำหรับ object ไกล
          if (child.geometry && child.geometry.attributes.position.count > 5000) {
            child.frustumCulled = true // เพิ่ม frustum culling
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

function createMarker() {
  // สร้าง marker group
  markerGroup = new THREE.Group()
  
  // สร้างหมุดแบบ Google Maps Style
  const pinGeometry = new THREE.SphereGeometry(0.8, 16, 16)
  const pinMaterial = new THREE.MeshLambertMaterial({ 
    color: 0xff3333,
    emissive: 0x331100
  })
  const pinHead = new THREE.Mesh(pinGeometry, pinMaterial)
  pinHead.position.y = 2.5
  pinHead.castShadow = true
  
  // สร้างก้านหมุด
  const stemGeometry = new THREE.ConeGeometry(0.15, 1.5, 8)
  const stemMaterial = new THREE.MeshLambertMaterial({ 
    color: 0xff3333,
    emissive: 0x220000
  })
  const stem = new THREE.Mesh(stemGeometry, stemMaterial)
  stem.position.y = 1.2
  stem.castShadow = true
  
  // สร้างจุดเล็กๆ บนหัวหมุด
  const dotGeometry = new THREE.SphereGeometry(0.3, 8, 8)
  const dotMaterial = new THREE.MeshLambertMaterial({ 
    color: 0xffffff,
    emissive: 0x111111
  })
  const dot = new THREE.Mesh(dotGeometry, dotMaterial)
  dot.position.y = 2.5
  
  // สร้างเงารอบฐาน
  const shadowGeometry = new THREE.CircleGeometry(1.2, 16)
  const shadowMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x000000,
    transparent: true,
    opacity: 0.3
  })
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial)
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.01
  
  // รวม marker ทั้งหมด
  markerGroup.add(pinHead)
  markerGroup.add(stem)
  markerGroup.add(dot)
  markerGroup.add(shadow)
  
  // ซ่อน marker ในตอนแรก
  markerGroup.visible = false
  scene.add(markerGroup)
  
  markerMesh = markerGroup
}

function updateMarker() {
  if (!markerMesh) return
  
  if (props.showMarker && props.selectedRoom) {
    // แสดง marker
    markerMesh.visible = true
    
    // ใช้ฟังก์ชันปรับแต่งพิกัดให้ตรงกับโมเดล (รวมความสูงแล้ว)
    let position = adjustPositionForBuilding(props.selectedRoom)
    
    markerMesh.position.set(position.x, position.y, position.z)
  } else {
    markerMesh.visible = false
  }
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

// ฟังก์ชันสำหรับเปิด/ปิดโซนจอดรถมอเตอร์ไซค์
function toggleMotorcycleParkingZones() {
  showMotorcycleParkingZones.value = !showMotorcycleParkingZones.value
  
  if (showMotorcycleParkingZones.value) {
    createMotorcycleParkingZones()
  } else {
    removeMotorcycleParkingZones()
  }
}

// ฟังก์ชันสำหรับสร้างโซนจอดรถมอเตอร์ไซค์
function createMotorcycleParkingZones() {
  console.log('Creating motorcycle parking zones...')
  
  // กำหนดโซนจอดรถมอเตอร์ไซค์ในตำแหน่งที่เหมาะสม (ปรับตามขนาดโมเดลจริง)
  const motorcycleParkingAreas = [
    {
      name: 'Motorcycle Zone 1 - หน้าตึก SC01',
      corners: [
        new THREE.Vector3(-15, 0, 10),
        new THREE.Vector3(-10, 0, 10),
        new THREE.Vector3(-10, 0, 15),
        new THREE.Vector3(-15, 0, 15)
      ],
      color: 0xff6b35, // สีส้ม
      opacity: 0.6
    },
    {
      name: 'Motorcycle Zone 2 - หน้าตึก SC08', 
      corners: [
        new THREE.Vector3(8, 0, 5),
        new THREE.Vector3(13, 0, 5),
        new THREE.Vector3(13, 0, 10),
        new THREE.Vector3(8, 0, 10)
      ],
      color: 0xff6b35, // สีส้ม
      opacity: 0.6
    },
    {
      name: 'Motorcycle Zone 3 - หน้าตึก SC09',
      corners: [
        new THREE.Vector3(-5, 0, -20),
        new THREE.Vector3(5, 0, -20),
        new THREE.Vector3(5, 0, -15),
        new THREE.Vector3(-5, 0, -15)
      ],
      color: 0xff6b35, // สีส้ม
      opacity: 0.6
    },
    {
      name: 'Motorcycle Zone 4 - ลานกลาง',
      corners: [
        new THREE.Vector3(-4, 0, -2),
        new THREE.Vector3(4, 0, -2),
        new THREE.Vector3(4, 0, 3),
        new THREE.Vector3(-4, 0, 3)
      ],
      color: 0xff6b35, // สีส้ม
      opacity: 0.6
    },
    {
      name: 'Motorcycle Zone 5 - ด้านข้างอาคาร A',
      corners: [
        new THREE.Vector3(-18, 0, -5),
        new THREE.Vector3(-13, 0, -5),
        new THREE.Vector3(-13, 0, 0),
        new THREE.Vector3(-18, 0, 0)
      ],
      color: 0xff6b35, // สีส้ม
      opacity: 0.6
    },
    {
      name: 'Motorcycle Zone 6 - ด้านข้างอาคาร B',
      corners: [
        new THREE.Vector3(10, 0, -8),
        new THREE.Vector3(15, 0, -8),
        new THREE.Vector3(15, 0, -3),
        new THREE.Vector3(10, 0, -3)
      ],
      color: 0xff6b35, // สีส้ม
      opacity: 0.6
    }
  ]
  
  // สร้างโซนจоดรถมอเตอร์ไซค์โดยใช้ createParkingArea utility
  motorcycleParkingAreas.forEach((areaConfig, index) => {
    const parkingZone = createParkingArea(areaConfig.corners, {
      groundY: 0.05, // ยกขึ้นเล็กน้อยเพื่อไม่ให้ซ้อนกับพื้น
      height: 0.15, // ลดความสูงให้ดูเป็นธรรมชาติ
      color: areaConfig.color,
      opacity: areaConfig.opacity
    })
    
    // เพิ่ม metadata สำหรับการจัดการ
    parkingZone.userData = {
      isMotorcycleParkingZone: true,
      zoneName: areaConfig.name,
      zoneIndex: index
    }
    
    scene.add(parkingZone)
    console.log(`Created motorcycle parking zone: ${areaConfig.name}`)
  })
  
  console.log('All motorcycle parking zones created!')
}

// ฟังก์ชันสำหรับลบโซนจอดรถมอเตอร์ไซค์
function removeMotorcycleParkingZones() {
  console.log('Removing motorcycle parking zones...')
  
  // หาและลบโซนจอดรถมอเตอร์ไซค์ทั้งหมด
  const motorcycleParkingZones = scene.children.filter(child => 
    child.userData && child.userData.isMotorcycleParkingZone
  )
  
  motorcycleParkingZones.forEach(zone => {
    scene.remove(zone)
    console.log(`Removed motorcycle parking zone: ${zone.userData.zoneName}`)
  })
  
  console.log('All motorcycle parking zones removed!')
}

let frameCount = 0
let lastTime = performance.now()
let fps = 60

function animate() {
  animationId = requestAnimationFrame(animate)
  
  // เอา FPS monitoring ออก - เก็บแค่ adaptive quality พื้นฐาน
  frameCount++
  const currentTime = performance.now()
  if (currentTime - lastTime >= 2000) { // เช็คทุก 2 วินาที
    fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
    frameCount = 0
    lastTime = currentTime
    
    // Adaptive quality แบบเบา ๆ
    if (fps < 25 && renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2)) // ลด quality เล็กน้อย
    }
  }
  
  if (controls) {
    controls.update()
  }
  
  // อัพเดท marker animation
  updateMarker()
  
  if (renderer && scene && camera) {
    // Render ปกติ - เอา frame skipping ออก
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
  
  // Cleanup Three.js resources เพื่อป้องกัน memory leak
  if (scene) {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) {
          child.geometry.dispose()
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose())
          } else {
            child.material.dispose()
          }
        }
      }
    })
    scene.clear()
  }
  
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer.domElement = null
  }
  
  if (controls) {
    controls.dispose()
  }
  
  // Force garbage collection
  scene = null
  camera = null
  renderer = null
  controls = null
}

onMounted(() => {
  setTimeout(() => {
    init3D()
  }, 100)
})



onUnmounted(() => {
  cleanup()
})

// Export ฟังก์ชันให้ parent component เรียกใช้ได้
defineExpose({
  toggleMotorcycleParkingZones
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