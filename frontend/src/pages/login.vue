<template>
  <div class="page-container">
    <form class="form" @submit.prevent="login">
      <h2>ขอต้อนรับกลับมา</h2>

      <label>รหัสนักศึกษา</label>
      <input v-model="username" type="text" placeholder="เช่น 673380198-7" required />

      <label>รหัสผ่าน</label>
      <div class="password-input-container">
        <input 
          v-model="password" 
          :type="showPassword ? 'text' : 'password'" 
          placeholder="รหัสผ่าน" 
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

      <button type="submit" class="button-submit" :disabled="loading">
        {{ loading ? "กำลังเข้าสู่ระบบ..." : "ดำเนินการต่อ" }}
      </button>

      <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>

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
import { useRouter } from "vue-router";
import apiService from "@/services/api.js";

export default {
  name: "LoginPage",
  setup() {
    const router = useRouter();
    const username = ref("");
    const password = ref("");
    const loading = ref(false);
    const errorMessage = ref("");
    const showPassword = ref(false);

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    const login = async () => {
      errorMessage.value = "";
      loading.value = true;

      try {
        // ตรวจสอบว่ากรอกข้อมูลครบ
        if (!username.value || !password.value) {
          errorMessage.value = "กรุณากรอกรหัสนักศึกษาและรหัสผ่าน";
          loading.value = false;
          return;
        }

        // เตรียมข้อมูล - จัดรูปแบบรหัสนักศึกษา
        const studentIdValue = username.value.trim();
        
        // ตรวจสอบรูปแบบ
        const studentIdPattern = /^[0-9]{9}-[0-9]{1}$|^[0-9]{10}$/;
        if (!studentIdPattern.test(studentIdValue)) {
          errorMessage.value = "รูปแบบรหัสนักศึกษาไม่ถูกต้อง (เช่น 673380198-7)";
          loading.value = false;
          return;
        }
        
        // จัดรูปแบบรหัสนักศึกษาให้เป็น XXXXXXXXX-X
        let formattedStudentId = studentIdValue;
        if (studentIdValue.length === 10 && !studentIdValue.includes('-')) {
          formattedStudentId = studentIdValue.substring(0, 9) + '-' + studentIdValue.substring(9);
        }

        // เรียก API login ด้วย studentId
        const response = await apiService.login(formattedStudentId, password.value);

        if (response.success) {
          errorMessage.value = "";
          
          // บันทึก token และข้อมูล user
          localStorage.setItem("token", response.token);
          localStorage.setItem("userId", response.user.id);
          localStorage.setItem("userName", response.user.name);
          localStorage.setItem("studentId", response.user.studentId);
          localStorage.setItem("role", response.user.role);

          // เปลี่ยนไปหน้า map หรือ dashboard
          setTimeout(() => {
            if (response.user.role === "admin") {
              router.push("/admin-dashboard");
            } else {
              router.push("/map");
            }
          }, 500);
        } else {
          errorMessage.value = response.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
        }
      } catch (error) {
        errorMessage.value = error.message || "เกิดข้อผิดพลาด: เก็บรหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง";
      } finally {
        loading.value = false;
      }
    };

    return {
      username,
      password,
      loading,
      errorMessage,
      showPassword,
      togglePasswordVisibility,
      login
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
  box-sizing: border-box;
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

.button-submit:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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

.forgot {
  color: #f33;
  font-size: 14px;
}

.forgot:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 15px;
  color: #d32f2f;
  background-color: #ffebee;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
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
</style>
