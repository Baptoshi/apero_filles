import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Luma-style segmented toggle.
 *
 * A rounded container holds the options side-by-side; the active option is
 * highlighted by a pill indicator that glides between positions. Width is
 * measured once via `onLayout` so the indicator exactly matches each segment.
 *
 * Generic on the option value for type-safe callbacks.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const [segmentWidth, setSegmentWidth] = useState(0);
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (segmentWidth === 0) return;
    // Quick slide, no overshoot / bounce.
    translateX.value = withTiming(activeIndex * segmentWidth, { duration: 180 });
  }, [activeIndex, segmentWidth, translateX]);

  const onLayout = (event: LayoutChangeEvent) => {
    const total = event.nativeEvent.layout.width;
    const next = Math.round(total / options.length);
    if (next > 0 && next !== segmentWidth) {
      setSegmentWidth(next);
      // jump the indicator to its position on first layout (no animation)
      translateX.value = withTiming(activeIndex * next, { duration: 0 });
    }
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      {segmentWidth > 0 ? (
        <Animated.View style={[styles.indicator, indicatorStyle]} />
      ) : null}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            style={styles.segment}
            hitSlop={4}
          >
            <Text style={[styles.label, selected ? styles.labelActive : styles.labelIdle]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundMuted,
    borderRadius: Radius.full,
    padding: 4,
    position: 'relative',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segment: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.lg,
    minWidth: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.caption,
  },
  labelActive: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
  },
  labelIdle: {
    color: Colors.textSecondary,
  },
});
