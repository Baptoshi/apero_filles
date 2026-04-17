/**
 * Remote photo URLs for the mock data — served straight from the Unsplash CDN.
 *
 * Kept in a separate file so `mock.ts` stays focused on the domain shape; here
 * we only deal with asset references. If you want to swap an avatar for your
 * own photo, drop the file in `assets/images/` and use a `require('...')`
 * expression wrapped in `Image.resolveAssetSource(...).uri` — or just replace
 * the URL below with a data URI or remote URL.
 */
function unsplash(id: string, width = 800): string {
  return `https://images.unsplash.com/photo-${id}?w=${width}&auto=format&fit=crop&q=80`;
}

export const USER_PHOTOS: Record<string, string> = {
  // u1 Marguerite — no remote photo; the Avatar component falls back to the
  // flat initial circle (which is the real "avatar" look the user asked for).
  // Drop a photo in assets/images/ and reference it here to replace.
  u2: unsplash('1438761681033-6461ffad8d80', 200),
  u3: unsplash('1494790108377-be9c29b29330', 200),
  u4: unsplash('1531746020798-e6953c6e8e04', 200),
  u5: unsplash('1508214751196-bcfd4ca60f91', 200),
  u6: unsplash('1544005313-94ddf0286df2', 200),
  u7: unsplash('1524504388940-b1c1722653e1', 200),
  u8: unsplash('1517841905240-472988babdf9', 200),
  u9: unsplash('1541823709867-1b206113eafd', 200),
  u10: unsplash('1487412720507-e7ab37603c6f', 200),
  u11: unsplash('1489424731084-a5d8b219a5bb', 200),
  u12: unsplash('1529626455594-4ff0802cfb7e', 200),
  u13: unsplash('1507003211169-0a1dd7228f2d', 200),
  u14: unsplash('1548142813-c348350df52b', 200),
  u15: unsplash('1502106527946-b38c8f0876fc', 200),
  u16: unsplash('1541101767792-f9b2b1c4f127', 200),
  u17: unsplash('1534528741775-53994a69daeb', 200),
  u18: unsplash('1531123897727-8f129e1688ce', 200),
  u19: unsplash('1580489944761-15a19d654956', 200),
  u20: unsplash('1502767089025-6572583495b4', 200),
};

export const EVENT_PHOTOS: Record<string, string> = {
  e1: unsplash('1528825871115-3581a5387919', 900), // apéro bar
  e2: unsplash('1552674605-db6ffd4facb5', 900), // morning run
  e3: unsplash('1565193566173-7a0ee3dbe261', 900), // pottery
  e4: unsplash('1514525253161-7a46d19cd819', 900), // comedy stage
  e5: unsplash('1540575467063-178a50c2df87', 900), // speaker talk
  e6: unsplash('1495474472287-4d71bcdd2085', 900), // coffee + books
  e7: unsplash('1519671482749-fd09be7ccebf', 900), // rooftop night
  e8: unsplash('1506126613408-eca07ce68773', 900), // yoga beach
  e9: unsplash('1533089860892-a7c6f0a88666', 900), // brunch flowers
  e10: unsplash('1543007630-9710e4a00a20', 900), // pub
  e11: unsplash('1551024601-bec78aea704b', 900), // cocktail making
  e12: unsplash('1551632811-561732d1e306', 900), // hiking
};
