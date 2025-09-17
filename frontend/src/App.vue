<script setup>
import { ref } from 'vue'
import My3DViewer from './components/My3DViewer.vue'

// state เพื่อควบคุมว่าเลือกอะไร
const selected = ref(null)
</script>

<template>
  <div class="container">
    <h1>SCIENCE MAP</h1>

    <!-- ปุ่มเมนูจำลอง -->
    <div class="menu">
      <button @click="selected = 'SC01'">SC01</button>
      <button @click="selected = 'SC02'">SC02</button>
      <button @click="selected = 'FOOD'">ศูนย์อาหาร</button>
    </div>

    <!-- แสดง 3D Viewer เมื่อเลือก SC01 -->
    <div v-if="selected === 'SC01'">
      <My3DViewer modelPath="/models/webmodel.obj.glb" />
    </div>

    <!-- กรณีเลือกอย่างอื่น -->
    <div v-else-if="selected === 'SC02'">
      <p>SC02: ยังไม่มีโมเดล</p>
    </div>
    <div v-else-if="selected === 'FOOD'">
      <p>ศูนย์อาหาร: รหัส 09</p>
    </div>

    <div v-else>
      <p>← กรุณาเลือกเมนู</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  text-align: center;
  padding: 40px;
}

.menu button {
  margin: 10px;
  padding: 10px 20px;
  font-size: 16px;
}
</style>
