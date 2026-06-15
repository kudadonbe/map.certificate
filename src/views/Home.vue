<template>
  <AqdLayout>
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <div v-if="isAuthenticated" class="bg-gradient-to-br from-fc-900 via-fc-800 to-fc-900 rounded-2xl p-8 text-fc-50 shadow-lg border border-fc-700/30">
          <div class="flex items-center gap-4 mb-4">
            <ProfileAvatar
              :photo-url="user?.photoURL"
              :display-name="user?.displayName"
              :email="user?.email"
              size-class="h-16 w-16 border-4 border-fc-700/50"
              text-class="text-lg"
            />
            <div>
              <h2 class="text-2xl font-bold text-white">Welcome, {{ userDisplayName }}</h2>
              <div class="flex items-center gap-2 mt-1">
                <span class="px-2 py-0.5 bg-fc-700/50 rounded text-sm text-fc-100 border border-fc-600/30">{{ primaryRoleLabel }}</span>
                <span class="text-fc-200/70 text-sm">Family Court, Maldives</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="bg-gradient-to-br from-fc-900 via-fc-800 to-fc-900 rounded-2xl p-8 text-fc-50 text-center shadow-lg border border-fc-700/30">
          <BuildingLibraryIcon class="w-16 h-16 mx-auto mb-4 text-fc-300/80" />
          <h2 class="text-3xl font-bold mb-2 text-fc-50">Welcome to AQD</h2>
          <p class="text-fc-100/90 mb-6 max-w-2xl mx-auto">
            Family Court Digital Platform - Access court services, manage certificates, and connect with Family Court Maldives online.
          </p>
          <div class="flex gap-4 justify-center">
            <router-link
              to="/login"
              class="px-6 py-3 bg-white text-fc-800 font-semibold rounded-lg hover:bg-fc-50 transition-colors shadow-sm"
            >
              Staff Login
            </router-link>
            <router-link
              to="/login"
              class="px-6 py-3 bg-fc-800/50 text-fc-50 font-semibold rounded-lg hover:bg-fc-800/70 transition-colors border border-fc-700/50"
            >
              Public Login
            </router-link>
          </div>
        </div>
      </div>

      <!-- Applications Grid -->
      <section class="mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Squares2X2Icon class="w-5 h-5 text-gray-400" />
          Applications
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <!-- MAP Certificate - Active -->
          <router-link
            :to="mapAppRoute"
            class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
          >
            <div class="w-12 h-12 bg-fc-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-fc-100 transition-colors">
              <DocumentCheckIcon class="w-6 h-6 text-fc-700" />
            </div>
            <h4 class="font-semibold text-gray-900 mb-1">MAP Certificate</h4>
            <p class="text-sm text-gray-500">Marriage Awareness Program</p>
            <span class="inline-block mt-3 text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Active</span>
          </router-link>

          <!-- Coming Soon Apps -->
          <div class="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-200">
            <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <FolderIcon class="w-6 h-6 text-gray-400" />
            </div>
            <h4 class="font-semibold text-gray-400 mb-1">Case Portal</h4>
            <p class="text-sm text-gray-400">Case management</p>
            <span class="inline-block mt-3 text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded">Coming Soon</span>
          </div>

          <div class="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-200">
            <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <DocumentTextIcon class="w-6 h-6 text-gray-400" />
            </div>
            <h4 class="font-semibold text-gray-400 mb-1">Documents</h4>
            <p class="text-sm text-gray-400">Document portal</p>
            <span class="inline-block mt-3 text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded">Coming Soon</span>
          </div>

          <div class="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-200">
            <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <CalendarDaysIcon class="w-6 h-6 text-gray-400" />
            </div>
            <h4 class="font-semibold text-gray-400 mb-1">Court Calendar</h4>
            <p class="text-sm text-gray-400">Schedules & hearings</p>
            <span class="inline-block mt-3 text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded">Coming Soon</span>
          </div>
        </div>
      </section>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Quick Links -->
        <section class="lg:col-span-2">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LinkIcon class="w-5 h-5 text-gray-400" />
            Quick Links
          </h3>
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            <!-- Staff Links -->
            <template v-if="isStaff">
              <router-link
                to="/map/dashboard"
                class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="w-10 h-10 bg-fc-50 rounded-lg flex items-center justify-center">
                  <ChartBarIcon class="w-5 h-5 text-fc-700" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">Dashboard</p>
                  <p class="text-sm text-gray-500">View statistics and manage operations</p>
                </div>
                <ChevronRightIcon class="w-5 h-5 text-gray-400" />
              </router-link>

              <router-link
                to="/map/participants"
                class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="w-10 h-10 bg-fc-accentLight rounded-lg flex items-center justify-center">
                  <UsersIcon class="w-5 h-5 text-fc-accent" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">Participants</p>
                  <p class="text-sm text-gray-500">Manage MAP program participants</p>
                </div>
                <ChevronRightIcon class="w-5 h-5 text-gray-400" />
              </router-link>

              <router-link
                to="/map/certificates"
                class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="w-10 h-10 bg-fc-50 rounded-lg flex items-center justify-center">
                  <DocumentCheckIcon class="w-5 h-5 text-fc-700" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">Certificates</p>
                  <p class="text-sm text-gray-500">Generate and send certificates</p>
                </div>
                <ChevronRightIcon class="w-5 h-5 text-gray-400" />
              </router-link>

              <router-link
                v-if="canManageUsers"
                to="/map/users"
                class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="w-10 h-10 bg-fc-accentLight rounded-lg flex items-center justify-center">
                  <UserGroupIcon class="w-5 h-5 text-fc-accent" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">User Management</p>
                  <p class="text-sm text-gray-500">Manage users and permissions</p>
                </div>
                <ChevronRightIcon class="w-5 h-5 text-gray-400" />
              </router-link>
            </template>

            <!-- Participant Links -->
            <template v-else-if="isParticipant">
              <router-link
                to="/participant/portal"
                class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="w-10 h-10 bg-fc-50 rounded-lg flex items-center justify-center">
                  <DocumentCheckIcon class="w-5 h-5 text-fc-700" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">My Certificates</p>
                  <p class="text-sm text-gray-500">View and download your certificates</p>
                </div>
                <ChevronRightIcon class="w-5 h-5 text-gray-400" />
              </router-link>

              <router-link
                to="/profile"
                class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="w-10 h-10 bg-fc-accentLight rounded-lg flex items-center justify-center">
                  <UserCircleIcon class="w-5 h-5 text-fc-accent" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">My Profile</p>
                  <p class="text-sm text-gray-500">View your account information</p>
                </div>
                <ChevronRightIcon class="w-5 h-5 text-gray-400" />
              </router-link>
            </template>

            <!-- Public/Guest Links -->
            <template v-else>
              <router-link
                to="/profile"
                class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="w-10 h-10 bg-fc-50 rounded-lg flex items-center justify-center">
                  <UserCircleIcon class="w-5 h-5 text-fc-700" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">My Profile</p>
                  <p class="text-sm text-gray-500">View your account information</p>
                </div>
                <ChevronRightIcon class="w-5 h-5 text-gray-400" />
              </router-link>

              <a
                href="https://familycourt.gov.mv"
                target="_blank"
                class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="w-10 h-10 bg-fc-accentLight rounded-lg flex items-center justify-center">
                  <GlobeAltIcon class="w-5 h-5 text-fc-accent" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">Family Court Website</p>
                  <p class="text-sm text-gray-500">Visit our official website</p>
                </div>
                <ArrowTopRightOnSquareIcon class="w-5 h-5 text-gray-400" />
              </a>
            </template>
          </div>
        </section>

        <!-- Announcements / Support -->
        <section>
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MegaphoneIcon class="w-5 h-5 text-gray-400" />
            Notices
          </h3>
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
            <!-- Notice Items -->
            <div class="p-3 bg-fc-50 rounded-lg border border-fc-100">
              <div class="flex items-start gap-3">
                <InformationCircleIcon class="w-5 h-5 text-fc-700 mt-0.5 flex-shrink-0" />
                <div>
                  <p class="text-sm font-medium text-fc-900">System Update</p>
                  <p class="text-xs text-fc-700 mt-1">AQD platform is now live with MAP Certificate module.</p>
                </div>
              </div>
            </div>

            <div class="p-3 bg-gray-50 rounded-lg">
              <div class="flex items-start gap-3">
                <CalendarDaysIcon class="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Upcoming Features</p>
                  <p class="text-xs text-gray-600 mt-1">Case Portal and Document Management coming soon.</p>
                </div>
              </div>
            </div>

            <!-- Support Section -->
            <div class="pt-4 border-t border-gray-100">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Support</h4>
              <div class="space-y-2">
                <a
                  href="mailto:it@familycourt.gov.mv"
                  class="flex items-center gap-2 text-sm text-gray-600 hover:text-fc-700"
                >
                  <EnvelopeIcon class="w-4 h-4" />
                  it@familycourt.gov.mv
                </a>
                <a
                  href="tel:+9603323894"
                  class="flex items-center gap-2 text-sm text-gray-600 hover:text-fc-700"
                >
                  <PhoneIcon class="w-4 h-4" />
                  +960 332 3894
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </AqdLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { getPrimaryRoleLabel } from '@/utils/role.helpers';
import AqdLayout from '@/layouts/AqdLayout.vue';
import ProfileAvatar from '@/components/layout/ProfileAvatar.vue';
import {
  BuildingLibraryIcon,
  UserCircleIcon,
  Squares2X2Icon,
  DocumentCheckIcon,
  FolderIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  LinkIcon,
  ChartBarIcon,
  UsersIcon,
  UserGroupIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  ArrowTopRightOnSquareIcon,
  MegaphoneIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);
const userDisplayName = computed(() => authStore.userDisplayName);
const isStaff = computed(() => authStore.isOfficer);
const isParticipant = computed(() => authStore.isParticipant);
const canManageUsers = computed(() => authStore.canManageUsers);
const primaryRoleLabel = computed(() => getPrimaryRoleLabel(authStore.user));

// Route for MAP app based on user role
const mapAppRoute = computed(() => {
  if (authStore.isOfficer) {
    return '/map/dashboard';
  } else if (authStore.isParticipant) {
    return '/participant/portal';
  } else if (authStore.isAuthenticated) {
    return '/profile';
  }
  return '/login';
});
</script>
