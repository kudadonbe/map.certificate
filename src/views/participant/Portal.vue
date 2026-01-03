<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-2">
            <DocumentCheckIcon class="w-8 h-8 text-indigo-600" />
            <h1 class="text-xl font-bold text-indigo-600">My Certificates</h1>
          </div>
          <div class="flex items-center gap-4">
            <button class="p-2 text-gray-600 hover:text-gray-900">
              <BellIcon class="w-6 h-6" />
            </button>
            <button @click="logout" class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900">
              <UserCircleIcon class="w-6 h-6" />
              <span class="hidden md:inline">{{ userName }}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome, {{ userName }}</h2>
            <p class="text-gray-600">View and manage your Marriage Awareness Program certificates</p>
          </div>
          <div class="hidden md:block">
            <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <UserCircleIcon class="w-12 h-12 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Status -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Profile Status</p>
              <p class="text-lg font-semibold text-gray-900">Verified</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DocumentCheckIcon class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Certificates</p>
              <p class="text-lg font-semibold text-gray-900">{{ certificates.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CalendarIcon class="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Last Updated</p>
              <p class="text-lg font-semibold text-gray-900">Jan 2, 2026</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Information -->
      <div class="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-900">Profile Information</h3>
          <button
            @click="editProfile"
            class="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <PencilIcon class="w-5 h-5" />
            <span>Edit Profile</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Name (English)</label>
            <p class="text-gray-900">{{ profile.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Name (Dhivehi)</label>
            <p class="text-gray-900">{{ profile.name_dv }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Partner Name</label>
            <p class="text-gray-900">{{ profile.partner_name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Partner Name (Dhivehi)</label>
            <p class="text-gray-900">{{ profile.partner_name_dv }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <p class="text-gray-900">{{ profile.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Phone</label>
            <p class="text-gray-900">{{ profile.phone }}</p>
          </div>
        </div>
      </div>

      <!-- Certificates -->
      <div class="bg-white rounded-xl shadow-sm p-8">
        <h3 class="text-xl font-bold text-gray-900 mb-6">My Certificates</h3>

        <div v-if="certificates.length === 0" class="text-center py-12">
          <DocumentIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-600">No certificates available yet</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="cert in certificates"
            :key="cert.id"
            class="border border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <DocumentCheckIcon class="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-gray-900">{{ cert.title }}</h4>
                  <p class="text-sm text-gray-600">Certificate Number: {{ cert.number }}</p>
                  <p class="text-sm text-gray-600">Issued: {{ cert.issuedDate }}</p>
                  <span
                    :class="[
                      'inline-block px-2 py-1 text-xs rounded-full mt-2',
                      cert.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    ]"
                  >
                    {{ cert.status }}
                  </span>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="viewCertificate(cert)"
                  class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <EyeIcon class="w-5 h-5" />
                  <span>View</span>
                </button>
                <button
                  @click="downloadCertificate(cert)"
                  class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ArrowDownTrayIcon class="w-5 h-5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
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
  DocumentCheckIcon,
  CheckCircleIcon,
  CalendarIcon,
  PencilIcon,
  DocumentIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from '@heroicons/vue/24/outline';

const router = useRouter();

const userName = ref('Ahmed Ali');

const profile = ref({
  name: 'Ahmed Ali',
  name_dv: 'އަޙްމަދު ޢަލީ',
  partner_name: 'Aminath Sara',
  partner_name_dv: 'އާމިނަތު ސާރާ',
  email: 'ahmed@example.com',
  phone: '+960 7777777',
});

const certificates = ref([
  {
    id: 1,
    title: 'Marriage Awareness Program Certificate',
    number: 'MAP-2026-001',
    issuedDate: 'January 2, 2026',
    status: 'sent',
  },
]);

function editProfile() {
  console.log('Edit profile');
}

function viewCertificate(cert: any) {
  console.log('View certificate:', cert.id);
}

function downloadCertificate(cert: any) {
  console.log('Download certificate:', cert.id);
}

function logout() {
  router.push('/login');
}
</script>
