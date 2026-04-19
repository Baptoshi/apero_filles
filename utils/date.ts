/**
 * Formatting helpers for event dates.
 * All formats go through Intl.DateTimeFormat("fr-FR") so we stay consistent.
 */

const shortDate = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
});

const fullDate = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const dayNumber = new Intl.DateTimeFormat('fr-FR', { day: '2-digit' });
const monthShort = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
const weekdayShort = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });

function parse(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatShortDate(iso: string): string {
  const date = parse(iso);
  return date ? shortDate.format(date) : iso;
}

export function formatFullDate(iso: string): string {
  const date = parse(iso);
  return date ? fullDate.format(date) : iso;
}

export function formatDatePieces(iso: string): { weekday: string; day: string; month: string } {
  const date = parse(iso);
  if (!date) {
    return { weekday: '', day: '', month: '' };
  }
  return {
    weekday: weekdayShort.format(date).replace('.', ''),
    day: dayNumber.format(date),
    month: monthShort.format(date).replace('.', ''),
  };
}

/** YYYY-MM key useful for "events this month" counters. */
export function monthKey(iso: string | Date): string {
  const date = typeof iso === 'string' ? parse(iso) : iso;
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function isUpcoming(iso: string, now: Date = new Date()): boolean {
  const date = parse(iso);
  if (!date) return false;
  return date.getTime() >= now.getTime();
}

/**
 * French month names → 2-digit month index. Used to normalise the mock
 * `memberSince` field ("mars 2024") into a compact "MM/YYYY" stamp for
 * the profile stats + subscription sheet.
 */
const FR_MONTHS: Record<string, string> = {
  janvier: '01',
  février: '02',
  fevrier: '02',
  mars: '03',
  avril: '04',
  mai: '05',
  juin: '06',
  juillet: '07',
  août: '08',
  aout: '08',
  septembre: '09',
  octobre: '10',
  novembre: '11',
  décembre: '12',
  decembre: '12',
};

/**
 * Format a loose "mois YYYY" string into "MM/YYYY". Falls back to the
 * original input if the month can't be parsed — safe to use anywhere.
 */
export function formatMonthYear(value: string): string {
  const normalised = value.trim().toLowerCase();
  const [rawMonth, rawYear] = normalised.split(/\s+/);
  if (!rawMonth || !rawYear) return value;
  const mm = FR_MONTHS[rawMonth];
  if (!mm) return value;
  return `${mm}/${rawYear}`;
}
