# Certificate Template System - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

Required packages:
- Firebase (Firestore, Storage, Auth)
- Vue 3
- Pinia (state management)
- Tailwind CSS

### 2. Firebase Setup

#### Initialize Firestore Collection

Run this script once to create the initial template:

```javascript
// scripts/initializeTemplate.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { DEFAULT_A4_PORTRAIT_TEMPLATE } from '../src/utils/template.defaults';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeDefaultTemplate() {
  try {
    const template = {
      ...DEFAULT_A4_PORTRAIT_TEMPLATE,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = await addDoc(collection(db, 'certificate_templates'), template);
    console.log('Default template created with ID:', docRef.id);
  } catch (error) {
    console.error('Error creating template:', error);
  }
}

initializeDefaultTemplate();
```

Run:
```bash
node scripts/initializeTemplate.js
```

#### Set up Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Assets folder - Admin upload, public read
    match /assets/{type}/{filename} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.token.role == 'admin';
    }
    
    // Certificates - Admin write, owner read
    match /certificates/{year}/{month}/{filename} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.token.role == 'admin';
    }
  }
}
```

#### Set up Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Certificate Templates
    match /certificate_templates/{templateId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.token.role == 'admin';
    }
    
    // Settings
    match /settings/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.token.role == 'admin';
    }
  }
}
```

### 3. Add Routes

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import TemplateManager from '@/views/admin/template/TemplateManager.vue';

