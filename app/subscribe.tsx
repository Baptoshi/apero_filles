import { useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';

interface Plan {
  id: '1m' | '3m' | '6m';
  name: string;
  promise: string;
  priceMonthly: string;
  total: string | null;
  saving: string | null;
  highlight: boolean;
}

/**
 * Three named tiers, one for each moment of the journey — discover, meet,
 * build. Prices align with the proposal (§ 3 bis of
 * `docs/proposition-marguerite.md`).
 */
const plans: Plan[] = [
  {
    id: '1m',
    name: 'L\'Étincelle ✨',
    promise: 'Pour découvrir le concept',
    priceMonthly: '18,90 € / mois',
    total: null,
    saving: 'Sans engagement',
    highlight: false,
  },
  {
    id: '3m',
    name: 'Le Lien 🧡',
    promise: 'Pour rencontrer ta prochaine acolyte',
    priceMonthly: '15,50 € / mois',
    total: '46,50 € tous les 3 mois',
    saving: 'Économise 18 %',
    highlight: false,
  },
  {
    id: '6m',
    name: 'La Bande 👯',
    promise: 'Pour te constituer ton gang de copines',
    priceMonthly: '12,50 € / mois',
    total: '75 € tous les 6 mois',
    saving: 'Économise 34 %',
    highlight: true,
  },
];

const benefits = [
  'Accès illimité aux événements à prix réduit',
  'Bons plans et réductions partenaires',
  'Annuaire complet des adhérentes',
  'Notifications prioritaires',
  'Système de fidélité',
];

export default function SubscribeScreen() {
  const router = useRouter();
  const setTier = useAuthStore((s) => s.setTier);
  const [selected, setSelected] = useState<Plan['id']>('3m');

  const subscribe = () => {
    setTier('member');
    router.back();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <IconButton
          icon={<X size={IconSize.content} color={Colors.darkBrown} strokeWidth={1.8} />}
          accessibilityLabel="Fermer"
          onPress={() => router.back()}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Rejoins ta bande</Text>
        <Text style={styles.title}>Rejoins le club</Text>
        <Text style={styles.subtitle}>
          Événements à prix réduits, bons plans exclusifs, et une communauté qui te ressemble.
        </Text>

        <View style={styles.plans}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selected === plan.id}
              onPress={() => setSelected(plan.id)}
            />
          ))}
        </View>

        <View style={styles.benefits}>
          {benefits.map((benefit) => (
            <View key={benefit} style={styles.benefitRow}>
              <View style={styles.benefitCheck}>
                <Check size={IconSize.inline} color={Colors.warmWhite} strokeWidth={2.5} />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.legal}>
          Paiement sécurisé via Stripe. Renouvellement automatique, annulable à tout moment.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={`Choisir ${plans.find((p) => p.id === selected)?.name ?? ''}`}
          onPress={subscribe}
          accessibilityLabel="Valider le choix d'abonnement"
        />
        <Text style={styles.footerSmall}>Déjà un compte ? Se connecter</Text>
      </View>
    </SafeAreaView>
  );
}

interface PlanCardProps {
  plan: Plan;
  selected: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PlanCard({ plan, selected, onPress }: PlanCardProps) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 14, stiffness: 200 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 180 });
      }}
      accessibilityRole="button"
      accessibilityLabel={`Abonnement ${plan.name}`}
      accessibilityState={{ selected }}
      style={[
        styles.planCard,
        selected ? styles.planCardSelected : styles.planCardIdle,
        style,
      ]}
    >
      {plan.highlight ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Le plus choisi</Text>
        </View>
      ) : null}
      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.planPromise}>{plan.promise}</Text>
      <Text style={styles.planPrice}>{plan.priceMonthly}</Text>
      {plan.total ? <Text style={styles.planTotal}>{plan.total}</Text> : null}
      {plan.saving ? <Text style={styles.planSaving}>{plan.saving}</Text> : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    alignItems: 'flex-end',
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.terracotta,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h1,
    color: Colors.darkBrown,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.brown,
    marginBottom: Spacing.xl,
  },
  plans: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  planCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 2,
  },
  planCardIdle: {
    backgroundColor: Colors.warmWhite,
    borderColor: Colors.lightPeach,
  },
  planCardSelected: {
    backgroundColor: Colors.blush,
    borderColor: Colors.orange,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: Spacing.lg,
    backgroundColor: Colors.orange,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    ...Typography.small,
    color: Colors.warmWhite,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planName: {
    ...Typography.h3,
    color: Colors.darkBrown,
    marginBottom: 2,
  },
  planPromise: {
    ...Typography.caption,
    color: Colors.brown,
    marginBottom: Spacing.sm,
  },
  planPrice: {
    ...Typography.bodyBold,
    color: Colors.terracotta,
  },
  planTotal: {
    ...Typography.caption,
    color: Colors.brown,
    marginTop: 2,
  },
  planSaving: {
    ...Typography.caption,
    color: Colors.success,
    marginTop: Spacing.xs,
  },
  benefits: {
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
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    ...Typography.body,
    color: Colors.darkBrown,
    flex: 1,
  },
  legal: {
    ...Typography.small,
    color: Colors.muted,
    marginTop: Spacing.xl,
    textAlign: 'center',
  },
  footer: {
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.lightPeach,
    gap: Spacing.sm,
  },
  footerSmall: {
    ...Typography.caption,
    color: Colors.muted,
    textAlign: 'center',
  },
});
