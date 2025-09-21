<template>
  <form class="form" @submit.prevent="login">
    <h2>ขอต้อนรับกลับมา</h2>

    <label>รหัสนักศึกษา</label>
    <input v-model="username" type="text" placeholder="เช่น 6430XXXXXX" required />

    <label>รหัสผ่าน</label>
    <input v-model="password" type="password" placeholder="รหัสผ่าน" required />

    <button type="submit" class="button-submit">ดำเนินการต่อ</button>

    <div class="text-center">
      <router-link to="/forgot-password" class="forgot">ลืมรหัสผ่าน?</router-link>
    </div>

    <div class="text-center">
      ยังไม่มีบัญชีใช่ไหม? <router-link to="/register">ลงชื่อสมัคร</router-link>
    </div>
  </form>
</template>

<script>
// ใช้ Firebase SDK ของ Vue (ติดตั้ง firebase ก่อน: npm install firebase)
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAmfunEqGUmZHabiPKYwCuay3JCRVXa_DU",
  authDomain: "project-web-f9a73.firebaseapp.com",
  projectId: "project-web-f9a73",
  storageBucket: "project-web-f9a73.firebasestorage.app",
  messagingSenderId: "809705005062",
  appId: "1:809705005062:web:f4736c194fc7cf68c5e387",
  measurementId: "G-BK760T9XCW"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default {
  name: "LoginPage",
  data() {
    return {
      username: "",
      password: ""
    };
  },
  methods: {
    async login() {
      try {
        // 🔹 เช็ค admin ก่อน
        const adminQuery = query(
          collection(db, "admin"),
          where("user", "==", this.username),
          where("password", "==", this.password)
        );
        const adminSnapshot = await getDocs(adminQuery);

        if (!adminSnapshot.empty) {
          const adminData = adminSnapshot.docs[0].data();
          localStorage.setItem("role", "admin");
          localStorage.setItem("adminID", adminData.adminID || "");
          alert("เข้าสู่ระบบในฐานะผู้ดูแลระบบสำเร็จ!");
          this.$router.push("/admin-dashboard"); // ใช้ Vue Router
          return;
        }

        // 🔹 ถ้าไม่ใช่ admin → เช็ค user ปกติ
        const userQuery = query(
          collection(db, "users"),
          where("studentId", "==", this.username),
          where("password", "==", this.password)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const user = userSnapshot.docs[0].data();
          localStorage.setItem("role", "user");
          localStorage.setItem("fullName", user.fullName || "ไม่ระบุชื่อ");
          localStorage.setItem("faculty", user.faculty || "ไม่ระบุคณะ");
          localStorage.setItem("major", user.major || "-");
          alert("เข้าสู่ระบบสำเร็จ!");
          this.$router.push("/map");
        } else {
          alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
        }

      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ:", error);
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    }
  }
};
</script>

<style scoped>
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.form {
  background-color: white;
  padding: 40px;
  border-radius: 20px;
  width: 400px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}
.form h2 { text-align: center; margin-bottom: 30px; }
label { font-weight: bold; display: block; margin: 15px 0 5px; }
input {
  width: 100%; padding: 12px; border-radius: 10px;
  border: 1px solid #ccc; outline: none; font-size: 16px;
}
.button-submit {
  margin-top: 30px; width: 100%; padding: 12px;
  font-size: 16px; background-color: #151717;
  color: white; border: none; border-radius: 999px; cursor: pointer;
}
.button-submit:hover { background-color: #333; }
.text-center { text-align: center; margin-top: 20px; }
.text-center a { color: #2d79f3; text-decoration: none; font-weight: 500; }
.text-center a:hover { text-decoration: underline; }
.forgot { color: #f33; font-size: 14px; }
.forgot:hover { text-decoration: underline; }
</style>
