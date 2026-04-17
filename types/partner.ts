import type { GradientName } from '@/constants/colors';
import type { City } from './user';

export interface Partner {
  id: string;
  name: string;
  category: string;
  offer: string;
  city: City;
  validUntil: string;
  gradient: GradientName;
}
