<template>
  <div class="container">
    <aside class="sidebar" @mouseleave="closeSubmenu" @mouseenter="openSidebar">
      <div class="brand">
        <div class="logo">S</div>
        <div class="label">SCIENCE MAP</div>
      </div>
      <div class="search-box">
        <div class="icon">🔎</div>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="ค้นหาห้อง (เช่น CP9127)"
          @keyup.enter="searchRoom"
          @input="onSearchInput"
        />
        <button class="search-btn" @click="searchRoom" v-if="searchQuery.trim()">
          <span>🎯</span>
        </button>
      </div>
      
      <!-- Search Results -->
      <div class="search-results" v-if="searchResults.length > 0">
        <div class="results-title">ผลการค้นหา:</div>
        <div 
          class="result-item" 
          v-for="result in searchResults" 
          :key="result.room"
          @click="goToRoom(result)"
        >
          <div class="room-number">{{ result.room }}</div>
          <div class="room-info">
            <div class="building">{{ result.building }}</div>
            <div class="floor">ชั้น {{ result.floor }}</div>
          </div>
        </div>
      </div>
      <ul class="menu-list">
        <li
          class="menu-item has-sub"
          v-show="matchesSearch('ตึกคณะ')"
        >
          <div @click.stop="handleBuildingClick">
            <span class="icon">🏛</span>
            <span class="label">ตึกคณะ</span>
          </div>
          <div
            class="submenu"
            :class="{ open: submenuOpen }"
          >
            <div class="sub-item" @click="showCanvas('SC01')">SC01</div>
            <div class="sub-item" @click="showCanvas('SC08')">SC08</div>
            <div class="sub-item" @click="showCanvas('SC09')">SC09</div>
          </div>
        </li>
        <!-- ที่จอดรถ ถูกลบออกตามคำขอ -->
        
      </ul>
    </aside>

    <main class="main">
      <div class="top-bar">
        <div class="welcome-section">
          <div class="title">Science Map</div>
        </div>
        
        <div class="home-button" @click="goToHome" style="display: flex !important;">
          <span class="home-icon">🏠</span>
          <span class="home-text">หน้าแรก</span>
        </div>
      </div>

      <div class="canvas-area">
        <component 
          :is="currentCanvasComponent" 
          ref="currentCanvasRef"
          :showMarker="showMarker"
          :selectedRoom="selectedRoom"
        />
        

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ModelViewer from '@/components/ModelViewer.vue'
import CanvasSC01 from '@/components/CanvasSC01.vue'
import CanvasSC08 from '@/components/CanvasSC08.vue'
import CanvasSC09 from '@/components/CanvasSC09.vue'

// router
const router = useRouter()

// reactive state
const searchQuery = ref('')
const submenuOpen = ref(false)
const currentCanvas = ref('modelViewer')  // default component name
const currentCanvasRef = ref(null) // ref สำหรับ component ปัจจุบัน
const searchResults = ref([])
const showMarker = ref(false)
const markerPosition = ref({ x: 0, y: 0, z: 0 })
const selectedRoom = ref(null)

// components registry
const components = {
  ModelViewer,
  CanvasSC01,
  CanvasSC08,
  CanvasSC09
}

// computed properties
const currentCanvasComponent = computed(() => {
  const componentName = canvasComponents[currentCanvas.value] || 'ModelViewer'
  return components[componentName] || ModelViewer
})



// mapping name to component names — ต้องมี component จริงในโปรเจกต์ของคุณ
const canvasComponents = {
  modelViewer: 'ModelViewer',      // default 3D model component
  SC01: 'CanvasSC01',
  SC08: 'CanvasSC08',
  SC09: 'CanvasSC09'
}

