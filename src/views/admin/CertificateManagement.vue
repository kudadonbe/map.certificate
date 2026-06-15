<template>
  <MapLayout>
    <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-3xl font-bold text-gray-900">Certificate Management</h2>
          <p class="text-gray-600 mt-2">Generate and manage participant certificates</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="previewTemporaryCertificate()"
            class="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
          >
            <EyeIcon class="w-5 h-5" />
            <span>Temporary Certificate</span>
          </button>
          <button
            @click="generateSelected"
            :disabled="selectedCount === 0 || isGenerating"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              selectedCount > 0 && !isGenerating
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            <ArrowPathIcon v-if="isGenerating" class="w-5 h-5 animate-spin" />
            <DocumentPlusIcon v-else class="w-5 h-5" />
            <span>Generate ({{ selectedCount }})</span>
          </button>
          <button
            @click="sendEmails"
            :disabled="emailSelectedCount === 0 || isSending"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              emailSelectedCount > 0 && !isSending
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            <ArrowPathIcon v-if="isSending" class="w-5 h-5 animate-spin" />
            <PaperAirplaneIcon v-else class="w-5 h-5" />
            <span>Send Emails ({{ emailSelectedCount }})</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="participantsStore.isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <template v-else>
        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Ready to Generate</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.readyToGenerate }}</p>
              </div>
              <ClockIcon class="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Generated</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.generated }}</p>
              </div>
              <DocumentCheckIcon class="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Emails Sent</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.emailsSent }}</p>
              </div>
              <EnvelopeIcon class="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Failed</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.failed }}</p>
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
                v-model="filterCertStatus"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="not_generated">Not Generated</option>
                <option value="generating">Generating</option>
                <option value="generated">Generated</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email Status</label>
              <select
                v-model="filterEmailStatus"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredParticipants.length === 0" class="bg-white rounded-xl shadow-sm p-12 text-center">
          <DocumentCheckIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No participants found</h3>
          <p class="text-gray-500 mb-4">
            {{ searchQuery || filterCertStatus || filterEmailStatus
              ? 'Try adjusting your filters'
              : 'Add approved participants to generate certificates' }}
          </p>
          <router-link
            to="/map/participants"
            class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <UsersIcon class="w-5 h-5" />
            View Participants
          </router-link>
        </div>

        <!-- Certificates Table -->
        <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
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
                  v-for="participant in paginatedParticipants"
                  :key="participant.id"
                  class="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td class="py-4 px-6">
                    <input
                      v-model="selectedIds"
                      :value="participant.id"
                      type="checkbox"
                      class="rounded"
                    />
                  </td>
                  <td class="py-4 px-6">
                    <div>
                      <p class="text-sm text-gray-900">{{ participant.name }}</p>
                      <p class="text-xs text-gray-500">{{ participant.name_dv }}</p>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <div>
                      <p class="text-sm text-gray-600">{{ participant.partner_name }}</p>
                      <p class="text-xs text-gray-500">{{ participant.partner_name_dv }}</p>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-sm text-gray-600">{{ participant.certificate_number || '-' }}</td>
                  <td class="py-4 px-6">
                    <span :class="['px-2 py-1 text-xs rounded-full', getCertStatusClass(participant.certificate_status)]">
                      {{ formatCertStatus(participant.certificate_status) }}
                    </span>
                  </td>
                  <td class="py-4 px-6">
                    <span :class="['px-2 py-1 text-xs rounded-full', getEmailStatusClass(participant.email_status)]">
                      {{ formatEmailStatus(participant.email_status) }}
                    </span>
                  </td>
                  <td class="py-4 px-6 text-sm text-gray-600">{{ formatDate(participant.created_at) }}</td>
                  <td class="py-4 px-6">
                    <div class="flex justify-end gap-2">
                      <button
                        @click="previewTemporaryCertificate(participant)"
                        class="p-2 text-amber-700 hover:bg-amber-50 rounded-lg"
                        title="Preview temporary certificate"
                      >
                        <EyeIcon class="w-5 h-5" />
                      </button>
                      <button
                        v-if="participant.certificate_status === 'generated' && participant.certificate_url"
                        @click="previewCertificate(participant)"
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Preview"
                      >
                        <EyeIcon class="w-5 h-5" />
                      </button>
                      <button
                        v-if="participant.certificate_status === 'generated' && participant.certificate_url"
                        @click="downloadCertificate(participant)"
                        class="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Download"
                      >
                        <ArrowDownTrayIcon class="w-5 h-5" />
                      </button>
                      <button
                        v-if="participant.certificate_status === 'not_generated' && participant.status === 'approved'"
                        @click="generateSingle(participant.id)"
                        class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Generate"
                      >
                        <DocumentPlusIcon class="w-5 h-5" />
                      </button>
                      <button
                        v-if="participant.certificate_status === 'generated' && participant.email_status !== 'sent'"
                        @click="sendSingleEmail(participant.id)"
                        class="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Send Email"
                      >
                        <PaperAirplaneIcon class="w-5 h-5" />
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
              Showing {{ paginationStart }} to {{ paginationEnd }} of {{ filteredParticipants.length }} participants
            </div>
            <div class="flex gap-2">
              <button
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                :class="[
                  'px-3 py-1 border border-gray-300 rounded-lg',
                  currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                ]"
              >
                Previous
              </button>
              <button
                v-for="page in displayedPages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-3 py-1 rounded-lg',
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                :class="[
                  'px-3 py-1 border border-gray-300 rounded-lg',
                  currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                ]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </template>

      <Teleport to="body">
        <div
          v-if="showTemporaryCertificate"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          @click.self="showTemporaryCertificate = false"
        >
          <div class="w-full max-w-6xl rounded-xl bg-white p-4 shadow-2xl">
            <div class="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 class="text-lg font-bold text-gray-900">Temporary Certificate Preview</h3>
                <p class="text-sm text-gray-600">Static preview adapted from the certificate-system template</p>
              </div>
              <button
                @click="showTemporaryCertificate = false"
                class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close certificate preview"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>
            <TemporaryCertificate
              :participant-name="temporaryCertificateData.name"
              :id-number="temporaryCertificateData.idNumber"
              :issue-date="temporaryCertificateData.issueDate"
            />
          </div>
        </div>
      </Teleport>
  </MapLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useParticipantsStore } from '@/stores/participants.store';
