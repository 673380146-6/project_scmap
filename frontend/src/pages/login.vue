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



export default {
  name: "LoginPage",
  data() {
    return {
      username: "",
      password: ""
    };
  },
  methods: {
    login() {
      // MOCK: ให้ login สำเร็จเสมอ (ไม่เชื่อมต่อฐานข้อมูล)
      if (this.username === 'admin') {
        localStorage.setItem("role", "admin");
        localStorage.setItem("adminID", "mock-admin-id");
        alert("เข้าสู่ระบบในฐานะผู้ดูแลระบบสำเร็จ!");
        this.$router.push("/admin-dashboard");
      } else {
        localStorage.setItem("role", "user");
        localStorage.setItem("fullName", this.username || "ไม่ระบุชื่อ");
        localStorage.setItem("faculty", "ไม่ระบุคณะ");
        localStorage.setItem("major", "-");
        alert("เข้าสู่ระบบสำเร็จ!");
        this.$router.push("/map");
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
