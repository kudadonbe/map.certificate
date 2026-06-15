<template>
  <MapLayout>
    <!-- Page Header -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900">User Management</h2>
      <p class="text-gray-600 mt-2">Manage users and their roles in the system</p>
    </div>

      <!-- Error/Success Messages -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-800 text-sm">{{ errorMessage }}</p>
      </div>
      <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-green-800 text-sm">{{ successMessage }}</p>
      </div>

      <!-- Role Groups Overview -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div v-for="(group, role) in ROLE_GROUPS" :key="role" class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-900">{{ group.name }}</span>
            <span class="text-lg font-bold text-indigo-600">{{ getUserCountByRole(role) }}</span>
          </div>
          <p class="text-xs text-gray-500">{{ group.description }}</p>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">All Users</h3>
            <div class="flex items-center gap-4">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by email or name..."
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
              />
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingUsers" class="p-12 text-center">
          <svg class="animate-spin h-8 w-8 mx-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-500 mt-2">Loading users...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredUsers.length === 0" class="p-12 text-center">
          <UserGroupIcon class="w-12 h-12 mx-auto text-gray-400" />
          <p class="text-gray-500 mt-2">{{ searchQuery ? 'No users found matching your search' : 'No users found' }}</p>
        </div>

        <!-- Users Table -->
        <table v-else class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left py-3 px-6 text-sm font-semibold text-gray-600">User</th>
              <th class="text-left py-3 px-6 text-sm font-semibold text-gray-600">Roles</th>
              <th class="text-left py-3 px-6 text-sm font-semibold text-gray-600">Provider</th>
              <th class="text-left py-3 px-6 text-sm font-semibold text-gray-600">Last Login</th>
              <th class="text-right py-3 px-6 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="user in filteredUsers" :key="user.uid" class="hover:bg-gray-50">
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <ProfileAvatar
                    :photo-url="user.photoURL"
                    :display-name="user.displayName"
                    :email="user.email"
                    size-class="h-10 w-10"
                  />
                  <div>
                    <p class="text-gray-900 font-medium">{{ user.displayName || 'No name' }}</p>
                    <p class="text-sm text-gray-500">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="role in user.roles"
                    :key="role"
                    :class="getRoleBadgeClass(role)"
                    class="px-2 py-1 text-xs rounded-full"
                  >
                    {{ getRoleLabel(role) }}
                  </span>
                </div>
              </td>
              <td class="py-4 px-6">
                <span class="text-sm text-gray-600 capitalize">{{ user.provider }}</span>
              </td>
              <td class="py-4 px-6">
                <span class="text-sm text-gray-600">{{ formatDate(user.lastLoginAt) }}</span>
              </td>
              <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="user.uid === authStore.user?.uid"
                    @click="openProfileModal(user)"
                    class="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                  <button
                    v-if="canEditUser(user)"
                    @click="openEditModal(user)"
                    class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Edit Roles
                  </button>
                  <span v-if="user.uid === authStore.user?.uid" class="text-xs text-gray-400 ml-1">
                    (You)
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Info Box -->
      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex gap-3">
          <InformationCircleIcon class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div class="text-sm text-blue-800">
            <p class="font-medium mb-1">Role Hierarchy</p>
            <ul class="list-disc list-inside space-y-1 text-blue-700">
              <li><strong>Developer:</strong> Full system access and developer management</li>
              <li><strong>System Admin:</strong> User and admin management</li>
              <li><strong>Administrator:</strong> Content management for participants and certificates</li>
              <li><strong>Officer:</strong> Family Court staff access</li>
              <li><strong>Participant:</strong> Access to own certificates</li>
              <li><strong>Public User:</strong> Basic authenticated user</li>
            </ul>
          </div>
        </div>
      </div>

    <!-- Edit Roles Modal -->
    <div v-if="showEditModal && selectedUser" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Edit User Roles</h3>
        <p class="text-gray-600 mb-4">
          {{ selectedUser.displayName || selectedUser.email }}
        </p>

        <div class="space-y-3 mb-6">
          <label
            v-for="role in assignableRoles"
            :key="role"
            class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            :class="{ 'border-indigo-500 bg-indigo-50': selectedRoles.includes(role) }"
          >
            <input
              type="checkbox"
              :value="role"
              v-model="selectedRoles"
              class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <div class="flex-1">
              <p class="font-medium text-gray-900">{{ ROLE_GROUPS[role]?.name }}</p>
              <p class="text-xs text-gray-500">{{ ROLE_GROUPS[role]?.description }}</p>
            </div>
          </label>
        </div>

        <div class="flex gap-3 justify-end">
          <button
            @click="showEditModal = false"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            @click="saveUserRoles"
            :disabled="isLoading || selectedRoles.length === 0"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            Save Roles
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showProfileModal && selectedUser" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Edit Your Profile</h3>
        <p class="text-gray-600 mb-4">
          {{ selectedUser.email }}
        </p>

        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              v-model="editDisplayName"
              type="text"
              placeholder="Enter your name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Your Roles</label>
            <div class="flex flex-wrap gap-1 p-3 bg-gray-50 rounded-lg">
              <span
                v-for="role in selectedUser.roles"
                :key="role"
                :class="getRoleBadgeClass(role)"
                class="px-2 py-1 text-xs rounded-full"
              >
                {{ getRoleLabel(role) }}
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-1">Contact a system admin to change your roles</p>
          </div>
        </div>

        <div class="flex gap-3 justify-end">
          <button
            @click="showProfileModal = false"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            @click="saveProfile"
            :disabled="isLoading || !editDisplayName.trim()"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  </MapLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { AuthService } from '@/services/auth.service';
