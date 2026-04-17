import { mockPartners } from '@/data/mock';
import type { Partner } from '@/types/partner';
import type { Deal, Ticket } from '@/types/wallet';
import type { City, MembershipTier } from '@/types/user';

/**
 * Wallet aggregation helpers.
 *
 * Deals are derived from the partners list rather than stored — they become
 * "available" as soon as a user is a member (or faithful). This keeps the free-tier
 * preview (cards visible, QR locked) trivial to implement.
 */

function buildDeal(partner: Partner): Deal {
  return {
    id: `deal-${partner.id}`,
    partnerId: partner.id,
    partner,
    qrPayload: `laf:deal:${partner.id}`,
  };
}

export function getDealsForCity(city: City | 'all'): Deal[] {
  return mockPartners
    .filter((partner) => (city === 'all' ? true : partner.city === city))
    .map(buildDeal);
}

/**
 * True when the membership lets the user actually redeem the deal / ticket.
 * Free tier previews deals but sees a locked QR.
 */
export function canRedeem(tier: MembershipTier): boolean {
  return tier !== 'free';
}

export type WalletItem =
  | { kind: 'ticket'; id: string; ticket: Ticket }
  | { kind: 'deal'; id: string; deal: Deal };

export function toTicketItem(ticket: Ticket): WalletItem {
  return { kind: 'ticket', id: ticket.id, ticket };
}

export function toDealItem(deal: Deal): WalletItem {
  return { kind: 'deal', id: deal.id, deal };
}
