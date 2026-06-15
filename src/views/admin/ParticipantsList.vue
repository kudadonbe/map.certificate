<template>
  <MapLayout>
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
              placeholder="Search by name or email..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              @input="handleSearch"
            />
            <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            v-model="filterStatus"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            @change="handleFilterChange"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="profile_submitted">Profile Submitted</option>
            <option value="verified">Verified</option>
            <option value="approved">Approved</option>
            <option value="certificate_sent">Certificate Sent</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <input
            v-model="filterDate"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="participantsStore.isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="participantsStore.error" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
      <p class="text-red-800">{{ participantsStore.error }}</p>
      <button @click="loadData" class="mt-2 text-red-600 hover:text-red-800">Try again</button>
    </div>

    <!-- Participants Table -->
    <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div v-if="filteredParticipants.length === 0" class="text-center py-12 text-gray-500">
        <UsersIcon class="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No participants found</p>
        <button @click="showAddModal = true" class="mt-4 text-indigo-600 hover:text-indigo-800">Add first participant</button>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                <input type="checkbox" class="rounded" @change="toggleSelectAll" />
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
              v-for="participant in paginatedParticipants"
              :key="participant.id"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="py-4 px-6">
                <input
                  type="checkbox"
                  class="rounded"
                  :checked="selectedIds.includes(participant.id)"
                  @change="toggleSelect(participant.id)"
                />
              </td>
              <td class="py-4 px-6 text-sm text-gray-900">{{ participant.name }}</td>
              <td class="py-4 px-6 text-sm text-gray-900 font-dhivehi">{{ participant.name_dv }}</td>
              <td class="py-4 px-6 text-sm text-gray-600">{{ participant.partner_name }}</td>
              <td class="py-4 px-6 text-sm text-gray-600">{{ participant.email }}</td>
              <td class="py-4 px-6">
                <span :class="['px-2 py-1 text-xs rounded-full', getStatusClass(participant.status)]">
                  {{ formatStatus(participant.status) }}
                </span>
              </td>
              <td class="py-4 px-6 text-sm text-gray-600">{{ formatDate(participant.created_at) }}</td>
              <td class="py-4 px-6">
                <div class="flex justify-end gap-2">
                  <button
                    @click="viewParticipant(participant)"
                    class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    title="View details"
                  >
                    <EyeIcon class="w-5 h-5" />
                  </button>
                  <button
                    v-if="participant.status === 'pending' || participant.status === 'profile_submitted'"
                    @click="verifyParticipant(participant)"
                    class="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Verify"
                  >
                    <CheckIcon class="w-5 h-5" />
                  </button>
                  <button
                    @click="editParticipant(participant)"
                    class="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    title="Edit"
                  >
                    <PencilIcon class="w-5 h-5" />
                  </button>
                  <button
                    @click="deleteParticipant(participant)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredParticipants.length > 0" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredParticipants.length }} participants
        </div>
        <div class="flex gap-2">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            :class="[
              'px-3 py-1 rounded-lg',
              currentPage === page ? 'bg-indigo-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          <button
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-xl font-semibold">{{ editingParticipant ? 'Edit Participant' : 'Add Participant' }}</h3>
          </div>
          <form @submit.prevent="saveParticipant" class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name (English)</label>
                <input v-model="formData.name" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name (Dhivehi)</label>
                <input v-model="formData.name_dv" type="text" dir="rtl" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Partner Name (English)</label>
                <input v-model="formData.partner_name" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Partner Name (Dhivehi)</label>
                <input v-model="formData.partner_name_dv" type="text" dir="rtl" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input v-model="formData.email" type="email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input v-model="formData.phone" type="tel" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" :disabled="isSaving" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {{ isSaving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </MapLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useParticipantsStore } from '@/stores/participants.store';
import type { Participant, ParticipantStatus } from '@/types/participant.types';
import MapLayout from '@/layouts/MapLayout.vue';
import {
  UserPlusIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline';

const route = useRoute();
const authStore = useAuthStore();
const participantsStore = useParticipantsStore();

// State
const searchQuery = ref('');
const filterStatus = ref<ParticipantStatus | 'all'>('all');
const filterDate = ref('');
const showAddModal = ref(false);
const editingParticipant = ref<Participant | null>(null);
const selectedIds = ref<string[]>([]);
const currentPage = ref(1);
const pageSize = 10;
const isSaving = ref(false);

// Form data
const formData = ref({
  name: '',
  name_dv: '',
  partner_name: '',
  partner_name_dv: '',
  email: '',
  phone: '',
});

// Computed
const filteredParticipants = computed(() => {
  let result = participantsStore.participants;

  // Filter by status
  if (filterStatus.value !== 'all') {
    result = result.filter(p => p.status === filterStatus.value);
  }

  // Filter by search
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.partner_name.toLowerCase().includes(search) ||
      p.email.toLowerCase().includes(search) ||
      p.name_dv.includes(searchQuery.value) ||
      p.partner_name_dv.includes(searchQuery.value)
    );
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredParticipants.value.length / pageSize));
const startIndex = computed(() => (currentPage.value - 1) * pageSize);
const endIndex = computed(() => Math.min(startIndex.value + pageSize, filteredParticipants.value.length));
const paginatedParticipants = computed(() => filteredParticipants.value.slice(startIndex.value, endIndex.value));

// Watch for route query changes
watch(() => route.query.status, (newStatus) => {
  if (newStatus && typeof newStatus === 'string') {
    filterStatus.value = newStatus as ParticipantStatus | 'all';
  }
}, { immediate: true });

// Lifecycle
onMounted(async () => {
  await loadData();
});

async function loadData() {
  await participantsStore.loadParticipants();
}

function handleSearch() {
  currentPage.value = 1;
}

function handleFilterChange() {
  currentPage.value = 1;
}

function resetFilters() {
  searchQuery.value = '';
  filterStatus.value = 'all';
  filterDate.value = '';
  currentPage.value = 1;
}

function toggleSelectAll(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  if (checked) {
    selectedIds.value = paginatedParticipants.value.map(p => p.id);
  } else {
    selectedIds.value = [];
  }
}

function toggleSelect(id: string) {
  const index = selectedIds.value.indexOf(id);
  if (index === -1) {
    selectedIds.value.push(id);
  } else {
    selectedIds.value.splice(index, 1);
  }
}

function viewParticipant(participant: Participant) {
  // TODO: Open view modal or navigate to detail page
  console.log('View participant:', participant);
}

function editParticipant(participant: Participant) {
  editingParticipant.value = participant;
  formData.value = {
    name: participant.name,
    name_dv: participant.name_dv,
    partner_name: participant.partner_name,
    partner_name_dv: participant.partner_name_dv,
    email: participant.email,
    phone: participant.phone || '',
  };
  showAddModal.value = true;
}

async function verifyParticipant(participant: Participant) {
  if (confirm(`Verify ${participant.name}?`)) {
    await participantsStore.verifyProfile(participant.id, authStore.user?.uid || 'unknown');
  }
}

async function deleteParticipant(participant: Participant) {
  if (confirm(`Delete ${participant.name}? This action cannot be undone.`)) {
    await participantsStore.deleteParticipant(participant.id);
  }
}

async function saveParticipant() {
  isSaving.value = true;
  try {
    if (editingParticipant.value) {
      await participantsStore.updateParticipant(editingParticipant.value.id, formData.value);
    } else {
      await participantsStore.createParticipant({
        ...formData.value,
        status: 'pending',
        certificate_status: 'not_generated',
        email_status: 'pending',
        email_attempts: 0,
        profile_verified: false,
      });
    }
    closeModal();
  } catch (err) {
    console.error('Error saving participant:', err);
  } finally {
    isSaving.value = false;
  }
}

function closeModal() {
  showAddModal.value = false;
  editingParticipant.value = null;
  formData.value = {
    name: '',
    name_dv: '',
    partner_name: '',
    partner_name_dv: '',
    email: '',
    phone: '',
  };
}

function formatDate(date: Date | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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
  const classes: Record<ParticipantStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    profile_submitted: 'bg-blue-100 text-blue-800',
    verified: 'bg-green-100 text-green-800',
    approved: 'bg-indigo-100 text-indigo-800',
    certificate_sent: 'bg-purple-100 text-purple-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}
</script>
