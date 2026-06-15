<template>
  <div class="min-h-screen flex flex-col bg-fc-25">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-fc-800 to-fc-700 rounded-lg flex items-center justify-center">
              <BuildingLibraryIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">AQD</h1>
              <p class="text-xs text-gray-500 hidden sm:block">Family Court Digital Platform</p>
            </div>
          </router-link>

          <!-- Right side actions -->
          <div class="flex items-center gap-4">
            <slot name="header-actions">
              <!-- Default header actions -->
              <template v-if="authStore.isAuthenticated">
                <button class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <BellIcon class="w-6 h-6" />
                </button>
                <router-link
                  to="/profile"
                  class="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <ProfileAvatar
                    :photo-url="authStore.user?.photoURL"
                    :display-name="authStore.user?.displayName"
                    :email="authStore.user?.email"
                  />
                  <span class="hidden md:inline font-medium">{{ authStore.userDisplayName }}</span>
                </router-link>
                <button
                  @click="handleLogout"
                  class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title="Logout"
                >
                  <ArrowRightStartOnRectangleIcon class="w-5 h-5" />
                </button>
              </template>
              <template v-else>
                <router-link
                  to="/login"
                  class="px-4 py-2 text-fc-700 hover:text-fc-900 font-medium"
                >
                  Login
                </router-link>
              </template>
            </slot>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gradient-to-br from-fc-800 to-fc-700 rounded-lg flex items-center justify-center">
              <BuildingLibraryIcon class="w-4 h-4 text-white" />
            </div>
            <div>
              <p class="font-semibold text-gray-900">Family Court, Maldives</p>
              <p class="text-xs text-gray-500">Justice Building, Orchid Magu, Male', Maldives</p>
            </div>
          </div>
          <div class="flex items-center gap-6 text-sm text-gray-500">
            <a href="mailto:info@familycourt.gov.mv" class="hover:text-fc-700 flex items-center gap-1">
              <EnvelopeIcon class="w-4 h-4" />
              <span class="hidden sm:inline">info@familycourt.gov.mv</span>
            </a>
            <a href="tel:+9603323894" class="hover:text-fc-700 flex items-center gap-1">
              <PhoneIcon class="w-4 h-4" />
              <span class="hidden sm:inline">+960 332 3894</span>
            </a>
          </div>
          <div class="text-sm text-gray-500">
            AQD Platform v1.0
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import ProfileAvatar from '@/components/layout/ProfileAvatar.vue';
import {
  BuildingLibraryIcon,
  BellIcon,
  ArrowRightStartOnRectangleIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/vue/24/outline';

const router = useRouter();
const authStore = useAuthStore();

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>
