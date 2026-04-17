import type { Event } from './event';
import type { Partner } from './partner';

export interface Ticket {
  id: string;
  eventId: string;
  event: Event;
  purchasedAt: string;
  qrPayload: string;
}

export interface Deal {
  id: string;
  partnerId: string;
  partner: Partner;
  qrPayload: string;
}
