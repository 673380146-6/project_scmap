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
        </li>

        <div
          v-for="item in menuItems"
          v-if="item.submenu"
          :key="item.name+'-submenu'"
          class="submenu"
          :class="{ open: openSubmenus.includes(item.name) }"
        >
          <div
            v-for="sub in item.submenu"
            :key="sub"
            class="sub-item"
            @click.stop="showCanvas(sub)"
          >
            {{ sub }}
          </div>
        </div>
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
        <button @click="addAdmin" style="margin-bottom:10px; background: var(--accent); color: white; border: none; padding: 8px 12px; border-radius: 6px;">➕ เพิ่มแอดมิน</button>
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
        <button @click="addUser" style="margin-bottom:10px; background: var(--accent); color: white; border: none; padding: 8px 12px; border-radius: 6px;">➕ เพิ่มผู้สมัคร</button>
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
