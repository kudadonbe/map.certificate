<template>
  <div class="template-editor bg-white rounded-lg shadow-lg p-6">
    <div class="flex gap-6">
      <!-- Left Sidebar - Controls -->
      <div class="w-80 flex-shrink-0 space-y-6 overflow-y-auto max-h-screen">
        <!-- Template Info -->
        <div class="space-y-4">
          <h2 class="text-xl font-bold text-gray-900">Template Settings</h2>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
            <input 
              v-model="template.name" 
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              v-model="template.description" 
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Page Settings -->
        <div class="space-y-4 border-t pt-4">
          <h3 class="text-lg font-semibold text-gray-900">Page Settings</h3>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Size</label>
            <select 
              v-model="template.size"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="A4">A4 (210 × 297mm)</option>
              <option value="Letter">Letter (215.9 × 279.4mm)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
            <select 
              v-model="template.orientation"
              @change="updateOrientation"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        </div>

        <!-- Background Settings -->
        <div class="space-y-4 border-t pt-4">
          <h3 class="text-lg font-semibold text-gray-900">Background</h3>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select 
              v-model="template.background.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="color">Solid Color</option>
              <option value="gradient">Gradient</option>
              <option value="image">Image</option>
            </select>
          </div>

          <div v-if="template.background.type === 'color'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input 
              v-model="template.background.value" 
              type="color"
              class="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>

          <div v-if="template.background.type === 'image'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
            <input 
              type="file" 
              accept="image/*"
              @change="handleBackgroundUpload"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        <!-- Border Settings -->
        <div class="space-y-4 border-t pt-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Border</h3>
            <label class="flex items-center">
              <input 
                v-model="template.border!.enabled" 
                type="checkbox"
                class="mr-2 rounded"
              />
              <span class="text-sm text-gray-700">Enable</span>
            </label>
          </div>

          <div v-if="template.border?.enabled">
            <label class="block text-sm font-medium text-gray-700 mb-1">Style</label>
            <select 
              v-model="template.border.style"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
            </select>
          </div>

          <div v-if="template.border?.enabled" class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
              <input 
                v-model.number="template.border.width" 
                type="number"
                min="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input 
                v-model="template.border.color" 
                type="color"
                class="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          </div>
        </div>

        <!-- Theme Colors -->
        <div class="space-y-4 border-t pt-4">
          <h3 class="text-lg font-semibold text-gray-900">Theme Colors</h3>
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Primary</label>
              <input 
                v-model="template.theme.primary" 
                type="color"
                class="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Secondary</label>
              <input 
                v-model="template.theme.secondary" 
                type="color"
                class="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Accent</label>
              <input 
                v-model="template.theme.accent" 
                type="color"
                class="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Text</label>
              <input 
                v-model="template.theme.text" 
                type="color"
                class="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          </div>
        </div>

        <!-- Signatures & Stamps -->
        <div class="space-y-4 border-t pt-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Signatures</h3>
            <button 
              @click="addSignature"
              class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Add
            </button>
          </div>

          <div v-for="(sig, idx) in template.signatures" :key="sig.id" class="p-3 bg-gray-50 rounded-md">
            <div class="flex justify-between items-start mb-2">
              <span class="text-sm font-medium">Signature {{ idx + 1 }}</span>
              <button @click="removeSignature(idx)" class="text-red-600 text-sm">Remove</button>
            </div>
            <div class="space-y-2">
              <input 
                v-model="sig.signatoryName" 
                placeholder="Signatory Name"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <input 
                v-model="sig.signatoryTitle" 
                placeholder="Title"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <input 
                type="file" 
                accept="image/*"
                @change="(e) => handleSignatureUpload(e, idx)"
                class="w-full text-xs"
              />
            </div>
          </div>
        </div>

        <div class="space-y-4 border-t pt-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Stamps/Seals</h3>
            <button 
              @click="addStamp"
              class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Add
            </button>
          </div>

          <div v-for="(stamp, idx) in template.stamps" :key="stamp.id" class="p-3 bg-gray-50 rounded-md">
            <div class="flex justify-between items-start mb-2">
              <span class="text-sm font-medium">Stamp {{ idx + 1 }}</span>
              <button @click="removeStamp(idx)" class="text-red-600 text-sm">Remove</button>
            </div>
            <div class="space-y-2">
              <select 
                v-model="stamp.stampType"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="official-seal">Official Seal</option>
                <option value="stamp">Stamp</option>
                <option value="watermark">Watermark</option>
              </select>
              <input 
                type="file" 
                accept="image/*"
                @change="(e) => handleStampUpload(e, idx)"
                class="w-full text-xs"
              />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 border-t pt-4 sticky bottom-0 bg-white">
          <button 
            @click="saveTemplate"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Save Template
          </button>
          <button 
            @click="$emit('cancel')"
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>

      <!-- Right Side - Preview -->
      <div class="flex-1 flex flex-col items-center justify-start bg-gray-100 p-8 rounded-lg">
        <div class="mb-4 flex items-center gap-4">
          <h3 class="text-lg font-semibold">Preview</h3>
          <div class="flex gap-2">
            <button 
              @click="previewMode = 'print'"
              :class="previewMode === 'print' ? 'bg-blue-600 text-white' : 'bg-white'"
              class="px-3 py-1 rounded-md text-sm border"
            >
              Print (A4)
            </button>
            <button 
              @click="previewMode = 'mobile'"
              :class="previewMode === 'mobile' ? 'bg-blue-600 text-white' : 'bg-white'"
              class="px-3 py-1 rounded-md text-sm border"
            >
              Mobile View
            </button>
          </div>
        </div>

        <!-- Certificate Preview -->
        <div 
          :class="[
            'certificate-preview bg-white shadow-xl',
            previewMode === 'mobile' ? 'w-[375px] scale-90' : 'w-[210mm] h-[297mm]',
            template.orientation === 'landscape' ? 'landscape' : 'portrait'
          ]"
          :style="certificateStyle"
        >
          <!-- Render certificate elements here -->
          <div class="relative w-full h-full">
            <div v-for="element in template.elements" :key="element.id" 
                 :style="getElementStyle(element)"
                 class="absolute">
              <component 
                :is="getElementComponent(element.type)"
                :element="element"
                :data="sampleData"
              />
            </div>
            
            <!-- Signatures -->
            <div v-for="sig in template.signatures" :key="sig.id"
                 :style="getElementStyle(sig)"
                 class="absolute">
              <img v-if="sig.url" :src="sig.url" :alt="sig.alt" class="max-w-full h-auto" />
              <div v-if="sig.showName" class="text-center mt-1 text-sm">{{ sig.signatoryName }}</div>
              <div v-if="sig.showTitle" class="text-center text-xs text-gray-600">{{ sig.signatoryTitle }}</div>
            </div>

            <!-- Stamps -->
            <div v-for="stamp in template.stamps" :key="stamp.id"
                 :style="getElementStyle(stamp)"
                 class="absolute">
              <img v-if="stamp.url" :src="stamp.url" :alt="stamp.alt" 
                   :style="{ opacity: stamp.opacity || 1 }"
                   class="max-w-full h-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { CertificateTemplate } from '@/types/template.types';
