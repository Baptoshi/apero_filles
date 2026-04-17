/**
 * Design tokens — warm Mediterranean / Amalfi Coast editorial direction.
 *
 * Palette : cream / beige surfaces, deep warm-brown text (never pure black),
 * terracotta signature and soft peach accents. Some moments are brighter
 * ("soleil") but always elegant — never AI-pastel or washed-out.
 *
 * Semantic keys are the preferred API. Legacy keys (`orange`, `cream`,
 * `terracotta`, ...) remain as aliases for backwards compatibility.
 */
export const Colors = {
  // Surfaces — warm cream canvas, white for raised cards
  background: '#FBF6EE',
  backgroundMuted: '#F3EADB',
  surface: '#FFFFFF',
  surfaceMuted: '#F7EDDD',
  surfaceSunken: '#EDE1CB',

  // Text — warm dark brown
  text: '#2A1810',
  textSecondary: '#7A5D4F',
  textTertiary: '#B89E8C',
  textInverse: '#FBF6EE',

  // Borders
  border: 'rgba(42, 24, 16, 0.1)',
  borderStrong: 'rgba(42, 24, 16, 0.2)',

  // Accent — terracotta signature
  accent: '#C2410C',
  accentContrast: '#FFFFFF',

  // Brand
  brand: '#C2410C',
  brandSoft: '#F5DFC8',
  brandDeep: '#7F2C0F',

  // Semantic — warm-tuned
  success: '#5A7A3E',
  danger: '#C73939',
  warning: '#D68B2E',

  // Membership tier rings
  tierFree: '#C6B8A8',
  tierMember: '#C2410C',
  tierFaithful: '#2A1810',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(42, 24, 16, 0.5)',
  shadow: '#2A1810',

  // Glass
  glass: 'rgba(255, 255, 255, 0.65)',
  glassDark: 'rgba(42, 24, 16, 0.3)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',

  // ───────────── Legacy aliases ─────────────
  darkBrown: '#2A1810',
  brown: '#7A5D4F',
  muted: '#B89E8C',
  orange: '#C2410C',
  peach: '#F5DFC8',
  terracotta: '#C2410C',
  cream: '#FBF6EE',
  warmWhite: '#FFFFFF',
  blush: '#F7EDDD',
  lightPeach: 'rgba(42, 24, 16, 0.1)',
  glassShadow: 'rgba(42, 24, 16, 0.1)',
} as const;

export type ColorName = keyof typeof Colors;

/**
 * Avatar tints — muted warm palette à la kinfolk/cereal magazine photography.
 */
export const AvatarTints = {
  peach: '#D98A65',
  terracotta: '#9C3C15',
  blush: '#C4756C',
  cream: '#C9A57E',
  sunset: '#C75A2E',
  warm: '#B48858',
  rose: '#A86E7C',
  dusk: '#5C3E30',
} as const;

export type AvatarTintName = keyof typeof AvatarTints;

export const Gradients = Object.fromEntries(
  Object.entries(AvatarTints).map(([k, v]) => [k, [v, v] as const]),
) as Record<AvatarTintName, readonly [string, string]>;

export type GradientName = AvatarTintName;
