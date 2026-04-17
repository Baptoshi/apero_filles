import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/colors';
import { Radius } from '@/constants/spacing';

/** Tuple matching the original template spec — keeps the prop self-documenting. */
export type Rgba = `rgba(${number}, ${number}, ${number}, ${number})`;

interface SpotlightCardProps {
  children: ReactNode;
  /**
   * Color of the radial spotlight overlay. Defaults to a warm terracotta
   * wash to match the Amalfi palette.
   */
  spotlightColor?: Rgba;
  /** Outer frame style (borderRadius, shadow, etc.). */
  style?: ViewStyle | ViewStyle[];
  /** Radius of the frame clip — keeps the spotlight from leaking past the corners. */
  radius?: number;
  /** Diameter in px of the soft spotlight; tune for the card size. */
  spotlightSize?: number;
  /**
   * Peak opacity of the spotlight when the pointer is over the card (0–1).
   * Lowering this makes the effect more subtle without killing the motion.
   */
  maxOpacity?: number;
}

/**
 * SpotlightCard — React-Native port of the react-bits/SpotlightCard component.
 *
 * Adapted to the project's warm editorial DA:
 *   - Cream surface + hairline warm border (instead of the original dark theme)
 *   - Terracotta spotlight by default
 *   - Same principle: a radial gradient follows the pointer on hover, fading
 *     in smoothly on enter and fading out on leave
 *
 * Web uses `onMouseMove` / `onMouseEnter` / `onMouseLeave` (React-Native-Web
 * forwards these DOM events). On native we simply render children without the
 * spotlight — the effect has no touch equivalent that feels right.
 */
export function SpotlightCard({
  children,
  spotlightColor = 'rgba(194, 65, 12, 0.16)',
  style,
  radius = Radius.xl,
  spotlightSize = 300,
  maxOpacity = 0.55,
}: SpotlightCardProps) {
  const x = useSharedValue(-9999);
  const y = useSharedValue(-9999);
  const opacity = useSharedValue(0);
  const [layout, setLayout] = useState<{ width: number; height: number } | null>(null);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  }, []);

  // These handlers only exist on web — RN ignores them natively.
  const webHandlers = useMemo(() => {
    if (Platform.OS !== 'web') return {};
    return {
      onMouseMove: (event: NativeSyntheticEvent<unknown>) => {
        // @ts-expect-error — nativeEvent is a real MouseEvent on web.
        const ev: MouseEvent = event.nativeEvent;
        // @ts-expect-error — currentTarget is an HTMLElement on web.
        const rect = event.currentTarget.getBoundingClientRect?.();
        if (!rect) return;
        x.value = ev.clientX - rect.left;
        y.value = ev.clientY - rect.top;
      },
      onMouseEnter: () => {
        opacity.value = withTiming(maxOpacity, { duration: 320 });
      },
      onMouseLeave: () => {
        opacity.value = withTiming(0, { duration: 500 });
      },
    } as Record<string, unknown>;
  }, [x, y, opacity, maxOpacity]);

  const animatedSpotlight = useAnimatedStyle(() => ({
    opacity: opacity.value,
    // Position the radial gradient via a translated View centered on the cursor.
    transform: [
      { translateX: x.value - spotlightSize / 2 },
      { translateY: y.value - spotlightSize / 2 },
    ],
  }));

  // The radial gradient is rendered via an inline CSS `backgroundImage` on web
  // (React-Native-Web forwards it); on native it's ignored, so we fall back to
  // a soft transparent View with a radial-ish tint via opacity (still subtle).
  const spotlightBg =
    Platform.OS === 'web'
      ? {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          backgroundImage: `radial-gradient(circle, ${spotlightColor}, rgba(0,0,0,0) 70%)`,
        }
      : { backgroundColor: spotlightColor };

  return (
    <View
      style={[styles.frame, { borderRadius: radius }, style]}
      onLayout={onLayout}
      {...webHandlers}
    >
      {layout ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.spotlight,
            {
              width: spotlightSize,
              height: spotlightSize,
              borderRadius: spotlightSize / 2,
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            spotlightBg as any,
            animatedSpotlight,
          ]}
        />
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  spotlight: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  content: {
    flex: 1,
  },
});
