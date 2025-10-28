<template>
  <div class="page-container">
    <form class="form" @submit.prevent="login">
      <h2>ขอต้อนรับกลับมา</h2>

      <label>รหัสนักศึกษา</label>
      <input v-model="username" type="text" placeholder="เช่น 6430XXXXXX" required />

      <label>รหัสผ่าน</label>
      <input v-model="password" type="password" placeholder="รหัสผ่าน" required />

      <button type="submit" class="button-submit" :disabled="loading">
        {{ loading ? "กำลังเข้าสู่ระบบ..." : "ดำเนินการต่อ" }}
      </button>

      <div class="text-center">
        <router-link to="/forgot-password" class="forgot">ลืมรหัสผ่าน?</router-link>
      </div>

      <div class="text-center">
        ยังไม่มีบัญชีใช่ไหม? <router-link to="/register">ลงชื่อสมัคร</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { ref } from "vue";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { getApp } from "firebase/app";

export default {
  name: "LoginPage",
  setup(_, { router }) {
    const username = ref("");
    const password = ref("");
    const loading = ref(false);

    const login = async () => {
      loading.value = true;
      const db = getFirestore(getApp());
      const usernameInput = username.value.trim();

      try {
        // เช็คว่าเป็น admin
        const adminQuery = query(collection(db, "admin"), where("user", "==", usernameInput));
        const adminSnapshot = await getDocs(adminQuery);

        if (!adminSnapshot.empty) {
          // Admin
          localStorage.setItem("role", "admin");
          localStorage.setItem("adminID", adminSnapshot.docs[0].id);
          alert("เข้าสู่ระบบในฐานะผู้ดูแลระบบสำเร็จ!");
          router.push("/admin-dashboard");
        } else {
          // User ปกติ
          localStorage.setItem("role", "user");
          localStorage.setItem("fullName", usernameInput || "ไม่ระบุชื่อ");
          localStorage.setItem("faculty", "ไม่ระบุคณะ");
          localStorage.setItem("major", "-");
          alert("เข้าสู่ระบบสำเร็จ!");
          router.push("/map");
        }
      } catch (e) {
        alert("เกิดข้อผิดพลาด: " + e.message);
      } finally {
        loading.value = false;
      }
    };

    return {
      username,
      password,
      login,
      loading
    };
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
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
