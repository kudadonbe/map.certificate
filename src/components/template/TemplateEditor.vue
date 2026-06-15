<template>
  <div class="rounded-xl bg-white p-6 shadow-lg">
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-gray-900">
          {{ templateId ? 'Edit Certificate Template' : 'New Certificate Template' }}
        </h2>
        <p class="mt-1 text-sm text-gray-600">
          Edit the saved template and preview it with test participant information.
        </p>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          @click="$emit('cancel')"
          class="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="isSaving"
          @click="saveTemplate"
          class="rounded-md bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ isSaving ? 'Saving...' : 'Save Template' }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-16">
      <div class="h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600"></div>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <div class="max-h-[760px] space-y-5 overflow-y-auto pr-2">
        <fieldset class="space-y-3">
          <legend class="mb-2 font-semibold text-gray-900">Template Details</legend>
          <label class="block text-sm text-gray-700">
            Template Name
            <input
              v-model="template.name"
              required
              class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label class="block text-sm text-gray-700">
            Description
            <textarea
              v-model="template.description"
              rows="2"
              class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input v-model="template.isActive" type="checkbox" class="rounded" />
              Active
            </label>
            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input v-model="template.isDefault" type="checkbox" class="rounded" />
              Default
            </label>
          </div>
          <p class="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-800">
            This official certificate uses A4 landscape layout.
          </p>
        </fieldset>

        <fieldset class="space-y-3 border-t pt-5">
          <legend class="mb-2 font-semibold text-gray-900">Test Participant</legend>
          <label class="block text-sm text-gray-700">
            Name
            <input v-model="sampleData.participantName" dir="rtl" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
          </label>
          <label class="block text-sm text-gray-700">
            ID Number
            <input v-model="sampleData.idNumber" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
          </label>
          <label class="block text-sm text-gray-700">
            Issue Date
            <input v-model="sampleData.issueDate" dir="rtl" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
          </label>
          <p class="text-xs text-gray-500">Test participant values are preview-only and are not saved.</p>
        </fieldset>

        <fieldset class="space-y-3 border-t pt-5">
          <legend class="mb-2 font-semibold text-gray-900">Certificate Text</legend>
          <label
            v-for="field in editableFields"
            :key="field.key"
            class="block text-sm text-gray-700"
          >
            {{ field.label }}
            <textarea
              v-if="field.multiline"
              v-model="certificateFields[field.key]"
              dir="rtl"
              rows="3"
              class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <input
              v-else
              v-model="certificateFields[field.key]"
              dir="rtl"
              class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
        </fieldset>

        <p v-if="errorMessage" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ errorMessage }}
        </p>
      </div>

      <div class="min-w-0 self-start rounded-lg bg-gray-100 p-4">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900">Live Preview</h3>
          <span class="text-xs text-gray-500">A4 landscape</span>
        </div>
        <TemporaryCertificate
          v-bind="certificateFields"
          :participant-name="sampleData.participantName"
          :id-number="sampleData.idNumber"
          :issue-date="sampleData.issueDate"
          :signature-url="signatureUrl"
          :seal-url="sealUrl"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TemporaryCertificate from '@/components/certificate/TemporaryCertificate.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useTemplateStore } from '@/stores/template.store';
import type {
  CertificateTemplate,
  TextElement,
} from '@/types/template.types';
import { createDefaultTemplate } from '@/utils/template.defaults';

type CertificateFields = {
  organization: string;
  location: string;
  title: string;
  textBeforeName: string;
  idLabel: string;
  textAfterId: string;
  signatoryName: string;
  signatoryRole: string;
  stampLabel: string;
};

type CertificateFieldKey = keyof CertificateFields;

const props = defineProps<{
  templateId?: string;
}>();

const emit = defineEmits<{
  save: [];
  cancel: [];
}>();

const templateStore = useTemplateStore();
const authStore = useAuthStore();
const isLoading = ref(false);
const isSaving = ref(false);
const errorMessage = ref('');

const defaultTemplate = createTemplateModel();
const template = ref<CertificateTemplate>(defaultTemplate);
const sampleData = ref({
  participantName: 'ހުސައިން އަލީ',
  idNumber: 'A123456',
  issueDate: '14 ޖޫން 2026',
});
const certificateFields = ref<CertificateFields>({
  organization: 'ފެމިލީ ކޯޓު',
  location: 'މާލެ، ދިވެހިރާއްޖެ',
  title: 'ކާވެންޏަށް ހޭލުންތެރިކުރުމުގެ ޕްރޮގްރާމު ފުރިހަމަކުރިކަމުގެ ލިޔުން',
  textBeforeName: 'މި ލިޔުމަކީ',
  idLabel: 'އައިޑީކާޑު ނަންބަރު',
  textAfterId: 'ކާވެންޏަށް ހޭލުންތެރިކުރުމުގެ ޕްރޮގްރާމު ފުރިހަމަކޮށްފައިވާތީ ދޫކޮށްފައިވާ ލިޔުމެކެވެ.',
  signatoryName: 'އަޙްމަދު ސައްފާނު',
  signatoryRole: 'ޕްރޮގްރާމް ކޯޑިނޭޓަރ',
  stampLabel: 'ފެމިލީ ކޯޓު',
});

