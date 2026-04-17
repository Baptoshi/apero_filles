import {
  MessageCircle,
  MoreHorizontal,
  Share2,
  Ticket as TicketIcon,
  TicketPlus,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

export interface EventActionHandlers {
  onRegister?: () => void;
  onTicket?: () => void;
  onContact?: () => void;
  onShare?: () => void;
  onMore?: () => void;
}

export interface EventActionsState {
  /** The user has a ticket — the first button becomes "Mon ticket". */
  hasTicket: boolean;
  /** CTA label to use when the user is not yet registered (e.g. "Je m'inscris" or "Rejoindre le club"). */
  registerLabel?: string;
  /** Disable the CTA (e.g. sold-out). */
  registerDisabled?: boolean;
}

interface EventActionsProps extends EventActionHandlers, EventActionsState {}

/**
 * Action row on the event detail page — Luma-inspired layout.
 *
 *   [  Primary CTA  ] [ Contact ] [ Share ] [ More ]
 *
 *  The first button is the registration / ticket CTA and is always
 *  visually emphasized. The three trailing buttons are quieter
 *  cream-filled action buttons with a small icon + label.
 */
export function EventActions({
  hasTicket,
  registerLabel = 'Je m’inscris',
  registerDisabled = false,
  onRegister,
  onTicket,
  onContact,
  onShare,
  onMore,
}: EventActionsProps) {
  const primaryLabel = hasTicket ? 'Mon ticket' : registerLabel;
  const primaryOnPress = hasTicket ? onTicket : onRegister;
  const primaryIcon = hasTicket ? (
    <TicketIcon size={20} color={Colors.accentContrast} strokeWidth={1.8} />
  ) : (
    <TicketPlus size={20} color={Colors.accentContrast} strokeWidth={1.8} />
  );

  return (
    <View style={styles.row}>
      <PrimaryAction
        label={primaryLabel}
        icon={primaryIcon}
        onPress={primaryOnPress}
        disabled={registerDisabled && !hasTicket}
        accessibilityLabel={hasTicket ? 'Voir mon ticket' : primaryLabel}
      />
      <SecondaryAction
        label="Contact"
        onPress={onContact}
        icon={<MessageCircle size={18} color={Colors.text} strokeWidth={1.6} />}
        accessibilityLabel="Contacter l'organisateur"
      />
      <SecondaryAction
        label="Partager"
        onPress={onShare}
        icon={<Share2 size={18} color={Colors.text} strokeWidth={1.6} />}
        accessibilityLabel="Partager l'événement"
      />
      <SecondaryAction
        label="Plus"
        onPress={onMore}
        icon={<MoreHorizontal size={18} color={Colors.text} strokeWidth={1.6} />}
        accessibilityLabel="Plus d'actions"
      />
    </View>
  );
}

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
}

function PrimaryAction({
  label,
  icon,
  onPress,
  disabled,
  accessibilityLabel,
}: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        styles.primary,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
      hitSlop={4}
    >
      <View style={styles.iconSlot}>{icon}</View>
      <Text style={[styles.label, styles.primaryLabel]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function SecondaryAction({
  label,
  icon,
  onPress,
  accessibilityLabel,
}: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.button,
        styles.secondary,
        pressed && styles.pressed,
      ]}
      hitSlop={4}
    >
      <View style={styles.iconSlot}>{icon}</View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
  },
  button: {
    flex: 1,
    height: 72,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    gap: 6,
  },
  primary: {
    backgroundColor: Colors.accent,
  },
  secondary: {
    backgroundColor: Colors.surfaceMuted,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.75,
  },
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.small,
    color: Colors.text,
    textAlign: 'center',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  primaryLabel: {
    color: Colors.accentContrast,
  },
});
