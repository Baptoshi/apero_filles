import { FlatList, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';

interface NotificationsSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  /** Unread notifications get a terracotta dot on the left. */
  unread?: boolean;
}

// Static mock stream — in production this comes from a feed / push backend.
const NOTIFICATIONS: readonly Notification[] = [
  {
    id: 'n1',
    title: 'Apéro Galentines',
    body: "Plus que 4 places au Comptoir, vendredi 19h30.",
    time: "À l'instant",
    unread: true,
  },
  {
    id: 'n2',
    title: 'Sophie est venue à ton atelier',
    body: 'Tu peux retrouver son profil dans Les Filles.',
    time: 'Il y a 2 h',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Rappel',
    body: 'Morning Run dans 2 jours au Parc de la Tête d’Or.',
    time: 'Hier',
  },
  {
    id: 'n4',
    title: 'Nouveau partenaire',
    body: 'Café Mokxa propose -15% sur la carte aux membres.',
    time: 'Il y a 3 jours',
  },
  {
    id: 'n5',
    title: 'Merci d’être là ✨',
    body: '6 mois avec nous — tu es devenue membre fidèle.',
    time: 'La semaine dernière',
  },
];

/**
 * Notifications bottom sheet — editorial, hairlines between items.
 *
 * Each item: a small terracotta dot if unread, title (bodyBold), body copy,
 * and a relative time tag on the right.
 */
export function NotificationsSheet({ visible, onClose }: NotificationsSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeightRatio={0.8}>
      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Récent</Text>
            <Text style={styles.title}>Notifications</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View
            style={[styles.row, index === NOTIFICATIONS.length - 1 && styles.lastRow]}
          >
            <View style={styles.dotCol}>
              {item.unread ? <View style={styles.dot} /> : null}
            </View>
            <View style={styles.text}>
              <View style={styles.headerLine}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.rowBody}>{item.body}</Text>
            </View>
          </View>
        )}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    // `flex: 1` + `minHeight: 0` gives the FlatList a bounded height inside
    // the sheet's contentWrap → overflow-y: auto kicks in and scroll works.
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    lineHeight: 32,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  dotCol: {
    width: 16,
    alignItems: 'center',
    paddingTop: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  text: {
    flex: 1,
  },
  headerLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  rowTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    flex: 1,
  },
  time: {
    ...Typography.small,
    color: Colors.textTertiary,
  },
  rowBody: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
