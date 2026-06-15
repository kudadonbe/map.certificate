import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { requireAuth, requireAdmin, requireOfficer, requireParticipant, guestOnly } from '@/middleware/auth.guards'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Profile from '@/views/Profile.vue'
import Dashboard from '@/views/admin/Dashboard.vue'
import ParticipantsList from '@/views/admin/ParticipantsList.vue'
import CertificateManagement from '@/views/admin/CertificateManagement.vue'
import TemplateManager from '@/views/admin/template/TemplateManager.vue'
import AdminManagement from '@/views/admin/AdminManagement.vue'
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
  // MAP Module routes - accessible to Family Court staff
  {
    path: '/map/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    beforeEnter: requireOfficer,
    meta: { requiresAuth: true, role: 'officer' }
  },
  {
    path: '/map/participants',
    name: 'ParticipantsList',
    component: ParticipantsList,
    beforeEnter: requireOfficer,
    meta: { requiresAuth: true, role: 'officer' }
  },
  {
    path: '/map/certificates',
    name: 'CertificateManagement',
    component: CertificateManagement,
    beforeEnter: requireOfficer,
    meta: { requiresAuth: true, role: 'officer' }
  },
  {
    path: '/map/templates',
    name: 'TemplateManager',
    component: TemplateManager,
    beforeEnter: requireOfficer,
    meta: { requiresAuth: true, role: 'officer' }
  },
  // Admin routes - requires admin or higher role
  {
    path: '/map/users',
    name: 'AdminManagement',
    component: AdminManagement,
    beforeEnter: requireAdmin,
    meta: { requiresAuth: true, role: 'admin' }
  },
  // Participant routes
  {
    path: '/participant/portal',
    name: 'ParticipantPortal',
    component: ParticipantPortal,
    beforeEnter: requireParticipant,
    meta: { requiresAuth: true, role: 'participant' }
  },
]

const router = createRouter({
  history: import.meta.env.MODE === 'pages'
    ? createWebHashHistory(import.meta.env.BASE_URL)
    : createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
