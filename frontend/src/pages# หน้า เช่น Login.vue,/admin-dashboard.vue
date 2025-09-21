<template>
  <div class="container">
    <!-- Sidebar -->
    <aside class="sidebar" @mouseenter="sidebarHover = true" @mouseleave="sidebarHover = false">
      <div class="brand">
        <div class="logo">S</div>
        <div class="label" v-if="sidebarHover">SCIENCE MAP</div>
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
        <li class="menu-item" @click="toggleSubmenu('building')" data-name="ตึกคณะ">
          <span class="icon">🏛</span>
          <span class="label" v-if="sidebarHover">ตึกคณะ</span>
        </li>
        <div class="submenu" v-if="submenu.building && sidebarHover">
          <div class="sub-item" @click="showCanvas('SC01')">SC01</div>
          <div class="sub-item" @click="showCanvas('SC02')">SC02</div>
          <div class="sub-item" @click="showCanvas('SC03')">SC03</div>
        </div>

        <li class="menu-item" v-for="item in filteredMenu" :key="item.name" @click="item.action">
          <span class="icon">{{ item.icon }}</span>
          <span class="label" v-if="sidebarHover">{{ item.name }}</span>
        </li>
      </ul>
    </aside>

    <!-- Main -->
    <main class="main">
      <div class="top-bar">
        <div class="title">{{ displayName || "SCIENCE MAP" }}</div>
        <div class="settings" :class="{ active: settingsOpen }" @click.stop="toggleSettingsMenu">
          <svg viewBox="0 0 24 24"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm7.43-3.5c0-.36-.03-.72-.08-1.07l2.11-1.65a.5.5 0 0 0 .12-.65l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.16 7.16 0 0 0-1.84-1.07L14.5 2.5a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5l-.24 2.88a7.16 7.16 0 0 0-1.84 1.07l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.65l2.11 1.65c-.05.35-.08.71-.08 1.07s.03.72.08 1.07l-2.11 1.65a.5.5 0 0 0-.12.65l2 3.46a.5.5 0 0 0 .61.22l2.49-1a7.16 7.16 0 0 0 1.84 1.07L9.5 21.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5l.24-2.88a7.16 7.16 0 0 0 1.84-1.07l2.49 1a.5.5 0 0 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.65l-2.11-1.65c.05-.35.08-.71.08-1.07z"/></svg>
          <div class="settings-menu">
            <div class="profile-info">
              <div class="name">{{ userName }}</div>
              <div class="faculty-major">{{ facultyMajor }}</div>
            </div>
            <a href="index.html" class="logout" @click.prevent="logoutUser">ออกจากระบบ</a>
          </div>
        </div>
      </div>

      <!-- Canvas -->
      <div v-if="view==='canvas'" class="canvas-area">
        <model-viewer
          src="../models/cp09model.glb"
          alt="3D model"
          auto-rotate
          camera-controls
          style="width: 100%; height: 100%;"
        ></model-viewer>
      </div>

      <!-- Admins Table -->
      <div v-if="view==='admins'" id="adminsTable">
        <h3>รายชื่อแอดมิน (Admins)</h3>
        <button @click="addAdmin">➕ เพิ่มแอดมิน</button>
        <table>
          <thead><tr><th>ชื่อผู้ใช้</th></tr></thead>
          <tbody>
            <tr v-for="admin in admins" :key="admin.id">
              <td contenteditable @blur="updateAdmin(admin.id, $event.target.innerText)">
                {{ admin.user }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Users Table -->
      <div v-if="view==='users'" id="usersTable">
        <h3>รายชื่อผู้สมัคร (Users)</h3>
        <button @click="addUser">➕ เพิ่มผู้สมัคร</button>
        <table>
          <thead><tr><th>ชื่อผู้ใช้</th></tr></thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td contenteditable @blur="updateUser(user.id, $event.target.innerText)">
                {{ user.user }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAmfunEqGUmZHabiPKYwCuay3JCRVXa_DU",
  authDomain: "project-web-f9a73.firebaseapp.com",
  projectId: "project-web-f9a73",
  storageBucket: "project-web-f9a73.appspot.com",
  messagingSenderId: "809705005062",
  appId: "1:809705005062:web:f4736c194fc7cf68c5e387",
  measurementId: "G-BK760T9XCW"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// States
const sidebarHover = ref(false);
const submenu = ref({ building: false });
const searchQuery = ref("");
const view = ref("canvas");
const admins = ref([]);
const users = ref([]);
const settingsOpen = ref(false);

// LocalStorage user info
const userName = ref(localStorage.getItem("fullName") || "แอดมิน");
const displayName = ref(localStorage.getItem("fullName") || "");
const faculty = localStorage.getItem("faculty") || "";
const major = localStorage.getItem("major") || "";
const facultyMajor = `${faculty}${faculty && major ? " | " : ""}${major}`;

// Menu Items
const menuItems = [
  { name: "ศูนย์อาหาร", icon: "🍜", action: () => showCanvas("ศูนย์อาหาร") },
  { name: "ตู้ & เต่าบิน", icon: "⚙️", action: () => showCanvas("ตู้ & เต่าบิน") },
  { name: "ที่จอดรถยนต์", icon: "🚗", action: () => showCanvas("ที่จอดรถยนต์") },
  { name: "ที่จอดรถมอไซค์", icon: "🛵", action: () => showCanvas("ที่จอดรถมอไซค์") },
  { name: "รายชื่อแอดมิน", icon: "🛠️", action: showAdminsTable },
  { name: "รายชื่อผู้สมัคร", icon: "📋", action: showUsersTable }
];
const filteredMenu = computed(() =>
  menuItems.filter(item => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
);

// Functions
function toggleSubmenu(key) {
  submenu.value[key] = !submenu.value[key];
}
function showCanvas(name) {
  view.value = "canvas";
}
function toggleSettingsMenu() {
  settingsOpen.value = !settingsOpen.value;
}
function logoutUser() {
  localStorage.clear();
  window.location.href = "index.html";
}

// Admin functions
async function showAdminsTable() {
  view.value = "admins";
  admins.value = [];
  const snapshot = await getDocs(collection(db, "admin"));
  admins.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function updateAdmin(id, value) {
  const refDoc = doc(db, "admin", id);
  await updateDoc(refDoc, { user: value });
}
async function addAdmin() {
  await addDoc(collection(db, "admin"), { user: "ใหม่" });
  showAdminsTable();
}

// Users functions
async function showUsersTable() {
  view.value = "users";
  users.value = [];
  const snapshot = await getDocs(collection(db, "users"));
  users.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function updateUser(id, value) {
  const refDoc = doc(db, "users", id);
  await updateDoc(refDoc, { user: value });
}
async function addUser() {
  await addDoc(collection(db, "users"), { user: "ใหม่" });
  showUsersTable();
}

// Close settings when click outside
onMounted(() => {
  window.addEventListener("click", e => {
    const settingsEl = document.querySelector(".settings");
    if (settingsEl && !settingsEl.contains(e.target)) {
      settingsOpen.value = false;
    }
  });
});
</script>

<style scoped>
/* --- CSS ของคุณคงเดิม --- */
:root{
  --bg:#f6f8fb;
  --panel:#ffffff;
  --panel-2:#f1f4f9;
  --panel-3:#e8edf5;
  --text:#2b2b2b;
  --muted:#6f7c91;
  --accent:#1f8fff;
  --hover:#dbe9ff;
  --item-hover:#e5f1ff;
  --radius:14px;
  --side-collapsed:80px;
  --side-expanded:260px;
  --gap:12px;
  --shadow:0 4px 20px rgba(0,0,0,.08);
}
*{ box-sizing: border-box; }
html,body{ height:100%; margin:0; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, "Noto Sans Thai", "Prompt", sans-serif; color:var(--text); background: var(--bg); overflow:hidden; }
.container{ height:100vh; width:100vw; display:flex; gap:0; }
.sidebar{ width:var(--side-collapsed); background: var(--panel); border-right:1px solid #ddd; transition: width .25s ease; padding:14px 10px; position:relative; overflow:hidden; box-shadow: var(--shadow); }
.sidebar:hover{ width:var(--side-expanded); }
.brand{ display:flex; align-items:center; gap:10px; padding:8px 10px; margin-bottom:10px; user-select:none; white-space:nowrap; }
.brand .logo{ width:40px; height:40px; border-radius:8px; display:grid; place-items:center; background:linear-gradient(145deg,#1a57ff,#00b7ff); color:#fff; font-weight:900; font-size:20px; box-shadow: inset 0 0 12px #ffffff33; }
.brand .label{ font-weight:700; color:var(--text); }
.search-box{ display:flex; align-items:center; gap:10px; background: var(--panel-3); border:1px solid #ccc; padding:8px 10px; border-radius:999px; margin:6px 8px 18px; }
.search-box .icon{ font-size:18px; color:var(--muted); }
.search-box input{ border:none; outline:none; background:transparent; color:var(--text); font-size:14px; flex:1; }
.menu-list{ list-style:none; margin:0; padding:0 6px; }
.menu-item{ display:flex; align-items:center; gap:12px; color:var(--muted); padding:12px 12px; margin:8px 0; border-radius: 0 22px 22px 0; cursor:pointer; position:relative; white-space:nowrap; font-size:16px; }
.menu-item .icon{ width:34px; height:34px; display:grid; place-items:center; background:#f0f4f9; border:1px solid #ccc; border-radius:9px; font-size:20px; }
.menu-item:hover{ background: var(--item-hover); color:#000; }
.menu-item:hover .icon{ border-color:#1f8fff; }
.submenu{ display:flex; flex-direction:column; gap:6px; margin-left:46px; margin-top:6px; margin-bottom:4px; }
.submenu .sub-item{ padding:8px 10px; border-radius:8px; cursor:pointer; background:transparent; transition: background .2s ease; }
.submenu .sub-item:hover{ background:#dbe9ff; }
.main{ flex:1; min-width:0; padding:20px; display:flex; flex-direction:column; overflow:hidden; }
.top-bar{ display:flex; justify-content:space-between; align-items:center; padding-bottom:18px; }
.title{ font-weight:800; font-size:20px; color:var(--text); }
.settings{ position:relative; cursor:pointer; }
.settings svg{ width:26px; height:26px; fill:var(--text); }
.settings-menu{ display:none; position:absolute; top:120%; right:0; background:#fff; border:1px solid #ddd; border-radius:12px; box-shadow: var(--shadow); min-width:220px; z-index:10; overflow:hidden; }
.settings.active .settings-menu{ display:block; }
.settings-menu .profile-info{ padding:12px; text-align:center; border-bottom:1px solid #ddd; }
.settings-menu .profile-info .name{ font-weight:700; font-size:16px; color:#000; }
.settings-menu .profile-info .faculty-major{ color:#555; font-size:13px; }
.settings-menu .logout{ display:block; text-align:center; padding:10px; background:#1f8fff; color:#fff; text-decoration:none; font-weight:700; }
.settings-menu .logout:hover{ background:#0f6fde; }
.canvas-area{ flex:1; border-radius:12px; border:1px dashed #ccc; display:flex; align-items:center; justify-content:center; color:#666; overflow:hidden; background: #fff; }
table { border-collapse: collapse; width: 100%; margin-top: 20px; }
th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
</style>
