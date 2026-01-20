<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Debug Auth Panel (only in development) -->
    <DebugAuthPanel v-if="isDev" />
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-indigo-600">MAP Certificate</h1>
          </div>

          <!-- Logged In Navigation -->
          <div v-if="isAuthenticated" class="flex items-center gap-4">
            <span class="text-gray-700">Welcome, {{ userDisplayName }}!</span>
            <button
              @click="navigateToPortal"
              class="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              {{ isAdmin ? 'Admin Dashboard' : isParticipant ? 'My Portal' : 'My Profile' }}
            </button>
            <button
              @click="logout"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center gap-2"
            >
              <ArrowRightOnRectangleIcon class="w-5 h-5" />
              Logout
            </button>
          </div>

          <!-- Logged Out Navigation -->
          <div v-else class="flex gap-4">
            <button
              @click="navigateToLogin"
              class="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Admin Login
            </button>
            <button
              @click="navigateToLogin"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Participant Login
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center">
        <h2 class="text-5xl font-bold text-gray-900 mb-6">
          Marriage Awareness Program
        </h2>
        <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Access your Marriage Awareness Program certificates and information online. Login to view your certificates, enroll in sessions, and manage your program participation.
        </p>

        <!-- Logged In CTAs -->
        <div v-if="isAuthenticated" class="flex gap-4 justify-center">
          <button
            @click="navigateToPortal"
            class="px-8 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            {{ isAdmin ? 'Go to Admin Dashboard' : isParticipant ? 'Go to My Portal' : 'Go to My Profile' }}
          </button>
        </div>

        <!-- Logged Out CTAs -->
        <div v-else class="flex gap-4 justify-center">
          <button
            @click="navigateToLogin"
            class="px-8 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Get Started
          </button>
          <a
            href="#features"
            class="px-8 py-3 bg-white text-indigo-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg border-2 border-indigo-600"
          >
            Learn More
          </a>
        </div>
      </div>

      <!-- Features Grid -->
      <div id="features" class="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white rounded-xl p-8 shadow-lg">
          <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <DocumentIcon class="w-6 h-6 text-indigo-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            Certificate Generation
          </h3>
          <p class="text-gray-600">
            Automatically generate professional PDF certificates with customizable templates
          </p>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-lg">
          <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <EnvelopeIcon class="w-6 h-6 text-indigo-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            Email Distribution
          </h3>
          <p class="text-gray-600">
            Send certificates to participants automatically via email with one click
          </p>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-lg">
          <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <UserGroupIcon class="w-6 h-6 text-indigo-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            Participant Portal
          </h3>
          <p class="text-gray-600">
            Participants can view, download, and manage their certificates online
          </p>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-lg">
          <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <ShieldCheckIcon class="w-6 h-6 text-indigo-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            Secure Authentication
          </h3>
          <p class="text-gray-600">
            Multi-provider authentication with Office 365 for admins and Google OAuth for participants
          </p>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-lg">
          <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <LanguageIcon class="w-6 h-6 text-indigo-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            Bilingual Support
          </h3>
          <p class="text-gray-600">
            Full support for English and Dhivehi languages on certificates
          </p>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-lg">
          <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <CloudIcon class="w-6 h-6 text-indigo-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            Cloud Storage
          </h3>
          <p class="text-gray-600">
            Secure PDF storage with Firebase and role-based access control
          </p>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="mt-24 bg-white rounded-xl shadow-lg p-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div class="text-4xl font-bold text-indigo-600 mb-2">90%</div>
            <div class="text-gray-600">Time Savings</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-indigo-600 mb-2">100%</div>
            <div class="text-gray-600">Automated</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-indigo-600 mb-2">Secure</div>
            <div class="text-gray-600">Firebase Backend</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-gray-600">
          <p class="mb-2">Family Court, Maldives</p>
          <p class="text-sm">Email: info@familycourt.gov.mv</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import DebugAuthPanel from '@/components/layout/DebugAuthPanel.vue';
import {
  DocumentIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CloudIcon,
  LanguageIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline';

const router = useRouter();
const { isAuthenticated, isAdmin, isParticipant, isPublic, userDisplayName, logout } = useAuth();
const isDev = import.meta.env.DEV; // Only show in development mode

function navigateToPortal() {
  if (isAdmin.value) {
    router.push('/admin/dashboard');
  } else if (isParticipant.value) {
    router.push('/participant/portal');
  } else if (isPublic.value) {
    router.push('/profile');
  } else {
    router.push('/login');
  }
}

function navigateToLogin() {
  router.push('/login');
}
</script>