// ฐานข้อมูลห้อง
const roomDatabase = {
  // ตึก SC01
  'SC0101': { building: 'SC01', floor: 1, room: 'SC0101', description: 'ห้องเรียน', position: { x: -10, y: 2, z: 5 } },
  'SC0102': { building: 'SC01', floor: 1, room: 'SC0102', description: 'ห้องปฏิบัติการ', position: { x: -8, y: 2, z: 5 } },
  'SC0201': { building: 'SC01', floor: 2, room: 'SC0201', description: 'ห้องเรียน', position: { x: -10, y: 6, z: 5 } },
  
  // ตึก SC08
  'SC0801': { building: 'SC08', floor: 1, room: 'SC0801', description: 'ห้องเรียน', position: { x: 0, y: 2, z: 0 } },
  'SC0802': { building: 'SC08', floor: 1, room: 'SC0802', description: 'ห้องปฏิบัติการ', position: { x: 2, y: 2, z: 0 } },
  'SC0803': { building: 'SC08', floor: 1, room: 'SC0803', description: 'ห้องสำนักงาน', position: { x: 4, y: 2, z: 0 } },
  
  // ตึก SC09 (CP = Computer Programming)
  'CP9101': { building: 'SC09', floor: 1, room: 'CP9101', description: 'ห้องเรียนคอมพิวเตอร์', position: { x: 10, y: 2, z: -5 } },
  'CP9102': { building: 'SC09', floor: 1, room: 'CP9102', description: 'ห้องปฏิบัติการคอมพิวเตอร์', position: { x: 12, y: 2, z: -5 } },
  'CP9127': { building: 'SC09', floor: 1, room: 'CP9127', description: 'ห้องปฏิบัติการโปรแกรมมิ่ง', position: { x: 15, y: 2, z: -3 } },
  'CP9201': { building: 'SC09', floor: 2, room: 'CP9201', description: 'ห้องวิจัย', position: { x: 10, y: 6, z: -5 } },
  'CP9301': { building: 'SC09', floor: 3, room: 'CP9301', description: 'ห้องสัมมนา', position: { x: 10, y: 10, z: -5 } },
}

function matchesSearch(name) {
  return name.toLowerCase().includes(searchQuery.value.toLowerCase())
}

function toggleSubmenu() {
  submenuOpen.value = !submenuOpen.value
}

function closeSubmenu() {
  submenuOpen.value = false
}

function openSidebar() {
  // optional: you could force expand sidebar on hover
}

function showCanvas(name) {
  if (canvasComponents[name]) {
    currentCanvas.value = name
    
    // (รถและฟังก์ชันที่เกี่ยวข้องถูกลบออก)
  } else {
    currentCanvas.value = 'modelViewer'
  }
}

function handleBuildingClick() {
  console.log('Building clicked! submenuOpen:', submenuOpen.value)
  // ถ้า submenu ปิดอยู่ ให้เปิด submenu
  if (!submenuOpen.value) {
    toggleSubmenu()
    console.log('Opening submenu, submenuOpen:', submenuOpen.value)
  } else {
    // ถ้า submenu เปิดอยู่แล้ว ให้กลับไปหน้าแมพหลัก
    submenuOpen.value = false
    showCanvas('modelViewer')
    console.log('กลับไปหน้าแมพหลัก')
  }
}

function goToHome() {
  router.push('/')
}



function onSearchInput() {
  if (searchQuery.value.trim().length >= 2) {
    searchRoom()
  } else {
    searchResults.value = []
    showMarker.value = false
  }
}

function searchRoom() {
  const query = searchQuery.value.trim().toUpperCase()
  if (!query) {
    searchResults.value = []
    return
  }
  
  // ค้นหาห้องที่ตรงกับคำค้นหา
  const results = []
  for (const [roomCode, roomData] of Object.entries(roomDatabase)) {
    if (roomCode.toUpperCase().includes(query) || 
        roomData.description.includes(query) ||
        roomData.building.includes(query)) {
      results.push(roomData)
    }
  }
  
  searchResults.value = results.slice(0, 5) // แสดงไม่เกิน 5 ผลลัพธ์
  
  // ถ้าพบผลลัพธ์เดียว ให้ไปที่ห้องนั้นเลย
  if (results.length === 1) {
    goToRoom(results[0])
  }
}

function goToRoom(room) {
  console.log('Going to room:', room)
  selectedRoom.value = room
  
  // กลับไปหน้าแผนที่หลักเพื่อแสดง marker
  currentCanvas.value = 'modelViewer'
  
  // แสดง marker ที่ตำแหน่งห้องบนแผนที่หลัก
  showMarker.value = true
  markerPosition.value = room.position || { x: 0, y: 5, z: 0 }
  
  // ปิดผลลัพธ์การค้นหา
  searchResults.value = []
  
  // ไม่แสดงข้อมูลห้อง แค่แสดง marker
}

