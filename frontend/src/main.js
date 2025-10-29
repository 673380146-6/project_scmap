import { createApp } from 'vue';
import App from './App.vue';
import router from './routes';
import './firebase/config';  // Import Firebase configuration

createApp(App).use(router).mount('#app');
