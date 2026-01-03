<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation (reuse from Dashboard) -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-8">
            <h1 class="text-xl font-bold text-indigo-600">MAP Certificate</h1>
            <div class="hidden md:flex gap-4">
              <router-link to="/admin/dashboard" class="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Dashboard</router-link>
              <router-link to="/admin/participants" class="px-3 py-2 rounded-lg text-indigo-600 bg-indigo-50 font-medium">Participants</router-link>
              <router-link to="/admin/certificates" class="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Certificates</router-link>
              <router-link to="/admin/templates" class="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Templates</router-link>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button class="p-2 text-gray-600 hover:text-gray-900">
              <BellIcon class="w-6 h-6" />
            </button>
            <button class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900">
              <UserCircleIcon class="w-6 h-6" />
              <span class="hidden md:inline">Admin User</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-3xl font-bold text-gray-900">Participants</h2>
          <p class="text-gray-600 mt-2">Manage program participants and approvals</p>
        </div>
        <button
          @click="showAddModal = true"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <UserPlusIcon class="w-5 h-5" />
          <span>Add Participant</span>
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="filterStatus"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="approved">Approved</option>
              <option value="certificate_sent">Certificate Sent</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <input
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div class="flex items-end">
            <button
              class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Participants Table -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  <input type="checkbox" class="rounded" />
                </th>
                <th class="text-left py-4 px-6 text-sm font-semibold text-gray-600">Name (EN)</th>
                <th class="text-left py-4 px-6 text-sm font-semibold text-gray-600">Name (DV)</th>
                <th class="text-left py-4 px-6 text-sm font-semibold text-gray-600">Partner</th>
                <th class="text-left py-4 px-6 text-sm font-semibold text-gray-600">Email</th>
                <th class="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                <th class="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                <th class="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="participant in participants"
                :key="participant.id"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-4 px-6">
                  <input type="checkbox" class="rounded" />
                </td>
                <td class="py-4 px-6 text-sm text-gray-900">{{ participant.name }}</td>
                <td class="py-4 px-6 text-sm text-gray-900">{{ participant.name_dv }}</td>
                <td class="py-4 px-6 text-sm text-gray-600">{{ participant.partner_name }}</td>
                <td class="py-4 px-6 text-sm text-gray-600">{{ participant.email }}</td>
                <td class="py-4 px-6">
                  <span
                    :class="[
                      'px-2 py-1 text-xs rounded-full',
                      getStatusClass(participant.status)
                    ]"
                  >
                    {{ participant.status }}
                  </span>
                </td>
                <td class="py-4 px-6 text-sm text-gray-600">{{ participant.date }}</td>
                <td class="py-4 px-6">
                  <div class="flex justify-end gap-2">
                    <button class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                      <EyeIcon class="w-5 h-5" />
                    </button>
                    <button class="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                      <CheckIcon class="w-5 h-5" />
                    </button>
                    <button class="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                      <PencilIcon class="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Showing 1 to 10 of 248 participants
          </div>
          <div class="flex gap-2">
            <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">
              Previous
            </button>
            <button class="px-3 py-1 bg-indigo-600 text-white rounded-lg">1</button>
            <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
            <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
            <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  BellIcon,
  UserCircleIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  PencilIcon,
} from '@heroicons/vue/24/outline';

const searchQuery = ref('');
const filterStatus = ref('');
const showAddModal = ref(false);

const participants = ref([
  {
    id: 1,
    name: 'Ahmed Ali',
    name_dv: 'އަޙްމަދު ޢަލީ',
    partner_name: 'Aminath Sara',
    email: 'ahmed@example.com',
    status: 'approved',
    date: '2026-01-02',
  },
  {
    id: 2,
    name: 'Mohamed Hassan',
    name_dv: 'މުޙައްމަދު ޙަސަން',
    partner_name: 'Fathimath Leena',
    email: 'mohamed@example.com',
    status: 'pending',
    date: '2026-01-02',
  },
  {
    id: 3,
    name: 'Ibrahim Ahmed',
    name_dv: 'އިބްރާހީމް އަޙްމަދު',
    partner_name: 'Mariyam Didi',
    email: 'ibrahim@example.com',
    status: 'verified',
    date: '2026-01-01',
  },
]);

function getStatusClass(status: string) {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    certificate_sent: 'bg-purple-100 text-purple-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}
</script>
