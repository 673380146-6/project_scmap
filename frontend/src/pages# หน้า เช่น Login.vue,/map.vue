<template>
  <div class="container">
    <!-- Sidebar -->
    <aside class="sidebar" @mouseover="sidebarExpanded = true" @mouseleave="sidebarExpanded = false">
      <div class="brand">
        <div class="logo">S</div>
        <div class="label" v-if="sidebarExpanded">SCIENCE MAP</div>
      </div>

      <div class="search-box">
        <div class="icon">🔎</div>
        <input type="text" v-model="searchQuery" placeholder="ค้นหา..." />
      </div>

      <ul class="menu-list">
        <li
          class="menu-item"
          :class="{ 'has-sub': true }"
          @click.stop="toggleSubmenu('building-submenu')"
        >
          <span class="icon">🏛</span>
          <span class="label" v-if="sidebarExpanded">ตึกคณะ</span>
        </li>
        <div class="submenu" v-if="sidebarExpanded && openSubmenu === 'building-submenu'">
          <div class="sub-item" @click="showCanvas('SC01')">SC01</div>
          <div class="sub-item" @click="showCanvas('SC02')">SC02</div>
          <div class="sub-item" @click="showCanvas('SC03')">SC03</div>
        </div>

        <li class="menu-item" @click="showCanvas('ศูนย์อาหาร')">
          <span class="icon">🍜</span>
          <span class="label" v-if="sidebarExpanded">ศูนย์อาหาร</span>
        </li>
        <li class="menu-item" @click="showCanvas('ตู้ & เต่าบิน')">
          <span class="icon">⚙️</span>
          <span class="label" v-if="sidebarExpanded">ตู้อาหาร & เต่าบิน</span>
        </li>
        <li class="menu-item" @click="showCanvas('ที่จอดรถยนต์')">
          <span class="icon">🚗</span>
          <span class="label" v-if="sidebarExpanded">ที่จอดรถยนต์</span>
        </li>
        <li class="menu-item" @click="showCanvas('ที่จอดรถมอไซค์')">
          <span class="icon">🛵</span>
          <span class="label" v-if="sidebarExpanded">ที่จอดรถมอไซค์</span>
        </li>
      </ul>
    </aside>

    <!-- Main -->
    <main class="main">
      <div class="top-bar">
        <div class="title">{{ displayName }}</div>
        <div class="settings" :class="{ active: settingsOpen }" @click.stop="toggleSettingsMenu">
          <svg viewBox="0 0 24 24">
            <path
              d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm7.43-3.5c0-.36-.03-.72-.08-1.07l2.11-1.65a.5.5 0 0 0 .12-.65l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.16 7.16 0 0 0-1.84-1.07L14.5 2.5a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5l-.24 2.88a7.16 7.16 0 0 0-1.84 1.07l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.65l2.11 1.65c-.05.35-.08.71-.08 1.07s.03.72.08 1.07l-2.11 1.65a.5.5 0 0 0-.12.65l2 3.46a.5.5 0 0 0 .61.22l2.49-1a7.16 7.16 0 0 0 1.84 1.07L9.5 21.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5l.24-2.88a7.16 7.16 0 0 0 1.84-1.07l2.49 1a.5.5 0 0 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.65l-2.11-1.65c.05-.35.08-.71.08-1.07z"
            />
          </svg>
          <div class="settings-menu">
            <div class="profile-info">
              <img :src="profilePic" alt="profile" />
              <div class="name">{{ userName }}</div>
              <div class="faculty-major">{{ facultyMajor }}</div>
            </div>
            <div style="padding:10px; border-bottom:1px solid #ddd;">
              <input type="file" accept="image/*" @change="uploadProfilePic" style="margin-bottom:8px;" />
              <button @click="editProfile" style="width:100%; padding:8px; border:none; border-radius:8px; background:#f1f4f9; cursor:pointer; font-weight:600;">✏️ แก้ไขข้อมูล</button>
            </div>
            <a href="/" class="logout" @click.prevent="logoutUser">ออกจากระบบ</a>
          </div>
        </div>
      </div>

      <div class="canvas-area">
        <div v-if="canvasContent" v-html="canvasContent"></div>
        <model-viewer
          v-else
          src="../models/cp09model.glb"
          alt="3D model"
          auto-rotate
          camera-controls
          style="width: 100%; height: 100%;"
        />
      </div>
    </main>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

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
const storage = getStorage(app);

