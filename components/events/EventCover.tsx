import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { AvatarTints, Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import type { Event } from '@/types/event';

interface EventCoverProps {
  event: Event;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Editorial "poster" cover for an event detail page.
 *
 * Warm tinted block that mimics a real cover image — category label at the top,
 * event title centered (Playfair), and date/venue strip at the bottom. All
 * rendered in flat solid colors (no gradient) for the Amalfi editorial feel.
 */
export function EventCover({ event, style }: EventCoverProps) {
  const tint = AvatarTints[event.imageGradient];

  return (
    <View style={[styles.card, { backgroundColor: tint }, style]}>
      <Text style={styles.category}>{event.category}</Text>

      <View style={styles.titleBlock}>
        <Text style={styles.title} numberOfLines={3} allowFontScaling={false}>
          {event.title}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerCol}>
          <Text style={styles.footerLabel}>Date</Text>
          <Text style={styles.footerValue}>
            {new Date(event.date)
              .toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
              .replace('.', '')
              .toUpperCase()}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.footerCol}>
          <Text style={styles.footerLabel}>Heure</Text>
          <Text style={styles.footerValue}>{event.time}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.footerCol}>
          <Text style={styles.footerLabel}>Ville</Text>
          <Text style={styles.footerValue} numberOfLines={1}>
            {event.city}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    minHeight: 320,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  category: {
    ...Typography.label,
    color: Colors.white,
    opacity: 0.85,
  },
  titleBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 40,
    lineHeight: 46,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    gap: Spacing.md,
  },
  footerCol: {
    flex: 1,
  },
  footerLabel: {
    ...Typography.small,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  footerValue: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
});
