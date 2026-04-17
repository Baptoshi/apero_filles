export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/**
 * Radii tuned to Apple / Luma feel: 12 for cards, 14 for larger surfaces.
 * Pill (`full`) only used for CTAs and avatar-like shapes.
 */
export const Radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 18,
  full: 9999,
} as const;

export const IconSize = {
  inline: 14,
  content: 18,
  nav: 22,
  large: 28,
} as const;

export const TouchTarget = {
  min: 44,
} as const;

/**
 * iPhone 14 portrait frame size — used by the web viewport lock so the demo
 * looks like a phone even when served in a browser.
 */
export const PhoneViewport = {
  width: 390,
  height: 844,
} as const;
