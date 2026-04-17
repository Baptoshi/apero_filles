import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { useAuthStore } from '@/stores/useAuthStore';
import { useEventsStore } from '@/stores/useEventsStore';
import type { Event } from '@/types/event';

/**
 * Monthly limit for free members, per spec :
 * "Elle peut s'inscrire à 1 event par mois max au prix plein."
 */
export const FREE_TIER_MONTHLY_LIMIT = 1;

export interface RegistrationIntent {
  status: 'ok' | 'needs-subscription' | 'full';
  reason: 'ok' | 'tier-limit' | 'sold-out';
}

export interface EventActions {
  isRegistered: boolean;
  isBookmarked: boolean;
  canRegister: boolean;
  registrationIntent: RegistrationIntent;

  toggleBookmark: () => void;
  register: () => RegistrationIntent;
  unregister: () => void;
  /** Triggers register; on failure, opens the paywall for tier-limit. */
  registerOrPaywall: () => void;
}

/**
 * Single entry-point for every event-related user action.
 *
 * Keeps the membership + limit rules centralized — screens never need to
 * know about the free-tier monthly cap or when to redirect to paywall.
 */
export function useEventActions(event: Event): EventActions {
  const router = useRouter();
  const tier = useAuthStore((s) => s.tier);

  const bookmarked = useEventsStore((s) => s.bookmarks.has(event.id));
  const registered = useEventsStore((s) => s.registrations.has(event.id));
  const toggleBookmarkStore = useEventsStore((s) => s.toggleBookmark);
  const registerStore = useEventsStore((s) => s.register);
  const unregisterStore = useEventsStore((s) => s.unregister);
  const countThisMonth = useEventsStore((s) => s.countRegistrationsInMonth);

  const registrationIntent = useMemo<RegistrationIntent>(() => {
    if (event.spots <= 0 && !registered) {
      return { status: 'full', reason: 'sold-out' };
    }
    if (
      tier === 'free' &&
      !registered &&
      countThisMonth() >= FREE_TIER_MONTHLY_LIMIT
    ) {
      return { status: 'needs-subscription', reason: 'tier-limit' };
    }
    return { status: 'ok', reason: 'ok' };
  }, [tier, registered, event.spots, countThisMonth]);

  const toggleBookmark = useCallback(() => {
    toggleBookmarkStore(event.id);
  }, [toggleBookmarkStore, event.id]);

  const register = useCallback((): RegistrationIntent => {
    if (registrationIntent.status !== 'ok') return registrationIntent;
    registerStore(event.id);
    return registrationIntent;
  }, [registrationIntent, registerStore, event.id]);

  const unregister = useCallback(() => {
    unregisterStore(event.id);
  }, [unregisterStore, event.id]);

  const registerOrPaywall = useCallback(() => {
    if (registrationIntent.status === 'needs-subscription') {
      router.push('/subscribe');
      return;
    }
    if (registrationIntent.status === 'ok') {
      registerStore(event.id);
    }
  }, [registrationIntent, registerStore, event.id, router]);

  return {
    isRegistered: registered,
    isBookmarked: bookmarked,
    canRegister: registrationIntent.status === 'ok',
    registrationIntent,
    toggleBookmark,
    register,
    unregister,
    registerOrPaywall,
  };
}
