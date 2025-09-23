import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/login.vue'
import Register from '../pages/register.vue'
import Map from '../pages/map.vue'
import AdminDashboard from '../pages/admin-dashboard.vue'
import ForgotPassword from '../pages/forgot-password.vue'
import Home from '../pages/index.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/map', component: Map },
  { path: '/admin-dashboard', component: AdminDashboard },
  { path: '/forgot-password', component: ForgotPassword }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router