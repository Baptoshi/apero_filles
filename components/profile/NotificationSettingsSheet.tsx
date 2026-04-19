import { Bell, Mail, type LucideIcon } from 'lucide-react-native';
import { Platform, StyleSheet, Switch, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { useAuthStore, type NotificationKey } from '@/stores/useAuthStore';

interface NotificationSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface ChannelRow {
  key: NotificationKey;
  label: string;
  helper: string;
  icon: LucideIcon;
}

const CHANNELS: readonly ChannelRow[] = [
  {
    key: 'push',
    label: 'Notifications push',
    helper: 'Nouveaux événements, rappels J-2 et confirmations.',
    icon: Bell,
  },
  {
    key: 'email',
    label: 'Emails',
    helper: 'Reçus de paiement, confirmations, infos abonnement.',
    icon: Mail,
  },
];

/**
 * Notification channels sheet — one toggle per channel (push / email / SMS).
 * Opened from the "Notifications" row in the Profile settings. Each toggle
 * writes through `toggleNotificationChannel` on the auth store — a real
 * backend would sync these via `PATCH /me/notifications`.
 */
export function NotificationSettingsSheet({
  visible,
  onClose,
}: NotificationSettingsSheetProps) {
  const notifications = useAuthStore((s) => s.notifications);
  const toggle = useAuthStore((s) => s.toggleNotificationChannel);

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeightRatio={0.7}>
      <View style={styles.sheet}>
        <Text style={styles.eyebrow}>Notifications</Text>
        <Text style={styles.title}>
          Comment on te <Text style={styles.titleAccent}>prévient</Text> ?
        </Text>
        <Text style={styles.subtitle}>
          Tu choisis les canaux, on ajuste les envois. Tu peux toujours
          changer d'avis ici.
        </Text>

        <View style={styles.card}>
          {CHANNELS.map((channel, idx) => {
            const Icon = channel.icon;
            const value = notifications[channel.key];
            return (
              <View
                key={channel.key}
                style={[
                  styles.row,
                  idx === CHANNELS.length - 1 && styles.rowLast,
                ]}
              >
                <View style={styles.rowIcon}>
                  <Icon
                    size={18}
                    color={Colors.accent}
                    strokeWidth={1.8}
                  />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{channel.label}</Text>
                  <Text style={styles.rowHelper}>{channel.helper}</Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={() => toggle(channel.key)}
                  trackColor={{ false: Colors.border, true: Colors.accent }}
                  thumbColor={
                    Platform.OS === 'android' ? Colors.surface : undefined
                  }
                  ios_backgroundColor={Colors.border}
                />
              </View>
            );
          })}
        </View>

        <Text style={styles.note}>
          Les notifications push nécessitent ton accord au niveau du système
          (iOS / Android). Si elles restent off côté OS, l'app te le rappellera
          à la prochaine ouverture.
        </Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    lineHeight: 32,
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: Spacing.xs,
  },
  titleAccent: {
    fontStyle: 'italic',
    color: Colors.accent,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(194, 65, 12, 0.12)',
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  rowHelper: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  note: {
    ...Typography.small,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
});
