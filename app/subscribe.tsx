import { useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Subscription paywall — Tinder-style layout, Amalfi DA.
 *
 *   - Dark warm-brown full-screen backdrop (Colors.text) so the page reads
 *     like a premium upgrade surface, not another cream tab.
 *   - Editorial headline in Playfair with italic terracotta accents.
 *   - Horizontal carousel of plan cards (snap to each) — "L'Étincelle",
 *     "Le Lien", "La Bande" — with a terracotta border + check icon on the
 *     selected card.
 *   - Pagination dots under the carousel.
 *   - Benefits list styled as a compact panel.
 *   - Single CTA pill at the bottom ("Continuer · <total> total").
 */

interface Plan {
  id: '1m' | '3m' | '6m';
  name: string;
  promise: string;
  priceMonthly: string;
  total: string;
  totalAmount: string;
  saving: string | null;
  badge: string | null;
  highlight: boolean;
}

const plans: Plan[] = [
  {
    id: '1m',
    name: "L'Étincelle",
    promise: 'Pour découvrir le concept.',
    priceMonthly: '18,90 €',
    total: '18,90 € facturés chaque mois',
    totalAmount: '18,90 €',
    saving: null,
    badge: null,
    highlight: false,
  },
  {
    id: '3m',
    name: 'Le Lien',
    promise: 'Pour rencontrer ta prochaine acolyte.',
    priceMonthly: '15,50 €',
    total: '46,50 € tous les 3 mois',
    totalAmount: '46,50 €',
    saving: '−18 %',
    badge: null,
    highlight: false,
  },
  {
    id: '6m',
    name: 'La Bande',
    promise: 'Pour te constituer ton gang de copines.',
    priceMonthly: '12,50 €',
    total: '75 € tous les 6 mois',
    totalAmount: '75 €',
    saving: '−34 %',
    badge: 'Populaire',
    highlight: true,
  },
];

const benefits = [
  'Accès illimité aux événements',
  'Prix membres (−30 à −50 % selon l\'event)',
  'Tous les QR bons plans partenaires débloqués',
  'Annuaire complet des adhérentes',
  'Priorité d\'inscription sur les events populaires',
  'Newsletter éditoriale + drip d\'onboarding',
];

export default function SubscribeScreen() {
  const router = useRouter();
  const setTier = useAuthStore((s) => s.setTier);
  const [selected, setSelected] = useState<Plan['id']>('6m');
  const { width } = useWindowDimensions();

  // Card width tuned to the phone frame (390 wide). 76% of the screen keeps
  // the neighbour card peeking at the edges — the "there's more" hint that
  // makes the carousel discoverable.
  const cardWidth = Math.min(260, width * 0.74);
  const cardGap = Spacing.md;
  const snapInterval = cardWidth + cardGap;

  const activePlan = useMemo(
    () => plans.find((p) => p.id === selected) ?? plans[2],
    [selected],
  );

  if (!activePlan) return null;

  const subscribe = () => {
    setTier('member');
    router.back();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          hitSlop={10}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
        >
          <X size={IconSize.content} color={Colors.background} strokeWidth={1.8} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Rejoins <Text style={styles.titleAccent}>le club.</Text>
        </Text>
        <Text style={styles.subtitle}>
          Les événements à prix membre, les bons plans partenaires, l'annuaire
          de ta ville — tout ce qui fait Les Apéros Filles.
        </Text>

        <Text style={styles.sectionLabel}>Choisis ta formule</Text>

        <FlatList
          data={plans}
          keyExtractor={(p) => p.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={snapInterval}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingLeft: Spacing.xl,
            paddingRight: Spacing.xl,
            gap: cardGap,
          }}
          renderItem={({ item }) => (
            <PlanCard
              plan={item}
              selected={selected === item.id}
              onPress={() => setSelected(item.id)}
              width={cardWidth}
            />
          )}
        />

        <View style={styles.dotsRow}>
          {plans.map((p) => (
            <View
              key={p.id}
              style={[styles.dot, selected === p.id && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.benefitsHeaderWrap}>
          <View style={styles.benefitsHeader}>
            <Text style={styles.benefitsHeaderLabel}>
              Inclus avec le club
            </Text>
          </View>
        </View>

        <View style={styles.benefits}>
          {benefits.map((benefit) => (
            <View key={benefit} style={styles.benefitRow}>
              <View style={styles.benefitCheck}>
                <Check
                  size={IconSize.inline}
                  color={Colors.accent}
                  strokeWidth={2.5}
                />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.legal}>
          En touchant « Continuer », tu t'abonnes à la formule{' '}
          <Text style={styles.legalBold}>{activePlan.name}</Text>. Ton abonnement
          sera reconduit automatiquement au même tarif jusqu'à résiliation, que
          tu peux effectuer à tout moment depuis ton profil.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={subscribe}
          accessibilityRole="button"
          accessibilityLabel={`Continuer — ${activePlan.totalAmount} au total`}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaLabel}>
            Continuer · {activePlan.totalAmount}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

interface PlanCardProps {
  plan: Plan;
  selected: boolean;
  onPress: () => void;
  width: number;
}

function PlanCard({ plan, selected, onPress, width }: PlanCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Formule ${plan.name}`}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.planCard,
        { width },
        selected ? styles.planCardSelected : styles.planCardIdle,
        pressed && styles.pressed,
      ]}
    >
      {plan.badge ? (
        <Text style={styles.planBadge}>{plan.badge}</Text>
      ) : (
        <Text style={styles.planBadgePlaceholder}> </Text>
      )}

      {selected ? (
        <View style={styles.planCheck}>
          <Check size={IconSize.inline} color={Colors.accent} strokeWidth={2.5} />
        </View>
      ) : null}

      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.planPromise} numberOfLines={2}>
        {plan.promise}
      </Text>

      <View style={styles.planPriceRow}>
        <Text style={styles.planPrice}>{plan.priceMonthly}</Text>
        <Text style={styles.planPriceSuffix}> / mois</Text>
      </View>

      <Text style={styles.planTotal}>{plan.total}</Text>

      {plan.saving ? (
        <View style={styles.planSavingChip}>
          <Text style={styles.planSavingLabel}>{plan.saving}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const PAGE_BG = Colors.text; // deep warm brown, reads as premium
const CARD_BG = 'rgba(255, 255, 255, 0.06)';
const CARD_BG_ACTIVE = 'rgba(194, 65, 12, 0.12)';
const TEXT_PRIMARY = Colors.background; // cream
const TEXT_SECONDARY = 'rgba(251, 246, 238, 0.68)';
const TEXT_TERTIARY = 'rgba(251, 246, 238, 0.42)';
const HAIRLINE = 'rgba(251, 246, 238, 0.14)';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 34,
    lineHeight: 40,
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
    paddingHorizontal: Spacing.xl,
  },
  titleAccent: {
    fontStyle: 'italic',
    color: Colors.accent,
  },
  subtitle: {
    ...Typography.body,
    color: TEXT_SECONDARY,
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  sectionLabel: {
    ...Typography.label,
    color: TEXT_SECONDARY,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  planCard: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    minHeight: 200,
    gap: 4,
  },
  planCardIdle: {
    backgroundColor: CARD_BG,
    borderColor: HAIRLINE,
  },
  planCardSelected: {
    backgroundColor: CARD_BG_ACTIVE,
    borderColor: Colors.accent,
  },
  planBadge: {
    ...Typography.small,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  planBadgePlaceholder: {
    ...Typography.small,
    marginBottom: 4,
  },
  planCheck: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251, 246, 238, 0.92)',
  },
  planName: {
    fontFamily: FontFamily.display,
    fontStyle: 'italic',
    fontSize: 22,
    lineHeight: 26,
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  planPromise: {
    ...Typography.caption,
    color: TEXT_SECONDARY,
    marginBottom: Spacing.md,
    minHeight: 34,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 'auto',
  },
  planPrice: {
    fontFamily: FontFamily.bold,
    fontSize: 26,
    lineHeight: 30,
    color: TEXT_PRIMARY,
  },
  planPriceSuffix: {
    ...Typography.caption,
    color: TEXT_SECONDARY,
  },
  planTotal: {
    ...Typography.small,
    color: TEXT_TERTIARY,
    marginTop: 2,
  },
  planSavingChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    marginTop: Spacing.sm,
  },
  planSavingLabel: {
    ...Typography.small,
    color: Colors.accentContrast,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TEXT_TERTIARY,
  },
  dotActive: {
    backgroundColor: Colors.accent,
    width: 18,
  },
  benefitsHeaderWrap: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  benefitsHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: HAIRLINE,
  },
  benefitsHeaderLabel: {
    ...Typography.label,
    color: TEXT_SECONDARY,
  },
  benefits: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  benefitCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(194, 65, 12, 0.18)',
  },
  benefitText: {
    ...Typography.body,
    color: TEXT_PRIMARY,
    flex: 1,
  },
  legal: {
    ...Typography.small,
    color: TEXT_TERTIARY,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xxl,
    textAlign: 'center',
    lineHeight: 16,
  },
  legalBold: {
    ...Typography.small,
    fontFamily: FontFamily.semiBold,
    color: TEXT_SECONDARY,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
  },
  cta: {
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaLabel: {
    ...Typography.bodyBold,
    color: Colors.accentContrast,
  },
});