function showRoomInfo(room) {
  // สร้าง popup สวยๆ แทน alert
  const notification = document.createElement('div')
  notification.className = 'room-notification'
  notification.innerHTML = `
    <div class="notification-content">
      <div class="room-header">
        <span class="room-code">${room.room}</span>
        <button class="close-notification" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="room-details">
        <div><strong>ตึก:</strong> ${room.building}</div>
        <div><strong>ชั้น:</strong> ${room.floor}</div>
        <div><strong>รายละเอียด:</strong> ${room.description}</div>
      </div>
    </div>
  `
  
  // เพิ่ม CSS สำหรับ notification
  notification.style.position = 'fixed'
  notification.style.top = '80px'
  notification.style.right = '20px'
  notification.style.zIndex = '10000'
  notification.style.background = 'white'
  notification.style.borderRadius = '12px'
  notification.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'
  notification.style.padding = '0'
  notification.style.minWidth = '300px'
  notification.style.animation = 'slideInRight 0.3s ease'
  
  document.body.appendChild(notification)
  
  // ลบ notification หลัง 5 วินาที
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.animation = 'slideOutRight 0.3s ease'
      setTimeout(() => notification.remove(), 300)
    }
  }, 5000)
}






</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Mitr:wght@300;400;600&display=swap');
.icon-setting {
  font-size: 30px;
}
:root {
  --bg: #f5f5f5;
  --panel: #ffffff;
  --panel-2: #f1f4f9;
  --panel-3: #e8edf5;
  --text: #2b2b2b;
  --muted: #6f7c91;
  --accent: #1f8fff;
  --hover: #dbe9ff;
  --item-hover: #e5f1ff;
  --radius:14px;
  --side-collapsed:80px;
  --side-expanded:260px;
  --gap:12px;
  --shadow:0 4px 20px rgba(0,0,0,.08);
}
*{ box-sizing: border-box; }
html,body{ height:100%; margin:0; font-family: 'Mitr', 'Noto Sans Thai', ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif; color: var(--text); background: var(--bg); }
.container { height:100vh; width:100vw; display:flex; gap:0; }

/* Sidebar */
.sidebar {
  width: var(--side-collapsed);
  background: var(--panel);
  border-right:1px solid #ddd;
  transition: width .25s ease;
  padding:14px 10px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow);
}
.sidebar:hover {
  width: var(--side-expanded);
}

.brand {
  display:flex; align-items:center; gap:10px;
  padding:8px 10px; margin-bottom:10px; user-select:none; white-space:nowrap;
}
.brand .logo {
  width:40px; height:40px; border-radius:8px; display:grid; place-items:center;
  background: linear-gradient(145deg,#1a57ff,#00b7ff);
  color:#fff; font-weight:900; font-size:20px;
  box-shadow: inset 0 0 12px #ffffff33;
}
.brand .label {
  display: none; font-weight:700; color: var(--text);
}
.sidebar:hover .brand .label {
  display: inline;
}

.search-box {
  display:flex; align-items:center; gap:8px;
  background: var(--panel-3); border:1px solid #ccc;
  padding:8px 10px; border-radius:999px;
  margin:6px 8px 18px;
  position: relative;
}
.search-box .icon {
  font-size:18px; color: var(--muted);
}
.search-box input {
  border:none; outline:none; background:transparent;
  color: var(--text);
  width:0; padding:0; opacity:0;
  transition: all .2s ease; font-size:14px;
}
.sidebar:hover .search-box input {
  width:100%; opacity:1;
}

.search-btn {
  background: var(--accent);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}
.search-btn:hover {
  background: #1976d2;
  transform: scale(1.1);
}

.search-results {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin: 0 8px 16px;
  max-height: 200px;
  overflow-y: auto;
}

.results-title {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  border-bottom: 1px solid #eee;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f5f5f5;
}
.result-item:hover {
  background: var(--hover);
}
.result-item:last-child {
  border-bottom: none;
}

.room-number {
  font-weight: 600;
  color: var(--accent);
  font-size: 14px;
  min-width: 60px;
}

.room-info {
  flex: 1;
}
.building {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
}
.floor {
  font-size: 11px;
  color: var(--muted);
}

.menu-list {
  list-style:none; margin:0; padding:0 6px;
}
.menu-item {
  display:flex; align-items:center; gap:12px;
  color: var(--muted);
  padding:12px 12px; margin:8px 0;
  border-radius: 0 22px 22px 0;
  cursor:pointer; position: relative; white-space:nowrap;
  font-size:16px;
}
.menu-item .icon {
  width:34px; height:34px; display:grid; place-items:center;
  background:#f0f4f9; border:1px solid #ccc; border-radius:9px; font-size:20px;
}
.menu-item .label {
  display: none;
}
.sidebar:hover .menu-item .label {
  display: inline;
}
.menu-item:hover {
  background: var(--item-hover); color: #000;
}
.menu-item:hover .icon {
  border-color: var(--accent);
}

.menu-item.has-sub {
  flex-direction: column;
  align-items: flex-start;
}

.menu-item.has-sub > div:first-child {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.submenu {
  display: none;
  flex-direction: column; 
  gap: 6px;
  width: 100%;
  margin-top: 8px;
  padding-left: 46px;
}

.submenu.open {
  display: flex;
}
.submenu .sub-item {
  padding:8px 10px; border-radius:8px;
  cursor:pointer; background: transparent;
  transition: background .2s ease;
}
.submenu .sub-item:hover {
  background: var(--hover);
}

.main {
  flex:1; min-width:0; padding:20px;
  display:flex; flex-direction:column; overflow:hidden;
}
.top-bar {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  position: relative;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  z-index: 10;
}

.welcome-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  font-weight: 800;
  font-size: 22px;
  color: var(--text);
  margin: 0;
}

.home-button {
  display: flex !important;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  background: #1f8fff !important; /* ใช้สีฟ้าโดยตรง */
  color: white !important;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 14px;
  user-select: none;
  box-shadow: 0 4px 12px rgba(31, 143, 255, 0.4);
  visibility: visible !important;
  opacity: 1 !important;
  position: relative;
  z-index: 1000;
  border: 2px solid #1976d2;
  min-width: 120px;
  justify-content: center;
}

.home-button:hover {
  background: #1976d2;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(31, 143, 255, 0.4);
}

.home-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(31, 143, 255, 0.3);
}

