const faNumber = new Intl.NumberFormat("fa-IR");
const faCompactNumber = new Intl.NumberFormat("fa-IR", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const faDate = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatNumber(value: number): string {
  return faNumber.format(value);
}

export function formatCompactNumber(value: number): string {
  return faCompactNumber.format(value);
}

export function formatRating(value: number): string {
  return new Intl.NumberFormat("fa-IR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value || 0);
}

export function formatDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : faDate.format(date);
}

export function getYear(value?: string): string | null {
  if (!value) return null;
  const year = Number(value.slice(0, 4));
  return Number.isFinite(year) ? faNumber.format(year) : null;
}

export function formatRuntime(minutes?: number | null): string | null {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${faNumber.format(rest)} دقیقه`;
  if (!rest) return `${faNumber.format(hours)} ساعت`;
  return `${faNumber.format(hours)} ساعت و ${faNumber.format(rest)} دقیقه`;
}

export function formatMoney(value?: number): string | null {
  if (!value) return null;
  return `${faCompactNumber.format(value)} دلار`;
}
