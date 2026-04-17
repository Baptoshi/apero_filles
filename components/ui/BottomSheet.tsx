import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';

import { PlatformModal } from './PlatformModal';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Optional max height override, defaults to 85% of the screen height. */
  maxHeightRatio?: number;
  contentStyle?: ViewStyle | ViewStyle[];
}

/**
 * Bottom sheet primitive used across the app. The panel is fully opaque
 * (cream surface, shadow) and the backdrop is blurred so the content
 * underneath reads as out-of-focus rather than just dimmed.
 */
export function BottomSheet({
  visible,
  onClose,
  children,
  maxHeightRatio = 0.85,
  contentStyle,
}: BottomSheetProps) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const translate = useSharedValue(screenHeight);
  const backdrop = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdrop.value = withTiming(1, { duration: 220 });
      translate.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      backdrop.value = withTiming(0, { duration: 160 });
      translate.value = withTiming(screenHeight, {
        duration: 220,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [visible, backdrop, translate, screenHeight]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translate.value }],
  }));

  const requestClose = () => {
    backdrop.value = withTiming(0, { duration: 160 });
    translate.value = withTiming(
      screenHeight,
      { duration: 220, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(onClose)();
      },
    );
  };

  return (
    <PlatformModal visible={visible} onRequestClose={requestClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFillObject, backdropStyle]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={65} tint="dark" style={StyleSheet.absoluteFillObject} />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.webBackdrop]} />
          )}
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={requestClose}
            accessibilityLabel="Fermer"
            accessibilityRole="button"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight: screenHeight * maxHeightRatio,
              paddingBottom: Math.max(insets.bottom, Spacing.lg),
            },
            sheetStyle,
            contentStyle,
          ]}
        >
          <Pressable
            onPress={requestClose}
            hitSlop={12}
            accessibilityLabel="Fermer"
            accessibilityRole="button"
            style={styles.handleWrap}
          >
            <View style={styles.handle} />
          </Pressable>
          {children}
        </Animated.View>
      </View>
    </PlatformModal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  webBackdrop: {
    backgroundColor: 'rgba(15, 10, 7, 0.35)',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(28px) saturate(130%)' } as any)
      : null),
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 12,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderStrong,
  },
});