export default {
  name: "ScienceMap",
  setup() {
    const sidebarExpanded = ref(false);
    const searchQuery = ref("");
    const openSubmenu = ref(null);
    const settingsOpen = ref(false);

    const canvasContent = ref("");
    const displayName = ref("SCIENCE MAP");

    const profilePic = ref("default-profile.png");
    const userName = ref("ชื่อ นามสกุล");
    const facultyMajor = ref("คณะของคุณ | สาขาของคุณ");

    const userId = localStorage.getItem("userId") || "currentUser";

    const toggleSubmenu = (id) => {
      openSubmenu.value = openSubmenu.value === id ? null : id;
    };

    const showCanvas = (name) => {
      if (name === "SC01" || name === "SC02" || name === "SC03") {
        canvasContent.value = `<div><strong>${name}</strong><br>อาคารย่อยของคณะ</div>`;
      } else if (name === "ศูนย์อาหาร") {
        canvasContent.value = "<div><strong>ศูนย์อาหาร</strong><br>รหัส: 09</div>";
      } else if (name === "ตู้ & เต่าบิน") {
        canvasContent.value = "<div><strong>ตู้ & เต่าบิน</strong><br>รหัส: 13</div>";
      } else if (name === "ที่จอดรถยนต์") {
        canvasContent.value = "<div><strong>ที่จอดรถยนต์</strong><br>โซน C และ D</div>";
      } else if (name === "ที่จอดรถมอไซค์") {
        canvasContent.value = "<div><strong>ที่จอดรถมอไซค์</strong><br>ใต้อาคาร SC01 และหลังตึกฟิสิกส์</div>";
      } else {
        canvasContent.value = "";
      }
    };

    const toggleSettingsMenu = () => {
      settingsOpen.value = !settingsOpen.value;
    };

    const logoutUser = () => {
      localStorage.clear();
      window.location.href = "/";
    };

    const uploadProfilePic = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const fileRef = storageRef(storage, `profiles/${userId}-${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      profilePic.value = url;
      await setDoc(doc(db, "users", userId), { profilePic: url }, { merge: true });
    };

    const editProfile = async () => {
      const newName = prompt("กรอกชื่อ-นามสกุลใหม่:", userName.value);
      const newFacultyMajor = prompt("กรอกคณะ | สาขาใหม่:", facultyMajor.value);
      if (newName && newFacultyMajor) {
        userName.value = newName;
        facultyMajor.value = newFacultyMajor;
        await setDoc(doc(db, "users", userId), { fullName: newName, facultyMajor: newFacultyMajor }, { merge: true });
      }
    };

    onMounted(async () => {
      const snap = await getDoc(doc(db, "users", userId));
      if (snap.exists()) {
        const data = snap.data();
        if (data.fullName) {
          userName.value = data.fullName;
          displayName.value = data.fullName;
        }
        if (data.facultyMajor) facultyMajor.value = data.facultyMajor;
        if (data.profilePic) profilePic.value = data.profilePic;
      }

      // close settings when click outside
      window.addEventListener("click", (e) => {
        const settingsEl = document.querySelector(".settings");
        if (settingsEl && !settingsEl.contains(e.target)) {
          settingsOpen.value = false;
        }
      });
    });

    return {
      sidebarExpanded,
      searchQuery,
      openSubmenu,
      settingsOpen,
      canvasContent,
      displayName,
      profilePic,
      userName,
      facultyMajor,
      toggleSubmenu,
      showCanvas,
      toggleSettingsMenu,
      logoutUser,
      uploadProfilePic,
      editProfile
    };
  }
};
</script>

<style scoped>
/* นำ style ทั้งหมดจาก HTML ของคุณมาใส่ตรงนี้ได้เลย (เหมือนเดิม) */
</style>
