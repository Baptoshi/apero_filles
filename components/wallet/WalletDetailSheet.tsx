import { useRouter } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { QRCode } from '@/components/ui/QRCode';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { formatFullDate, formatShortDate } from '@/utils/date';
import type { WalletItem } from '@/utils/wallet';

interface WalletDetailSheetProps {
  visible: boolean;
  item: WalletItem | null;
  locked: boolean;
  onClose: () => void;
}

/**
 * Detail sheet for a wallet item.
 *
 *   - Deal  → editorial layout (eyebrow / Playfair title / offer / QR or lock)
 *   - Ticket → event title + QR + date + place (mirrors the deal structure)
 *
 * No duplicated info, no framed "details" cards — just clean flowing copy
 * with a single QR block in the middle.
 */
export function WalletDetailSheet({
  visible,
  item,
  locked,
  onClose,
}: WalletDetailSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeightRatio={0.9}>
      {item ? <DetailBody item={item} locked={locked} onClose={onClose} /> : null}
    </BottomSheet>
  );
}

function DetailBody({
  item,
  locked,
  onClose,
}: {
  item: WalletItem;
  locked: boolean;
  onClose: () => void;
}) {
  if (item.kind === 'ticket') {
    const { event, qrPayload } = item.ticket;
    return (
      <View style={styles.body}>
        <Text style={styles.eyebrow}>Mon ticket</Text>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.offer}>
          {formatFullDate(event.date)} · {event.time}
        </Text>

        <View style={styles.qrSlot}>
          <QRCode value={qrPayload} size={220} />
        </View>

        <Text style={styles.meta}>{event.location} — {event.city}</Text>
        <Text style={styles.metaSub}>Présente ce QR code à l'entrée. Il est personnel.</Text>
      </View>
    );
  }

  const { partner, qrPayload } = item.deal;

  return (
    <View style={styles.body}>
      <Text style={styles.eyebrow}>Bon plan</Text>
      <Text style={styles.title}>{partner.name}</Text>
      <Text style={styles.offer}>{partner.offer}</Text>

      {locked ? (
        <LockedState onClose={onClose} />
      ) : (
        <View style={styles.qrSlot}>
          <QRCode value={qrPayload} size={220} />
        </View>
      )}

      <Text style={styles.meta}>
        {partner.category} · {partner.city}
      </Text>
      <Text style={styles.metaSub}>
        Valable jusqu'au {formatShortDate(partner.validUntil)}
      </Text>
    </View>
  );
}

function LockedState({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  return (
    <View style={styles.lockSlot}>
      <View style={styles.lockIcon}>
        <Lock size={IconSize.content} color={Colors.text} strokeWidth={1.6} />
      </View>
      <Text style={styles.lockTitle}>Réservé aux membres</Text>
      <Text style={styles.lockBody}>
        Rejoins le club pour débloquer ce QR code et tous les avantages partenaires.
      </Text>
      <Pressable
        onPress={() => {
          onClose();
          router.push('/subscribe');
        }}
        accessibilityRole="button"
        accessibilityLabel="Voir les formules"
        style={({ pressed }) => [styles.lockCta, pressed && styles.lockCtaPressed]}
      >
        <Text style={styles.lockCtaLabel}>Voir les formules</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 32,
    lineHeight: 36,
    color: Colors.text,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  offer: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  qrSlot: {
    marginVertical: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockSlot: {
    marginVertical: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.xs,
    maxWidth: 320,
  },
  lockIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  lockTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    textAlign: 'center',
  },
  lockBody: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  lockCta: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
  },
  lockCtaPressed: {
    opacity: 0.8,
  },
  lockCtaLabel: {
    ...Typography.bodyBold,
    color: Colors.accentContrast,
  },
  meta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  metaSub: {
    ...Typography.small,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 2,
  },
});
