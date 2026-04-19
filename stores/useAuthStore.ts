import { create } from 'zustand';

import { currentUser } from '@/data/mock';
import type { City, Interest, MembershipTier, User } from '@/types/user';

export type AuthMode = 'sign-in' | 'sign-up';
export type AuthProvider = 'email' | 'google';

interface OnboardingDraft {
  mode: AuthMode;
  provider: AuthProvider | null;
  email: string;
  firstName: string;
  lastName: string;
  instagram: string;
  phone: string;
  /** Local or remote URI of the avatar picked during onboarding. */
  avatarUrl: string | null;
  city: City | null;
  age: number | null;
  interests: Interest[];
}

/**
 * Field-level privacy settings. Controls what other users see in the
 * annuaire + on shared event pages. When `profileVisible` is false the
 * entire profile is hidden (the fille becomes invisible in the annuaire),
 * regardless of the per-field flags below.
 */
export interface PrivacySettings {
  profileVisible: boolean;
  showFirstName: boolean;
  showLastName: boolean;
  showAge: boolean;
  showCity: boolean;
  showBio: boolean;
  showInterests: boolean;
  showEventsCount: boolean;
  showGirlsMet: boolean;
  showInstagram: boolean;
}

export type PrivacyKey = Exclude<keyof PrivacySettings, 'profileVisible'>;

const defaultPrivacy: PrivacySettings = {
  profileVisible: true,
  showFirstName: true,
  showLastName: false,
  showAge: true,
  showCity: true,
  showBio: true,
  showInterests: true,
  showEventsCount: true,
  showGirlsMet: false,
  showInstagram: false,
};

/**
 * Notification channel toggles. Push is on by default (the OS-level prompt
 * is triggered separately), email optional. Each channel is independent —
 * the backend reads this to pick whether to send a transactional template
 * or schedule a push.
 */
export interface NotificationSettings {
  push: boolean;
  email: boolean;
}

export type NotificationKey = keyof NotificationSettings;

const defaultNotifications: NotificationSettings = {
  push: true,
  email: true,
};

interface AuthState {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  user: User | null;
  tier: MembershipTier;
  onboardingDraft: OnboardingDraft;
  privacy: PrivacySettings;
  notifications: NotificationSettings;

  // Onboarding actions
  setDraftMode: (mode: AuthMode) => void;
  setDraftProvider: (provider: AuthProvider) => void;
  setDraftEmail: (email: string) => void;
  setDraftFirstName: (firstName: string) => void;
  setDraftLastName: (lastName: string) => void;
  setDraftInstagram: (instagram: string) => void;
  setDraftPhone: (phone: string) => void;
  setDraftAvatarUrl: (uri: string | null) => void;
  setDraftCity: (city: City) => void;
  setDraftAge: (age: number) => void;
  toggleDraftInterest: (interest: Interest) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // Auth actions
  login: () => void;
  logout: () => void;

  // Tier (dev toggle + subscription)
  setTier: (tier: MembershipTier) => void;
  cycleTier: () => void;

  // Preference
  setCity: (city: City) => void;

  /**
   * Generic partial-update for the signed-in user. Every editable field
   * on the profile page routes through here — mirror of a future
   * `PATCH /me` endpoint on the backend (the payload is a `Partial<User>`).
   */
  updateUser: (patch: Partial<User>) => void;

  // Privacy
  setProfileVisible: (visible: boolean) => void;
  togglePrivacyField: (key: PrivacyKey) => void;

  // Notification channels
  toggleNotificationChannel: (key: NotificationKey) => void;
}

const emptyDraft: OnboardingDraft = {
  mode: 'sign-up',
  provider: null,
  email: '',
  firstName: '',
  lastName: '',
  instagram: '',
  phone: '',
  avatarUrl: null,
  city: null,
  age: null,
  interests: [],
};

