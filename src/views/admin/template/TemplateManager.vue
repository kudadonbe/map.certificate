<template>
  <MapLayout>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Certificate Templates</h1>
        <p class="text-sm text-gray-600 mt-1">Create and manage customizable certificate templates</p>
      </div>
      <button
        @click="createNewTemplate"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium flex items-center gap-2"
      >
        <PlusIcon class="w-5 h-5" />
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
        <div class="h-48 bg-gray-100 relative overflow-hidden p-3">
          <div class="flex h-full items-center">
            <TemporaryCertificate v-bind="getTemplatePreview(template)" />
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
              <DocumentDuplicateIcon class="w-4 h-4" />
            </button>
            <button
              v-if="!template.isDefault"
              @click="setAsDefault(template.id)"
              class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              title="Set as Default"
            >
              <StarIcon class="w-4 h-4" />
            </button>
            <button
              @click="confirmDelete(template.id)"
              class="px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-sm"
              title="Delete"
              :disabled="template.isDefault"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="templates.length === 0" class="col-span-full text-center py-12">
        <DocumentTextIcon class="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
        <p class="text-gray-600 mb-4">Create your first certificate template to get started</p>
        <button
          @click="createNewTemplate"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
  </MapLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTemplateStore } from '@/stores/template.store';
import TemplateEditor from '@/components/template/TemplateEditor.vue';
import TemporaryCertificate from '@/components/certificate/TemporaryCertificate.vue';
import MapLayout from '@/layouts/MapLayout.vue';
import type { CertificateTemplate, TextElement } from '@/types/template.types';
import {
  PlusIcon,
  DocumentDuplicateIcon,
  StarIcon,
  TrashIcon,
  DocumentTextIcon,
} from '@heroicons/vue/24/outline';

const templateStore = useTemplateStore();
const showEditor = ref(false);
const editingTemplateId = ref<string | undefined>(undefined);
const showDeleteModal = ref(false);
const deletingTemplateId = ref<string | null>(null);

const templates = computed(() => templateStore.templates);

function getTemplatePreview(template: CertificateTemplate) {
  const text = (id: string, fallback: string) => {
    const element = template.elements.find(
      item => item.id === id && item.type === 'text',
    ) as TextElement | undefined;
    return element?.content || fallback;
  };

  return {
    participantName: 'ހުސައިން އަލީ',
    idNumber: 'A123456',
    issueDate: '14 ޖޫން 2026',
    organization: text('header-dv-1', 'ފެމިލީ ކޯޓު'),
    location: text('header-dv-2', 'މާލެ، ދިވެހިރާއްޖެ'),
    title: text('title-dv', 'ކާވެންޏަށް ހޭލުންތެރިކުރުމުގެ ޕްރޮގްރާމު ފުރިހަމަކުރިކަމުގެ ލިޔުން'),
    textBeforeName: text('body-dv-1', 'މި ލިޔުމަކީ'),
    idLabel: text('id-label', 'އައިޑީކާޑު ނަންބަރު'),
    textAfterId: text('body-dv-2', 'ކާވެންޏަށް ހޭލުންތެރިކުރުމުގެ ޕްރޮގްރާމު ފުރިހަމަކޮށްފައިވާތީ ދޫކޮށްފައިވާ ލިޔުމެކެވެ.'),
    signatoryName: template.signatures[0]?.signatoryName || 'އަޙްމަދު ސައްފާނު',
    signatoryRole: template.signatures[0]?.signatoryTitle || text('signature-label', 'ޕްރޮގްރާމް ކޯޑިނޭޓަރ'),
    stampLabel: text('footer', 'ފެމިލީ ކޯޓު'),
    signatureUrl: template.signatures[0]?.url || '/certificate-assets/signature-template.png',
    sealUrl: template.stamps[0]?.url || '/certificate-assets/seal.jpg',
  };
}

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
