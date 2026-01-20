import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireAdmin, requireParticipant, guestOnly } from '@/middleware/auth.guards'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Profile from '@/views/Profile.vue'
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
    beforeEnter: guestOnly,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    beforeEnter: requireAdmin,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/participants',
    name: 'ParticipantsList',
    component: ParticipantsList,
    beforeEnter: requireAdmin,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/certificates',
    name: 'CertificateManagement',
    component: CertificateManagement,
    beforeEnter: requireAdmin,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/templates',
    name: 'TemplateManager',
    component: TemplateManager,
    beforeEnter: requireAdmin,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/participant/portal',
    name: 'ParticipantPortal',
    component: ParticipantPortal,
    beforeEnter: requireParticipant,
    meta: { requiresAuth: true, role: 'participant' }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
