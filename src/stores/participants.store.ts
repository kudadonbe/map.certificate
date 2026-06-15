import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '@/firebase';
import type {
  Participant,
  ParticipantStatus,
  ParticipantFilters,
  DashboardStats,
  ActivityItem,
  ProfileUpdate
} from '@/types/participant.types';

export const useParticipantsStore = defineStore('participants', () => {
  // State
  const participants = ref<Participant[]>([]);
  const currentParticipant = ref<Participant | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const stats = ref<DashboardStats>({
    totalParticipants: 0,
    certificatesIssued: 0,
    pendingApproval: 0,
    emailsSent: 0,
    pendingVerification: 0,
    failedEmails: 0
  });
  const recentActivity = ref<ActivityItem[]>([]);

  // Firestore unsubscribe functions
  let participantsUnsubscribe: Unsubscribe | null = null;

  // Computed
  const pendingParticipants = computed(() =>
    participants.value.filter(p => p.status === 'pending' || p.status === 'profile_submitted')
  );

  const verifiedParticipants = computed(() =>
    participants.value.filter(p => p.status === 'verified' || p.status === 'approved')
  );

  const participantsWithCertificates = computed(() =>
    participants.value.filter(p => p.certificate_status === 'generated')
  );

  // Helper: Convert Firestore document to Participant
  function docToParticipant(docId: string, data: any): Participant {
    return {
      id: docId,
      name: data.name || '',
      partner_name: data.partner_name || '',
      name_dv: data.name_dv || '',
      partner_name_dv: data.partner_name_dv || '',
      email: data.email || '',
      phone: data.phone,
      id_number: data.id_number,
      partner_id_number: data.partner_id_number,
      course_date: data.course_date?.toDate(),
      course_completed: data.course_completed || false,
      certificate_number: data.certificate_number,
      certificate_url: data.certificate_url,
      certificate_generated_at: data.certificate_generated_at?.toDate(),
      certificate_status: data.certificate_status || 'not_generated',
      status: data.status || 'pending',
      profile_verified: data.profile_verified || false,
      verified_by: data.verified_by,
      verified_at: data.verified_at?.toDate(),
      verification_notes: data.verification_notes,
      email_sent_at: data.email_sent_at?.toDate(),
      email_attempts: data.email_attempts || 0,
      email_status: data.email_status || 'pending',
      email_error: data.email_error,
      user_id: data.user_id,
      created_at: data.created_at?.toDate() || new Date(),
      updated_at: data.updated_at?.toDate() || new Date(),
      synced_from_sheets: data.synced_from_sheets
    };
  }

  // Actions

  /**
   * Load all participants from Firestore
   */
  async function loadParticipants(filters?: ParticipantFilters): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const participantsRef = collection(db, 'participants');
      let q = query(participantsRef, orderBy('created_at', 'desc'));

      // Apply status filter
      if (filters?.status && filters.status !== 'all') {
        q = query(participantsRef, where('status', '==', filters.status), orderBy('created_at', 'desc'));
      }

      const snapshot = await getDocs(q);
      let result = snapshot.docs.map(doc => docToParticipant(doc.id, doc.data()));

      // Apply search filter (client-side)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.partner_name.toLowerCase().includes(searchLower) ||
          p.email.toLowerCase().includes(searchLower) ||
          p.name_dv.includes(filters.search!) ||
          p.partner_name_dv.includes(filters.search!)
        );
      }

      participants.value = result;
      await updateStats();
    } catch (err: any) {
      console.error('Error loading participants:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Subscribe to real-time participants updates
   */
  function subscribeToParticipants(): void {
    if (participantsUnsubscribe) {
      participantsUnsubscribe();
    }

    const participantsRef = collection(db, 'participants');
    const q = query(participantsRef, orderBy('created_at', 'desc'));

    participantsUnsubscribe = onSnapshot(q, (snapshot) => {
      participants.value = snapshot.docs.map(doc => docToParticipant(doc.id, doc.data()));
      updateStats();
    }, (err) => {
      console.error('Error in participants subscription:', err);
      error.value = err.message;
    });
  }

  /**
   * Unsubscribe from real-time updates
   */
  function unsubscribe(): void {
    if (participantsUnsubscribe) {
      participantsUnsubscribe();
      participantsUnsubscribe = null;
    }
  }

  /**
   * Load a single participant by ID
   */
  async function loadParticipant(id: string): Promise<Participant | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const docRef = doc(db, 'participants', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      currentParticipant.value = docToParticipant(docSnap.id, docSnap.data());
      return currentParticipant.value;
    } catch (err: any) {
      console.error('Error loading participant:', err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Find participant by email
   */
  async function findByEmail(email: string): Promise<Participant | null> {
    try {
      const participantsRef = collection(db, 'participants');
      const q = query(participantsRef, where('email', '==', email.toLowerCase().trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      return docToParticipant(snapshot.docs[0].id, snapshot.docs[0].data());
    } catch (err: any) {
      console.error('Error finding participant by email:', err);
      return null;
    }
  }

  /**
   * Find participant by user ID (Firebase Auth UID)
   */
  async function findByUserId(userId: string): Promise<Participant | null> {
    try {
      const participantsRef = collection(db, 'participants');
      const q = query(participantsRef, where('user_id', '==', userId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      return docToParticipant(snapshot.docs[0].id, snapshot.docs[0].data());
    } catch (err: any) {
      console.error('Error finding participant by user ID:', err);
      return null;
    }
  }

  /**
   * Create a new participant
   */
  async function createParticipant(data: Omit<Participant, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    isLoading.value = true;
    error.value = null;

    try {
      const participantsRef = collection(db, 'participants');
      const newDocRef = doc(participantsRef);
      const now = Timestamp.now();

      await setDoc(newDocRef, {
        ...data,
        email: data.email.toLowerCase().trim(),
        created_at: now,
        updated_at: now
      });

      console.log('Participant created:', newDocRef.id);
      await loadParticipants();
      return newDocRef.id;
    } catch (err: any) {
      console.error('Error creating participant:', err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update a participant
   */
  async function updateParticipant(id: string, updates: Partial<Participant>): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const docRef = doc(db, 'participants', id);

      await updateDoc(docRef, {
        ...updates,
        updated_at: Timestamp.now()
      });

      console.log('Participant updated:', id);

      // Update local state
      const index = participants.value.findIndex(p => p.id === id);
      if (index !== -1) {
        participants.value[index] = { ...participants.value[index], ...updates, updated_at: new Date() };
      }
    } catch (err: any) {
      console.error('Error updating participant:', err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update participant status
   */
  async function updateStatus(id: string, status: ParticipantStatus, notes?: string): Promise<void> {
    const updates: Partial<Participant> = { status };

    if (status === 'verified') {
      updates.profile_verified = true;
      updates.verified_at = new Date();
      if (notes) updates.verification_notes = notes;
    }

    await updateParticipant(id, updates);
  }

  /**
   * Verify participant profile
   */
  async function verifyProfile(id: string, verifiedBy: string, notes?: string): Promise<void> {
    await updateParticipant(id, {
      status: 'verified',
      profile_verified: true,
      verified_by: verifiedBy,
      verified_at: new Date(),
      verification_notes: notes
    });
  }

  /**
   * Approve participant for certificate generation
   */
  async function approveParticipant(id: string): Promise<void> {
    await updateStatus(id, 'approved');
  }

  /**
   * Delete a participant
   */
  async function deleteParticipant(id: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const docRef = doc(db, 'participants', id);
      await deleteDoc(docRef);

      console.log('Participant deleted:', id);

      // Remove from local state
      participants.value = participants.value.filter(p => p.id !== id);
    } catch (err: any) {
      console.error('Error deleting participant:', err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update dashboard statistics
   */
  async function updateStats(): Promise<void> {
    const all = participants.value;

    stats.value = {
      totalParticipants: all.length,
      certificatesIssued: all.filter(p => p.certificate_status === 'generated').length,
      pendingApproval: all.filter(p => p.status === 'pending' || p.status === 'profile_submitted').length,
      emailsSent: all.filter(p => p.email_status === 'sent').length,
      pendingVerification: all.filter(p => p.status === 'profile_submitted').length,
      failedEmails: all.filter(p => p.email_status === 'failed').length
    };
  }

  /**
   * Load recent activity (from activity_logs collection or derived from participants)
   */
  async function loadRecentActivity(limitCount: number = 10): Promise<void> {
    try {
      // For now, derive activity from participants
      // TODO: Create separate activity_logs collection for more detailed tracking
      const recent = participants.value
        .slice(0, limitCount)
        .map((p, index): ActivityItem => ({
          id: `activity-${index}`,
          type: p.certificate_status === 'generated' ? 'certificate_generated' :
                p.email_status === 'sent' ? 'email_sent' :
                p.status === 'verified' ? 'profile_verified' : 'participant_added',
          message: p.certificate_status === 'generated'
            ? `Certificate generated for ${p.name}`
            : p.email_status === 'sent'
            ? `Certificate emailed to ${p.name}`
            : p.status === 'verified'
            ? `Profile verified for ${p.name}`
            : `${p.name} added to program`,
          timestamp: p.updated_at,
          participant_id: p.id
        }));

      recentActivity.value = recent;
    } catch (err: any) {
      console.error('Error loading recent activity:', err);
    }
  }

  /**
   * Get pending profile updates for verification
   */
  async function getPendingProfileUpdates(): Promise<ProfileUpdate[]> {
    try {
      const updatesRef = collection(db, 'profile_updates');
      const q = query(updatesRef, where('status', '==', 'pending'), orderBy('submitted_at', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submitted_at: doc.data().submitted_at?.toDate(),
        reviewed_at: doc.data().reviewed_at?.toDate()
      })) as ProfileUpdate[];
    } catch (err: any) {
      console.error('Error loading profile updates:', err);
      return [];
    }
  }

  /**
   * Link participant to user account
   */
  async function linkToUser(participantId: string, userId: string): Promise<void> {
    await updateParticipant(participantId, { user_id: userId });
  }

  return {
    // State
    participants,
    currentParticipant,
    isLoading,
    error,
    stats,
    recentActivity,

    // Computed
    pendingParticipants,
    verifiedParticipants,
    participantsWithCertificates,

    // Actions
    loadParticipants,
    subscribeToParticipants,
    unsubscribe,
    loadParticipant,
    findByEmail,
    findByUserId,
    createParticipant,
    updateParticipant,
    updateStatus,
    verifyProfile,
    approveParticipant,
    deleteParticipant,
    updateStats,
    loadRecentActivity,
    getPendingProfileUpdates,
    linkToUser
  };
});
