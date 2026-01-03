# Official Certificate Template Complete

## Date: January 4, 2026

## ✅ Certificate Template Created

Based on the official Word document template from Family Court Maldives.

### Source Documents Analyzed

1. **Awareness Program Certificate.docx** - Official certificate template
2. **Awareness Program Certificate - Data.xlsx** - Merge data structure

### Template Structure

#### Dynamic Fields
- `{{name}}` - Participant name (Dhivehi)
- `{{id_number}}` - National ID card number
- `{{day}}` - Issue day (Dhivehi number)
- `{{month}}` - Issue month (Dhivehi)
- `{{year}}` - Issue year (Dhivehi number)

#### Fixed Content (Dhivehi Text)

**Header:**
- ފެމިލީ ކޯޓު (Family Court)
- މާލެ، ދިވެހިރާއްޖެ (Male, Maldives)

**Title:**
- ކައިވެންޏަށް ހޭލުންތެރި ކުރުމުގެ ޕްރޮގްރާމުގައި ބައިވެރިވިކަމުގެ ލިޔުން
- (Certificate of Participation in Marriage Awareness Program)

**Body:**
- މިލިޔުމަކީ (This certificate is for)
- އައިޑީކާޑް ނަންބަރު (ID Card Number)
- ކައިވެންޏަށް ހޭލުންތެރިކުރުމުގެ ޕްރޮގްރާމުގައި ބައިވެރިވެފައިވާތީ ދޫކޮށްފައިވާ ލިޔުމެކެވެ.
- (Issued for participating in the Marriage Awareness Program)

**Signature:**
- ޕްރޮގްރާމް ކޯޑިނޭޓަރ (Program Coordinator)
- ފެމިލީ ކޯޓު (Family Court)

### Layout

```
┌─────────────────────────────────────────────────────┐
│  [Logo]    ފެމިލީ ކޯޓު         [Logo]              │
│            މާލެ، ދިވެހިރާއްޖެ                        │
│                                                     │
│    ކައިވެންޏަށް ހޭލުންތެރި ކުރުމުގެ ޕްރޮގްރާމުގައި      │
│              ބައިވެރިވިކަމުގެ ލިޔުން                    │
│                                                     │
│                  މިލިޔުމަކީ                         │
│                                                     │
│              [Participant Name]                     │
│                                                     │
│             އައިޑީކާޑް ނަންބަރު                       │
│                [ID Number]                          │
│                                                     │
│    ކައިވެންޏަށް ހޭލުންތެރިކުރުމުގެ ޕްރޮގްރާމުގައި         │
│        ބައިވެރިވެފައިވާތީ ދޫކޮށްފައިވާ ލިޔުމެކެވެ.        │
│                                                     │
│             [Day Month Year]                        │
│                                                     │
│         ________________                            │
│        ޕްރޮގްރާމް ކޯޑިނޭޓަރ          [Seal]          │
│             ފެމިލީ ކޯޓު                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Assets Extracted

1. **family-court-logo.png** (16KB)
   - Extracted from Word document
   - Placed in `public/assets/`
   - Used for both left and right header logos

2. **Additional images** (available if needed)
   - image2.png (10KB)
   - image3.png (12KB)

### Template Properties

- **Size:** A4 (210mm × 297mm)
- **Orientation:** Portrait
- **Border:** 2px solid blue (#2563eb)
- **Margins:** 20mm
- **Font:** Arial (supports Dhivehi)
- **Colors:**
  - Primary: #2563eb (Blue)
  - Text: #1f2937 (Dark Gray)
  - Accent: #10b981 (Green)

### File Location

**Template Definition:**
```
src/utils/template.defaults.ts
```

**Logo Asset:**
```
public/assets/family-court-logo.png
```

### Usage

The template is now the default template in the system:

```typescript
export const DEFAULT_A4_PORTRAIT_TEMPLATE
```

When creating certificates, the system will:
1. Load this template
2. Replace dynamic fields with actual participant data
3. Generate PDF with proper Dhivehi text rendering
4. Apply signatures and stamps

### Sample Data Format

From Excel file:

| # | Name | ID | Year | Month | Day |
|---|------|----|----|-------|-----|
| 1 | މުޙައްމަދު ސުޢޫދު | A001234 | 2025 | ޑިސެމްބަރ | 16 |

### Next Steps

1. **PDF Generation Backend**
   - Implement Puppeteer/PDFKit
   - Add Dhivehi font support
   - Handle dynamic field replacement

2. **Signature & Stamp Management**
   - Upload coordinator signature
   - Upload official seal
   - Position and opacity controls

3. **Certificate Numbering**
   - Implement sequential numbering
   - Format: MAP-{YEAR}-{NUMBER}
   - Store in Firestore

4. **Batch Generation**
   - Read participant data
   - Generate multiple certificates
   - Store PDFs in Firebase Storage

## 🎉 Status: Template Ready

The official certificate template is now configured and deployed. Ready for PDF generation implementation.

---

**Live URL:** https://map-certificate.web.app  
**Template:** Official Family Court MAP Certificate  
**Last Updated:** January 4, 2026