.home-icon {
  font-size: 16px;
}

.home-text {
  font-family: 'Mitr', 'Noto Sans Thai', sans-serif;
  white-space: nowrap;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .home-button {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .home-text {
    display: none; /* ซ่อนข้อความในมือถือ เหลือแค่ไอคอน */
  }
  
  .home-icon {
    font-size: 18px;
  }
}

.user-welcome {
  font-size: 14px;
  color: var(--muted);
  font-weight: 500;
}

.profile-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--panel-2);
  border: 2px solid #e5e7eb;
  transition: all 0.2s ease;
}

.profile-preview:hover {
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(31, 143, 255, 0.2);
}

.profile-mini {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.settings {
  position: relative;
  cursor: pointer;
  z-index: 200;
}

.settings-menu {
  display: none;
  position: absolute;
  top: 120%;
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
  min-width: 280px;
  z-index: 100;
  overflow: hidden;
}

.settings.active .settings-menu {
  display: block;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-menu .profile-info {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.settings-menu .profile-info img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.settings-menu .profile-info .name {
  font-weight: 700;
  font-size: 18px;
  color: #1f2937;
  margin-bottom: 4px;
}

.settings-menu .profile-info .faculty-major {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.settings-menu .profile-info .student-id {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
}

.settings-menu .logout {
  display: block;
  text-align: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #374151;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
  width: 100%;
  cursor: pointer;
}

.settings-menu .logout:hover {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  transform: translateY(-1px);
}



.canvas-area {
  flex:1; border-radius:12px; border:1px dashed #ccc;
  display:flex; align-items:center; justify-content:center;
  color: #666; overflow:hidden; background: #fff;
}

/* Room Notification Styles */
:global(.room-notification) {
  font-family: 'Mitr', 'Noto Sans Thai', sans-serif;
}

:global(.notification-content) {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

:global(.room-header) {
  background: linear-gradient(135deg, #1f8fff 0%, #1976d2 100%);
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:global(.room-code) {
  font-size: 18px;
  font-weight: 700;
}

:global(.close-notification) {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
}

:global(.close-notification:hover) {
  background: rgba(255,255,255,0.2);
}

:global(.room-details) {
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
}

:global(.room-details > div) {
  margin-bottom: 8px;
}

:global(.room-details > div:last-child) {
  margin-bottom: 0;
}

/* Animations */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}


</style>
