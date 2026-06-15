/**
 * Participant status workflow
 */
export type ParticipantStatus =
  | 'pending'           // Initial registration
  | 'profile_submitted' // User submitted profile updates
  | 'verified'          // Admin verified profile data
  | 'approved'          // Ready for certificate generation
  | 'certificate_sent'; // Certificate generated and emailed

/**
 * Email status for certificate delivery
 */
export type EmailStatus = 'pending' | 'sent' | 'failed';

/**
 * Certificate status
 */
export type CertificateStatus = 'not_generated' | 'generating' | 'generated' | 'error';

/**
 * Participant record from MAP program
 */
export interface Participant {
  id: string;

  // English names
  name: string;
  partner_name: string;

  // Dhivehi names
  name_dv: string;
  partner_name_dv: string;

  // Contact information
  email: string;
  phone?: string;

  // ID numbers
  id_number?: string;
  partner_id_number?: string;

  // Program information
  course_date?: Date;
  course_completed?: boolean;

  // Certificate information
  certificate_number?: string;
  certificate_url?: string;
  certificate_generated_at?: Date;
  certificate_status: CertificateStatus;

  // Status management
  status: ParticipantStatus;
  profile_verified: boolean;
  verified_by?: string;
  verified_at?: Date;
  verification_notes?: string;

  // Email tracking
  email_sent_at?: Date;
  email_attempts: number;
  email_status: EmailStatus;
  email_error?: string;

  // User link
  user_id?: string; // Firebase Auth UID

  // System fields
  created_at: Date;
  updated_at: Date;
  synced_from_sheets?: boolean;
}

/**
 * Profile update request submitted by participant
 */
export interface ProfileUpdate {
  id: string;
  participant_id: string;
  user_id: string;

  // Submitted data
  name: string;
  name_dv: string;
  partner_name: string;
  partner_name_dv: string;
  id_number?: string;
  partner_id_number?: string;
  phone?: string;

  // Review status
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: Date;
  reviewed_by?: string;
  reviewed_at?: Date;
  review_notes?: string;

  // Changes tracking
  changes?: Record<string, { old: string; new: string }>;
}

/**
 * Filter options for participant list
 */
export interface ParticipantFilters {
  status?: ParticipantStatus | 'all';
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  emailStatus?: EmailStatus | 'all';
  certificateStatus?: CertificateStatus | 'all';
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalParticipants: number;
  certificatesIssued: number;
  pendingApproval: number;
  emailsSent: number;
  pendingVerification: number;
  failedEmails: number;
}

/**
 * Recent activity item for dashboard
 */
export interface ActivityItem {
  id: string;
  type: 'certificate_generated' | 'email_sent' | 'participant_added' | 'profile_verified' | 'profile_submitted';
  message: string;
  timestamp: Date;
  participant_id?: string;
  user_id?: string;
}
