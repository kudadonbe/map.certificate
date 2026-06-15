<template>
  <ParticipantLayout>
    <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-fc-700"></div>
      </div>

      <!-- Not Found State -->
      <div v-else-if="!participant" class="bg-white rounded-xl shadow-sm p-12 text-center">
        <ExclamationTriangleIcon class="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-gray-900 mb-2">No Participant Record Found</h2>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">
          We couldn't find a MAP participant record linked to your account.
          If you recently completed the program, please contact the Family Court administration.
        </p>
        <div class="flex gap-4 justify-center">
          <router-link
            to="/"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go Home
          </router-link>
          <a
            href="mailto:map@familycourt.gov.mv"
            class="flex items-center gap-2 px-4 py-2 bg-fc-800 text-white rounded-lg hover:bg-fc-900 transition-colors"
          >
            <EnvelopeIcon class="w-5 h-5" />
            Contact Support
          </a>
        </div>
      </div>

      <template v-else>
        <!-- Welcome Section -->
        <div class="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {{ participant.name }}
              </h2>
              <p class="text-gray-600">View and manage your Marriage Awareness Program certificates</p>
            </div>
            <div class="hidden md:block">
              <ProfileAvatar
                :photo-url="authStore.user?.photoURL"
                :display-name="authStore.user?.displayName"
                :email="authStore.user?.email"
                size-class="h-20 w-20"
                text-class="text-xl"
              />
            </div>
          </div>
        </div>

        <!-- Profile Status -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center gap-4">
              <div :class="[
                'w-12 h-12 rounded-lg flex items-center justify-center',
                statusConfig.bgClass
              ]">
                <component :is="statusConfig.icon" :class="['w-6 h-6', statusConfig.iconClass]" />
              </div>
              <div>
                <p class="text-sm text-gray-600">Profile Status</p>
                <p class="text-lg font-semibold text-gray-900">{{ statusConfig.label }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-fc-50 rounded-lg flex items-center justify-center">
                <DocumentCheckIcon class="w-6 h-6 text-fc-700" />
              </div>
              <div>
                <p class="text-sm text-gray-600">Certificate</p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ participant.certificate_status === 'generated' ? 'Available' : 'Pending' }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-fc-accentLight rounded-lg flex items-center justify-center">
                <CalendarIcon class="w-6 h-6 text-fc-accent" />
              </div>
              <div>
                <p class="text-sm text-gray-600">Course Date</p>
                <p class="text-lg font-semibold text-gray-900">
                  {{ participant.course_date ? formatDate(participant.course_date) : 'Not set' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Information -->
        <div class="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-900">Profile Information</h3>
            <button
              v-if="participant.status !== 'profile_submitted'"
              @click="showEditModal = true"
              class="flex items-center gap-2 px-4 py-2 text-fc-700 hover:bg-fc-50 rounded-lg transition-colors"
            >
              <PencilIcon class="w-5 h-5" />
              <span>Request Update</span>
            </button>
            <span
              v-else
              class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
            >
              Update Pending Review
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Name (English)</label>
              <p class="text-gray-900">{{ participant.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Name (Dhivehi)</label>
              <p class="text-gray-900 font-dhivehi">{{ participant.name_dv || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Partner Name</label>
              <p class="text-gray-900">{{ participant.partner_name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Partner Name (Dhivehi)</label>
              <p class="text-gray-900 font-dhivehi">{{ participant.partner_name_dv || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <p class="text-gray-900">{{ participant.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              <p class="text-gray-900">{{ participant.phone || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Certificates -->
        <div class="bg-white rounded-xl shadow-sm p-8">
          <h3 class="text-xl font-bold text-gray-900 mb-6">My Certificates</h3>

          <!-- No Certificate Yet -->
          <div
            v-if="participant.certificate_status === 'not_generated'"
            class="text-center py-12"
          >
            <DocumentIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 class="text-lg font-medium text-gray-900 mb-2">Certificate Not Yet Generated</h4>
            <p class="text-gray-600 max-w-md mx-auto">
              Your certificate is being processed. You will be notified when it's ready for download.
            </p>
          </div>

          <!-- Generating -->
          <div
            v-else-if="participant.certificate_status === 'generating'"
            class="text-center py-12"
          >
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-fc-700 mx-auto mb-4"></div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">Certificate Being Generated</h4>
            <p class="text-gray-600">Please wait while your certificate is being generated...</p>
          </div>

          <!-- Error -->
          <div
            v-else-if="participant.certificate_status === 'error'"
            class="text-center py-12"
          >
            <ExclamationTriangleIcon class="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h4 class="text-lg font-medium text-gray-900 mb-2">Certificate Generation Error</h4>
            <p class="text-gray-600 max-w-md mx-auto mb-4">
              There was an issue generating your certificate. Please contact support.
            </p>
            <a
              href="mailto:map@familycourt.gov.mv"
              class="inline-flex items-center gap-2 px-4 py-2 bg-fc-800 text-white rounded-lg hover:bg-fc-900"
            >
              <EnvelopeIcon class="w-5 h-5" />
              Contact Support
            </a>
          </div>

          <!-- Certificate Available -->
          <div v-else class="space-y-4">
            <div class="border border-gray-200 rounded-lg p-6 hover:border-fc-300 transition-colors">
              <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 bg-fc-50 rounded-lg flex items-center justify-center">
                    <DocumentCheckIcon class="w-8 h-8 text-fc-700" />
                  </div>
                  <div>
                    <h4 class="text-lg font-semibold text-gray-900">Marriage Awareness Program Certificate</h4>
                    <p class="text-sm text-gray-600">
                      Certificate Number: {{ participant.certificate_number || 'N/A' }}
                    </p>
                    <p class="text-sm text-gray-600">
                      Issued: {{ participant.certificate_generated_at ? formatDate(participant.certificate_generated_at) : 'N/A' }}
                    </p>
                    <div class="flex items-center gap-2 mt-2">
                      <span :class="[
                        'inline-block px-2 py-1 text-xs rounded-full',
                        participant.email_status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : participant.email_status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      ]">
                        {{ participant.email_status === 'sent' ? 'Emailed' : participant.email_status === 'failed' ? 'Email Failed' : 'Email Pending' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 w-full md:w-auto">
                  <button
                    @click="viewCertificate"
                    :disabled="!participant.certificate_url"
                    :class="[
                      'flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors',
                      participant.certificate_url
                        ? 'bg-fc-800 text-white hover:bg-fc-900'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    ]"
                  >
                    <EyeIcon class="w-5 h-5" />
                    <span>View</span>
                  </button>
                  <button
                    @click="downloadCertificate"
                    :disabled="!participant.certificate_url"
                    :class="[
                      'flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors',
                      participant.certificate_url
                        ? 'bg-fc-accentLight text-fc-900 hover:bg-fc-accent'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    ]"
                  >
                    <ArrowDownTrayIcon class="w-5 h-5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

    <!-- Edit Profile Modal -->
    <Teleport to="body">
      <div
        v-if="showEditModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="showEditModal = false"
      >
        <div class="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900">Request Profile Update</h3>
              <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-600">
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>
            <p class="text-sm text-gray-600 mt-1">
              Submit your updated information for admin review
            </p>
          </div>

          <form @submit.prevent="submitProfileUpdate" class="p-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name (English)</label>
                <input
                  v-model="editForm.name"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fc-600 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name (Dhivehi)</label>
                <input
                  v-model="editForm.name_dv"
                  type="text"
                  dir="rtl"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fc-600 focus:border-transparent font-dhivehi"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Partner Name</label>
                <input
                  v-model="editForm.partner_name"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fc-600 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Partner Name (Dhivehi)</label>
                <input
                  v-model="editForm.partner_name_dv"
                  type="text"
                  dir="rtl"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fc-600 focus:border-transparent font-dhivehi"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  v-model="editForm.phone"
                  type="tel"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fc-600 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                <input
                  v-model="editForm.id_number"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fc-600 focus:border-transparent"
                />
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="showEditModal = false"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-fc-800 text-white rounded-lg hover:bg-fc-900 transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon v-if="isSubmitting" class="w-5 h-5 animate-spin" />
                <span>{{ isSubmitting ? 'Submitting...' : 'Submit Request' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </ParticipantLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuthStore } from '@/stores/auth.store';
import { useParticipantsStore } from '@/stores/participants.store';
import type { Participant, ParticipantStatus } from '@/types/participant.types';
import ParticipantLayout from '@/layouts/ParticipantLayout.vue';
import ProfileAvatar from '@/components/layout/ProfileAvatar.vue';
import {
  DocumentCheckIcon,
  CheckCircleIcon,
  CalendarIcon,
  PencilIcon,
  DocumentIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  XMarkIcon,
  ArrowPathIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const participantsStore = useParticipantsStore();

// State
const isLoading = ref(true);
const participant = ref<Participant | null>(null);
const showEditModal = ref(false);
const isSubmitting = ref(false);
const editForm = ref({
  name: '',
  name_dv: '',
  partner_name: '',
  partner_name_dv: '',
  phone: '',
  id_number: '',
});

// Computed: Status config based on participant status
const statusConfig = computed(() => {
  const status = participant.value?.status as ParticipantStatus | undefined;
  const configs: Record<ParticipantStatus, { label: string; bgClass: string; iconClass: string; icon: any }> = {
    pending: {
      label: 'Pending',
      bgClass: 'bg-fc-accentLight',
      iconClass: 'text-fc-accent',
      icon: ClockIcon,
    },
    profile_submitted: {
      label: 'Update Pending',
      bgClass: 'bg-fc-50',
      iconClass: 'text-fc-700',
      icon: ClockIcon,
    },
    verified: {
      label: 'Verified',
      bgClass: 'bg-fc-accentLight',
      iconClass: 'text-fc-accent',
      icon: CheckCircleIcon,
    },
    approved: {
      label: 'Approved',
      bgClass: 'bg-fc-50',
      iconClass: 'text-fc-700',
      icon: ShieldCheckIcon,
    },
    certificate_sent: {
      label: 'Completed',
      bgClass: 'bg-fc-accentLight',
      iconClass: 'text-fc-accent',
      icon: CheckCircleIcon,
    },
  };

  return configs[status || 'pending'] || configs.pending;
});

// Load participant data
async function loadParticipant() {
  isLoading.value = true;
  try {
    // First try to find by user_id
    if (authStore.user?.uid) {
      const found = await participantsStore.findByUserId(authStore.user.uid);
      if (found) {
        participant.value = found;
        initEditForm();
        isLoading.value = false;
        return;
      }
    }

    // Then try to find by email
    if (authStore.user?.email) {
      const found = await participantsStore.findByEmail(authStore.user.email);
      if (found) {
        participant.value = found;
        // Link the participant to this user account if not already linked
        if (!found.user_id && authStore.user.uid) {
          await participantsStore.linkToUser(found.id, authStore.user.uid);
        }
        initEditForm();
      }
    }
  } catch (err) {
    console.error('Error loading participant:', err);
  } finally {
    isLoading.value = false;
  }
}

function initEditForm() {
  if (participant.value) {
    editForm.value = {
      name: participant.value.name,
      name_dv: participant.value.name_dv,
      partner_name: participant.value.partner_name,
      partner_name_dv: participant.value.partner_name_dv,
      phone: participant.value.phone || '',
      id_number: participant.value.id_number || '',
    };
  }
}

async function submitProfileUpdate() {
  if (!participant.value || !authStore.user) return;

  isSubmitting.value = true;
  try {
    // Create a profile update request
    const profileUpdatesRef = collection(db, 'profile_updates');
    await addDoc(profileUpdatesRef, {
      participant_id: participant.value.id,
      user_id: authStore.user.uid,
      name: editForm.value.name,
      name_dv: editForm.value.name_dv,
      partner_name: editForm.value.partner_name,
      partner_name_dv: editForm.value.partner_name_dv,
      phone: editForm.value.phone,
      id_number: editForm.value.id_number,
      status: 'pending',
      submitted_at: Timestamp.now(),
      changes: getChanges(),
    });

    // Update participant status to profile_submitted
    await participantsStore.updateParticipant(participant.value.id, {
      status: 'profile_submitted',
    });

    // Reload participant data
    await loadParticipant();
    showEditModal.value = false;
  } catch (err) {
    console.error('Error submitting profile update:', err);
  } finally {
    isSubmitting.value = false;
  }
}

function getChanges(): Record<string, { old: string; new: string }> {
  if (!participant.value) return {};

  const changes: Record<string, { old: string; new: string }> = {};
  const fields = ['name', 'name_dv', 'partner_name', 'partner_name_dv', 'phone', 'id_number'] as const;

  for (const field of fields) {
    const oldVal = (participant.value[field] || '') as string;
    const newVal = editForm.value[field] || '';
    if (oldVal !== newVal) {
      changes[field] = { old: oldVal, new: newVal };
    }
  }

  return changes;
}

function viewCertificate() {
  if (participant.value?.certificate_url) {
    window.open(participant.value.certificate_url, '_blank');
  }
}

function downloadCertificate() {
  if (participant.value?.certificate_url) {
    const link = document.createElement('a');
    link.href = participant.value.certificate_url;
    link.download = `${participant.value.certificate_number || 'certificate'}.pdf`;
    link.click();
  }
}

function formatDate(date: Date | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Watch for auth changes
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    loadParticipant();
  }
}, { immediate: false });

onMounted(() => {
  loadParticipant();
});
</script>
