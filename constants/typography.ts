import type { TextStyle } from 'react-native';

/**
 * Typography tokens — editorial lifestyle direction.
 *
 * - Display sizes (h1, h2) use PlayfairDisplay for a magazine-like feel.
 * - UI, body, and secondary sizes use Inter for legibility.
 * - Tracking is tightened on display sizes, relaxed on uppercase labels.
 *
 * Legacy font family keys (`playfair*`, `inter*`) remain so no call-site has
 * to change during the migration.
 */
export const FontFamily = {
  display: 'PlayfairDisplay_700Bold',
  displaySemi: 'PlayfairDisplay_600SemiBold',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',

  // Legacy aliases
  playfairBold: 'PlayfairDisplay_700Bold',
  playfairSemiBold: 'PlayfairDisplay_600SemiBold',
  interRegular: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',
} as const;

export const Typography = {
  // Display — Playfair, editorial magazine feel
  h1: {
    fontFamily: FontFamily.display,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.2,
  },

  // Subhead — Inter, UI-like
  h3: {
    fontFamily: FontFamily.semiBold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.1,
  },

  // Body & UI — Inter
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyBold: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  small: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof Typography;
