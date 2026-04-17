import type { GradientName } from '@/constants/colors';

export type MembershipTier = 'free' | 'member' | 'faithful';

export type City = 'Lyon' | 'Marseille' | 'Toulouse' | 'Montpellier' | 'Rennes';

export type Interest =
  | 'Apéro'
  | 'Sport'
  | 'Atelier créatif'
  | 'Talk'
  | 'Bien-être'
  | 'Gastronomie'
  | 'Sortie';

export interface User {
  id: string;
  firstName: string;
  age: number;
  city: City;
  bio: string;
  instagram: string;
  phone: string;
  memberSince: string;
  eventsAttended: number;
  girlsMet: number;
  tier: MembershipTier;
  avatarGradient: GradientName;
  /** Remote portrait photo (Unsplash CDN). Falls back to initials if missing. */
  avatarUrl?: string;
  interests: Interest[];
}
