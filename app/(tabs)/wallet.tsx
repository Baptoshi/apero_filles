import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WalletCard } from '@/components/wallet/WalletCard';
import { WalletDetailSheet } from '@/components/wallet/WalletDetailSheet';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Deal } from '@/types/wallet';
import {
  canRedeem,
  getDealsForCity,
  toDealItem,
  type WalletItem,
} from '@/utils/wallet';

/**
 * Bons Plans — only partner advantages (tickets moved to the event detail page).
 *
 * Clean editorial list: cream canvas, minimalist deal cards, hairline spacing.
 * Non-members see every deal but the QR stays locked until they subscribe.
 */
export default function WalletScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const tier = useAuthStore((s) => s.tier);

  const redeemable = canRedeem(tier);

  const deals = useMemo<Deal[]>(
    () => getDealsForCity(user?.city ?? 'all'),
    [user?.city],
  );

  const [activeItem, setActiveItem] = useState<WalletItem | null>(null);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <FlatList
        data={deals}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>Mes avantages</Text>
            <Text style={styles.title}>
              Les <Text style={styles.titleAccent}>bons plans</Text>
            </Text>
            <Text style={styles.subtitle}>
              Les avantages réservés aux filles du club, près de chez toi.
            </Text>

            {!redeemable ? (
              <Pressable
                onPress={() => router.push('/subscribe')}
                accessibilityRole="button"
                accessibilityLabel="Rejoindre le club pour débloquer les QR codes"
                style={({ pressed }) => [styles.upsell, pressed && styles.upsellPressed]}
              >
                <Text style={styles.upsellEyebrow}>Réservé aux membres</Text>
                <Text style={styles.upsellBody}>
                  Débloque les QR codes et profite de tous les avantages partenaires.
                </Text>
                <Text style={styles.upsellCta}>Voir les formules →</Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <WalletCard
              deal={item}
              locked={!redeemable}
              onPress={() => setActiveItem(toDealItem(item))}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              De nouveaux partenaires arrivent régulièrement près de chez toi.
            </Text>
          </View>
        }
      />

      <WalletDetailSheet
        visible={activeItem !== null}
        item={activeItem}
        locked={!redeemable && activeItem?.kind === 'deal'}
        onClose={() => setActiveItem(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: Spacing.xxxl * 3,
  },
  intro: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    fontSize: 40,
    lineHeight: 46,
    marginBottom: Spacing.sm,
  },
  titleAccent: {
    fontStyle: 'italic',
    color: Colors.accent,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  upsell: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  upsellPressed: {
    opacity: 0.65,
  },
  upsellEyebrow: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  upsellBody: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  upsellCta: {
    ...Typography.bodyBold,
    color: Colors.accent,
  },
  cardWrap: {
    paddingHorizontal: Spacing.xl,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.xl,
  },
  empty: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
