import type { Event } from '@/types/event';
import type { MembershipTier } from '@/types/user';

/**
 * Membership-aware price resolution.
 *
 * Every event is paid. What changes with membership is what the user will pay:
 *   - Free     → they pay the full price; we also surface the member price so
 *                they can see what they would save by joining.
 *   - Member   → they pay the discounted price; the full price is struck-through.
 *
 * Components render `label` as the primary amount and use `strikethroughLabel`
 * (for members) or `memberHint` (for free) as secondary information.
 */
export interface EventPrice {
  /** Numeric amount the user pays right now. */
  amount: number;
  /** Primary price label to display prominently. */
  label: string;
  /** Struck-through full price when the member discount is active. */
  strikethroughLabel: string | null;
  /** Text like "Membre 10€" shown to free users to reveal the savings. */
  memberHint: string | null;
  /** Savings amount (positive when there is a discount). */
  savings: number;
  /** Whether a discount exists at all. */
  hasDiscount: boolean;
}

function formatAmount(amount: number): string {
  return amount === 0 ? 'Gratuit' : `${amount}€`;
}

export function getEventPrice(event: Event, tier: MembershipTier): EventPrice {
  const isMember = tier !== 'free';
  const hasDiscount = event.priceMember < event.priceFull;
  const amount = isMember ? event.priceMember : event.priceFull;

  return {
    amount,
    label: formatAmount(amount),
    strikethroughLabel: isMember && hasDiscount ? formatAmount(event.priceFull) : null,
    memberHint: !isMember && hasDiscount ? `Membre ${formatAmount(event.priceMember)}` : null,
    savings: Math.max(event.priceFull - event.priceMember, 0),
    hasDiscount,
  };
}
