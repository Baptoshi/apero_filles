import type { GradientName } from '@/constants/colors';
import type { City, Interest, User } from './user';

export type EventCategory = Interest;

export interface Event {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // ISO date
  time: string; // "19h30"
  location: string;
  city: City;
  priceFull: number;
  priceMember: number;
  spots: number;
  totalSpots: number;
  description: string;
  attendees: User[];
  imageGradient: GradientName;
  /** Remote hero image for the event (Unsplash CDN URL). */
  imageUrl?: string;
  isBookmarked: boolean;
}
