import type { Event } from '@/types/event';

/**
 * Pure countdown badge shown on top of every event card photo.
 *
 * Granularity is intentionally coarse — days or hours, never minutes:
 *   1. "En cours"      — the event started within the last ~3 hours
 *   2. "Dans Xh"       — same calendar day, before the event starts
 *   3. "Demain"        — next calendar day
 *   4. "Dans X jours"  — anything further out, no upper cap
 *
 * Returns null only when the event has fully ended (past + ongoing window).
 * Otherwise every upcoming event gets a badge, no matter how far ahead.
 */
export interface FomoBadge {
  label: string;
  /** `urgent` = terracotta pill ( < 24h / en cours ). `soon` = frosted white. */
  tone: 'urgent' | 'soon';
}

const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;
const ONGOING_WINDOW_MS = 3 * MS_PER_HOUR; // grace period after start

/**
 * Merge the event's ISO date with its "19h30" time string into a real Date.
 * Returns null if the input can't be parsed — the badge is then hidden.
 */
function parseEventStart(event: Event): Date | null {
  const base = new Date(event.date);
  if (Number.isNaN(base.getTime())) return null;

  const [hRaw, mRaw = '0'] = event.time.split('h');
  const hours = Number.parseInt(hRaw ?? '0', 10);
  const minutes = Number.parseInt(mRaw === '' ? '0' : mRaw, 10);

  base.setHours(
    Number.isFinite(hours) ? hours : 0,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0,
  );
  return base;
}

export function getEventFomoBadge(
  event: Event,
  now: Date = new Date(),
): FomoBadge | null {
  const start = parseEventStart(event);
  if (!start) return null;

  const diff = start.getTime() - now.getTime();

  // 1 — already started, still within the grace window ⇒ "en cours".
  if (diff <= 0 && diff >= -ONGOING_WINDOW_MS) {
    return { label: 'En cours', tone: 'urgent' };
  }
  if (diff <= 0) {
    return null; // event has ended — no badge
  }

  // 2 & 3 & 4 — calendar-day math so the label flips at midnight, not at
  // the exact 24 / 48h boundary. "Demain matin" reads "Demain" even if it's
  // technically 36h away.
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const dayOfEvent = new Date(start);
  dayOfEvent.setHours(0, 0, 0, 0);
  const daysAway = Math.round(
    (dayOfEvent.getTime() - today.getTime()) / MS_PER_DAY,
  );

  if (daysAway === 0) {
    // Same calendar day ⇒ hours, rounded up, always at least 1.
    const hours = Math.max(1, Math.ceil(diff / MS_PER_HOUR));
    return { label: `Dans ${hours}h`, tone: 'urgent' };
  }
  if (daysAway === 1) {
    return { label: 'Demain', tone: 'soon' };
  }

  return { label: `Dans ${daysAway} jours`, tone: 'soon' };
}
