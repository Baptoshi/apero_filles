import { ChevronLeft, Share2 } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/IconButton';
import { PillTag } from '@/components/ui/PillTag';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import type { Event } from '@/types/event';
import { formatDatePieces } from '@/utils/date';

interface EventHeroProps {
  event: Event;
  onBack: () => void;
  onShare?: () => void;
}

/**
 * Minimal event hero — Luma / Apple inspired.
 *
 * Soft neutral background (no gradient), a small floating date pill on the right,
 * bold title underneath. The category stays as a small pill for discoverability.
 */
export function EventHero({ event, onBack, onShare }: EventHeroProps) {
  const insets = useSafeAreaInsets();
  const pieces = formatDatePieces(event.date);

  return (
    <View style={[styles.hero, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.topRow}>
        <IconButton
          icon={<ChevronLeft size={IconSize.content} color={Colors.text} strokeWidth={1.8} />}
          accessibilityLabel="Retour"
          onPress={onBack}
          variant="solid"
        />
        <IconButton
          icon={<Share2 size={IconSize.content} color={Colors.text} strokeWidth={1.8} />}
          accessibilityLabel="Partager"
          onPress={onShare}
          variant="solid"
        />
      </View>

      <View style={styles.dateCard}>
        <Text style={styles.dateMonth}>{pieces.month}</Text>
        <Text style={styles.dateDay}>{pieces.day}</Text>
        <Text style={styles.dateWeekday}>{pieces.weekday}</Text>
      </View>

      <View style={styles.titleBlock}>
        <PillTag label={event.category} variant="outline" style={styles.categoryPill} />
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.subtitle}>
          {event.time} · {event.city}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    backgroundColor: Colors.backgroundMuted,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateCard: {
    position: 'absolute',
    right: Spacing.xl,
    top: Spacing.xxl + Spacing.xl + 24,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    width: 64,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateWeekday: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  dateDay: {
    ...Typography.h1,
    color: Colors.text,
    letterSpacing: -0.6,
  },
  dateMonth: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  titleBlock: {
    marginTop: Spacing.xxxl,
    paddingRight: 80,
  },
  categoryPill: {
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