import type { Participant, CertificateStatus, EmailStatus } from '@/types/participant.types';
import MapLayout from '@/layouts/MapLayout.vue';
import TemporaryCertificate from '@/components/certificate/TemporaryCertificate.vue';
import {
  DocumentPlusIcon,
  PaperAirplaneIcon,
  ClockIcon,
  DocumentCheckIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline';

const participantsStore = useParticipantsStore();

// State
const searchQuery = ref('');
const filterCertStatus = ref('');
const filterEmailStatus = ref('');
const selectAll = ref(false);
const selectedIds = ref<string[]>([]);
const currentPage = ref(1);
const pageSize = 10;
const isGenerating = ref(false);
const isSending = ref(false);
const showTemporaryCertificate = ref(false);
const temporaryCertificateData = ref({
  name: 'ހުސައިން އަލީ',
  idNumber: 'A123456',
  issueDate: formatDate(new Date()),
});

// Computed: Stats
const stats = computed(() => {
  const all = participantsStore.participants;
  return {
    readyToGenerate: all.filter(p => p.status === 'approved' && p.certificate_status === 'not_generated').length,
    generated: all.filter(p => p.certificate_status === 'generated').length,
    emailsSent: all.filter(p => p.email_status === 'sent').length,
    failed: all.filter(p => p.certificate_status === 'error' || p.email_status === 'failed').length,
  };
});

// Computed: Filtered participants (only approved or with certificates)
const filteredParticipants = computed(() => {
  let result = participantsStore.participants.filter(p =>
    p.status === 'approved' || p.certificate_status !== 'not_generated'
  );

  // Search filter
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.partner_name.toLowerCase().includes(search) ||
      p.email.toLowerCase().includes(search) ||
      p.name_dv.includes(searchQuery.value) ||
      p.partner_name_dv.includes(searchQuery.value) ||
      (p.certificate_number && p.certificate_number.toLowerCase().includes(search))
    );
  }

  // Certificate status filter
  if (filterCertStatus.value) {
    result = result.filter(p => p.certificate_status === filterCertStatus.value);
  }

  // Email status filter
  if (filterEmailStatus.value) {
    result = result.filter(p => p.email_status === filterEmailStatus.value);
  }

  return result;
});

// Computed: Pagination
const totalPages = computed(() => Math.ceil(filteredParticipants.value.length / pageSize) || 1);
const paginatedParticipants = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredParticipants.value.slice(start, start + pageSize);
});
const paginationStart = computed(() => Math.min((currentPage.value - 1) * pageSize + 1, filteredParticipants.value.length));
const paginationEnd = computed(() => Math.min(currentPage.value * pageSize, filteredParticipants.value.length));
const displayedPages = computed(() => {
  const pages: number[] = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, 5);
    } else if (current >= total - 2) {
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      for (let i = current - 2; i <= current + 2; i++) pages.push(i);
    }
  }
  return pages;
});

// Computed: Selection counts
const selectedCount = computed(() => {
  return selectedIds.value.filter(id =>
    participantsStore.participants.some(p =>
      p.id === id && p.status === 'approved' && p.certificate_status === 'not_generated'
    )
  ).length;
});

