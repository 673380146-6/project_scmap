import { createRouter, createWebHistory } from 'vue-router'
import Map from '../pages/map.vue'
import Home from '../pages/index.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/map', component: Map }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router