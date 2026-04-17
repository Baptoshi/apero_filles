import { Colors } from '@/constants/colors';
import type { Event } from '@/types/event';

export type SpotsLevel = 'plenty' | 'low' | 'last' | 'full';

export interface SpotsStatus {
  level: SpotsLevel;
  label: string;
  color: string;
}

/**
 * Derive the availability status of an event from remaining spots.
 * Keeps the same thresholds everywhere (card, detail page, CTA).
 */
export function getSpotsStatus(event: Event): SpotsStatus {
  const { spots, totalSpots } = event;
  if (spots <= 0) {
    return { level: 'full', label: 'Complet', color: Colors.muted };
  }
  if (spots <= 3) {
    return {
      level: 'last',
      label: `Plus que ${spots} place${spots > 1 ? 's' : ''}`,
      color: Colors.danger,
    };
  }
  if (spots / totalSpots <= 0.33) {
    return {
      level: 'low',
      label: `${spots} places restantes`,
      color: Colors.warning,
    };
  }
  return {
    level: 'plenty',
    label: `${spots} places disponibles`,
    color: Colors.success,
  };
}
