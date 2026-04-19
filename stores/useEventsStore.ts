import { create } from 'zustand';

import { mockEvents } from '@/data/mock';
import type { Event } from '@/types/event';
import type { Ticket } from '@/types/wallet';
import { isUpcoming, monthKey } from '@/utils/date';

/**
 * Events store. Single source of truth for:
 *  - the catalog of events
 *  - bookmarks (persisted as a Set of event ids)
 *  - registrations (event id -> ISO date of registration, used for monthly limits)
 *
 * All membership-tier checks live in hooks/useEventActions, NOT here — the store stays
 * membership-agnostic so components and tests can drive it directly.
 */
interface EventsState {
  events: Event[];
  bookmarks: Set<string>;
  registrations: Map<string, string>; // eventId -> ISO registration timestamp
  /**
   * Events the user has opened (from Discover, Home, deep links…). Used as a
   * weak implicit signal by the recommendation engine — every category she
   * opens bumps that category's taste weight.
   */
  viewed: Set<string>;

  getEventById: (id: string) => Event | undefined;

  toggleBookmark: (eventId: string) => void;
  isBookmarked: (eventId: string) => boolean;

  register: (eventId: string) => void;
  unregister: (eventId: string) => void;
  isRegistered: (eventId: string) => boolean;

  /** Record that the user has opened this event's detail page. Idempotent. */
  markViewed: (eventId: string) => void;

  getBookmarked: () => Event[];
  getUpcomingForUser: (userId: string) => Event[];
  getPastForUser: (userId: string) => Event[];

  /** Count of registrations initiated in the given month (defaults to now). */
  countRegistrationsInMonth: (reference?: Date) => number;

  /** Derive tickets from registrations + event catalog. */
  getTickets: () => Ticket[];
  getTicketForEvent: (eventId: string) => Ticket | null;
}

const initialBookmarks = new Set<string>(
  mockEvents.filter((e) => e.isBookmarked).map((e) => e.id),
);

function buildTicket(event: Event, purchasedAt: string): Ticket {
  return {
    id: `ticket-${event.id}`,
    eventId: event.id,
    event,
    purchasedAt,
    // Payload that the scanner at the venue would validate.
    qrPayload: `laf:ticket:${event.id}:${purchasedAt}`,
  };
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: mockEvents,
  bookmarks: initialBookmarks,
  registrations: new Map<string, string>(),
  viewed: new Set<string>(),

  getEventById: (id) => get().events.find((event) => event.id === id),

  toggleBookmark: (eventId) =>
    set((state) => {
      const next = new Set(state.bookmarks);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return { bookmarks: next };
    }),

  isBookmarked: (eventId) => get().bookmarks.has(eventId),

  register: (eventId) =>
    set((state) => {
      if (state.registrations.has(eventId)) return state;
      const next = new Map(state.registrations);
      next.set(eventId, new Date().toISOString());
      return { registrations: next };
    }),

  unregister: (eventId) =>
    set((state) => {
      if (!state.registrations.has(eventId)) return state;
      const next = new Map(state.registrations);
      next.delete(eventId);
      return { registrations: next };
    }),

  isRegistered: (eventId) => get().registrations.has(eventId),

  markViewed: (eventId) =>
    set((state) => {
      if (state.viewed.has(eventId)) return state;
      const next = new Set(state.viewed);
      next.add(eventId);
      return { viewed: next };
    }),

  getBookmarked: () => {
    const { events, bookmarks } = get();
    return events.filter((event) => bookmarks.has(event.id));
  },

  getUpcomingForUser: (userId) => {
    const { events, registrations } = get();
    return events.filter(
      (event) =>
        isUpcoming(event.date) &&
        (registrations.has(event.id) || event.attendees.some((a) => a.id === userId)),
    );
  },

  getPastForUser: (userId) => {
    const { events, registrations } = get();
    return events.filter(
      (event) =>
        !isUpcoming(event.date) &&
        (registrations.has(event.id) || event.attendees.some((a) => a.id === userId)),
    );
  },

  countRegistrationsInMonth: (reference = new Date()) => {
    const key = monthKey(reference);
    let count = 0;
    for (const iso of get().registrations.values()) {
      if (monthKey(iso) === key) count += 1;
    }
    return count;
  },

  getTickets: () => {
    const { events, registrations } = get();
    const tickets: Ticket[] = [];
    for (const [eventId, purchasedAt] of registrations.entries()) {
      const event = events.find((e) => e.id === eventId);
      if (event) tickets.push(buildTicket(event, purchasedAt));
    }
    return tickets;
  },

  getTicketForEvent: (eventId) => {
    const { events, registrations } = get();
    const purchasedAt = registrations.get(eventId);
    if (!purchasedAt) return null;
    const event = events.find((e) => e.id === eventId);
    if (!event) return null;
    return buildTicket(event, purchasedAt);
  },
}));