const routes = [
  // ... other routes
  {
    path: '/admin/templates',
    name: 'TemplateManager',
    component: TemplateManager,
    meta: { requiresAuth: true, role: 'admin' },
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
```

### 4. Add to Navigation

```vue
<!-- AdminLayout.vue -->
<nav>
  <router-link to="/admin/dashboard">Dashboard</router-link>
  <router-link to="/admin/participants">Participants</router-link>
  <router-link to="/admin/templates">Certificate Templates</router-link>
  <router-link to="/admin/settings">Settings</router-link>
</nav>
```

## 📋 Usage Examples

### Creating a Template

```typescript
import { useTemplateStore } from '@/stores/template.store';

const templateStore = useTemplateStore();

const newTemplate = {
  name: 'My Custom Template',
  description: 'A custom certificate design',
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
    color: '#1e40af',
    style: 'solid',
    margin: 15,
  },
  theme: {
    primary: '#1e40af',
    secondary: '#3b82f6',
    accent: '#f59e0b',
    text: '#1f2937',
  },
  elements: [],
  signatures: [],
  stamps: [],
  createdBy: currentUserId,
  isDefault: false,
  isActive: true,
  printSettings: {
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    resolution: 300,
  },
};

const templateId = await templateStore.createTemplate(newTemplate);
```

### Adding a Signature

```typescript
// In TemplateEditor component
async function addSignatureToTemplate(file: File) {
  // Upload signature image
  const signatureUrl = await templateStore.uploadAsset(file, 'signature');
  
  // Add to template
  const signature: SignatureElement = {
    id: `sig-${Date.now()}`,
    type: 'image',
    url: signatureUrl,
    alt: 'Signature',
    position: { x: 50, y: 250, width: 60, height: 30 },
    zIndex: 10,
    visible: true,
    signatoryName: 'John Doe',
    signatoryTitle: 'Chief Judge',
    showName: true,
    showTitle: true,
    opacity: 1,
  };
  
  template.value.signatures.push(signature);
  await templateStore.updateTemplate(template.value.id, template.value);
}
```

### Generating Certificate with Template

```typescript
// functions/certificateGenerator.ts
import PDFDocument from 'pdfkit';
import { getStorage, ref, uploadBytes } from 'firebase/storage';

export async function generateCertificatePDF(
  template: CertificateTemplate,
  participantData: CertificateData
): Promise<string> {
  // Create PDF
  const doc = new PDFDocument({
    size: template.size === 'A4' ? 'A4' : 'LETTER',
    layout: template.orientation,
    margins: template.printSettings.margin,
  });
  
  // Set background
  if (template.background.type === 'color') {
    doc.rect(0, 0, doc.page.width, doc.page.height)
       .fill(template.background.value);
  }
  
  // Add border
  if (template.border?.enabled) {
    const margin = template.border.margin || 0;
    doc.rect(
      margin,
      margin,
      doc.page.width - (margin * 2),
      doc.page.height - (margin * 2)
    )
    .lineWidth(template.border.width)
    .stroke(template.border.color);
  }
  
  // Render elements
  for (const element of template.elements) {
    if (element.type === 'text') {
      const textElement = element as TextElement;
      const content = textElement.field 
        ? participantData[textElement.field]
        : textElement.content;
      
      doc.font(textElement.font.family)
         .fontSize(textElement.font.size)
         .fillColor(textElement.font.color)
         .text(
           content,
           mmToPt(textElement.position.x),
           mmToPt(textElement.position.y),
           {
             width: mmToPt(textElement.position.width || 100),
             align: textElement.align,
           }
         );
    }
    
    if (element.type === 'image') {
      const imgElement = element as ImageElement;
      doc.image(
        imgElement.url,
        mmToPt(imgElement.position.x),
        mmToPt(imgElement.position.y),
        {
          width: mmToPt(imgElement.position.width || 50),
          height: mmToPt(imgElement.position.height || 50),
        }
      );
    }
  }
  
  // Add signatures
  for (const signature of template.signatures) {
    doc.image(
      signature.url,
      mmToPt(signature.position.x),
      mmToPt(signature.position.y),
      {
        width: mmToPt(signature.position.width || 60),
        height: mmToPt(signature.position.height || 30),
      }
    );
    
    if (signature.showName) {
      doc.fontSize(10)
         .text(
           signature.signatoryName,
           mmToPt(signature.position.x),
           mmToPt(signature.position.y + (signature.position.height || 30) + 2)
         );
    }
  }
  
  // Add stamps
  for (const stamp of template.stamps) {
    doc.image(
      stamp.url,
      mmToPt(stamp.position.x),
      mmToPt(stamp.position.y),
      {
        width: mmToPt(stamp.position.width || 50),
        height: mmToPt(stamp.position.height || 50),
        opacity: stamp.opacity,
      }
    );
  }
  
  doc.end();
  
  // Upload to Firebase Storage
  const pdfBuffer = await streamToBuffer(doc);
  const filename = `${participantData.certificateNumber}.pdf`;
  const storageRef = ref(
    getStorage(),
    `certificates/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${filename}`
  );
  
  await uploadBytes(storageRef, pdfBuffer);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}

function mmToPt(mm: number): number {
  return mm * 2.83465; // 1mm = 2.83465 points
}

function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
```

## 🎨 Customization Tips

### Adding Custom Fonts

1. Upload fonts to Firebase Storage:
```
assets/fonts/
  Playfair-Display-Bold.ttf
  OpenSans-Regular.ttf
  MV-Faseyha.ttf
```

2. Load in PDF generator:
```typescript
doc.registerFont('Playfair Display', 'path/to/Playfair-Display-Bold.ttf');
doc.registerFont('MV Faseyha', 'path/to/MV-Faseyha.ttf');
```

### Mobile-First Digital View

Create a responsive component:

```vue
<template>
  <div class="certificate-mobile-view">
    <div 
      class="certificate-content"
      :class="{ 'mobile': isMobile, 'print': !isMobile }"
    >
      <!-- Certificate content -->
    </div>
  </div>
</template>

<style scoped>
.certificate-content.mobile {
  max-width: 100vw;
  padding: 1rem;
  font-size: 14px;
}

.certificate-content.print {
  width: 210mm;
  height: 297mm;
  font-size: 16px;
}

@media (max-width: 768px) {
  .certificate-content {
    transform: scale(0.95);
  }
}
</style>
```

## 🔧 Troubleshooting

### Templates Not Loading
```bash
# Check Firebase connection
npm run dev
# Open browser console
# Look for Firebase errors
```

### Images Not Displaying
- Verify Storage rules allow public read for assets
- Check image URLs in Firestore
- Ensure images are uploaded successfully

### PDF Generation Fails
- Install required dependencies: `npm install pdfkit`
- Check template has all required fields
- Verify participant data is complete

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [PDFKit Documentation](https://pdfkit.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vue 3 Documentation](https://vuejs.org/)

---

Need help? Check the main documentation in `docs/TEMPLATE_CUSTOMIZATION.md`
