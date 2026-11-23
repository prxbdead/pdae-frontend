export function formatMoney(value: number, currency = 'USD'): string {
  const safe = Number.isFinite(value) ? value : 0;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `${currency} ${safe.toFixed(2)}`;
  }
}

export function formatSignedMoney(value: number, currency = 'USD'): string {
  const sign = value >= 0 ? '+' : '-';

  return `${sign}${formatMoney(Math.abs(value), currency)}`;
}

/** Trim the float noise that comes from repeated paper trades. */
export function formatQuantity(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;

  try {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 8,
    }).format(safe);
  } catch {
    return safe.toString();
  }
}
