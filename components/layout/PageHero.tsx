import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';

interface PageHeroProps {
  /** Main title — usually a composition of Text with an italic accent. */
  title: ReactNode;
  /** Small greeting or meta line above the title. */
  eyebrow?: ReactNode;
  /** Small meta line under the title (e.g. "4 prochains à Lyon"). */
  subtitle?: ReactNode;
  /** Small right-aligned slot (e.g. bell icon on Home). */
  accessory?: ReactNode;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Editorial page hero — typography only, no colored block.
 *
 * Inspired by Timeleft's clean greeting + big title layout: the hero sits
 * on the same cream canvas as the rest of the page, and relies purely on
 * Playfair type + whitespace to feel premium. An optional `accessory` (e.g.
 * a bell icon) floats to the top-right of the eyebrow row.
 */
export function PageHero({
  title,
  eyebrow,
  subtitle,
  accessory,
  style,
}: PageHeroProps) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.topRow}>
        <View style={styles.eyebrowSlot}>
          {typeof eyebrow === 'string' ? (
            <Text style={styles.eyebrow}>{eyebrow}</Text>
          ) : (
            eyebrow
          )}
        </View>
        {accessory ? <View style={styles.accessorySlot}>{accessory}</View> : null}
      </View>

      <Text style={styles.title}>{title}</Text>

      {subtitle ? (
        typeof subtitle === 'string' ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : (
          <View style={styles.subtitleSlot}>{subtitle}</View>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    minHeight: 36,
  },
  eyebrowSlot: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  eyebrow: {
    ...Typography.body,
    color: Colors.text,
  },
  accessorySlot: {
    // right-aligned
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 38,
    lineHeight: 44,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  subtitleSlot: {
    marginTop: Spacing.sm,
  },
});
