// @ts-check

/**
 * Format ISO date string into Indonesian readable format
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '—';
  try {
    const d = new Date(date);
    return d.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return String(date);
  }
}

/**
 * Format rate limit RPS with commas
 * @param {number|string} rps
 * @returns {string}
 */
export function formatRPS(rps) {
  const num = Number(rps) || 0;
  return `${num.toLocaleString('id-ID')} req/s`;
}

/**
 * Truncate long strings with ellipsis
 * @param {string} str
 * @param {number} [max=30]
 * @returns {string}
 */
export function truncate(str, max = 30) {
  if (!str) return '';
  return str.length > max ? `${str.slice(0, max)}...` : str;
}
