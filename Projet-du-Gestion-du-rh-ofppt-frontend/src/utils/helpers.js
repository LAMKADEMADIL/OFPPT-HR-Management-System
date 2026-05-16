/**
 * Format a date string to French locale format
 * @param {string} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Format a datetime string to French locale format
 * @param {string} dateString
 * @returns {string}
 */
export function formatDateTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Capitalize the first letter of a string
 * @param {string} string
 * @returns {string}
 */
export function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Get full name from object with nom/prenom
 * @param {{ nom?: string, prenom?: string }} person
 * @returns {string}
 */
export function getFullName(person) {
  if (!person) return '—';
  return [person.prenom, person.nom].filter(Boolean).join(' ') || '—';
}

/**
 * Calculate number of days between two dates
 * @param {string} start
 * @param {string} end
 * @returns {number}
 */
export function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.abs(e - s);
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Truncate a string to a max length
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(str, maxLen = 40) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

/**
 * Get initials from a name
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
