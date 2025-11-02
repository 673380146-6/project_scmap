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
          placeholder="ค้นหา..."
        />
      </div>
      <ul class="menu-list">
        <li
          class="menu-item has-sub"
          v-show="matchesSearch('ตึกคณะ')"
          @click.stop="handleBuildingClick"
        >
          <span class="icon">🏛</span>
          <span class="label">ตึกคณะ</span>
        </li>
        <div
          class="submenu"
          :class="{ open: submenuOpen }"
        >
          <div class="sub-item" @click="showCanvas('SC01')">SC01</div>
          <div class="sub-item" @click="showCanvas('SC08')">SC08</div>
          <div class="sub-item" @click="showCanvas('SC09')">SC09</div>
        </div>
        <li
          class="menu-item"
          v-show="matchesSearch('ที่จอดรถยนต์')"
          @click="showCanvas('ที่จอดรถยนต์')"
        >
          <span class="icon">🚗</span>
          <span class="label">ที่จอดรถยนต์</span>
        </li>
        <li
          class="menu-item"
          v-show="matchesSearch('ที่จอดรถมอไซค์')"
          @click="showCanvas('ที่จอดรถมอไซค์')"
        >
          <span class="icon">🛵</span>
          <span class="label">ที่จอดรถมอไซค์</span>
        </li>
        
      </ul>
    </aside>

    <main class="main">
      <div class="top-bar">
        <div class="welcome-section">
          <div class="title">Science Map</div>
          <div class="user-welcome" v-if="displayName">
            <span>สวัสดีคุณ {{ displayName }}</span>
          </div>
        </div>
        <div class="settings" :class="{ active: settingsOpen }" @click.stop="toggleSettingsMenu">
          <div class="profile-preview">
            <img v-if="user.profilePic" :src="user.profilePic" alt="profile" class="profile-mini" />
            <span v-else class="icon-setting">👱🏻‍♂️</span>
          </div>
          <div class="settings-menu" @click.stop="preventClose">
            <div class="profile-info">
              <div class="name">{{ user.fullName || 'ชื่อ นามสกุล' }}</div>
              <div class="faculty-major">{{ user.facultyMajor || 'คณะของคุณ | สาขาของคุณ' }}</div>
              <div class="student-id" v-if="studentId">
                รหัส: {{ studentId }}
              </div>
            </div>

            <a href="index.html" class="logout" @click.prevent="logoutUser">ออกจากระบบ</a>
          </div>
        </div>
      </div>

      <div class="canvas-area">
        <component :is="currentCanvasComponent" ref="currentCanvasRef" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import apiService from '@/services/api.js'
import ModelViewer from '@/components/ModelViewer.vue'
import CanvasSC01 from '@/components/CanvasSC01.vue'
import CanvasSC09 from '@/components/CanvasSC09.vue'

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
const storage = getStorage(app)

// reactive state
const searchQuery = ref('')
const submenuOpen = ref(false)
const settingsOpen = ref(false)
const user = ref({ fullName: '', facultyMajor: 'กำลังโหลดข้อมูล...', profilePic: '' })
const currentCanvas = ref('modelViewer')  // default component name
const defaultProfilePic = 'default-profile.png'
const studentId = ref('')
const isLoadingUserData = ref(true)
const currentCanvasRef = ref(null) // ref สำหรับ component ปัจจุบัน

// components registry
const components = {
  ModelViewer,
  CanvasSC01,
  CanvasSC09
}

// computed properties
const currentCanvasComponent = computed(() => {
  const componentName = canvasComponents[currentCanvas.value] || 'ModelViewer'
  return components[componentName] || ModelViewer
})

const displayName = computed(() => {
  return user.value.fullName || 'ผู้ใช้'
})

