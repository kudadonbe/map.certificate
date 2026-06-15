<template>
  <MapLayout>
    <!-- Page Header -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900">Dashboard</h2>
      <p class="text-gray-600 mt-2">Overview of MAP certificate management system</p>
    </div>

    <!-- Loading State -->
    <div v-if="participantsStore.isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <template v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Total Participants</p>
              <p class="text-3xl font-bold text-gray-900">{{ participantsStore.stats.totalParticipants }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UsersIcon class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Certificates Issued</p>
              <p class="text-3xl font-bold text-gray-900">{{ participantsStore.stats.certificatesIssued }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DocumentCheckIcon class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Pending Approval</p>
              <p class="text-3xl font-bold text-gray-900">{{ participantsStore.stats.pendingApproval }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ClockIcon class="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Emails Sent</p>
              <p class="text-3xl font-bold text-gray-900">{{ participantsStore.stats.emailsSent }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <EnvelopeIcon class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <button
              @click="$router.push('/map/participants')"
              class="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <UserPlusIcon class="w-5 h-5" />
              <span>Add New Participant</span>
            </button>
            <button
              @click="$router.push('/map/certificates')"
              class="w-full flex items-center gap-3 px-4 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
            >
              <DocumentPlusIcon class="w-5 h-5" />
              <span>Generate Certificates</span>
            </button>
            <button
              class="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <PaperAirplaneIcon class="w-5 h-5" />
              <span>Send Batch Emails</span>
            </button>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div v-if="participantsStore.recentActivity.length === 0" class="text-gray-500 text-sm py-4">
            No recent activity
          </div>
          <div v-else class="space-y-4">
            <div v-for="activity in participantsStore.recentActivity" :key="activity.id" class="flex items-start gap-3">
              <div class="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
              <div class="flex-1">
                <p class="text-sm text-gray-900">{{ activity.message }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatTimeAgo(activity.timestamp) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Approvals Table -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Pending Approvals</h3>
          <router-link
            to="/map/participants?status=pending"
            class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            View All
          </router-link>
        </div>
        <div v-if="participantsStore.pendingParticipants.length === 0" class="text-gray-500 text-sm py-8 text-center">
          No pending approvals
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Partner</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th class="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in participantsStore.pendingParticipants.slice(0, 5)"
                :key="item.id"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-3 px-4">
                  <div>
                    <p class="text-sm text-gray-900">{{ item.name }}</p>
                    <p class="text-xs text-gray-500">{{ item.name_dv }}</p>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div>
                    <p class="text-sm text-gray-600">{{ item.partner_name }}</p>
                    <p class="text-xs text-gray-500">{{ item.partner_name_dv }}</p>
                  </div>
                </td>
                <td class="py-3 px-4 text-sm text-gray-600">{{ formatDate(item.created_at) }}</td>
                <td class="py-3 px-4">
                  <span :class="getStatusClass(item.status)">
                    {{ formatStatus(item.status) }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <button
                    @click="reviewParticipant(item.id)"
                    class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Review
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </MapLayout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useParticipantsStore } from '@/stores/participants.store';
import type { ParticipantStatus } from '@/types/participant.types';
import MapLayout from '@/layouts/MapLayout.vue';
import {
  UsersIcon,
  DocumentCheckIcon,
  ClockIcon,
  EnvelopeIcon,
  UserPlusIcon,
  DocumentPlusIcon,
  PaperAirplaneIcon,
} from '@heroicons/vue/24/outline';

const router = useRouter();
const participantsStore = useParticipantsStore();

onMounted(async () => {
  await participantsStore.loadParticipants();
  await participantsStore.loadRecentActivity();
});

onUnmounted(() => {
  participantsStore.unsubscribe();
});

function formatDate(date: Date | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatTimeAgo(date: Date | undefined): string {
  if (!date) return '';
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function formatStatus(status: ParticipantStatus): string {
  const statusMap: Record<ParticipantStatus, string> = {
    pending: 'Pending',
    profile_submitted: 'Profile Submitted',
    verified: 'Verified',
    approved: 'Approved',
    certificate_sent: 'Certificate Sent'
  };
  return statusMap[status] || status;
}

function getStatusClass(status: ParticipantStatus): string {
  const baseClass = 'px-2 py-1 text-xs rounded-full';
  const statusClasses: Record<ParticipantStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    profile_submitted: 'bg-blue-100 text-blue-800',
    verified: 'bg-green-100 text-green-800',
    approved: 'bg-indigo-100 text-indigo-800',
    certificate_sent: 'bg-purple-100 text-purple-800'
  };
  return `${baseClass} ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
}

function reviewParticipant(id: string) {
  router.push(`/map/participants?id=${id}`);
}
</script>
