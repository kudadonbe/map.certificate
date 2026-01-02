import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CertificateTemplate, SignatureElement, StampElement } from '../types/template.types';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

export const useTemplateStore = defineStore('template', () => {
  const templates = ref<CertificateTemplate[]>([]);
  const activeTemplate = ref<CertificateTemplate | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const defaultTemplate = computed(() => 
    templates.value.find(t => t.isDefault) || templates.value[0]
  );

  const activeTemplates = computed(() =>
    templates.value.filter(t => t.isActive)
  );

  // Load all templates
  async function loadTemplates() {
    loading.value = true;
    error.value = null;
    try {
      const q = query(
        collection(db, 'certificate_templates'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      templates.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as CertificateTemplate[];
    } catch (e: any) {
      error.value = e.message;
      console.error('Error loading templates:', e);
    } finally {
      loading.value = false;
    }
  }

  // Load single template
  async function loadTemplate(id: string) {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'certificate_templates', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        activeTemplate.value = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
        } as CertificateTemplate;
      }
    } catch (e: any) {
      error.value = e.message;
      console.error('Error loading template:', e);
    } finally {
      loading.value = false;
    }
  }

  // Create new template
  async function createTemplate(template: Omit<CertificateTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'>) {
    loading.value = true;
    error.value = null;
    try {
      const newTemplate = {
        ...template,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        version: 1,
      };
      const docRef = await addDoc(collection(db, 'certificate_templates'), newTemplate);
      await loadTemplates();
      return docRef.id;
    } catch (e: any) {
      error.value = e.message;
      console.error('Error creating template:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // Update template
  async function updateTemplate(id: string, updates: Partial<CertificateTemplate>) {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'certificate_templates', id);
      const currentDoc = await getDoc(docRef);
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
        version: (currentDoc.data()?.version || 0) + 1,
      });
      
      await loadTemplates();
    } catch (e: any) {
      error.value = e.message;
      console.error('Error updating template:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // Delete template
  async function deleteTemplate(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await deleteDoc(doc(db, 'certificate_templates', id));
      await loadTemplates();
    } catch (e: any) {
      error.value = e.message;
      console.error('Error deleting template:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // Set default template
  async function setDefaultTemplate(id: string) {
    loading.value = true;
    error.value = null;
    try {
      // Remove default from all templates
      const batch = templates.value.map(t => 
        updateDoc(doc(db, 'certificate_templates', t.id), { isDefault: false })
      );
      await Promise.all(batch);

      // Set new default
      await updateDoc(doc(db, 'certificate_templates', id), { isDefault: true });
      await loadTemplates();
    } catch (e: any) {
      error.value = e.message;
      console.error('Error setting default template:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // Upload asset (signature, stamp, logo, background)
  async function uploadAsset(file: File, type: 'signature' | 'stamp' | 'logo' | 'background'): Promise<string> {
    try {
      const path = `assets/${type}s/${Date.now()}_${file.name}`;
      const fileRef = storageRef(storage, path);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (e: any) {
      error.value = e.message;
      console.error('Error uploading asset:', e);
      throw e;
    }
  }

  // Delete asset
  async function deleteAsset(url: string) {
    try {
      const fileRef = storageRef(storage, url);
      await deleteObject(fileRef);
    } catch (e: any) {
      error.value = e.message;
      console.error('Error deleting asset:', e);
      throw e;
    }
  }

  // Duplicate template
  async function duplicateTemplate(id: string, newName: string) {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'certificate_templates', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const templateData = docSnap.data() as CertificateTemplate;
        const newTemplate = {
          ...templateData,
          name: newName,
          isDefault: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          version: 1,
        };
        
        const newDocRef = await addDoc(collection(db, 'certificate_templates'), newTemplate);
        await loadTemplates();
        return newDocRef.id;
      }
    } catch (e: any) {
      error.value = e.message;
      console.error('Error duplicating template:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    templates,
    activeTemplate,
    loading,
    error,
    defaultTemplate,
    activeTemplates,
    loadTemplates,
    loadTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    uploadAsset,
    deleteAsset,
    duplicateTemplate,
  };
});
