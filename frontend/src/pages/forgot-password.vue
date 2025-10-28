<template>
  <div class="page-container">
    <div class="form">
      <h2>แก้ไขรหัสผ่าน</h2>

      <form @submit.prevent="handleSubmit">
        <label>รหัสนักศึกษา</label>
        <input v-model="studentId" type="text" placeholder="เช่น 6430XXXXXX" required />

        <label>สิ่งที่คุณชอบ</label>
        <input v-model="favoriteThing" type="text" placeholder="เช่น หนังสือ, หมา, กระเป๋า..." required />

        <label>รหัสผ่านใหม่</label>
        <input v-model="newPassword" type="password" placeholder="รหัสผ่านใหม่" required />

        <button type="submit" class="button-submit" :disabled="loading">
          {{ loading ? "กำลังตรวจสอบ..." : "ยืนยันการแก้ไข" }}
        </button>
      </form>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

      <div class="text-center">
        <router-link to="/login">กลับไปหน้าเข้าสู่ระบบ</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const studentId = ref("");
const favoriteThing = ref("");
const newPassword = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const loading = ref(false);

async function handleSubmit() {
  errorMessage.value = "";
  successMessage.value = "";
  loading.value = true;

  const cleanStudentId = studentId.value.replace(/[^0-9]/g, "");

  if (cleanStudentId.length !== 10) {
    errorMessage.value = "กรุณาใส่รหัสนักศึกษาให้ครบ 10 ตัวเลข";
    loading.value = false;
    return;
  }

  setTimeout(() => {
    if (favoriteThing.value.trim() === "" || newPassword.value.trim() === "") {
      errorMessage.value = "ข้อมูลไม่ถูกต้อง กรุณาลองใหม่";
    } else {
      successMessage.value = "แก้ไขรหัสผ่านเรียบร้อยแล้ว! (mock)";
      studentId.value = "";
      favoriteThing.value = "";
      newPassword.value = "";
    }
    loading.value = false;
  }, 1000);
}
</script>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* เต็มจอ */
  background-color: #f5f5f5;
}

.form {
  background-color: white;
  padding: 40px;
  border-radius: 20px;
  width: 450px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

.form h2 {
  text-align: center;
  margin-bottom: 30px;
}

label {
  font-weight: bold;
  display: block;
  margin: 15px 0 5px;
}

input {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #ccc;
  outline: none;
  font-size: 16px;
}

.button-submit {
  margin-top: 30px;
  width: 100%;
  padding: 12px;
  font-size: 16px;
  background-color: #151717;
  color: white;
  border: none;
  border-radius: 999px;
  cursor: pointer;
}

.button-submit:hover {
  background-color: #333;
}

.text-center {
  text-align: center;
  margin-top: 20px;
}

.text-center a {
  color: #2d79f3;
  text-decoration: none;
  font-weight: 500;
}

.text-center a:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 15px;
  color: red;
  text-align: center;
  font-weight: bold;
}

.success-message {
  margin-top: 15px;
  color: green;
  text-align: center;
  font-weight: bold;
}
</style>
