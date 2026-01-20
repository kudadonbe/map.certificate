<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-indigo-600">MAP Certificate</h1>
          </div>
          <div class="flex items-center gap-4">
            <button
              @click="$router.push('/')"
              class="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Home
            </button>
            <button
              @click="logout"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center gap-2"
            >
              <ArrowRightOnRectangleIcon class="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Profile Header -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div class="flex items-center gap-6 mb-6">
          <div class="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
            <img
              v-if="user?.photoURL"
              :src="user.photoURL"
              :alt="user.displayName || 'User'"
              class="w-full h-full object-cover"
            />
            <UserIcon v-else class="w-12 h-12 text-indigo-600" />
          </div>
          <div>
            <h2 class="text-3xl font-bold text-gray-900">{{ user?.displayName || 'User' }}</h2>
            <p class="text-gray-600">{{ user?.email }}</p>
            <span class="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
              {{ roleLabel }}
            </span>
          </div>
        </div>

        <div class="border-t border-gray-200 pt-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <p class="text-gray-900">{{ user?.displayName || 'Not set' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <p class="text-gray-900">{{ user?.email }}</p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Primary Role</label>
                <p class="text-gray-900">{{ roleLabel }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                <p class="text-gray-900">{{ formatDate(user?.createdAt) }}</p>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">All Roles</label>
              <div class="flex gap-2 flex-wrap">
                <span
                  v-for="role in userRoles"
                  :key="role"
                  class="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full"
                >
                  {{ role.charAt(0).toUpperCase() + role.slice(1) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Participant Info -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center gap-3 mb-4">
            <DocumentTextIcon class="w-6 h-6 text-indigo-600" />
            <h3 class="text-lg font-semibold text-gray-900">Certificate Status</h3>
          </div>
          <p v-if="user?.participantId" class="text-gray-600">
            You have an active participant record. Visit the Participant Portal to view your certificates.
          </p>
          <p v-else class="text-gray-600">
            You don't have any certificates yet. Contact the administrator to enroll in the program.
          </p>
        </div>

        <!-- Account Info -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center gap-3 mb-4">
            <InformationCircleIcon class="w-6 h-6 text-indigo-600" />
            <h3 class="text-lg font-semibold text-gray-900">Account Information</h3>
          </div>
          <p class="text-gray-600 mb-3">
            Last login: {{ formatDate(user?.lastLoginAt) }}
          </p>
          <p class="text-gray-600">
            Provider: {{ user?.provider === 'google' ? 'Google' : 'Microsoft' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { getPrimaryRoleLabel } from '@/utils/role.helpers';
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline';

const router = useRouter();
const { user, logout: authLogout, userRoles } = useAuth();

const roleLabel = computed(() => getPrimaryRoleLabel(user.value));

function formatDate(date: Date | undefined): string {
  if (!date) return 'Unknown';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

async function logout() {
  await authLogout();
  router.push('/');
}
</script>
