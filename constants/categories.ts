import type { EventCategory } from '@/types/event';

export const EVENT_CATEGORIES: readonly EventCategory[] = [
  'Apéro',
  'Sport',
  'Atelier créatif',
  'Talk',
  'Bien-être',
  'Gastronomie',
  'Sortie',
] as const;

export type CategoryFilter = EventCategory | 'all';

export const CATEGORY_FILTER_ALL: CategoryFilter = 'all';

export const CATEGORY_FILTERS: readonly CategoryFilter[] = [
  CATEGORY_FILTER_ALL,
  ...EVENT_CATEGORIES,
] as const;

export function categoryLabel(filter: CategoryFilter): string {
  return filter === 'all' ? 'Tout' : filter;
}
