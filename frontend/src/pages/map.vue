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
          @click.stop="toggleSubmenu"
        >
          <span class="icon">🏛</span>
          <span class="label">ตึกคณะ</span>
        </li>
        <div
          class="submenu"
          :class="{ open: submenuOpen }"
        >
          <div class="sub-item" @click="showCanvas('SC01')">SC01</div>
          <div class="sub-item" @click="showCanvas('SC02')">SC02</div>
          <div class="sub-item" @click="showCanvas('SC03')">SC03</div>
        </div>
        <li
          class="menu-item"
          v-show="matchesSearch('ศูนย์อาหาร')"
          @click="showCanvas('ศูนย์อาหาร')"
        >
          <span class="icon">🍜</span>
          <span class="label">ศูนย์อาหาร</span>
        </li>
        <li
          class="menu-item"
          v-show="matchesSearch('ตู้ & เต่าบิน')"
          @click="showCanvas('ตู้ & เต่าบิน')"
        >
          <span class="icon">⚙️</span>
          <span class="label">ตู้อาหาร & เต่าบิน</span>
        </li>
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
        <div class="title">{{ userDisplayName }}</div>
        <div class="settings" :class="{ active: settingsOpen }" @click.stop="toggleSettingsMenu">
          <svg viewBox="0 0 24 24">
            <path
              d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm7.43-3.5c0-.36-.03-.72-.08-1.07l2.11-1.65a.5.5 0 0 0 .12-.65l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.16 7.16 0 0 0-1.84-1.07L14.5 2.5a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5l-.24 2.88a7.16 7.16 0 0 0-1.84 1.07l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.65l2.11 1.65c-.05.35-.08.71-.08 1.07s.03.72.08 1.07l-2.11 1.65a.5.5 0 0 0-.12.65l2 3.46a.5.5 0 0 0 .61.22l2.49-1a7.16 7.16 0 0 0 1.84 1.07L9.5 21.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5l.24-2.88a7.16 7.16 0 0 0 1.84-1.07l2.49 1a.5.5 0 0 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.65l-2.11-1.65c.05-.35.08-.71.08-1.07z"
            />
          </svg>
          <div class="settings-menu">
            <div class="profile-info">
              <img :src="user.profilePic || defaultProfilePic" alt="profile" />
              <div class="name">{{ user.fullName || 'ชื่อ นามสกุล' }}</div>
              <div class="faculty-major">{{ user.facultyMajor || 'คณะของคุณ | สาขาของคุณ' }}</div>
            </div>
            <div style="padding:10px; border-bottom:1px solid #ddd;">
              <input type="file" accept="image/*" @change="uploadProfilePic" style="margin-bottom:8px;" />
              <button @click="editProfile" style="width:100%; padding:8px; border:none; border-radius:8px; background:#f1f4f9; cursor:pointer; font-weight:600;">
                ✏️ แก้ไขข้อมูล
              </button>
            </div>
            <a href="index.html" class="logout" @click.prevent="logoutUser">ออกจากระบบ</a>
          </div>
        </div>
      </div>

      <div class="canvas-area">
        <component :is="currentCanvasComponent" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

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
const user = ref({ fullName: '', facultyMajor: '', profilePic: '' })
const currentCanvas = ref('modelViewer')  // default component name
const defaultProfilePic = 'default-profile.png'

// mapping name to component names — ต้องมี component จริงในโปรเจกต์ของคุณ
const canvasComponents = {
  modelViewer: 'ModelViewer',      // default 3D model component
  SC01: 'CanvasSC01',
  SC02: 'CanvasSC02',
  SC03: 'CanvasSC03',
  'ศูนย์อาหาร': 'CanvasFoodCenter',
  'ตู้ & เต่าบิน': 'CanvasVendingTurtle',
  'ที่จอดรถยนต์': 'CanvasCarParking',
  'ที่จอดรถมอไซค์': 'CanvasMotorcycleParking'
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
  } else {
    currentCanvas.value = 'modelViewer'
  }
}

function toggleSettingsMenu() {
  settingsOpen.value = !settingsOpen.value
}

function logoutUser() {
  localStorage.clear()
  window.location.href = 'index.html'
}

async function uploadProfilePic(event) {
  const file = event.target.files[0]
  if (!file) return
  const userId = localStorage.getItem('userId') || 'currentUser'
  const sRef = storageRef(storage, `profiles/${userId}-${file.name}`)
  await uploadBytes(sRef, file)
  const url = await getDownloadURL(sRef)
  user.value.profilePic = url
  await setDoc(doc(db, 'users', userId), { profilePic: url }, { merge: true })
}

async function editProfile() {
  const newName = prompt('กรอกชื่อ-นามสกุลใหม่:', user.value.fullName)
  const newFaculty = prompt('กรอกคณะ | สาขาใหม่:', user.value.facultyMajor)
  if (newName && newFaculty) {
    user.value.fullName = newName
    user.value.facultyMajor = newFaculty
    const userId = localStorage.getItem('userId') || 'currentUser'
    await setDoc(doc(db, 'users', userId), {
      fullName: newName,
      facultyMajor: newFaculty
    }, { merge: true })
  }
}

onMounted(async () => {
  const userId = localStorage.getItem('userId') || 'currentUser'
  const docSnap = await getDoc(doc(db, 'users', userId))
  if (docSnap.exists()) {
    const data = docSnap.data()
    user.value = {
      fullName: data.fullName || '',
      facultyMajor: data.facultyMajor || '',
      profilePic: data.profilePic || ''
    }
  }
})
</script>

<style scoped>
:root {
  --bg: #f6f8fb;
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
html,body{ height:100%; margin:0; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, "Noto Sans Thai", "Prompt", sans-serif; color: var(--text); background: var(--bg); }
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
  justify-content: space-between; /* ดัน title ไปซ้าย, settings ไปขวา */
  align-items: center;
  padding: 10px 20px;
  position: relative;
  background: #fff;
  z-index: 10;
}

.title {
  font-weight: 800;
  font-size: 20px;
  color: var(--text);
}

.settings {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  width: 40px;
  height: 40px;
  z-index: 200;   /* ให้ปุ่มอยู่เหนือเมนู */
}

.settings:hover {
  background: var(--hover);   /* hover จะเห็นว่าเป็นปุ่มจริง ๆ */
}

.settings svg {
  width: 24px;
  height: 24px;
  fill: var(--text);
}

.settings-menu {
  display: none;
  position: absolute;
  top: 120%;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: var(--shadow);
  min-width: 240px;
  z-index: 100;  /* เมนูอยู่ล่างกว่าปุ่ม */
}

.settings.active .settings-menu {
  display: block;
}

.settings-menu .profile-info {
  padding:12px; text-align:center; border-bottom:1px solid #ddd;
}
.settings-menu .profile-info img {
  width:70px; height:70px; border-radius:50%;
  object-fit: cover; margin-bottom:8px;
}
.settings-menu .profile-info .name {
  font-weight:700; font-size:16px; color:#000;
}
.settings-menu .profile-info .faculty-major {
  color:#555; font-size:13px;
}
.settings-menu .logout {
  display:block; text-align:center;
  padding:10px; background: var(--accent);
  color:#fff; text-decoration:none; font-weight:700;
}
.settings-menu .logout:hover {
  background:#0f6fde;
}

.canvas-area {
  flex:1; border-radius:12px; border:1px dashed #ccc;
  display:flex; align-items:center; justify-content:center;
  color: #666; overflow:hidden; background: #fff;
}
</style>