// mapping name to component names — ต้องมี component จริงในโปรเจกต์ของคุณ
const canvasComponents = {
  modelViewer: 'ModelViewer',      // default 3D model component
  SC01: 'CanvasSC01',
  SC08: 'CanvasSC08',
  SC09: 'CanvasSC09',
  'ที่จอดรถยนต์': 'CanvasCarParking',
  'ที่จอดรถมอไซค์': 'ModelViewer' // ใช้ ModelViewer และจะ toggle โซนจอดรถ
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
    
    // ถ้าเป็นการเลือก "ที่จอดรถมอไซค์" ให้เรียก toggle function
    if (name === 'ที่จอดรถมอไซค์') {
      // รอให้ component โหลดเสร็จก่อนเรียก function
      setTimeout(() => {
        if (currentCanvasRef.value && currentCanvasRef.value.toggleMotorcycleParkingZones) {
          currentCanvasRef.value.toggleMotorcycleParkingZones()
          console.log('Toggled motorcycle parking zones from sidebar menu')
        }
      }, 100)
    }
  } else {
    currentCanvas.value = 'modelViewer'
  }
}

function handleBuildingClick() {
  // ถ้า submenu ปิดอยู่ ให้เปิด submenu
  if (!submenuOpen.value) {
    toggleSubmenu()
  } else {
    // ถ้า submenu เปิดอยู่แล้ว ให้กลับไปหน้าแมพหลัก
    submenuOpen.value = false
    showCanvas('modelViewer')
    console.log('กลับไปหน้าแมพหลัก')
  }
}

function toggleSettingsMenu() {
  settingsOpen.value = !settingsOpen.value
}

// ปิดเมนูเมื่อคลิกข้างนอก
function closeSettingsMenu() {
  settingsOpen.value = false
}

// ป้องกันการปิดเมนูเมื่อคลิกภายในเมนู
function preventClose(event) {
  event.stopPropagation()
}

async function logoutUser() {
  try {
    await apiService.logout()
  } catch (error) {
    console.log('Logout API error:', error)
  } finally {
    // ล้าง localStorage และเปลี่ยนหน้า
    localStorage.clear()
    window.location.href = '/'
  }
}





onMounted(async () => {
  // เพิ่ม event listener สำหรับปิดเมนู
  document.addEventListener('click', closeSettingsMenu)
  
  // โหลดข้อมูลผู้ใช้จาก localStorage
  const userId = localStorage.getItem('userId')
  const userName = localStorage.getItem('userName')
  const studentIdValue = localStorage.getItem('studentId')
  const facultyValue = localStorage.getItem('faculty')
  const majorValue = localStorage.getItem('major')
  
  studentId.value = studentIdValue || ''
  
  if (userId && userName) {
    // ถ้ามีการล็อกอิน ใช้ข้อมูลจาก localStorage เป็นหลัก
    const facultyText = facultyValue || 'ไม่ระบุคณะ'
    const majorText = majorValue || 'ไม่ระบุสาขา'
    
    user.value = {
      fullName: userName,
      facultyMajor: `${facultyText} | ${majorText}`,
      profilePic: ''
    }
    
    isLoadingUserData.value = false
    console.log('Using localStorage data:', user.value)
    
    // ลองดึงข้อมูลจาก API เป็นตัวสำรอง (ถ้าต้องการ)
    try {
      const userResponse = await apiService.getUserById(userId)
      if (userResponse && userResponse.success && userResponse.data) {
        const userData = userResponse.data
        console.log('API data available, updating if needed')
        
        // อัพเดทข้อมูลถ้า API มีข้อมูลที่ใหม่กว่า
        if (userData.faculty && userData.major) {
          user.value.facultyMajor = `${userData.faculty} | ${userData.major}`
          console.log('Updated from API:', user.value)
        }
      }
    } catch (error) {
      console.log('API fallback failed, using localStorage data:', error.message)
    }
    
  } else {
    // ถ้าไม่ได้ล็อกอิน ใช้ข้อมูลเริ่มต้น
    user.value = {
      fullName: 'ผู้ใช้ระบบ',
      facultyMajor: 'กรุณาล็อกอินเพื่อดูข้อมูล',
      profilePic: ''
    }
    isLoadingUserData.value = false
  }
})
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
  display:flex; align-items:center; gap:10px;
  background: var(--panel-3); border:1px solid #ccc;
  padding:8px 10px; border-radius:999px;
  margin:6px 8px 18px;
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

.submenu {
  display: none;
  flex-direction: column; gap:6px;
  margin-left:46px; margin-top:6px; margin-bottom:4px;
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
</style>
