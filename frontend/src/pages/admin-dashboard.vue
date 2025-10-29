<template>
  <div class="container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="brand">
        <div class="logo">S</div>
        <div class="label">SCIENCE MAP</div>
      </div>

      <div class="search-box">
        <div class="icon">🔎</div>
        <!-- แทน onkeyup="filterList()" ด้วย v-model + @input -->
        <input type="text" placeholder="ค้นหา..." v-model="searchQuery" @input="filterList" />
      </div>

      <ul class="menu-list">
        <li
          class="menu-item has-sub"
          v-for="item in menuItems"
          :key="item.name"
          @click.stop="item.submenu ? toggleSubmenu(item.name) : showCanvas(item.name)"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>

          <!-- render submenu inside its parent li to keep valid HTML structure -->
          <div
            v-if="item.submenu"
            class="submenu"
            :class="{ open: openSubmenus.includes(item.name) }"
          >
            <div
              v-for="sub in item.submenu"
              :key="item.name + '-' + sub"
              class="sub-item"
              @click.stop="showCanvas(sub)"
            >
              {{ sub }}
            </div>
          </div>
        </li>
      </ul>
    </aside>

    <!-- Main -->
    <main class="main">
      <div class="top-bar">
        <div class="title">{{ user.fullName || "SCIENCE MAP" }}</div>
        <div class="settings" :class="{ active: settingsActive }" @click.stop="toggleSettingsMenu">
          <svg viewBox="0 0 24 24">
            <path
              d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm7.43-3.5c0-.36-.03-.72-.08-1.07l2.11-1.65a.5.5 0 0 0 .12-.65l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.16 7.16 0 0 0-1.84-1.07L14.5 2.5a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5l-.24 2.88a7.16 7.16 0 0 0-1.84 1.07l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.65l2.11 1.65c-.05.35-.08.71-.08 1.07s.03.72.08 1.07l-2.11 1.65a.5.5 0 0 0-.12.65l2 3.46a.5.5 0 0 0 .61.22l2.49-1a7.16 7.16 0 0 0 1.84 1.07L9.5 21.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5l.24-2.88a7.16 7.16 0 0 0 1.84-1.07l2.49 1a.5.5 0 0 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.65l-2.11-1.65c.05-.35.08-.71.08-1.07z"
            />
          </svg>
          <div class="settings-menu">
            <div class="profile-info">
              <div class="name">{{ user.fullName || "แอดมิน" }}</div>
              <div class="faculty-major">{{ user.faculty || "" }}{{ user.major ? " | " + user.major : "" }}</div>
            </div>
            <a href="#" class="logout" @click.prevent="logoutUser">ออกจากระบบ</a>
          </div>
        </div>
      </div>

      <div class="canvas-area" v-show="canvasVisible">
        <div v-html="canvasContent"></div>
      </div>

      <div v-show="adminsVisible">
        <h3>รายชื่อแอดมิน (Admins)</h3>
        <button class="btn primary" @click="addAdmin">➕ เพิ่มแอดมิน</button>
        <table>
          <thead>
            <tr><th>ชื่อผู้ใช้</th></tr>
          </thead>
          <tbody>
            <tr v-for="admin in admins" :key="admin.id">
              <td contenteditable @blur="updateAdmin(admin, $event)">{{ admin.user }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-show="usersVisible">
        <h3>รายชื่อผู้สมัคร (Users)</h3>
        <button class="btn primary" @click="addUser">➕ เพิ่มผู้สมัคร</button>
        <table>
          <thead>
            <tr><th>ชื่อผู้ใช้</th></tr>
          </thead>
          <tbody>
            <tr v-for="userItem in users" :key="userItem.id">
              <td contenteditable @blur="updateUser(userItem, $event)">{{ userItem.user }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, addDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// Sidebar / Menu
const searchQuery = ref("");
const menuItems = [
  { name: "ตึกคณะ", label: "ตึกคณะ", icon: "🏛", submenu: ["SC01","SC02","SC03"] },
  { name: "ศูนย์อาหาร", label: "ศูนย์อาหาร", icon: "🍜" },
  { name: "ตู้ & เต่าบิน", label: "ตู้อาหาร & เต่าบิน", icon: "⚙️" },
  { name: "ที่จอดรถยนต์", label: "ที่จอดรถยนต์", icon: "🚗" },
  { name: "ที่จอดรถมอไซค์", label: "ที่จอดรถมอไซค์", icon: "🛵" },
  { name: "รายชื่อแอดมิน", label: "รายชื่อแอดมิน", icon: "🛠️" },
  { name: "รายชื่อผู้สมัคร", label: "รายชื่อผู้สมัคร", icon: "📋" }
];

const openSubmenus = ref([]);
function toggleSubmenu(name) {
  if (openSubmenus.value.includes(name)) {
    openSubmenus.value = openSubmenus.value.filter(n => n !== name);
  } else openSubmenus.value.push(name);
}

function filterList() {
  // ไม่ต้องทำอะไรเพราะ v-show จะ filter ด้วย computed later ถ้าต้องการ
}

// Canvas
const canvasVisible = ref(true);
const canvasContent = ref('<model-viewer src="../models/cp09model.glb" alt="3D model" auto-rotate camera-controls style="width:100%;height:100%;"></model-viewer>');

// Settings
const settingsActive = ref(false);
function toggleSettingsMenu() { settingsActive.value = !settingsActive.value; }

// User info
const user = reactive({ fullName:'', faculty:'', major:'' });

// Admins & Users
const adminsVisible = ref(false);
const usersVisible = ref(false);
const admins = ref([]);
const users = ref([]);

async function showAdminsTable() {
  canvasVisible.value = false;
  usersVisible.value = false;
  adminsVisible.value = true;
  admins.value = [];
  const querySnapshot = await getDocs(collection(db,"admin"));
  querySnapshot.forEach(docSnap => admins.value.push({ id: docSnap.id, user: docSnap.data().user || '-' }));
}

async function updateAdmin(admin, e) {
  const refDoc = doc(db, "admin", admin.id);
  await updateDoc(refDoc, { user: e.target.innerText });
}

async function addAdmin() {
  await addDoc(collection(db,"admin"), { user:"ใหม่" });
  showAdminsTable();
}

async function showUsersTable() {
  canvasVisible.value = false;
  adminsVisible.value = false;
  usersVisible.value = true;
  users.value = [];
  const querySnapshot = await getDocs(collection(db,"users"));
  querySnapshot.forEach(docSnap => users.value.push({ id: docSnap.id, user: docSnap.data().user || '-' }));
}

async function updateUser(userItem, e) {
  const refDoc = doc(db,"users", userItem.id);
  await updateDoc(refDoc, { user: e.target.innerText });
}

async function addUser() {
  await addDoc(collection(db,"users"), { user:"ใหม่" });
  showUsersTable();
}

// Canvas display
function showCanvas(name) {
  usersVisible.value = false;
  adminsVisible.value = false;
  canvasVisible.value = true;
  canvasContent.value = `<div><strong>${name}</strong></div>`;
}

// Logout
function logoutUser() {
  localStorage.clear();
  window.location.href="index.html";
}

// Load user info from localStorage
onMounted(()=>{
  user.fullName = localStorage.getItem("fullName")||"";
  user.faculty = localStorage.getItem("faculty")||"";
  user.major = localStorage.getItem("major")||"";
});
</script>

<style scoped>
/* ย้าย CSS ของคุณมาทั้งหมด unchanged */
 /* ใส่ CSS ที่คุณมีทั้งหมดตรงนี้ */
</style>

<style scoped>
.container{
  --bg: #ffffff;
  --text: #0b1220; /* very dark */
  --muted: #6b7280;
  --surface: #ffffff;
  --accent: #0b84ff; /* bright blue */
  display:flex;
  min-height:100vh;
  background:var(--bg);
  color:var(--text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}
.sidebar{
  width:260px;
  border-right:1px solid #eef2f7;
  padding:20px 16px;
  box-sizing:border-box;
  background: linear-gradient(180deg, #ffffff, #fbfdff);
}
.brand{ display:flex; align-items:center; gap:12px; margin-bottom:18px }
.brand .logo{ width:44px; height:44px; border-radius:10px; background:var(--text); color:white; display:flex; align-items:center; justify-content:center; font-weight:700 }
.brand .label{ font-weight:700; letter-spacing:0.6px }
.search-box{ display:flex; align-items:center; gap:8px; padding:8px; border-radius:8px; background:#f5f7fb; margin-bottom:14px }
.search-box input{ border:0; outline:none; background:transparent; width:100%; color:var(--text); font-size:14px }
.menu-list{ list-style:none; padding:0; margin:0 }
.menu-item{ display:flex; align-items:center; gap:10px; padding:10px 8px; border-radius:8px; cursor:pointer; color:var(--text); transition:background .15s, color .15s }
.menu-item:hover{ background:#f0f6ff }
.menu-item .icon{ font-size:18px }
.menu-item .label{ font-size:14px }
.submenu{ margin-top:6px; margin-left:34px; overflow:hidden; max-height:0; transition:max-height .25s ease }
.submenu.open{ max-height:200px }
.sub-item{ padding:6px 10px; border-radius:6px; color:var(--muted); font-size:13px; cursor:pointer }
.sub-item:hover{ background:#f0f6ff; color:var(--text) }

.main{ flex:1; padding:20px; position:relative }
.top-bar{ display:flex; align-items:center; justify-content:flex-start; gap:12px; position:relative; padding:6px 40px 12px 0 }
.top-bar .title{ font-size:18px; font-weight:700 }

.settings{ position:absolute; top:12px; right:18px; width:44px; height:44px; display:flex; align-items:center; justify-content:center; border-radius:8px; cursor:pointer }
.settings svg{ width:22px; height:22px; fill:var(--muted) }
.settings:hover svg{ fill:var(--text) }
.settings-menu{ position:absolute; right:0; top:54px; background:var(--surface); border:1px solid #eef2f7; box-shadow:0 8px 20px rgba(11,18,32,0.06); min-width:220px; padding:12px; border-radius:8px; display:none }
.settings.active .settings-menu{ display:block }
.settings-menu .profile-info .name{ font-weight:700 }
.settings-menu .faculty-major{ font-size:13px; color:var(--muted); margin-top:4px }
.settings-menu .logout{ display:inline-block; margin-top:10px; color:var(--accent); text-decoration:none }

.canvas-area{ border-radius:8px; border:1px solid #eef4ff; padding:12px; min-height:420px; background: linear-gradient(180deg, #ffffff, #fbfdff) }

h3{ margin-top:14px; margin-bottom:8px }
table{ width:100%; border-collapse:collapse; margin-top:8px }
thead th{ text-align:left; padding:8px 10px; color:var(--muted); font-size:13px }
tbody td{ padding:10px; border-top:1px solid #f1f5f9 }

.btn{ display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:8px; border:1px solid transparent; cursor:pointer; margin-bottom:10px }
.btn.primary{ background:var(--accent); color:white }
.btn.ghost{ background:transparent; border-color:#eef2f7; color:var(--text) }

/* responsive adjustments */
@media (max-width:800px){
  .sidebar{ display:none }
  .main{ padding:12px }
  .settings{ right:12px }
}
</style>
