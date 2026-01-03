<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-8">
            <h1 class="text-xl font-bold text-indigo-600">MAP Certificate</h1>
            <div class="hidden md:flex gap-4">
              <router-link to="/admin/dashboard" class="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Dashboard</router-link>
              <router-link to="/admin/participants" class="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Participants</router-link>
              <router-link to="/admin/certificates" class="px-3 py-2 rounded-lg text-indigo-600 bg-indigo-50 font-medium">Certificates</router-link>
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
          <h2 class="text-3xl font-bold text-gray-900">Certificate Management</h2>
          <p class="text-gray-600 mt-2">Generate and manage participant certificates</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="generateSelected"
            :disabled="selectedCount === 0"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              selectedCount > 0
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            <DocumentPlusIcon class="w-5 h-5" />
            <span>Generate ({{ selectedCount }})</span>
          </button>
          <button
            @click="sendEmails"
            class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PaperAirplaneIcon class="w-5 h-5" />
            <span>Send Emails</span>
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Ready to Generate</p>
              <p class="text-2xl font-bold text-gray-900">45</p>
            </div>
            <ClockIcon class="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Generated</p>
              <p class="text-2xl font-bold text-gray-900">186</p>
            </div>
            <DocumentCheckIcon class="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Emails Sent</p>
              <p class="text-2xl font-bold text-gray-900">186</p>
            </div>
            <EnvelopeIcon class="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Failed</p>
              <p class="text-2xl font-bold text-gray-900">2</p>
            </div>
            <ExclamationCircleIcon class="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search certificates..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Certificate Status</label>
            <select
              v-model="filterStatus"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="not_generated">Not Generated</option>
              <option value="generated">Generated</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Template</label>
            <select
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option>Default Template</option>
              <option>Certificate 2026</option>
              <option>Bilingual Template</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Certificates Table -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  <input
                    v-model="selectAll"
                    @change="toggleSelectAll"
                    type="checkbox"
                    class="rounded"
                  />
                </th>
                <th class="text-left py-4 px-6 text-sm font-semibold text-gray-600">Participant</th>
                <th class="text-left py-4 px-6 text-sm font-semibold text-gray-600">Partner</th>
                <th class="text-left py-4 px-6 text-sm font-semibold text-gray-600">Cert. Number</th>
                <th class="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                <th class="text-left py-4 px-6 text-sm font-semibold text-gray-600">Email Status</th>
                <th class="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                <th class="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="cert in certificates"
                :key="cert.id"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-4 px-6">
                  <input
                    v-model="cert.selected"
                    type="checkbox"
                    class="rounded"
                  />
                </td>
                <td class="py-4 px-6 text-sm text-gray-900">{{ cert.participant }}</td>
                <td class="py-4 px-6 text-sm text-gray-600">{{ cert.partner }}</td>
                <td class="py-4 px-6 text-sm text-gray-600">{{ cert.number || '-' }}</td>
                <td class="py-4 px-6">
                  <span
                    :class="[
                      'px-2 py-1 text-xs rounded-full',
                      getCertStatusClass(cert.status)
                    ]"
                  >
                    {{ cert.status }}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <span
                    :class="[
                      'px-2 py-1 text-xs rounded-full',
                      getEmailStatusClass(cert.emailStatus)
                    ]"
                  >
                    {{ cert.emailStatus }}
                  </span>
                </td>
                <td class="py-4 px-6 text-sm text-gray-600">{{ cert.date }}</td>
                <td class="py-4 px-6">
                  <div class="flex justify-end gap-2">
                    <button
                      v-if="cert.status === 'generated'"
                      class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Preview"
                    >
                      <EyeIcon class="w-5 h-5" />
                    </button>
                    <button
                      v-if="cert.status === 'generated'"
                      class="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Download"
                    >
                      <ArrowDownTrayIcon class="w-5 h-5" />
                    </button>
                    <button
                      v-if="cert.status === 'not_generated'"
                      class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      title="Generate"
                    >
                      <DocumentPlusIcon class="w-5 h-5" />
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
            Showing 1 to 10 of 231 certificates
          </div>
          <div class="flex gap-2">
            <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>
            <button class="px-3 py-1 bg-indigo-600 text-white rounded-lg">1</button>
            <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
            <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  BellIcon,
  UserCircleIcon,
  DocumentPlusIcon,
  PaperAirplaneIcon,
  ClockIcon,
  DocumentCheckIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from '@heroicons/vue/24/outline';

const searchQuery = ref('');
const filterStatus = ref('');
const selectAll = ref(false);

const certificates = ref([
  {
    id: 1,
    participant: 'Ahmed Ali',
    partner: 'Aminath Sara',
    number: 'MAP-2026-001',
    status: 'generated',
    emailStatus: 'sent',
    date: '2026-01-02',
    selected: false,
  },
  {
    id: 2,
    participant: 'Mohamed Hassan',
    partner: 'Fathimath Leena',
    number: 'MAP-2026-002',
    status: 'generated',
    emailStatus: 'pending',
    date: '2026-01-02',
    selected: false,
  },
  {
    id: 3,
    participant: 'Ibrahim Ahmed',
    partner: 'Mariyam Didi',
    number: null,
    status: 'not_generated',
    emailStatus: 'not_sent',
    date: '2026-01-01',
    selected: false,
  },
]);

const selectedCount = computed(() => {
  return certificates.value.filter(c => c.selected).length;
});

function toggleSelectAll() {
  certificates.value.forEach(cert => {
    cert.selected = selectAll.value;
  });
}

function generateSelected() {
  console.log('Generating certificates for', selectedCount.value, 'participants');
}

function sendEmails() {
  console.log('Sending emails...');
}

function getCertStatusClass(status: string) {
  const classes: Record<string, string> = {
    not_generated: 'bg-gray-100 text-gray-800',
    generated: 'bg-green-100 text-green-800',
    sent: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

function getEmailStatusClass(status: string) {
  const classes: Record<string, string> = {
    not_sent: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}
</script>
