import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/admin/Dashboard.vue'
import ParticipantsList from '@/views/admin/ParticipantsList.vue'
import CertificateManagement from '@/views/admin/CertificateManagement.vue'
import TemplateManager from '@/views/admin/template/TemplateManager.vue'
import ParticipantPortal from '@/views/participant/Portal.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/admin/participants',
    name: 'ParticipantsList',
    component: ParticipantsList,
  },
  {
    path: '/admin/certificates',
    name: 'CertificateManagement',
    component: CertificateManagement,
  },
  {
    path: '/admin/templates',
    name: 'TemplateManager',
    component: TemplateManager,
  },
  {
    path: '/participant/portal',
    name: 'ParticipantPortal',
    component: ParticipantPortal,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
