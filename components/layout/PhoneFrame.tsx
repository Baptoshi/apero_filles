import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

import { Colors } from '@/constants/colors';
import { PhoneViewport, Radius } from '@/constants/spacing';

interface PhoneFrameProps {
  children: ReactNode;
}

/**
 * On web, locks the app inside a centered iPhone-shaped viewport so the demo
 * always feels like a phone — regardless of the browser window size. The
 * frame scales down proportionally when the viewport is too small to host it
 * at 1:1, so portrait is preserved even on short or narrow desktops. On
 * actual mobile breakpoints we fall back to full-bleed, and on native
 * platforms this is a pass-through.
 */
export function PhoneFrame({ children }: PhoneFrameProps) {
  const { height, width } = useWindowDimensions();

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const MIN_MARGIN = 40;
  // Mobile browsers (or narrow windows) — the phone frame would just add a
  // border for no reason; render full-bleed instead.
  if (width < 500) {
    return <View style={styles.fill}>{children}</View>;
  }

  // Compute the uniform scale that still leaves comfortable margins around
  // the frame. Never upscale past 1 — the design is tuned for iPhone width.
  const scaleFromWidth = (width - MIN_MARGIN * 2) / PhoneViewport.width;
  const scaleFromHeight = (height - MIN_MARGIN * 2) / PhoneViewport.height;
  const scale = Math.max(0.4, Math.min(1, scaleFromWidth, scaleFromHeight));

  return (
    <View style={styles.stage}>
      <View
        style={[
          styles.deviceWrap,
          { transform: [{ scale }] },
        ]}
      >
        <View style={styles.device}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundMuted,
  },
  deviceWrap: {
    width: PhoneViewport.width,
    height: PhoneViewport.height,
    borderRadius: Radius.xl + 14,
    backgroundColor: Colors.background,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.18,
    shadowRadius: 60,
    // @ts-expect-error — boxShadow is web-only; harmless on native.
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.18)',
  },
  device: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: Radius.xl + 14,
    backgroundColor: Colors.background,
  },
});
