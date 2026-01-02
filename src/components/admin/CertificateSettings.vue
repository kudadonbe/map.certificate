<template>
  <div class="settings-panel bg-white rounded-lg shadow p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Certificate Settings</h2>

    <div class="space-y-6">
      <!-- Default Template Selection -->
      <div class="setting-section">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Default Template</h3>
        <div class="flex items-center gap-4">
          <select 
            v-model="settings.defaultTemplateId"
            @change="updateSettings"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a template</option>
            <option 
              v-for="template in activeTemplates" 
              :key="template.id"
              :value="template.id"
            >
              {{ template.name }} ({{ template.size }} {{ template.orientation }})
            </option>
          </select>
          <router-link 
            to="/admin/templates"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
          >
            Manage Templates
          </router-link>
        </div>
        <p class="text-sm text-gray-600 mt-2">
          This template will be used for all new certificate generations
        </p>
      </div>

      <!-- Certificate Numbering -->
      <div class="setting-section border-t pt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Certificate Numbering</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Certificate Prefix
            </label>
            <input 
              v-model="settings.certificatePrefix"
              @blur="updateSettings"
              type="text"
              placeholder="MAP"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">e.g., "MAP" for MAP-2026-001</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Last Certificate Number
            </label>
            <input 
              v-model.number="settings.lastCertificateNumber"
              @blur="updateSettings"
              type="number"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Auto-incremented for each certificate</p>
          </div>
        </div>
      </div>

      <!-- PDF Generation Settings -->
      <div class="setting-section border-t pt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">PDF Generation</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Resolution (DPI)
            </label>
            <select 
              v-model.number="settings.pdfResolution"
              @change="updateSettings"
              class="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option :value="150">150 DPI (Draft)</option>
              <option :value="300">300 DPI (Standard)</option>
              <option :value="600">600 DPI (High Quality)</option>
            </select>
          </div>
          <div>
            <label class="flex items-center mt-8">
              <input 
                v-model="settings.embedFonts"
                @change="updateSettings"
                type="checkbox"
                class="mr-2 rounded"
              />
              <span class="text-sm text-gray-700">Embed fonts in PDF</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Participant Access Settings -->
      <div class="setting-section border-t pt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Participant Access</h3>
        <div class="space-y-3">
          <label class="flex items-center">
            <input 
              v-model="settings.allowParticipantDownload"
              @change="updateSettings"
              type="checkbox"
              class="mr-2 rounded"
            />
            <span class="text-sm text-gray-700">Allow participants to download certificates</span>
          </label>
          <label class="flex items-center">
            <input 
              v-model="settings.allowParticipantPreview"
              @change="updateSettings"
              type="checkbox"
              class="mr-2 rounded"
            />
            <span class="text-sm text-gray-700">Allow participants to preview certificates before generation</span>
          </label>
          <label class="flex items-center">
            <input 
              v-model="settings.emailNotificationOnGeneration"
              @change="updateSettings"
              type="checkbox"
              class="mr-2 rounded"
            />
            <span class="text-sm text-gray-700">Send email notification when certificate is generated</span>
          </label>
        </div>
      </div>

      <!-- Save Button -->
      <div class="border-t pt-6">
        <div class="flex items-center justify-between">
          <div v-if="saveStatus" class="text-sm">
            <span v-if="saveStatus === 'saving'" class="text-gray-600">Saving...</span>
            <span v-if="saveStatus === 'saved'" class="text-green-600">✓ Settings saved</span>
            <span v-if="saveStatus === 'error'" class="text-red-600">✗ Error saving settings</span>
          </div>
          <button 
            @click="saveSettings"
            :disabled="!hasChanges"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTemplateStore } from '@/stores/template.store';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const templateStore = useTemplateStore();

const settings = ref({
  defaultTemplateId: '',
  certificatePrefix: 'MAP',
  lastCertificateNumber: 0,
  pdfResolution: 300,
  embedFonts: true,
  allowParticipantDownload: true,
  allowParticipantPreview: true,
  emailNotificationOnGeneration: true,
  storagePath: {
    certificates: '/certificates/{year}/{month}/',
    templates: '/templates/',
    assets: '/assets/',
  },
});

const saveStatus = ref<'saving' | 'saved' | 'error' | null>(null);
const hasChanges = ref(false);
const originalSettings = ref<any>(null);

const activeTemplates = computed(() => templateStore.activeTemplates);

onMounted(async () => {
  await templateStore.loadTemplates();
  await loadSettings();
});

async function loadSettings() {
  try {
    const docRef = doc(db, 'settings', 'certificate_config');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      settings.value = { ...settings.value, ...docSnap.data() };
      originalSettings.value = JSON.parse(JSON.stringify(settings.value));
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function saveSettings() {
  saveStatus.value = 'saving';
  try {
    const docRef = doc(db, 'settings', 'certificate_config');
    await updateDoc(docRef, settings.value);
    
    originalSettings.value = JSON.parse(JSON.stringify(settings.value));
    hasChanges.value = false;
    saveStatus.value = 'saved';
    
    setTimeout(() => {
      saveStatus.value = null;
    }, 3000);
  } catch (error) {
    console.error('Error saving settings:', error);
    saveStatus.value = 'error';
    
    setTimeout(() => {
      saveStatus.value = null;
    }, 3000);
  }
}

function updateSettings() {
  hasChanges.value = true;
  setTimeout(() => {
    if (hasChanges.value) {
      saveSettings();
    }
  }, 1000);
}
</script>
