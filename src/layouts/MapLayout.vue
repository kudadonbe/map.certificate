<template>
  <div class="min-h-screen flex flex-col bg-fc-25">
    <!-- Header -->
    <header class="bg-white border-b border-fc-100 sticky top-0 z-40">
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
            <router-link to="/map/dashboard" class="flex items-center gap-2">
              <div class="w-8 h-8 bg-fc-50 rounded-lg flex items-center justify-center">
                <DocumentCheckIcon class="w-5 h-5 text-fc-700" />
              </div>
              <span class="text-lg font-bold text-fc-700">MAP</span>
            </router-link>
          </div>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-1">
            <router-link
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              :class="[
                'px-3 py-2 rounded-lg font-medium transition-colors',
                isActive(item.to)
                  ? 'text-fc-700 bg-fc-50'
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              {{ item.label }}
            </router-link>
            <router-link
              v-if="authStore.canManageUsers"
              to="/map/users"
              :class="[
                'px-3 py-2 rounded-lg font-medium transition-colors',
                isActive('/map/users')
                  ? 'text-fc-700 bg-fc-50'
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              Users
            </router-link>
          </nav>

          <!-- Right side actions -->
          <div class="flex items-center gap-2">
            <!-- Mobile menu button -->
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="md:hidden p-2 text-gray-600 hover:text-fc-700 hover:bg-fc-50 rounded-lg"
            >
              <Bars3Icon class="w-6 h-6" />
            </button>

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
              <span class="hidden lg:inline font-medium">{{ authStore.userDisplayName }}</span>
            </router-link>
            <button
              @click="handleLogout"
              class="p-2 text-gray-600 hover:text-fc-700 hover:bg-fc-50 rounded-lg"
              title="Logout"
            >
              <ArrowRightStartOnRectangleIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div
        v-if="mobileMenuOpen"
        class="md:hidden border-t border-fc-100 bg-white"
      >
        <div class="px-4 py-3 space-y-1">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            @click="mobileMenuOpen = false"
            :class="[
              'block px-3 py-2 rounded-lg font-medium transition-colors',
              isActive(item.to)
              ? 'text-fc-700 bg-fc-50'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            {{ item.label }}
          </router-link>
          <router-link
            v-if="authStore.canManageUsers"
            to="/map/users"
            @click="mobileMenuOpen = false"
            :class="[
              'block px-3 py-2 rounded-lg font-medium transition-colors',
              isActive('/map/users')
              ? 'text-fc-700 bg-fc-50'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            Users
          </router-link>
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
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <div class="flex items-center gap-2">
            <DocumentCheckIcon class="w-4 h-4 text-fc-600" />
            <span>MAP - Marriage Awareness Program</span>
          </div>
          <div class="flex items-center gap-4">
            <span>Family Court, Maldives</span>
            <span class="hidden sm:inline">|</span>
            <span>AQD Platform v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import ProfileAvatar from '@/components/layout/ProfileAvatar.vue';
import {
  BuildingLibraryIcon,
  DocumentCheckIcon,
  BellIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronRightIcon,
  Bars3Icon,
} from '@heroicons/vue/24/outline';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const mobileMenuOpen = ref(false);

const navItems = [
  { to: '/map/dashboard', label: 'Dashboard' },
  { to: '/map/participants', label: 'Participants' },
  { to: '/map/certificates', label: 'Certificates' },
  { to: '/map/templates', label: 'Templates' },
];

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/');
}

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>
