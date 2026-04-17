import { StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { QRCode } from '@/components/ui/QRCode';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import type { Ticket } from '@/types/wallet';
import { formatFullDate } from '@/utils/date';

interface TicketSheetProps {
  visible: boolean;
  ticket: Ticket | null;
  onClose: () => void;
}

/**
 * Bottom sheet displaying a ticket: QR + event details (plain rows, no icon chrome).
 */
export function TicketSheet({ visible, ticket, onClose }: TicketSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {ticket ? (
        <View style={styles.content}>
          <Text style={styles.eyebrow}>Mon ticket</Text>
          <Text style={styles.title}>{ticket.event.title}</Text>

          <View style={styles.qrWrap}>
            <QRCode value={ticket.qrPayload} size={200} />
          </View>

          <View style={styles.details}>
            <Row
              label="Date"
              value={`${formatFullDate(ticket.event.date)} · ${ticket.event.time}`}
            />
            <View style={styles.separator} />
            <Row label="Lieu" value={`${ticket.event.location}, ${ticket.event.city}`} />
          </View>

          <Text style={styles.hint}>
            Présente ce QR code à l'entrée. Ton code est personnel — ne le partage pas.
          </Text>
        </View>
      ) : null}
    </BottomSheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  qrWrap: {
    marginBottom: Spacing.xl,
  },
  details: {
    width: '100%',
    borderRadius: Radius.lg,
    backgroundColor: Colors.backgroundMuted,
    padding: Spacing.lg,
  },
  row: {
    gap: 2,
  },
  rowLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  rowValue: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  hint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    maxWidth: 280,
  },
});