import { ROLE_GROUPS, getAssignableRoles, getRoleLabel } from '@/utils/role.helpers';
import type { AppUser, UserRole } from '@/types/auth.types';
import MapLayout from '@/layouts/MapLayout.vue';
import ProfileAvatar from '@/components/layout/ProfileAvatar.vue';
import {
  UserGroupIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();

// State
const users = ref<AppUser[]>([]);
const isLoadingUsers = ref(true);
const isLoading = ref(false);
const searchQuery = ref('');
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Edit modal state
const showEditModal = ref(false);
const selectedUser = ref<AppUser | null>(null);
const selectedRoles = ref<UserRole[]>([]);

// Profile modal state
const showProfileModal = ref(false);
const editDisplayName = ref('');

const assignableRoles = computed(() => getAssignableRoles(authStore.user));

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user =>
    user.email?.toLowerCase().includes(query) ||
    user.displayName?.toLowerCase().includes(query)
  );
});

// Load users on mount
onMounted(async () => {
  await loadUsers();
});

async function loadUsers() {
  isLoadingUsers.value = true;
  try {
    users.value = await AuthService.getAllUsers();
  } catch (error) {
    console.error('Error loading users:', error);
    errorMessage.value = 'Failed to load users';
  } finally {
    isLoadingUsers.value = false;
  }
}

function getUserCountByRole(role: string): number {
  return users.value.filter(user => user.roles?.includes(role as UserRole)).length;
}

function getRoleBadgeClass(role: string): string {
  const classes: Record<string, string> = {
    developer: 'bg-purple-100 text-purple-800',
    system_admin: 'bg-red-100 text-red-800',
    admin: 'bg-blue-100 text-blue-800',
    officer: 'bg-indigo-100 text-indigo-800',
    participant: 'bg-green-100 text-green-800',
    public: 'bg-gray-100 text-gray-800',
  };
  return classes[role] || 'bg-gray-100 text-gray-800';
}

function formatDate(date: Date | undefined): string {
  if (!date) return 'Never';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function canEditUser(user: AppUser): boolean {
  // Can't edit your own roles
  if (user.uid === authStore.user?.uid) return false;

  // Developers can edit anyone
  if (authStore.isDeveloper) return true;

  // System admins can edit admins, officers, participants, and public (not developers or other system_admins)
  if (authStore.hasRole('system_admin')) {
    return !user.roles?.includes('developer') && !user.roles?.includes('system_admin');
  }

  // Admins can edit officers, participants, and public (not developers, system_admins, or other admins)
  if (authStore.hasRole('admin')) {
    return !user.roles?.includes('developer') &&
           !user.roles?.includes('system_admin') &&
           !user.roles?.includes('admin');
  }

  return false;
}

function openEditModal(user: AppUser) {
  selectedUser.value = user;
  selectedRoles.value = [...(user.roles || ['public'])];
  showEditModal.value = true;
}

function openProfileModal(user: AppUser) {
  selectedUser.value = user;
  editDisplayName.value = user.displayName || '';
  showProfileModal.value = true;
}

async function saveUserRoles() {
  if (!selectedUser.value || selectedRoles.value.length === 0) return;

  isLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  const result = await AuthService.updateUserRoles(
    selectedUser.value.uid,
    selectedRoles.value,
    authStore.userEmail
  );

  if (result.success) {
    successMessage.value = `Successfully updated roles for ${selectedUser.value.email}`;
    showEditModal.value = false;
    await loadUsers();
  } else {
    errorMessage.value = result.error || 'Failed to update roles';
  }

  isLoading.value = false;
}

async function saveProfile() {
  if (!selectedUser.value || !editDisplayName.value.trim()) return;

  isLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  const result = await AuthService.updateUserProfile(
    selectedUser.value.uid,
    { displayName: editDisplayName.value.trim() }
  );

  if (result.success) {
    successMessage.value = 'Profile updated successfully';
    showProfileModal.value = false;
    await loadUsers();
    // Also refresh the auth store user if it's the current user
    if (selectedUser.value.uid === authStore.user?.uid) {
      await authStore.refreshUser();
    }
  } else {
    errorMessage.value = result.error || 'Failed to update profile';
  }

  isLoading.value = false;
}

</script>
