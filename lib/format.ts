export function formatKes(value: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Customer facing price in Kenyan Shillings, for example "KSh 1,500".
 * Always whole shillings, no decimals, with the KSh symbol the brand uses.
 */
export function formatKsh(value: number): string {
  const amount = new Intl.NumberFormat("en-KE", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
  return `KSh ${amount}`;
}

export function formatPercent(value: number): string {
  return `${value}%`;
}