const editableFields: Array<{ key: CertificateFieldKey; label: string; multiline?: boolean }> = [
  { key: 'organization', label: 'Organization' },
  { key: 'location', label: 'Location' },
  { key: 'title', label: 'Certificate Title', multiline: true },
  { key: 'textBeforeName', label: 'Text Before Name' },
  { key: 'idLabel', label: 'ID Label' },
  { key: 'textAfterId', label: 'Body Text After ID', multiline: true },
  { key: 'signatoryName', label: 'Signatory Name' },
  { key: 'signatoryRole', label: 'Signatory Role' },
  { key: 'stampLabel', label: 'Stamp Label' },
];

const signatureUrl = ref('/certificate-assets/signature-template.png');
const sealUrl = ref('/certificate-assets/seal.jpg');

function createTemplateModel(): CertificateTemplate {
  const createdBy = authStore.user?.uid || '';
  const base = createDefaultTemplate('landscape', createdBy);
  return {
    id: '',
    ...base,
    name: 'MAP Certificate',
    description: 'Official Marriage Awareness Program certificate',
    orientation: 'landscape',
    width: 297,
    height: 210,
  };
}

function getTextContent(id: string, fallback: string): string {
  const element = template.value.elements.find(
    item => item.id === id && item.type === 'text',
  ) as TextElement | undefined;
  return element?.content || fallback;
}

function readCertificateFields() {
  certificateFields.value = {
    organization: getTextContent('header-dv-1', certificateFields.value.organization),
    location: getTextContent('header-dv-2', certificateFields.value.location),
    title: getTextContent('title-dv', certificateFields.value.title),
    textBeforeName: getTextContent('body-dv-1', certificateFields.value.textBeforeName),
    idLabel: getTextContent('id-label', certificateFields.value.idLabel),
    textAfterId: getTextContent('body-dv-2', certificateFields.value.textAfterId),
    signatoryName: template.value.signatures[0]?.signatoryName || certificateFields.value.signatoryName,
    signatoryRole: template.value.signatures[0]?.signatoryTitle || getTextContent('signature-label', certificateFields.value.signatoryRole),
    stampLabel: getTextContent('footer', certificateFields.value.stampLabel),
  };

  signatureUrl.value = template.value.signatures[0]?.url || '/certificate-assets/signature-template.png';
  sealUrl.value = template.value.stamps[0]?.url || '/certificate-assets/seal.jpg';
}

function updateTextElement(id: string, content: string) {
  let element = template.value.elements.find(
    item => item.id === id && item.type === 'text',
  ) as TextElement | undefined;

  if (!element) {
    const defaultElement = defaultTemplate.elements.find(
      item => item.id === id && item.type === 'text',
    ) as TextElement | undefined;
    if (!defaultElement) return;

    element = structuredClone(defaultElement);
    template.value.elements.push(element);
  }

  element.content = content;
}

function applyCertificateFields() {
  updateTextElement('header-dv-1', certificateFields.value.organization);
  updateTextElement('header-dv-2', certificateFields.value.location);
  updateTextElement('title-dv', certificateFields.value.title);
  updateTextElement('body-dv-1', certificateFields.value.textBeforeName);
  updateTextElement('id-label', certificateFields.value.idLabel);
  updateTextElement('body-dv-2', certificateFields.value.textAfterId);
  updateTextElement('signature-label', certificateFields.value.signatoryRole);
  updateTextElement('footer', certificateFields.value.stampLabel);

  if (!template.value.signatures[0] && defaultTemplate.signatures[0]) {
    template.value.signatures.push(structuredClone(defaultTemplate.signatures[0]));
  }
  template.value.signatures[0].signatoryName = certificateFields.value.signatoryName;
  template.value.signatures[0].signatoryTitle = certificateFields.value.signatoryRole;
  template.value.signatures[0].url = signatureUrl.value;

  if (!template.value.stamps[0] && defaultTemplate.stamps[0]) {
    template.value.stamps.push(structuredClone(defaultTemplate.stamps[0]));
  }
  template.value.stamps[0].url = sealUrl.value;

  template.value.orientation = 'landscape';
  template.value.width = 297;
  template.value.height = 210;
}

async function saveTemplate() {
  if (!template.value.name.trim()) {
    errorMessage.value = 'Template name is required.';
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';
  applyCertificateFields();

  try {
    const { id, createdAt, updatedAt, version, ...templateData } = template.value;
    if (props.templateId) {
      await templateStore.updateTemplate(props.templateId, templateData);
    } else {
      await templateStore.createTemplate(templateData);
    }
    emit('save');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to save template.';
  } finally {
    isSaving.value = false;
  }
}

onMounted(async () => {
  if (!props.templateId) return;

  isLoading.value = true;
  try {
    await templateStore.loadTemplate(props.templateId);
    if (templateStore.activeTemplate) {
      template.value = structuredClone(templateStore.activeTemplate);
      readCertificateFields();
    }
  } finally {
    isLoading.value = false;
  }
});
</script>