const emailSelectedCount = computed(() => {
  return selectedIds.value.filter(id =>
    participantsStore.participants.some(p =>
      p.id === id && p.certificate_status === 'generated' && p.email_status !== 'sent'
    )
  ).length;
});

// Watch for filter changes to reset page
watch([searchQuery, filterCertStatus, filterEmailStatus], () => {
  currentPage.value = 1;
});

// Actions
function toggleSelectAll() {
  if (selectAll.value) {
    selectedIds.value = paginatedParticipants.value.map(p => p.id);
  } else {
    selectedIds.value = [];
  }
}

async function generateSelected() {
  const toGenerate = selectedIds.value.filter(id =>
    participantsStore.participants.some(p =>
      p.id === id && p.status === 'approved' && p.certificate_status === 'not_generated'
    )
  );

  if (toGenerate.length === 0) return;

  isGenerating.value = true;
  try {
    // TODO: Implement actual certificate generation via Firebase Function
    // For now, just update status to show the flow
    for (const id of toGenerate) {
      await participantsStore.updateParticipant(id, {
        certificate_status: 'generating',
      });
    }
    console.log('Certificate generation started for', toGenerate.length, 'participants');
    // In production, this would call a Firebase Function to generate PDFs
  } catch (err) {
    console.error('Error generating certificates:', err);
  } finally {
    isGenerating.value = false;
    selectedIds.value = [];
    selectAll.value = false;
  }
}

async function generateSingle(id: string) {
  isGenerating.value = true;
  try {
    await participantsStore.updateParticipant(id, {
      certificate_status: 'generating',
    });
    console.log('Certificate generation started for participant:', id);
    // TODO: Call Firebase Function to generate PDF
  } catch (err) {
    console.error('Error generating certificate:', err);
  } finally {
    isGenerating.value = false;
  }
}

async function sendEmails() {
  const toSend = selectedIds.value.filter(id =>
    participantsStore.participants.some(p =>
      p.id === id && p.certificate_status === 'generated' && p.email_status !== 'sent'
    )
  );

  if (toSend.length === 0) return;

  isSending.value = true;
  try {
    // TODO: Implement actual email sending via Microsoft Graph API
    for (const id of toSend) {
      await participantsStore.updateParticipant(id, {
        email_status: 'pending',
        email_attempts: (participantsStore.participants.find(p => p.id === id)?.email_attempts || 0) + 1,
      });
    }
    console.log('Email sending started for', toSend.length, 'participants');
    // In production, this would call a Firebase Function to send emails
  } catch (err) {
    console.error('Error sending emails:', err);
  } finally {
    isSending.value = false;
    selectedIds.value = [];
    selectAll.value = false;
  }
}

async function sendSingleEmail(id: string) {
  isSending.value = true;
  try {
    const participant = participantsStore.participants.find(p => p.id === id);
    await participantsStore.updateParticipant(id, {
      email_status: 'pending',
      email_attempts: (participant?.email_attempts || 0) + 1,
    });
    console.log('Email sending started for participant:', id);
    // TODO: Call Firebase Function to send email
  } catch (err) {
    console.error('Error sending email:', err);
  } finally {
    isSending.value = false;
  }
}

function previewCertificate(participant: Participant) {
  if (participant.certificate_url) {
    window.open(participant.certificate_url, '_blank');
  }
}

function previewTemporaryCertificate(participant?: Participant) {
  temporaryCertificateData.value = {
    name: participant?.name_dv || participant?.name || 'ހުސައިން އަލީ',
    idNumber: participant?.id_number || 'A123456',
    issueDate: formatDate(new Date()),
  };
  showTemporaryCertificate.value = true;
}

function downloadCertificate(participant: Participant) {
  if (participant.certificate_url) {
    const link = document.createElement('a');
    link.href = participant.certificate_url;
    link.download = `${participant.certificate_number || 'certificate'}.pdf`;
    link.click();
  }
}

// Formatting helpers
function formatDate(date: Date | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCertStatus(status: CertificateStatus): string {
  const labels: Record<CertificateStatus, string> = {
    not_generated: 'Not Generated',
    generating: 'Generating',
    generated: 'Generated',
    error: 'Error',
  };
  return labels[status] || status;
}

function formatEmailStatus(status: EmailStatus): string {
  const labels: Record<EmailStatus, string> = {
    pending: 'Pending',
    sent: 'Sent',
    failed: 'Failed',
  };
  return labels[status] || status;
}

function getCertStatusClass(status: CertificateStatus): string {
  const classes: Record<CertificateStatus, string> = {
    not_generated: 'bg-gray-100 text-gray-800',
    generating: 'bg-blue-100 text-blue-800',
    generated: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

function getEmailStatusClass(status: EmailStatus): string {
  const classes: Record<EmailStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

// Load data on mount
onMounted(async () => {
  await participantsStore.loadParticipants();
});
</script>
