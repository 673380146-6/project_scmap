import { createApp } from 'vue';
import App from './App.vue';
import router from './routes';
// Firebase config ไม่จำเป็น เพราะเราใช้ Backend API

createApp(App).use(router).mount('#app');
