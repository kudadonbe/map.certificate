/**
 * Map error codes to user-friendly error messages
 */
export function getErrorMessage(errorCode?: string): string {
  const messages: Record<string, string> = {
    'unauthorized-email': 'No email found in your account',
    'not-in-whitelist': 'Your email is not authorized for admin access',
    'not-a-participant': 'No participant record found for your email',
    'popup-closed': 'Login was cancelled',
    'network-error': 'Network error. Please check your connection.',
    'unknown-error': 'An unexpected error occurred',
  };

  return messages[errorCode || 'unknown-error'];
}

/**
 * Get redirect path based on user role
 */
export function getRedirectPath(role: 'admin' | 'participant'): string {
  return role === 'admin' ? '/admin/dashboard' : '/participant/portal';
}

/**
 * Format last login date in relative time (e.g., "2 hours ago")
 */
export function formatLastLogin(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Format date to readable string (e.g., "January 20, 2026")
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Format date and time to readable string (e.g., "January 20, 2026 at 3:45 PM")
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

/**
 * Check if email is valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get user initials from display name
 */
export function getUserInitials(displayName: string | null): string {
  if (!displayName) return 'U';

  const names = displayName.trim().split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }

  return displayName.substring(0, 2).toUpperCase();
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: 'admin' | 'participant'): string {
  return role === 'admin' ? 'Administrator' : 'Participant';
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: 'microsoft' | 'google'): string {
  return provider === 'microsoft' ? 'Office 365' : 'Google';
}
