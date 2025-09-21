<template>
  <div class="form-container">
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
      <input v-model="studentId" type="text" placeholder="6430XXXXXX" required />

      <label>รหัสผ่าน</label>
      <input v-model="password" type="password" placeholder="สร้างรหัสผ่าน" required />

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
import { getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAmfunEqGUmZHabiPKYwCuay3JCRVXa_DU",
  authDomain: "project-web-f9a73.firebaseapp.com",
  projectId: "project-web-f9a73",
  storageBucket: "project-web-f9a73.firebasestorage.app",
  messagingSenderId: "809705005062",
  appId: "1:809705005062:web:f4736c194fc7cf68c5e387",
  measurementId: "G-BK760T9XCW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default {
  name: "Register",
  setup() {
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

    const registerUser = async () => {
      errorMessage.value = "";
      successMessage.value = "";
      loading.value = true;

      const cleanStudentId = studentId.value.replace(/[^0-9]/g, "");

      if (cleanStudentId.length !== 10) {
        errorMessage.value = "กรุณาใส่รหัสนักศึกษาให้ครบ 10 ตัวอักษร (เฉพาะตัวเลข)";
        loading.value = false;
        return;
      }

      try {
        const q = query(
          collection(db, "users"),
          where("studentIdClean", "==", cleanStudentId)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          errorMessage.value = "รหัสนักศึกษานี้มีอยู่แล้วในระบบ";
        } else {
          const data = {
            fullName: fullName.value,
            faculty: faculty.value,
            major: major.value,
            year: year.value,
            studentId: studentId.value,
            studentIdClean: cleanStudentId,
            password: password.value,
            favoriteThing: favoriteThing.value,
            createdAt: new Date().toISOString()
          };

          await addDoc(collection(db, "users"), data);
          successMessage.value = "สมัครเรียบร้อยแล้ว!";
          fullName.value = "";
          faculty.value = "";
          major.value = "";
          year.value = "";
          studentId.value = "";
          password.value = "";
          favoriteThing.value = "";
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
      registerUser
    };
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
