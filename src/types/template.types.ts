// Certificate Template Types

export type TemplateOrientation = 'portrait' | 'landscape';
export type TemplateSize = 'A4' | 'Letter';

export interface FontStyle {
  family: string;
  size: number;
  weight: number | string;
  color: string;
  style?: 'normal' | 'italic';
  lineHeight?: number;
}

export interface Position {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'qr-code' | 'line' | 'shape';
  position: Position;
  zIndex: number;
  visible: boolean;
}

export interface TextElement extends TemplateElement {
  type: 'text';
  content: string;
  field?: string; // Dynamic field reference
  font: FontStyle;
  align: 'left' | 'center' | 'right';
  language?: 'en' | 'dv';
}

export interface ImageElement extends TemplateElement {
  type: 'image';
  url: string;
  alt: string;
  opacity?: number;
  fit?: 'contain' | 'cover' | 'fill';
}

export interface SignatureElement extends ImageElement {
  signatoryName: string;
  signatoryTitle: string;
  showName: boolean;
  showTitle: boolean;
}

export interface StampElement extends ImageElement {
  stampType: 'official-seal' | 'stamp' | 'watermark';
}

export interface QRCodeElement extends TemplateElement {
  type: 'qr-code';
  data: string;
  size: number;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string;
  
  // Page Settings
  size: TemplateSize;
  orientation: TemplateOrientation;
  width: number; // mm
  height: number; // mm
  
  // Background
  background: {
    type: 'color' | 'image' | 'gradient';
    value: string | { from: string; to: string; angle?: number };
    image?: string; // URL to background image
    opacity?: number;
  };
  
  // Border
  border?: {
    enabled: boolean;
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted' | 'double';
    radius?: number;
    margin?: number;
  };
  
  // Template Elements
  elements: (TextElement | ImageElement | SignatureElement | StampElement | QRCodeElement)[];
  
  // Signatures
  signatures: SignatureElement[];
  
  // Stamps/Seals
  stamps: StampElement[];
  
  // Theme Colors
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  isDefault: boolean;
  isActive: boolean;
  
  // Print Settings
  printSettings: {
    margin: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    resolution: number; // DPI
  };
}

export interface CertificateData {
  // Participant Information
  certificateNumber: string;
  name: string;
  name_dv?: string;
  partnerName: string;
  partnerName_dv?: string;
  idNumber?: string;
  partnerIdNumber?: string;
  
  // Program Information
  courseDate: Date;
  issueDate: Date;
  completionDate?: Date;
  
  // Additional Fields
  [key: string]: any;
}

export interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number';
  required: boolean;
  bilingual: boolean;
  placeholder?: string;
}

export const DEFAULT_TEMPLATE_FIELDS: TemplateField[] = [
  { key: 'certificateNumber', label: 'Certificate Number', type: 'text', required: true, bilingual: false },
  { key: 'name', label: 'Participant Name', type: 'text', required: true, bilingual: true },
  { key: 'name_dv', label: 'Participant Name (Dhivehi)', type: 'text', required: false, bilingual: true },
  { key: 'partnerName', label: 'Partner Name', type: 'text', required: true, bilingual: true },
  { key: 'partnerName_dv', label: 'Partner Name (Dhivehi)', type: 'text', required: false, bilingual: true },
  { key: 'courseDate', label: 'Course Date', type: 'date', required: true, bilingual: false },
  { key: 'issueDate', label: 'Issue Date', type: 'date', required: true, bilingual: false },
  { key: 'idNumber', label: 'ID Number', type: 'text', required: false, bilingual: false },
  { key: 'partnerIdNumber', label: 'Partner ID Number', type: 'text', required: false, bilingual: false },
];
