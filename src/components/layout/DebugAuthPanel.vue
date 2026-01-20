<template>
  <div
    v-if="isVisible"
    class="fixed bottom-4 right-4 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50"
  >
    <div class="flex justify-between items-center mb-3">
      <h3 class="font-bold text-gray-900">🔐 Auth Status</h3>
      <button
        @click="isVisible = false"
        class="text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </div>

    <div class="space-y-2 text-sm">
      <div class="flex items-center gap-2">
        <span class="font-semibold">Authenticated:</span>
        <span :class="isAuthenticated ? 'text-green-600' : 'text-red-600'">
          {{ isAuthenticated ? '✅ Yes' : '❌ No' }}
        </span>
      </div>

      <div v-if="isAuthenticated" class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="font-semibold">Role:</span>
          <span class="px-2 py-1 rounded text-xs font-medium"
                :class="isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
            {{ isAdmin ? 'Admin' : 'Participant' }}
          </span>
        </div>

        <div>
          <span class="font-semibold">Name:</span>
          <span class="text-gray-700 ml-2">{{ userDisplayName }}</span>
        </div>

        <div>
          <span class="font-semibold">Email:</span>
          <span class="text-gray-700 ml-2 text-xs">{{ userEmail }}</span>
        </div>

        <div v-if="user">
          <span class="font-semibold">Provider:</span>
          <span class="text-gray-700 ml-2">
            {{ user.provider === 'microsoft' ? 'Office 365' : 'Google' }}
          </span>
        </div>

        <div v-if="user?.lastLoginAt">
          <span class="font-semibold">Last Login:</span>
          <span class="text-gray-700 ml-2 text-xs">
            {{ formatDate(user.lastLoginAt) }}
          </span>
        </div>
      </div>

      <div v-else class="text-gray-500 italic">
        Not logged in
      </div>
    </div>

    <div v-if="error" class="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
      <strong>Error:</strong> {{ error }}
    </div>
  </div>

  <!-- Toggle Button -->
  <button
    v-if="!isVisible"
    @click="isVisible = true"
    class="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors z-50 text-sm font-medium"
    title="Show Auth Debug Panel"
  >
    🔐 Auth Status
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';

const { user, isAuthenticated, isAdmin, userEmail, userDisplayName, error } = useAuth();
const isVisible = ref(true);

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}
</script>
