import Svg, { Path } from 'react-native-svg';

/**
 * Brand logos for the "Continuer avec …" buttons.
 *
 * Paths are the canonical Google / Apple logos as published in their
 * respective brand guidelines — rendered via `react-native-svg` so they
 * stay crisp at any size and work on iOS / Android / web.
 */

interface BrandIconProps {
  size?: number;
}

/** Multi-coloured Google "G" (2015 refresh). */
export function GoogleLogo({ size = 18 }: BrandIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.44c-.28 1.48-1.13 2.73-2.39 3.58v2.97h3.86c2.26-2.08 3.58-5.15 3.58-8.79z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-2.97c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <Path
        fill="#FBBC05"
        d="M5.27 14.32c-.25-.72-.39-1.49-.39-2.32s.14-1.6.39-2.32V6.59H1.29C.47 8.2 0 10.04 0 12s.47 3.8 1.29 5.41l3.98-3.09z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.77c1.77 0 3.35.61 4.59 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.98 3.09C6.22 6.88 8.87 4.77 12 4.77z"
      />
    </Svg>
  );
}

/** Monochrome Apple logo — solid fill, black (matches Apple's HIG). */
export function AppleLogo({ size = 18 }: BrandIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#000000"
        d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.2 0-1.4.67-2.14.5-3.03-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.89 3.51-.84 1.54.07 2.7.61 3.44 1.57-3.14 1.88-2.29 5.13.36 6.22-.65 1.29-1.52 2.58-2.39 4.22zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      />
    </Svg>
  );
}
