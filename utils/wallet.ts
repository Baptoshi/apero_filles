import { mockPartners } from '@/data/mock';
import type { Partner } from '@/types/partner';
import type { Deal } from '@/types/wallet';
import type { City, MembershipTier } from '@/types/user';

/**
 * Bons Plans aggregation helpers.
 *
 * The "wallet" surface only hosts partner deals — event tickets live on the
 * event detail page itself (via `TicketSheet`), not in a wallet list. Deals
 * are derived on-the-fly from the partners catalog so the free-tier preview
 * (cards visible, QR locked) stays trivial to implement.
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
 * True when the membership lets the user actually redeem the deal.
 * Free tier previews deals but sees a locked QR.
 */
export function canRedeem(tier: MembershipTier): boolean {
  return tier !== 'free';
}

/**
 * A single entry displayed on the Bons Plans screen. Kept as a discriminated
 * union for forward-compat (if we ever add another kind), but today only
 * `deal` is rendered — tickets don't live here.
 */
export type WalletItem = { kind: 'deal'; id: string; deal: Deal };

export function toDealItem(deal: Deal): WalletItem {
  return { kind: 'deal', id: deal.id, deal };
}
