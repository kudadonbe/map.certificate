import type { CertificateTemplate } from '../types/template.types';

export const DEFAULT_A4_PORTRAIT_TEMPLATE: Omit<CertificateTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
  name: 'MAP Certificate (Official)',
  description: 'Marriage Awareness Program Certificate - Family Court Maldives',
  size: 'A4',
  orientation: 'portrait',
  width: 210,
  height: 297,
  
  background: {
    type: 'color',
    value: '#ffffff',
    opacity: 1,
  },
  
  border: {
    enabled: true,
    width: 2,
    color: '#2563eb',
    style: 'solid',
    radius: 0,
    margin: 20,
  },
  
  theme: {
    primary: '#2563eb',
    secondary: '#3b82f6',
    accent: '#10b981',
    text: '#1f2937',
  },
  
  elements: [
    // Family Court Logo - Top Left
    {
      id: 'logo-left',
      type: 'image',
      url: '/assets/family-court-logo.png',
      alt: 'Family Court Logo',
      position: { x: 25, y: 25, width: 30, height: 30 },
      zIndex: 10,
      visible: true,
      opacity: 1,
      fit: 'contain',
    },
    
    // Family Court Logo - Top Right
    {
      id: 'logo-right',
      type: 'image',
      url: '/assets/family-court-logo.png',
      alt: 'Family Court Logo',
      position: { x: 155, y: 25, width: 30, height: 30 },
      zIndex: 10,
      visible: true,
      opacity: 1,
      fit: 'contain',
    },

    // Header - Dhivehi (ފެމިލީ ކޯޓު)
    {
      id: 'header-dv-1',
      type: 'text',
      content: 'ފެމިލީ ކޯޓު',
      position: { x: 105, y: 30, width: 180 },
      zIndex: 10,
      visible: true,
      font: {
        size: 18,
        weight: 'bold',
        color: '#1f2937',
        family: 'Arial',
      },
      align: 'center',
      language: 'dv',
    },
    
    // Sub-header - Dhivehi (މާލެ، ދިވެހިރާއްޖެ)
    {
      id: 'header-dv-2',
      type: 'text',
      content: 'މާލެ، ދިވެހިރާއްޖެ',
      position: { x: 105, y: 38, width: 180 },
      zIndex: 10,
      visible: true,
      font: {
        size: 14,
        weight: 'normal',
        color: '#4b5563',
        family: 'Arial',
      },
      align: 'center',
      language: 'dv',
    },

    // Certificate Title - Dhivehi
    {
      id: 'title-dv',
      type: 'text',
      content: 'ކައިވެންޏަށް ހޭލުންތެރި ކުރުމުގެ ޕްރޮގްރާމުގައި ބައިވެރިވިކަމުގެ ލިޔުން',
      position: { x: 105, y: 80, width: 160 },
      zIndex: 10,
      visible: true,
      font: {
        size: 16,
        weight: 'bold',
        color: '#1f2937',
        family: 'Arial',
      },
      align: 'center',
      language: 'dv',
    },

    // Certificate Body - Dhivehi (Part 1)
    {
      id: 'body-dv-1',
      type: 'text',
      content: 'މިލިޔުމަކީ',
      position: { x: 105, y: 110, width: 160 },
      zIndex: 10,
      visible: true,
      font: {
        size: 14,
        weight: 'normal',
        color: '#1f2937',
        family: 'Arial',
      },
      align: 'center',
      language: 'dv',
    },

    // Participant Name - Dynamic Field
    {
      id: 'participant-name',
      type: 'text',
      content: '{{name}}',
      position: { x: 105, y: 125, width: 160 },
      zIndex: 10,
      visible: true,
      font: {
        size: 18,
        weight: 'bold',
        color: '#2563eb',
        family: 'Arial',
      },
      align: 'center',
      language: 'dv',
    },

    // ID Card Number Label
    {
      id: 'id-label',
      type: 'text',
      content: 'އައިޑީކާޑް ނަންބަރު',
      position: { x: 105, y: 140, width: 160 },
      zIndex: 10,
      visible: true,
      font: {
        size: 14,
        weight: 'normal',
        color: '#1f2937',
        family: 'Arial',
      },
      align: 'center',
      language: 'dv',
    },

    // ID Number - Dynamic Field
    {
      id: 'id-number',
      type: 'text',
      content: '{{id_number}}',
      position: { x: 105, y: 150, width: 160 },
      zIndex: 10,
      visible: true,
      font: {
        size: 16,
        weight: 'bold',
        color: '#1f2937',
        family: 'Arial',
      },
      align: 'center',
      language: 'en',
    },

    // Certificate Body - Dhivehi (Part 2)
    {
      id: 'body-dv-2',
      type: 'text',
      content: 'ކައިވެންޏަށް ހޭލުންތެރިކުރުމުގެ ޕްރޮގްރާމުގައި ބައިވެރިވެފައިވާތީ ދޫކޮށްފައިވާ ލިޔުމެކެވެ.',
      position: { x: 105, y: 170, width: 160 },
      zIndex: 10,
      visible: true,
      font: {
        size: 14,
        weight: 'normal',
        color: '#1f2937',
        family: 'Arial',
      },
      align: 'center',
      language: 'dv',
    },

    // Issue Date - Dynamic Field
    {
      id: 'issue-date',
      type: 'text',
      content: '{{day}} {{month}} {{year}}',
      position: { x: 105, y: 195, width: 160 },
      zIndex: 10,
      visible: true,
      font: {
        size: 14,
        weight: 'bold',
        color: '#1f2937',
        family: 'Arial',
      },
      align: 'center',
      language: 'dv',
    },

    // Signature Label
    {
      id: 'signature-label',
      type: 'text',
      content: 'ޕްރޮގްރާމް ކޯޑިނޭޓަރ',
      position: { x: 105, y: 240, width: 160 },
      zIndex: 10,
      visible: true,
      font: {
        size: 12,
        weight: 'normal',
        color: '#4b5563',
        family: 'Arial',
      },
      align: 'center',
      language: 'dv',
    },

    // Footer
    {
      id: 'footer',
      type: 'text',
      content: 'ފެމިލީ ކޯޓު',
      position: { x: 105, y: 250, width: 160 },
      zIndex: 10,
      visible: true,
      font: {
        size: 11,
        weight: 'normal',
        color: '#6b7280',
        family: 'Arial',
      },
      align: 'center',
      language: 'dv',
    },
  ],

  signatures: [
    {
      id: 'coordinator-signature',
      type: 'image',
      url: '',
      alt: 'Program Coordinator Signature',
      position: { x: 85, y: 220, width: 40, height: 15 },
      zIndex: 10,
      visible: true,
      signatoryName: 'ޕްރޮގްރާމް ކޯޑިނޭޓަރ',
      signatoryTitle: 'Program Coordinator',
      showName: false,
      showTitle: false,
      opacity: 1,
    },
  ],

  stamps: [
    {
      id: 'official-seal',
      type: 'image',
      url: '',
      alt: 'Family Court Official Seal',
      position: { x: 155, y: 215, width: 25, height: 25 },
      zIndex: 9,
      visible: true,
      opacity: 0.9,
      stampType: 'official-seal',
    },
  ],

  version: 1,
  isDefault: true,
  isActive: true,

  printSettings: {
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    resolution: 300,
  },
};

export const DEFAULT_A4_LANDSCAPE_TEMPLATE: Omit<CertificateTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
  ...DEFAULT_A4_PORTRAIT_TEMPLATE,
  name: 'MAP Certificate Landscape',
  description: 'Marriage Awareness Program Certificate - Landscape orientation',
  orientation: 'landscape',
  width: 297,
  height: 210,
};

export function createDefaultTemplate(
  orientation: 'portrait' | 'landscape' = 'portrait', 
  createdBy: string
): Omit<CertificateTemplate, 'id'> {
  const base = orientation === 'portrait' 
    ? DEFAULT_A4_PORTRAIT_TEMPLATE 
    : DEFAULT_A4_LANDSCAPE_TEMPLATE;
  
  return {
    ...base,
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
