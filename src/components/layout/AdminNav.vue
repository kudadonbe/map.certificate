<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo & Navigation -->
        <div class="flex items-center gap-8">
          <router-link to="/" class="text-xl font-bold text-indigo-600">
            MAP Certificate
          </router-link>
          <div class="hidden md:flex gap-4">
            <router-link
              v-for="link in navLinks"
              :key="link.path"
              :to="link.path"
              :class="[
                'px-3 py-2 rounded-lg font-medium transition-colors',
                isActive(link.path)
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              {{ link.label }}
            </router-link>
          </div>
        </div>

        <!-- Right Side Actions -->
        <div class="flex items-center gap-4">
          <button class="p-2 text-gray-600 hover:text-gray-900 relative">
            <BellIcon class="w-6 h-6" />
            <span
              v-if="hasNotifications"
              class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
            ></span>
          </button>
          <button
            @click="toggleUserMenu"
            class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 relative"
          >
            <UserCircleIcon class="w-6 h-6" />
            <span class="hidden md:inline">{{ userName }}</span>
            <ChevronDownIcon class="w-4 h-4" />
          </button>

          <!-- User Dropdown Menu -->
          <div
            v-if="showUserMenu"
            class="absolute right-4 top-16 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          >
            <router-link
              to="/admin/profile"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Profile Settings
            </router-link>
            <button
              @click="logout"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="showMobileMenu" class="md:hidden border-t border-gray-200">
      <div class="px-4 py-3 space-y-1">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          :class="[
            'block px-3 py-2 rounded-lg font-medium',
            isActive(link.path)
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-gray-600 hover:bg-gray-50'
          ]"
        >
          {{ link.label }}
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { BellIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';

interface NavLink {
  path: string;
  label: string;
}

defineProps<{
  navLinks: NavLink[];
  userName?: string;
  hasNotifications?: boolean;
}>();

const router = useRouter();
const route = useRoute();

const showUserMenu = ref(false);
const showMobileMenu = ref(false);

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/');
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

function logout() {
  showUserMenu.value = false;
  router.push('/login');
}
</script>
