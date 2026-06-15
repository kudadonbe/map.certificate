# Certificate Template Customization System

## Overview

The MAP Certificate system now includes a comprehensive template customization feature that allows admin users to create, manage, and customize certificate templates with full control over design, layout, signatures, and stamps.

## Features

### 🎨 Template Designer
- **Visual Editor**: Drag-and-drop interface for positioning elements
- **Live Preview**: Real-time preview for both print (A4) and mobile views
- **Dual View Modes**:
  - Print View: A4 size (210mm × 297mm) for PDF generation
  - Mobile View: Responsive layout for digital viewing

### 📄 Page Settings
- **Paper Size**: A4 or Letter
- **Orientation**: Portrait or Landscape
- **Custom Dimensions**: Adjustable width and height in millimeters
- **Print Settings**: DPI resolution and margin control

### 🎨 Design Customization

#### Background
- Solid colors
- Gradient backgrounds (linear/radial)
- Image backgrounds with opacity control
- Background image upload to Firebase Storage

#### Borders
- Enable/disable borders
- Border styles: solid, dashed, dotted, double
- Customizable width, color, and border radius
- Adjustable margins

#### Theme Colors
- Primary color
- Secondary color
- Accent color
- Text color
- Color picker for easy selection

### ✍️ Signatures
- **Multiple Signatures**: Add unlimited signature blocks
- **Customizable Fields**:
  - Signatory name
  - Signatory title/position
  - Signature image upload
  - Toggle name/title visibility
- **Positioning**: Place signatures anywhere on certificate
- **Image Upload**: Secure storage in Firebase Storage

### 🔖 Stamps & Seals
- **Multiple Stamps**: Add multiple official seals/stamps
- **Stamp Types**:
  - Official Seal
  - Stamp
  - Watermark
- **Opacity Control**: Adjust transparency for watermarks
- **Image Upload**: PNG support with transparency
- **Positioning**: Precise placement on certificate

### 📝 Text Elements
- **Dynamic Fields**: Link to participant data
  - Certificate Number
  - Participant Name (English & Dhivehi)
  - Partner Name (English & Dhivehi)
  - Course Date
  - Issue Date
  - ID Numbers
- **Font Customization**:
  - Font family
  - Font size
  - Font weight (normal, bold)
  - Font color
  - Text alignment (left, center, right)
  - Line height
- **Bilingual Support**: Separate elements for English and Dhivehi

### 💾 Template Management
- **Create**: Build templates from scratch
- **Edit**: Modify existing templates
- **Duplicate**: Clone templates for variations
- **Delete**: Remove unused templates
- **Version Control**: Track template versions
- **Default Template**: Set one template as default
- **Active/Inactive**: Toggle template availability

## Architecture

### Database Structure

```typescript
certificate_templates/ (Firestore Collection)
  {templateId}/
    - name: string
    - description: string
    - size: "A4" | "Letter"
    - orientation: "portrait" | "landscape"
    - width: number (mm)
    - height: number (mm)
    - background: object
    - border: object
    - elements: array
    - signatures: array
    - stamps: array
    - theme: object
    - createdBy: string
    - createdAt: timestamp
    - updatedAt: timestamp
    - version: number
    - isDefault: boolean
    - isActive: boolean
    - printSettings: object
```

### Storage Structure

```
Firebase Storage:
  assets/
    signatures/
      {timestamp}_{filename}.png
    stamps/
      {timestamp}_{filename}.png
    logos/
      {timestamp}_{filename}.png
    backgrounds/
      {timestamp}_{filename}.jpg
```

### Type Definitions

See `/src/types/template.types.ts` for complete TypeScript definitions:
- `CertificateTemplate`
- `TextElement`
- `ImageElement`
- `SignatureElement`
- `StampElement`
- `QRCodeElement`
- `FontStyle`
- `Position`

## Usage

### Creating a New Template

1. Navigate to **Settings** > **Certificate Templates**
2. Click **"New Template"**
3. Configure page settings (size, orientation)
4. Set background and border styles
5. Choose theme colors
6. Add signatures and stamps
7. Position and style text elements
8. Preview in print and mobile modes
9. Click **"Save Template"**

### Adding Signatures

1. In template editor, scroll to **"Signatures"** section
2. Click **"+ Add"**
3. Enter signatory name and title
4. Upload signature image (PNG recommended)
5. Position signature on preview
6. Toggle name/title visibility

### Adding Stamps

1. In template editor, scroll to **"Stamps/Seals"** section
2. Click **"+ Add"**
3. Select stamp type (Official Seal, Stamp, Watermark)
4. Upload stamp image (PNG with transparency)
5. Adjust opacity if needed
6. Position stamp on preview

### Setting Default Template

1. Go to **Template Manager**
2. Find desired template
3. Click star icon or **"Set as Default"**
4. Confirm selection
5. Template will be used for all new certificates

## Settings Integration

### Admin Settings Panel

Add to your admin settings page:

```vue
<template>
  <div class="settings-page">
    <!-- Other settings tabs -->
    
    <div class="settings-section">
      <h3>Certificate Generation</h3>
      
      <div class="setting-item">
        <label>Default Template</label>
        <select v-model="settings.defaultTemplateId">
          <option 
            v-for="template in activeTemplates" 
            :key="template.id"
            :value="template.id"
          >
            {{ template.name }}
          </option>
        </select>
      </div>

      <div class="setting-item">
        <label>Certificate Prefix</label>
        <input v-model="settings.certificatePrefix" />
        <span class="help-text">e.g., "MAP" for MAP-2026-001</span>
      </div>

      <div class="setting-item">
        <button @click="$router.push('/admin/templates')">
          Manage Templates
        </button>
      </div>
    </div>
  </div>
</template>
```

### Firestore Settings Document

```javascript
settings/
  certificate_config/
    - defaultTemplateId: string
    - certificatePrefix: "MAP"
    - lastCertificateNumber: number
    - pdfResolution: 300 (DPI)
    - allowParticipantDownload: boolean
```

## PDF Generation Integration

### Update Certificate Generator Function

```typescript
// functions/certificateGenerator.ts

import { useTemplateStore } from '../stores/template.store';

async function generateCertificate(participantId: string, templateId?: string) {
  const templateStore = useTemplateStore();
  
  // Load template (use default if not specified)
  const template = templateId 
    ? await templateStore.loadTemplate(templateId)
    : templateStore.defaultTemplate;
  
  if (!template) {
    throw new Error('No template available');
  }
  
  // Load participant data
  const participant = await getParticipant(participantId);
  
  // Generate PDF using template
  const pdf = await renderTemplateToPDF(template, participant);
  
  // Upload to Firebase Storage
  const url = await uploadPDF(pdf, participant.certificateNumber);
  
  // Update participant record
  await updateParticipant(participantId, {
    certificateUrl: url,
    certificateGeneratedAt: new Date(),
  });
  
  return url;
}
```

## Mobile-First Digital View

The system generates two views:

1. **Print PDF (A4)**: 
   - Full A4 dimensions
   - 300 DPI resolution
   - Professional print quality
   
2. **Mobile Digital View**:
   - Responsive layout
   - Optimized for 375px mobile screens
   - Touch-friendly interactions
   - Fast loading

### Responsive Certificate Component

```vue
<template>
  <div class="certificate-viewer">
    <!-- Desktop/Print View -->
    <div v-if="viewMode === 'print'" class="print-view">
      <CertificateRender :template="template" :data="data" mode="print" />
    </div>

    <!-- Mobile View -->
    <div v-else class="mobile-view">
      <CertificateRender :template="template" :data="data" mode="mobile" />
    </div>

    <!-- View Toggle -->
    <button @click="toggleView">
      {{ viewMode === 'print' ? '📱 Mobile View' : '🖨️ Print View' }}
    </button>
  </div>
</template>
```

## Security

### Firebase Security Rules

```javascript
// Firestore Rules
match /certificate_templates/{templateId} {
  // Admin can read/write
  allow read, write: if request.auth.token.role == 'admin';
  
  // Participants can read active templates (for preview)
  allow read: if request.auth != null && 
                 resource.data.isActive == true;
}

// Storage Rules
match /assets/{type}/{filename} {
  // Admin can upload/delete
  allow write: if request.auth.token.role == 'admin';
  
  // Public read for certificate generation
  allow read: if true;
}
```

## Best Practices

1. **Template Naming**: Use descriptive names (e.g., "Classic Portrait 2026", "Modern Landscape")
2. **Versioning**: Keep track of template versions for audit trail
3. **Backup**: Export templates before major changes
4. **Testing**: Always preview in both print and mobile modes
5. **Image Quality**: Use high-resolution images (300 DPI) for signatures and stamps
6. **File Formats**: 
   - Signatures: PNG with transparent background
   - Stamps: PNG with transparent background
   - Backgrounds: JPG or PNG (compressed)
7. **Performance**: Optimize images before upload (max 500KB)

## Troubleshooting

### Template Not Showing
- Check `isActive` is set to `true`
- Verify Firebase permissions
- Check console for errors

### Images Not Loading
- Verify image URLs in Firebase Storage
- Check Storage security rules
- Ensure images are publicly readable

### PDF Generation Issues
- Confirm template has all required fields
- Check print settings (DPI, margins)
- Verify participant data completeness

## Future Enhancements

- [ ] Drag-and-drop element positioning
- [ ] Rich text editor for certificates
- [ ] QR code integration for verification
- [ ] Custom fonts upload
- [ ] Template marketplace/sharing
- [ ] Bulk template application
- [ ] A/B testing for templates
- [ ] Template analytics (download rates)

## API Reference

### Template Store Methods

```typescript
// Load templates
await templateStore.loadTemplates();

// Create template
const id = await templateStore.createTemplate(templateData);

// Update template
await templateStore.updateTemplate(id, updates);

// Delete template
await templateStore.deleteTemplate(id);

// Set default
await templateStore.setDefaultTemplate(id);

// Upload asset
const url = await templateStore.uploadAsset(file, 'signature');

// Duplicate template
const newId = await templateStore.duplicateTemplate(id, 'New Name');
```

## Support

For issues or feature requests, contact the development team or create an issue in the repository.

---

**Last Updated**: January 2, 2026  
**Version**: 1.0.0
