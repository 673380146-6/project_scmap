<script setup>
import { ref } from 'vue'
import My3DViewer from './components/My3DViewer.vue'

const selected = ref(null)
function goToLogin() {
  const bg = document.getElementById('welcome')
  bg.classList.add('exit')
  setTimeout(() => {
    // ใช้ router จาก context
    window.location.href = '/login'
  }, 800)
}
</script>

<template>
  <router-view />
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
