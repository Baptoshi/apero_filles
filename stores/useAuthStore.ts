import { create } from 'zustand';

import { currentUser } from '@/data/mock';
import type { City, Interest, MembershipTier, User } from '@/types/user';

interface OnboardingDraft {
  city: City | null;
  age: number | null;
  interests: Interest[];
}

interface AuthState {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  user: User | null;
  tier: MembershipTier;
  onboardingDraft: OnboardingDraft;

  // Onboarding actions
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
}

const emptyDraft: OnboardingDraft = {
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
}));
