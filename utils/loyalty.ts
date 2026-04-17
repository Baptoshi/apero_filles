/**
 * Loyalty system — tiers unlock as the user attends more events.
 * Kept intentionally simple; the source of truth is the `eventsAttended` count.
 */
export interface LoyaltyLevel {
  id: string;
  name: string;
  threshold: number;
  description: string;
}

export const LOYALTY_LEVELS: readonly LoyaltyLevel[] = [
  {
    id: 'newcomer',
    name: 'Nouvelle venue',
    threshold: 0,
    description: 'Tu viens d’arriver. Profite des premiers événements.',
  },
  {
    id: 'explorer',
    name: 'Exploratrice',
    threshold: 3,
    description: 'Tu commences à explorer ce que le club a à offrir.',
  },
  {
    id: 'regular',
    name: 'Régulière',
    threshold: 10,
    description: 'On te voit souvent. Tu connais ta tribu.',
  },
  {
    id: 'insider',
    name: 'Habituée',
    threshold: 20,
    description: 'Les filles savent qu’elles peuvent compter sur toi.',
  },
  {
    id: 'ambassador',
    name: 'Ambassadrice',
    threshold: 40,
    description: 'Tu es au cœur du club. Merci pour ton énergie.',
  },
] as const;

export interface LoyaltyProgress {
  current: LoyaltyLevel;
  next: LoyaltyLevel | null;
  progress: number; // 0..1
  toNext: number | null; // events remaining until next level, or null at max
}

export function getLoyaltyProgress(eventsAttended: number): LoyaltyProgress {
  const levels = LOYALTY_LEVELS;
  let currentIndex = 0;
  for (let i = 0; i < levels.length; i += 1) {
    const level = levels[i];
    if (!level) continue;
    if (eventsAttended >= level.threshold) currentIndex = i;
  }
  const current = levels[currentIndex] ?? levels[0];
  const next = levels[currentIndex + 1] ?? null;

  if (!current) {
    // Impossible but satisfies TS strictness.
    return { current: levels[0] as LoyaltyLevel, next: null, progress: 0, toNext: null };
  }

  if (!next) {
    return { current, next: null, progress: 1, toNext: null };
  }

  const span = next.threshold - current.threshold;
  const raw = eventsAttended - current.threshold;
  const progress = span === 0 ? 1 : Math.min(Math.max(raw / span, 0), 1);
  return {
    current,
    next,
    progress,
    toNext: Math.max(next.threshold - eventsAttended, 0),
  };
}
