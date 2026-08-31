const currencyFormatter = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  currencyDisplay: 'code',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a number (or numeric string) as Kenyan Shillings, e.g. "KES 1,234.50".
 * Returns "KES 0.00" for null/undefined/non-numeric input rather than throwing,
 * since amounts often arrive as strings from JSON or partially-loaded state.
 */
export function formatCurrency(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) {
    return currencyFormatter.format(0);
  }
  return currencyFormatter.format(value);
}

export function formatDate(dateString, options) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', options || {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
