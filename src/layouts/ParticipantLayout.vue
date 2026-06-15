<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-fc-25 to-fc-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo & Breadcrumb -->
          <div class="flex items-center gap-4">
            <router-link to="/" class="flex items-center gap-2">
              <div class="w-9 h-9 bg-gradient-to-br from-fc-800 to-fc-700 rounded-lg flex items-center justify-center">
                <BuildingLibraryIcon class="w-5 h-5 text-white" />
              </div>
            </router-link>
            <ChevronRightIcon class="w-5 h-5 text-gray-300" />
            <router-link to="/participant/portal" class="flex items-center gap-2">
              <DocumentCheckIcon class="w-6 h-6 text-fc-700" />
              <span class="text-lg font-bold text-fc-700">My Certificates</span>
            </router-link>
          </div>

          <!-- Right side actions -->
          <div class="flex items-center gap-2">
            <button class="p-2 text-gray-600 hover:text-fc-700 hover:bg-fc-50 rounded-lg">
              <BellIcon class="w-6 h-6" />
            </button>
            <router-link
              to="/profile"
              class="flex items-center gap-2 px-2 py-2 text-gray-600 hover:text-fc-700 hover:bg-fc-50 rounded-lg"
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
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white/80 backdrop-blur border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <div class="flex items-center gap-2">
            <DocumentCheckIcon class="w-4 h-4 text-fc-600" />
            <span>MAP - Marriage Awareness Program</span>
          </div>
          <div class="flex items-center gap-4">
            <a href="mailto:map@familycourt.gov.mv" class="hover:text-fc-700 flex items-center gap-1">
              <EnvelopeIcon class="w-4 h-4" />
              <span>Support</span>
            </a>
            <span>|</span>
            <span>Family Court, Maldives</span>
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
  DocumentCheckIcon,
  BellIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronRightIcon,
  EnvelopeIcon,
} from '@heroicons/vue/24/outline';

const router = useRouter();
const authStore = useAuthStore();

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>
