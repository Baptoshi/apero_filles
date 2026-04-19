import type { Event, EventCategory } from '@/types/event';
import type { Interest, User } from '@/types/user';

/**
 * Lightweight content-based recommender.
 *
 * This is the classic "linear combination of features" recipe used by most
 * open-source recommenders (Mahout, LensKit, LightFM, Surprise) for
 * cold-start scenarios where there's no matrix-factorization model yet.
 * Reference: Ricci / Rokach / Shapira — "Recommender Systems Handbook"
 * (Springer, 2011), chapter 3 "Content-Based Recommender Systems".
 *
 * How it works:
 *   1. We build a **taste profile** for the user — a weighted map from event
 *      category to affinity score. Explicit declared interests weigh the
 *      most; past attended events are a stronger implicit signal than
 *      bookmarks; events simply opened on Discover are the weakest signal.
 *   2. We score each candidate event by combining:
 *        score = taste[category]
 *              + cityMatchBoost
 *              + friendOverlapBoost
 *              + soonRecencyBoost
 *              + urgencyBoost
 *              + commitmentBoost
 *      "Commitment" (she's already registered or bookmarked the event)
 *      hoists the event to the top of the list so her personal calendar
 *      appears first — recommendations fill in behind.
 *   3. Ties break by earliest date so the feed stays chronological within
 *      equally-scored groups.
 *
 * The whole pass is O(candidates × interactions) with no ML dependencies,
 * which keeps it trivial to reason about, trivial to unit-test, and free of
 * the heavy deps that would bloat an Expo bundle.
 */

/** Signal weights — tweak these to change the feed's feel. */
export const RECO_WEIGHTS = {
  /** Explicitly declared in onboarding. Strongest single signal. */
  declaredInterest: 3,
  /** Past events she actually attended — behavioral truth. */
  attendedCategory: 2,
  /** Likes / bookmarks — intent, but weaker than showing up. */
  bookmarkCategory: 1.5,
  /** Events she opened on Discover — weakest (curiosity only). */
  viewedCategory: 0.5,
  /** Event happens in her city. */
  cityMatch: 2,
  /** Each friend (someone she's been to an event with) also attending. */
  friendAttending: 0.8,
  /** Happening within the next 14 days — proximity nudge. */
  soonBoost: 1,
  /** Fewer than 30% spots left — urgency nudge. */
  urgencyBoost: 0.5,
  /**
   * The user has already committed (registered or bookmarked). Big enough
   * that committed events always rank above recommendations.
   */
  commitment: 100,
} as const;

/** Immutable mapping from event category to affinity score. */
export type TasteProfile = ReadonlyMap<EventCategory, number>;

export interface RecommendationContext {
  user: User;
  interests: readonly Interest[];
  bookmarkedEvents: readonly Event[];
  /** Past events she attended (as listed attendee or via registration). */
  attendedEvents: readonly Event[];
  /** Events she opened on Discover / Home / deep link. */
  viewedEvents: readonly Event[];
  /** Ids of events she's currently committed to (registered OR bookmarked). */
  committedIds: ReadonlySet<string>;
  /** Ids of users she's been to past events with — her "friend circle". */
  friendIds: ReadonlySet<string>;
  /** `Date.now()` overridable for deterministic tests. */
  now?: number;
}

/**
 * Build the taste profile by stacking each interaction's category weight.
 * A category the user declared + attended + bookmarked accumulates weight
 * from all three signals — natural emphasis without manual tuning.
 */
export function buildTasteProfile(ctx: RecommendationContext): TasteProfile {
  const profile = new Map<EventCategory, number>();

  const bump = (category: EventCategory, weight: number) => {
    profile.set(category, (profile.get(category) ?? 0) + weight);
  };

  for (const interest of ctx.interests) {
    bump(interest as EventCategory, RECO_WEIGHTS.declaredInterest);
  }
  for (const event of ctx.attendedEvents) {
    bump(event.category, RECO_WEIGHTS.attendedCategory);
  }
  for (const event of ctx.bookmarkedEvents) {
    bump(event.category, RECO_WEIGHTS.bookmarkCategory);
  }
  for (const event of ctx.viewedEvents) {
    bump(event.category, RECO_WEIGHTS.viewedCategory);
  }

  return profile;
}

/**
 * Score a single event against the taste profile + contextual signals.
 * Pure function — no side effects, no state reads.
 */
export function scoreEvent(
  event: Event,
  taste: TasteProfile,
  ctx: RecommendationContext,
): number {
  let score = taste.get(event.category) ?? 0;

  if (event.city === ctx.user.city) {
    score += RECO_WEIGHTS.cityMatch;
  }

  if (ctx.committedIds.has(event.id)) {
    score += RECO_WEIGHTS.commitment;
  }

  // Social signal: overlap with the user's "friend circle" (anyone she's been
  // to a past event with). The more friends going, the stronger the pull.
  let friendsAttending = 0;
  for (const attendee of event.attendees) {
    if (ctx.friendIds.has(attendee.id)) friendsAttending += 1;
  }
  score += friendsAttending * RECO_WEIGHTS.friendAttending;

  // Recency — gentle boost for anything happening within two weeks.
  const now = ctx.now ?? Date.now();
  const daysAway = (new Date(event.date).getTime() - now) / 86_400_000;
  if (daysAway >= 0 && daysAway <= 14) {
    score += RECO_WEIGHTS.soonBoost;
  }

  // Urgency — "hurry up, it's almost full".
  if (event.totalSpots > 0) {
    const fillRatio = event.spots / event.totalSpots;
    if (fillRatio < 0.3) {
      score += RECO_WEIGHTS.urgencyBoost;
    }
  }

  return score;
}

/**
 * Return the candidate list sorted by personalised score (descending).
 * Equal-scored events fall back to chronological order.
 */
export function rankEvents(
  candidates: readonly Event[],
  ctx: RecommendationContext,
): Event[] {
  const taste = buildTasteProfile(ctx);
  return candidates
    .map((event) => ({ event, score: scoreEvent(event, taste, ctx) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.event.date).getTime() - new Date(b.event.date).getTime();
    })
    .map((entry) => entry.event);
}

/**
 * Build a "friend circle" from the user's past + committed events — anyone
 * she's shared an event with is likely to be a familiar face.
 */
export function buildFriendIds(
  userId: string,
  events: readonly Event[],
): Set<string> {
  const friends = new Set<string>();
  for (const event of events) {
    for (const attendee of event.attendees) {
      if (attendee.id !== userId) friends.add(attendee.id);
    }
  }
  return friends;
}
