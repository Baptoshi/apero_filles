import type { GradientName } from '@/constants/colors';
import type { City } from './user';

export interface Partner {
  id: string;
  name: string;
  category: string;
  offer: string;
  /** Short, editorial one-liner describing why the place is a find. */
  tagline?: string;
  /** Neighborhood or street — gives the deal a "near me" texture. */
  area?: string;
  city: City;
  validUntil: string;
  gradient: GradientName;
  /** Optional remote cover photo. Falls back to the gradient if absent. */
  imageUrl?: string;
  /** Highlights a deal as the current editorial pick. */
  featured?: boolean;
}