import { useTemplateStore } from '@/stores/template.store';

const props = defineProps<{
  templateId?: string;
  initialTemplate?: CertificateTemplate;
}>();

const emit = defineEmits(['save', 'cancel']);

const templateStore = useTemplateStore();
const template = ref<CertificateTemplate>(props.initialTemplate || createEmptyTemplate());
const previewMode = ref<'print' | 'mobile'>('print');

const sampleData = {
  certificateNumber: 'MAP-2026-001',
  name: 'Ahmed Ali',
  name_dv: 'އަހްމަދު އަލީ',
  partnerName: 'Aminath Sara',
  partnerName_dv: 'އާމިނަތު ސާރާ',
  courseDate: new Date('2026-01-15'),
  issueDate: new Date('2026-01-20'),
};

const certificateStyle = computed(() => {
  const bg = template.value.background;
  let backgroundColor: string = '#ffffff';
  
  if (bg.type === 'color') {
    backgroundColor = typeof bg.value === 'string' ? bg.value : '#ffffff';
  } else if (bg.type === 'gradient' && typeof bg.value === 'object') {
    backgroundColor = `linear-gradient(${bg.value.angle || 0}deg, ${bg.value.from}, ${bg.value.to})`;
  }
  
  return {
    backgroundColor,
    backgroundImage: bg.image ? `url(${bg.image})` : undefined,
    border: template.value.border?.enabled 
      ? `${template.value.border.width}px ${template.value.border.style} ${template.value.border.color}`
      : 'none',
  };
});

