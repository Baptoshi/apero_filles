import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PageHero } from '@/components/layout/PageHero';
import { ClubUpsellCard } from '@/components/subscription/ClubUpsellCard';
import {
  DealCategoryScroll,
  matchesDealCategory,
  type DealCategory,
} from '@/components/wallet/DealCategoryScroll';
import { FeaturedDealCard } from '@/components/wallet/FeaturedDealCard';
import { WalletCard } from '@/components/wallet/WalletCard';
import { WalletDetailSheet } from '@/components/wallet/WalletDetailSheet';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Deal } from '@/types/wallet';
import {
  canRedeem,
  getDealsForCity,
  toDealItem,
  type WalletItem,
} from '@/utils/wallet';

/**
 * Bons Plans — editorial listing of the partner advantages.
 *
 * The page is structured like a curated magazine column:
 *   1. Typographic hero with a warm one-liner.
 *   2. A single "La sélection" hero card — the pick of the week (featured
 *      partner) for the user's city. Full-bleed photo + gradient overlay.
 *   3. A clean typographic list of the remaining deals, grouped under a
 *      small uppercase label, separated by hairlines.
 *
 * Exclusivity is conveyed through curation, not copy: hand-written taglines,
 * neighborhood names, numbered sections — never "reserved for members".
 */
export default function WalletScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const tier = useAuthStore((s) => s.tier);

  const redeemable = canRedeem(tier);
  const [category, setCategory] = useState<DealCategory>('all');

  const deals = useMemo<Deal[]>(
    () => getDealsForCity(user?.city ?? 'all'),
    [user?.city],
  );

  const filteredDeals = useMemo<Deal[]>(
    () => deals.filter((d) => matchesDealCategory(d.partner.category, category)),
    [deals, category],
  );

  /**
   * Pick the first featured deal as the hero. Featured is computed on the
   * unfiltered list (the selection card always represents the city as a
   * whole), not the category filter.
   */
  const featured = useMemo<Deal | null>(() => {
    const flagged = deals.find((d) => d.partner.featured);
    return flagged ?? deals[0] ?? null;
  }, [deals]);

  /**
   * The list below the hero respects the category filter. When "Tout" is
   * selected we also exclude the featured deal so it doesn't appear twice.
   */
  const rest = useMemo<Deal[]>(() => {
    if (category === 'all' && featured) {
      return filteredDeals.filter((d) => d.id !== featured.id);
    }
    return filteredDeals;
  }, [filteredDeals, featured, category]);

  const showFeatured = category === 'all' && featured !== null;

  const [activeItem, setActiveItem] = useState<WalletItem | null>(null);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <FlatList
        data={rest}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <PageHero
              title={
                <Text>
                  Tes <Text style={styles.heroAccent}>bons plans</Text>
                </Text>
              }
            />

            <View style={styles.intro}>
              <Text style={styles.subtitle}>
                Nos adresses préférées — testées, aimées, choisies une par une.
              </Text>
            </View>

            {showFeatured && featured ? (
              <View style={styles.featuredWrap}>
                <FeaturedDealCard
                  deal={featured}
                  locked={!redeemable}
                  onPress={() => setActiveItem(toDealItem(featured))}
                />
              </View>
            ) : null}

            {!redeemable ? (
              <View style={styles.upsellWrap}>
                <ClubUpsellCard onPress={() => router.push('/subscribe')} />
              </View>
            ) : null}

            <View style={styles.categoryRow}>
              <DealCategoryScroll selected={category} onSelect={setCategory} />
            </View>

            {rest.length > 0 ? (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                  {category === 'all' ? 'À découvrir aussi' : 'Pour toi'}
                </Text>
                <Text style={styles.sectionCount}>
                  {rest.length} adresse{rest.length > 1 ? 's' : ''}
                </Text>
              </View>
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
          showFeatured ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {category === 'all'
                  ? 'De nouvelles adresses arrivent régulièrement près de chez toi.'
                  : 'Aucune adresse dans cette catégorie pour le moment.'}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          rest.length > 0 ? (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Sélection mise à jour chaque mois par l'équipe.
              </Text>
            </View>
          ) : null
        }
      />

      <WalletDetailSheet
        visible={activeItem !== null}
        item={activeItem}
        locked={!redeemable}
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
  heroAccent: {
    fontStyle: 'italic',
    color: Colors.accent,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  featuredWrap: {
    paddingHorizontal: Spacing.xl,
  },
  upsellWrap: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  categoryRow: {
    marginTop: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xs,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionLabel: {
    fontFamily: FontFamily.display,
    fontStyle: 'italic',
    fontSize: 22,
    lineHeight: 26,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  sectionCount: {
    ...Typography.small,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  footer: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginHorizontal: Spacing.xl,
  },
  footerText: {
    ...Typography.small,
    color: Colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
