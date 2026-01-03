<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-8">
            <h1 class="text-xl font-bold text-indigo-600">MAP Certificate</h1>
            <div class="hidden md:flex gap-4">
              <router-link
                to="/admin/dashboard"
                class="px-3 py-2 rounded-lg text-indigo-600 bg-indigo-50 font-medium"
              >
                Dashboard
              </router-link>
              <router-link
                to="/admin/participants"
                class="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
              >
                Participants
              </router-link>
              <router-link
                to="/admin/certificates"
                class="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
              >
                Certificates
              </router-link>
              <router-link
                to="/admin/templates"
                class="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
              >
                Templates
              </router-link>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button class="p-2 text-gray-600 hover:text-gray-900">
              <BellIcon class="w-6 h-6" />
            </button>
            <button @click="logout" class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900">
              <UserCircleIcon class="w-6 h-6" />
              <span class="hidden md:inline">Admin User</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p class="text-gray-600 mt-2">Overview of certificate management system</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Total Participants</p>
              <p class="text-3xl font-bold text-gray-900">{{ stats.totalParticipants }}</p>
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
              <p class="text-3xl font-bold text-gray-900">{{ stats.certificatesIssued }}</p>
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
              <p class="text-3xl font-bold text-gray-900">{{ stats.pendingApproval }}</p>
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
              <p class="text-3xl font-bold text-gray-900">{{ stats.emailsSent }}</p>
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
              @click="$router.push('/admin/participants')"
              class="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <UserPlusIcon class="w-5 h-5" />
              <span>Add New Participant</span>
            </button>
            <button
              @click="$router.push('/admin/certificates')"
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
          <div class="space-y-4">
            <div v-for="activity in recentActivity" :key="activity.id" class="flex items-start gap-3">
              <div class="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
              <div class="flex-1">
                <p class="text-sm text-gray-900">{{ activity.message }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Approvals Table -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Pending Approvals</h3>
          <button class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View All
          </button>
        </div>
        <div class="overflow-x-auto">
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
              <tr v-for="item in pendingItems" :key="item.id" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4 text-sm text-gray-900">{{ item.name }}</td>
                <td class="py-3 px-4 text-sm text-gray-600">{{ item.partner }}</td>
                <td class="py-3 px-4 text-sm text-gray-600">{{ item.date }}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    {{ item.status }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <button class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    Review
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  BellIcon,
  UserCircleIcon,
  UsersIcon,
  DocumentCheckIcon,
  ClockIcon,
  EnvelopeIcon,
  UserPlusIcon,
  DocumentPlusIcon,
  PaperAirplaneIcon,
} from '@heroicons/vue/24/outline';

const router = useRouter();

const stats = ref({
  totalParticipants: 248,
  certificatesIssued: 186,
  pendingApproval: 12,
  emailsSent: 186,
});

const recentActivity = ref([
  { id: 1, message: 'Certificate generated for Ahmed Ali', time: '5 minutes ago' },
  { id: 2, message: 'New participant registered: Mohamed Hassan', time: '15 minutes ago' },
  { id: 3, message: 'Batch email sent to 25 participants', time: '1 hour ago' },
  { id: 4, message: 'Template updated: Default Certificate', time: '2 hours ago' },
]);

const pendingItems = ref([
  { id: 1, name: 'Ahmed Ali', partner: 'Aminath Sara', date: '2026-01-02', status: 'Pending' },
  { id: 2, name: 'Mohamed Hassan', partner: 'Fathimath Leena', date: '2026-01-02', status: 'Pending' },
  { id: 3, name: 'Ibrahim Ahmed', partner: 'Mariyam Didi', date: '2026-01-01', status: 'Pending' },
]);

function logout() {
  router.push('/login');
}
</script>