function createEmptyTemplate(): CertificateTemplate {
  return {
    id: '',
    name: 'New Template',
    description: '',
    size: 'A4',
    orientation: 'portrait',
    width: 210,
    height: 297,
    background: { type: 'color', value: '#ffffff', opacity: 1 },
    border: { enabled: true, width: 2, color: '#1e40af', style: 'solid', margin: 15 },
    elements: [],
    signatures: [],
    stamps: [],
    theme: { primary: '#1e40af', secondary: '#3b82f6', accent: '#f59e0b', text: '#1f2937' },
    createdBy: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    isDefault: false,
    isActive: true,
    printSettings: { margin: { top: 0, right: 0, bottom: 0, left: 0 }, resolution: 300 },
  };
}

function updateOrientation() {
  if (template.value.orientation === 'landscape') {
    template.value.width = 297;
    template.value.height = 210;
  } else {
    template.value.width = 210;
    template.value.height = 297;
  }
}

async function handleBackgroundUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const url = await templateStore.uploadAsset(file, 'background');
    template.value.background.image = url;
  }
}

async function handleSignatureUpload(event: Event, index: number) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const url = await templateStore.uploadAsset(file, 'signature');
    template.value.signatures[index].url = url;
  }
}

async function handleStampUpload(event: Event, index: number) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const url = await templateStore.uploadAsset(file, 'stamp');
    template.value.stamps[index].url = url;
  }
}

function addSignature() {
  template.value.signatures.push({
    id: `sig-${Date.now()}`,
    type: 'image',
    url: '',
    alt: 'Signature',
    position: { x: 50, y: 250, width: 100, height: 50 },
    zIndex: 10,
    visible: true,
    signatoryName: '',
    signatoryTitle: '',
    showName: true,
    showTitle: true,
    opacity: 1,
  });
}

function removeSignature(index: number) {
  template.value.signatures.splice(index, 1);
}

function addStamp() {
  template.value.stamps.push({
    id: `stamp-${Date.now()}`,
    type: 'image',
    url: '',
    alt: 'Stamp',
    position: { x: 150, y: 250, width: 80, height: 80 },
    zIndex: 10,
    visible: true,
    stampType: 'official-seal',
    opacity: 1,
  });
}

function removeStamp(index: number) {
  template.value.stamps.splice(index, 1);
}

function getElementStyle(element: any) {
  return {
    left: `${element.position.x}mm`,
    top: `${element.position.y}mm`,
    width: element.position.width ? `${element.position.width}mm` : 'auto',
    height: element.position.height ? `${element.position.height}mm` : 'auto',
    zIndex: element.zIndex,
  };
}

function getElementComponent(_type: string) {
  return 'div'; // Placeholder - implement actual components
}

async function saveTemplate() {
  try {
    if (props.templateId) {
      await templateStore.updateTemplate(props.templateId, template.value);
    } else {
      await templateStore.createTemplate(template.value);
    }
    emit('save');
  } catch (error) {
    console.error('Error saving template:', error);
  }
}

onMounted(async () => {
  if (props.templateId) {
    await templateStore.loadTemplate(props.templateId);
    if (templateStore.activeTemplate) {
      template.value = templateStore.activeTemplate;
    }
  }
});
</script>

<style scoped>
.certificate-preview {
  transition: all 0.3s ease;
}

.certificate-preview.landscape {
  transform: rotate(0deg);
}

@media print {
  .certificate-preview {
    box-shadow: none;
  }
}
</style>
