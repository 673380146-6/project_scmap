<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar">
      <div class="menu-item">
        <a href="#" class="nav-link" style="font-family: 'Mitr', 'Noto Sans Thai', sans-serif;">แผนที่</a>
        <div class="submenu">
          <a 
            href="https://www.google.com/maps/place/%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%A5%E0%B8%B1%E0%B8%A2%E0%B8%82%E0%B8%AD%E0%B8%99%E0%B9%81%E0%B8%81%E0%B9%88%E0%B8%99/@16.4744154,102.8194494,17z/data=!3m1!4b1!4m6!3m5!1s0x31228a8eb01c96f3:0xf6a47b89e419df87!8m2!3d16.4744103!4d102.8220243!16zL20vMGJzMGd3?entry=ttu&g_ep=EgoyMDI1MTEwMi4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            style="font-family: 'Mitr', 'Noto Sans Thai', sans-serif;"
          >
            ที่ตั้งมหาวิทยาลัย
          </a>
        </div>
      </div>

      <div class="menu-item">
        <a href="#" class="nav-link" style="font-family: 'Mitr', 'Noto Sans Thai', sans-serif;">เกี่ยวกับ</a>
        <div class="submenu">
          <a href="#" @click.prevent="showTeam = true" style="font-family: 'Mitr', 'Noto Sans Thai', sans-serif;">ทีมพัฒนา</a>
          <a href="#" @click.prevent="showInfo = true" style="font-family: 'Mitr', 'Noto Sans Thai', sans-serif;">ข้อมูลระบบ</a>
        </div>
      </div>

      <div class="menu-item">
        <div class="submenu">
          <a href="#" style="font-family: 'Mitr', 'Noto Sans Thai', sans-serif;">Facebook</a>
          <a href="#" style="font-family: 'Mitr', 'Noto Sans Thai', sans-serif;">อีเมล</a>
        </div>
      </div>
    </nav>

    <!-- Background section -->
    <div class="full-background" :class="{ exit: isExiting }" @click="goToLogin">
      <svg viewBox="0 0 1000 200">
        <defs>
          <path id="curve" d="M00,150 Q500,20 1000,150" fill="transparent" />
        </defs>
        <text text-anchor="middle">
          <textPath href="#curve" startOffset="50%">WELCOME TO SCIENCE MAP</textPath>
        </text>
      </svg>
    </div>

    <!-- 🔹 Popup ทีมพัฒนา -->
    <transition name="popup-fade">
      <div v-if="showTeam" class="team-modal-overlay" @click.self="showTeam = false">
        <div class="team-modal-content">
          <button class="close-btn top-right" @click="showTeam = false">×</button>
          <h2 class="team-title">ทีมพัฒนา</h2>
          <img :src="n1" alt="ทีมพัฒนา" class="team-image" />
          <p class="team-desc">
            พัฒนาโดยนิสิตมหาวิทยาลัยขอนแก่น<br />
            คณะวิทยาศาสตร์ สาขาวิทยาการคอมพิวเตอร์
          </p>
        </div>
      </div>
    </transition>

    <!-- 🔹 Popup ข้อมูลระบบ -->
    <transition name="popup-fade">
      <div v-if="showInfo" class="team-modal-overlay" @click.self="showInfo = false">
        <div class="team-modal-content">
          <button class="close-btn top-right" @click="showInfo = false">×</button>
          <h2 class="team-title">ข้อมูลระบบ</h2>
          <div class="info-images">
            <img :src="n2" alt="ข้อมูลระบบ 1" class="team-image" />
            <img :src="n3" alt="ข้อมูลระบบ 2" class="team-image" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import n1 from "@/assets/n1.png";
import n2 from "@/assets/n2.png";
import n3 from "@/assets/n3.png";

const router = useRouter();
const isExiting = ref(false);
const showTeam = ref(false);
const showInfo = ref(false);

const goToLogin = () => {
  isExiting.value = true;
  setTimeout(() => {
    router.push("/map");
  }, 800);
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Mitr:wght@300;400;600&display=swap');

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

/* Navbar */
.navbar {
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 15px 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}
.menu-item { position: relative; cursor: pointer; }
.nav-link { color: white; text-decoration: none; transition: color 0.3s; }
.nav-link:hover { color: #667eea; }
.submenu {
  display: none;
  position: absolute;
  top: 100%;
  background: white;
  color: black;
  min-width: 150px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
.submenu a {
  display: block;
  padding: 10px;
  text-decoration: none;
  color: black;
}
.submenu a:hover { background-color: #f0f0f0; }
.menu-item:hover .submenu { display: block; }

/* Background */
.full-background {
  background: url("https://kku.ac.th/wp-content/uploads/2025/02/03-3000x1286-2-scaled.jpg") no-repeat center center / cover;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: transform 0.8s ease-in-out, opacity 0.8s ease-in-out;
}
.full-background.exit { transform: translateY(-100%); opacity: 0; }

/* Curved text */
svg {
  position: absolute;
  top: 100px;
  left: 0;
  width: 100%;
  height: 200px;
  pointer-events: none;
}
text {
  font-family: "Patrick Hand", cursive;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
  fill: white;
  font-size: 70px;
  font-weight: bold;
}

/* Modal (เต็มจอ) */
.team-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  backdrop-filter: blur(5px);
}

.team-modal-content {
  background: white;
  border-radius: 25px;
  padding: 40px;
  text-align: center;
  width: 90vw;
  height: 90vh;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  position: relative;
  overflow-y: auto;
}

.team-title {
  font-size: 2.5rem;
  font-family: 'Mitr', sans-serif;
  color: #2b2d42;
  margin-bottom: 20px;
}

.team-image {
  width: 80%;
  border-radius: 15px;
  margin: 20px auto;
  display: block;
}

.team-desc {
  font-family: 'Noto Sans Thai', sans-serif;
  margin-top: 20px;
  font-size: 1.2rem;
  color: #333;
}

.info-images {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

/* ปุ่มปิดมุมขวา */
.close-btn.top-right {
  position: absolute;
  top: 15px;
  right: 25px;
  font-size: 2rem;
  font-weight: bold;
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  transition: color 0.3s;
}
.close-btn.top-right:hover {
  color: #5563c1;
}

/* Popup Transition */
.popup-fade-enter-active, .popup-fade-leave-active {
  transition: all 0.5s ease;
}
.popup-fade-enter-from, .popup-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.popup-fade-enter-to, .popup-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