const tierCycle: MembershipTier[] = ['free', 'member', 'faithful'];

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  user: null,
  tier: 'free',
  onboardingDraft: { ...emptyDraft },
  privacy: { ...defaultPrivacy },
  notifications: { ...defaultNotifications },

  setDraftMode: (mode) =>
    set((state) => ({ onboardingDraft: { ...state.onboardingDraft, mode } })),

  setDraftProvider: (provider) =>
    set((state) => ({ onboardingDraft: { ...state.onboardingDraft, provider } })),

  setDraftEmail: (email) =>
    set((state) => ({ onboardingDraft: { ...state.onboardingDraft, email } })),

  setDraftFirstName: (firstName) =>
    set((state) => ({
      onboardingDraft: { ...state.onboardingDraft, firstName },
    })),

  setDraftLastName: (lastName) =>
    set((state) => ({
      onboardingDraft: { ...state.onboardingDraft, lastName },
    })),

  setDraftInstagram: (instagram) =>
    set((state) => ({
      onboardingDraft: { ...state.onboardingDraft, instagram },
    })),

  setDraftPhone: (phone) =>
    set((state) => ({
      onboardingDraft: { ...state.onboardingDraft, phone },
    })),

  setDraftAvatarUrl: (avatarUrl) =>
    set((state) => ({
      onboardingDraft: { ...state.onboardingDraft, avatarUrl },
    })),

  setDraftCity: (city) =>
    set((state) => ({ onboardingDraft: { ...state.onboardingDraft, city } })),

  setDraftAge: (age) =>
    set((state) => ({ onboardingDraft: { ...state.onboardingDraft, age } })),

  toggleDraftInterest: (interest) =>
    set((state) => {
      const exists = state.onboardingDraft.interests.includes(interest);
      const interests = exists
        ? state.onboardingDraft.interests.filter((i) => i !== interest)
        : [...state.onboardingDraft.interests, interest];
      return { onboardingDraft: { ...state.onboardingDraft, interests } };
    }),

  completeOnboarding: () => {
    const draft = get().onboardingDraft;
    const merged: User = {
      ...currentUser,
      firstName: draft.firstName.trim() || currentUser.firstName,
      lastName: draft.lastName.trim() || currentUser.lastName,
      email: draft.email.trim() || currentUser.email,
      instagram: draft.instagram.trim() || currentUser.instagram,
      phone: draft.phone.trim() || currentUser.phone,
      avatarUrl: draft.avatarUrl ?? currentUser.avatarUrl,
      city: draft.city ?? currentUser.city,
      age: draft.age ?? currentUser.age,
      interests: draft.interests.length > 0 ? draft.interests : currentUser.interests,
    };
    set({
      isAuthenticated: true,
      hasCompletedOnboarding: true,
      user: merged,
      tier: 'free',
      onboardingDraft: { ...emptyDraft },
    });
  },

  resetOnboarding: () => set({ onboardingDraft: { ...emptyDraft } }),

  login: () =>
    set({
      isAuthenticated: true,
      hasCompletedOnboarding: true,
      user: currentUser,
      tier: currentUser.tier,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      user: null,
      tier: 'free',
      onboardingDraft: { ...emptyDraft },
    }),

  setTier: (tier) => set({ tier }),
  cycleTier: () => {
    const current = get().tier;
    const idx = tierCycle.indexOf(current);
    const next = tierCycle[(idx + 1) % tierCycle.length] ?? 'free';
    set({ tier: next });
  },

  setCity: (city) =>
    set((state) => (state.user ? { user: { ...state.user, city } } : state)),

  updateUser: (patch) =>
    set((state) =>
      state.user ? { user: { ...state.user, ...patch } } : state,
    ),

  setProfileVisible: (visible) =>
    set((state) => ({ privacy: { ...state.privacy, profileVisible: visible } })),

  togglePrivacyField: (key) =>
    set((state) => ({
      privacy: { ...state.privacy, [key]: !state.privacy[key] },
    })),

  toggleNotificationChannel: (key) =>
    set((state) => ({
      notifications: {
        ...state.notifications,
        [key]: !state.notifications[key],
      },
    })),
}));
