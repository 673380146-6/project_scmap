<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar">
      <div class="menu-item">
        <a href="#" class="nav-link"style="font-family: 'Mitr', 'Noto Sans Thai', sans-serif;">แผนที่</a>
        <div class="submenu">
          <a href="#"style="font-family: 'Mitr', 'Noto Sans Thai', sans-serif;">คณะวิทยาศาสตร์</a>
          <a href="#"style="font-family: 'Mitr', 'Noto Sans Thai', sans-serif;">ตึกเรียนรวม</a>
        </div>
      </div>
      <div class="menu-item">
        <a href="#" class="nav-link"style="font-family: 'Mitr', 'Noto Sans Thai', sans-serif;">เกี่ยวกับ</a>
        <div class="submenu">
          <a href="#"style="font-family: 'Mitr', 'Noto Sans Thai', sans-serif;">ทีมพัฒนา</a>
          <a href="#"style="font-family: 'Mitr', 'Noto Sans Thai', sans-serif;">ข้อมูลระบบ</a>
        </div>
      </div>
      <div class="menu-item">
        <a href="#" class="nav-link"style="font-family: 'Mitr', 'Noto Sans Thai', sans-serif;">ติดต่อ</a>
        <div class="submenu">
          <a href="#"style="font-family: 'Mitr', 'Noto Sans Thai', sans-serif;">Facebook</a>
          <a href="#"style="font-family: 'Mitr', 'Noto Sans Thai', sans-serif;">อีเมล</a>
        </div>
      </div>
    </nav>

    <!-- Background section -->
    <div
      class="full-background"
      :class="{ exit: isExiting }"
      @click="goToLogin"
    >
      <!-- Curved text using SVG -->
      <svg viewBox="0 0 1000 200">
        <defs>
          <path id="curve" d="M00,150 Q500,20 1000,150" fill="transparent" />
        </defs>
        <text text-anchor="middle">
          <textPath href="#curve" startOffset="50%">
            WELCOME TO SCIENCE MAP
          </textPath>
        </text>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  data() {
    return {
      isExiting: false,
    };
  },
  methods: {
    goToLogin() {
      this.isExiting = true;
      setTimeout(() => {
        this.$router.push('/login');
      }, 800);
    },
  },
  mounted() {
    window.goToLogin = this.goToLogin;
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Mitr:wght@300;400;600&display=swap');

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: "Arial", sans-serif;
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

.navbar > .menu-item {
  position: relative;
  cursor: pointer;
}

.nav-link {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #667eea;
}

.navbar .submenu {
  display: none;
  position: absolute;
  top: 100%;
  background: white;
  color: black;
  min-width: 150px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.navbar .submenu a {
  display: block;
  padding: 10px;
  text-decoration: none;
  color: black;
}

.navbar .submenu a:hover {
  background-color: #f0f0f0;
}

.menu-item:hover .submenu {
  display: block;
}

/* Background block */
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

.full-background.exit {
  transform: translateY(-100%);
  opacity: 0;
}

/* Curved Text Style */
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
</style>