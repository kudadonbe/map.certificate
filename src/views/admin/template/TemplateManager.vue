<template>
  <div class="template-manager p-6">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Certificate Templates</h1>
        <p class="text-sm text-gray-600 mt-1">Create and manage customizable certificate templates</p>
      </div>
      <button 
        @click="createNewTemplate"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Template
      </button>
    </div>

    <!-- Template List -->
    <div v-if="!showEditor" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="template in templates" 
        :key="template.id"
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      >
        <!-- Preview Thumbnail -->
        <div class="h-48 bg-gray-100 relative">
          <div 
            class="w-full h-full flex items-center justify-center"
            :style="{ backgroundColor: template.background.value }"
          >
            <span class="text-4xl text-gray-400">📄</span>
          </div>
          <div v-if="template.isDefault" class="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
            Default
          </div>
          <div v-if="!template.isActive" class="absolute top-2 left-2 px-2 py-1 bg-gray-500 text-white text-xs rounded-full">
            Inactive
          </div>
        </div>

        <!-- Template Info -->
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ template.name }}</h3>
          <p class="text-sm text-gray-600 mb-3">{{ template.description || 'No description' }}</p>
          
          <div class="flex items-center text-xs text-gray-500 mb-3 gap-3">
            <span>{{ template.size }} {{ template.orientation }}</span>
            <span>v{{ template.version }}</span>
            <span>{{ formatDate(template.updatedAt) }}</span>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button 
              @click="editTemplate(template.id)"
              class="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm font-medium"
            >
              Edit
            </button>
            <button 
              @click="duplicateTemplate(template.id)"
              class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              title="Duplicate"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button 
              v-if="!template.isDefault"
              @click="setAsDefault(template.id)"
              class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              title="Set as Default"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            <button 
              @click="confirmDelete(template.id)"
              class="px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-sm"
              title="Delete"
              :disabled="template.isDefault"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="templates.length === 0" class="col-span-full text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
        <p class="text-gray-600 mb-4">Create your first certificate template to get started</p>
        <button 
          @click="createNewTemplate"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Template
        </button>
      </div>
    </div>

    <!-- Template Editor -->
    <TemplateEditor 
      v-if="showEditor"
      :template-id="editingTemplateId"
      @save="handleSave"
      @cancel="handleCancel"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Delete Template</h3>
        <p class="text-gray-600 mb-4">Are you sure you want to delete this template? This action cannot be undone.</p>
        <div class="flex gap-3 justify-end">
          <button 
            @click="showDeleteModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="handleDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTemplateStore } from '@/stores/template.store';
import TemplateEditor from '@/components/template/TemplateEditor.vue';

const templateStore = useTemplateStore();
const showEditor = ref(false);
const editingTemplateId = ref<string | undefined>(undefined);
const showDeleteModal = ref(false);
const deletingTemplateId = ref<string | null>(null);

const templates = computed(() => templateStore.templates);

onMounted(async () => {
  await templateStore.loadTemplates();
});

function createNewTemplate() {
  editingTemplateId.value = undefined;
  showEditor.value = true;
}

function editTemplate(id: string) {
  editingTemplateId.value = id;
  showEditor.value = true;
}

async function duplicateTemplate(id: string) {
  const template = templates.value.find(t => t.id === id);
  if (template) {
    const newName = prompt('Enter name for duplicated template:', `${template.name} (Copy)`);
    if (newName) {
      await templateStore.duplicateTemplate(id, newName);
    }
  }
}

async function setAsDefault(id: string) {
  if (confirm('Set this template as default?')) {
    await templateStore.setDefaultTemplate(id);
  }
}

function confirmDelete(id: string) {
  deletingTemplateId.value = id;
  showDeleteModal.value = true;
}

async function handleDelete() {
  if (deletingTemplateId.value) {
    await templateStore.deleteTemplate(deletingTemplateId.value);
    showDeleteModal.value = false;
    deletingTemplateId.value = null;
  }
}

function handleSave() {
  showEditor.value = false;
  editingTemplateId.value = undefined;
}

function handleCancel() {
  showEditor.value = false;
  editingTemplateId.value = undefined;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
}
</script>
