<template>
  <div class="page-container">
    <form class="form" @submit.prevent="registerUser">
      <h2>สมัครสมาชิก</h2>

      <label>ชื่อ - นามสกุล</label>
      <input v-model="fullName" type="text" placeholder="ชื่อ - นามสกุล" required />

      <label>คณะ</label>
      <input v-model="faculty" type="text" placeholder="เช่น วิทยาศาสตร์" required />

      <label>สาขา</label>
      <input v-model="major" type="text" placeholder="เช่น วิทยาการคอมพิวเตอร์" required />

      <label>ชั้นปี</label>
      <select v-model="year" required>
        <option value="">-- เลือกชั้นปี --</option>
        <option value="1">ปี 1</option>
        <option value="2">ปี 2</option>
        <option value="3">ปี 3</option>
        <option value="4">ปี 4</option>
      </select>

      <label>รหัสนักศึกษา</label>
      <input v-model="studentId" type="text" placeholder="673380198-7" required />

      <label>รหัสผ่าน</label>
      <div class="password-input-container">
        <input 
          v-model="password" 
          :type="showPassword ? 'text' : 'password'" 
          placeholder="สร้างรหัสผ่าน" 
          required 
        />
        <button 
          type="button" 
          class="password-toggle-btn" 
          @click="togglePasswordVisibility"
          :title="showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'"
        >
          {{ showPassword ? '🙈' : '👁️' }}
        </button>
      </div>

      <div class="section-title">ยืนยันตัวตน</div>
      <label>สิ่งของที่คุณชอบ</label>
      <input v-model="favoriteThing" type="text" placeholder="เช่น หนังสือ, หมา, กระเป๋า..." required />

      <button type="submit" class="button-submit" :disabled="loading">
        {{ loading ? "กำลังสมัคร..." : "สมัครสมาชิก" }}
      </button>

      <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      <div class="success-message" v-if="successMessage">{{ successMessage }}</div>

      <div class="text-center">
        มีบัญชีอยู่แล้ว? <router-link to="/login">เข้าสู่ระบบ</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/api.js";

export default {
  name: "Register",
  setup() {
    const router = useRouter();
    const fullName = ref("");
    const faculty = ref("");
    const major = ref("");
    const year = ref("");
    const studentId = ref("");
    const password = ref("");
    const favoriteThing = ref("");
    const errorMessage = ref("");
    const successMessage = ref("");
    const loading = ref(false);
    const showPassword = ref(false);

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };
    
    const registerUser = async () => {
      errorMessage.value = "";
      successMessage.value = "";
      loading.value = true;

      try {
        // ตรวจสอบรหัสนักศึกษา (รูปแบบ XXXXXXXXX-X)
        const studentIdValue = studentId.value.trim();
        
        // ตรวจสอบรูปแบบ: 9 หลัก-1 หลัก หรือ 10 หลักต่อเนื่อง
        const studentIdPattern = /^[0-9]{9}-[0-9]{1}$|^[0-9]{10}$/;
        if (!studentIdPattern.test(studentIdValue)) {
          errorMessage.value = "กรุณาใส่รหัสนักศึกษาให้ถูกต้อง (รูปแบบ: XXXXXXXXX-X หรือ XXXXXXXXXX)";
          loading.value = false;
          return;
        }
        
        // จัดรูปแบบรหัสนักศึกษาให้เป็น XXXXXXXXX-X
        let formattedStudentId = studentIdValue;
        if (studentIdValue.length === 10 && !studentIdValue.includes('-')) {
          formattedStudentId = studentIdValue.substring(0, 9) + '-' + studentIdValue.substring(9);
        }

        // ตรวจสอบรหัสผ่าน
        if (password.value.length < 6) {
          errorMessage.value = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
          loading.value = false;
          return;
        }

        // เตรียมข้อมูลเพื่อส่งไป backend (ไม่ต้องมี email)
        const userData = {
          name: fullName.value,
          role: "user",
          faculty: faculty.value,
          major: major.value,
          year: year.value,
          studentId: formattedStudentId,
          password: password.value,
          favoriteThing: favoriteThing.value
        };

        // ส่งข้อมูลไป backend ผ่าน auth/register endpoint
        const response = await apiService.register(userData);
        
        if (response.success) {
          successMessage.value = "สมัครเรียบร้อยแล้ว! กำลังเปลี่ยนหน้า...";
          
          // ล้างฟอร์ม
          fullName.value = "";
          faculty.value = "";
          major.value = "";
          year.value = "";
          studentId.value = "";
          password.value = "";
          favoriteThing.value = "";

          // เปลี่ยนไปหน้า login หลังจาก 2 วินาที
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } catch (error) {
        errorMessage.value = "เกิดข้อผิดพลาด: " + error.message;
      } finally {
        loading.value = false;
      }
    };

    return {
      fullName,
      faculty,
      major,
      year,
      studentId,
      password,
      favoriteThing,
      errorMessage,
      successMessage,
      loading,
      showPassword,
      togglePasswordVisibility,
      registerUser
    };
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* จัดเต็มจอ */
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

input, select {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #ccc;
  outline: none;
  font-size: 16px;
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-container input {
  padding-right: 50px;
}

.password-toggle-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 5px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.password-toggle-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
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

.section-title {
  font-size: 16px;
  margin-top: 25px;
  font-weight: bold;
  color: #333;
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
