import { useRouter } from 'expo-router';
import { ArrowLeft, Check, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import type { MembershipTier } from '@/types/user';
import { formatMonthYear } from '@/utils/date';

interface SubscriptionSheetProps {
  visible: boolean;
  onClose: () => void;
  tier: MembershipTier;
  memberSince: string;
}

const tierLabels: Record<MembershipTier, string> = {
  free: 'Membre découverte',
  member: 'Membre du club',
  faithful: 'Membre fidèle',
};

const tierDescriptions: Record<MembershipTier, string> = {
  free: "Profite d'un événement par mois au prix plein.",
  member: 'Accès illimité aux événements à prix membre.',
  faithful: 'Plus de 6 mois avec nous. Merci d’être là.',
};

/** La Bande recurring amount by default — in prod this reads from Stripe. */
const tierPrices: Record<MembershipTier, string> = {
  free: '0 €',
  member: '12,50 €',
  faithful: '12,50 €',
};

/** List of things the user loses when she cancels her membership. */
const cancelLosses: readonly string[] = [
  'Les prix membres sur les événements (−30 à −50 %)',
  'Tous les QR codes bons plans partenaires',
  "L'accès à l'annuaire complet",
  "La priorité d'inscription sur les événements populaires",
];

/** Benefits list shown to a free user to pitch what the club unlocks. */
const clubBenefits: readonly string[] = [
  'Accès illimité aux événements (et prix membre)',
  'Tous les bons plans partenaires débloqués',
  "Accès à l'annuaire des filles de ta ville",
  "Priorité d'inscription sur les événements populaires",
];

/** Next billing = today + 1 month, formatted in long French. */
function formatNextBilling(from: Date): string {
  const next = new Date(from);
  next.setMonth(next.getMonth() + 1);
  return next.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Bottom sheet that reveals the subscription status + management actions.
 *
 * Two internal stages :
 *   - "status" : editorial status panel (tier, description, billing) +
 *     actions Voir les formules / Résilier l'abonnement.
 *   - "cancel" : confirmation page warning what the user is about to lose.
 *     Only reachable from the status stage via "Résilier". Confirming drops
 *     the user back to the free tier and closes the sheet.
 *
 * For the free tier, the sheet has a single stage (pitch + CTA).
 */
type Stage = 'status' | 'cancel';

export function SubscriptionSheet({
  visible,
  onClose,
  tier,
  memberSince,
}: SubscriptionSheetProps) {
  const router = useRouter();
  const setTier = useAuthStore((s) => s.setTier);
  const [stage, setStage] = useState<Stage>('status');

  const isSubscribed = tier !== 'free';
  const nextBilling = formatNextBilling(new Date());

  // Reset to the main stage whenever the sheet reopens so the user never
  // lands mid-flow.
  useEffect(() => {
    if (visible) setStage('status');
  }, [visible]);

  const goToSubscribe = () => {
    onClose();
    router.push('/subscribe');
  };

  const confirmCancel = () => {
    setTier('free');
    setStage('status');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeightRatio={0.88}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {stage === 'status' ? (
          <StatusBody
            tier={tier}
            memberSince={memberSince}
            nextBilling={nextBilling}
            isSubscribed={isSubscribed}
            onOpenCancel={() => setStage('cancel')}
            onGoToSubscribe={goToSubscribe}
            onClose={onClose}
          />
        ) : (
          <CancelBody
            onBack={() => setStage('status')}
            onConfirm={confirmCancel}
          />
        )}
      </ScrollView>
    </BottomSheet>
  );
}

function StatusBody({
  tier,
  memberSince,
  nextBilling,
  isSubscribed,
  onOpenCancel,
  onGoToSubscribe,
  onClose,
}: {
  tier: MembershipTier;
  memberSince: string;
  nextBilling: string;
  isSubscribed: boolean;
  onOpenCancel: () => void;
  onGoToSubscribe: () => void;
  onClose: () => void;
}) {
  return (
    <View style={styles.sheet}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{tierLabels[tier]}</Text>
        {isSubscribed ? (
          <View style={styles.statusChip}>
            <View style={styles.statusDot} />
            <Text style={styles.statusChipLabel}>Actif</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.title}>
        {isSubscribed ? (
          <>
            Membre{' '}
            <Text style={styles.titleAccent}>
              {tier === 'faithful' ? 'fidèle' : 'du club'}
            </Text>
          </>
        ) : (
          <>
            Rejoins <Text style={styles.titleAccent}>le club</Text>
          </>
        )}
      </Text>

      {isSubscribed ? (
        <Text style={styles.body}>{tierDescriptions[tier]}</Text>
      ) : (
        <>
          <Text style={styles.body}>
            Tout ce qui fait Les Apéros Filles se débloque avec l'abonnement :
          </Text>
          <View style={styles.benefitsList}>
            {clubBenefits.map((benefit) => (
              <View key={benefit} style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
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
        </>
      )}

      {isSubscribed ? (
        <>
          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Depuis</Text>
            <Text style={styles.metaValue}>
              {formatMonthYear(memberSince)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Prochain paiement</Text>
            <Text style={styles.metaValue}>
              {nextBilling} · {tierPrices[tier]}
            </Text>
          </View>

          <View style={styles.actions}>
            <Button
              label="Voir les formules"
              variant="primary"
              onPress={onGoToSubscribe}
              accessibilityLabel="Voir toutes les formules d'abonnement"
            />
            <Pressable
              onPress={onOpenCancel}
              accessibilityRole="button"
              accessibilityLabel="Résilier l'abonnement"
              style={({ pressed }) => [
                styles.cancelRow,
                pressed && styles.cancelPressed,
              ]}
            >
              <Text style={styles.cancelLabel}>Résilier mon abonnement</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.actions}>
          <Button
            label="Passe au niveau supérieur"
            variant="primary"
            onPress={onGoToSubscribe}
            accessibilityLabel="Découvrir les abonnements"
          />
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Plus tard"
            style={({ pressed }) => [
              styles.laterRow,
              pressed && styles.laterPressed,
            ]}
          >
            <Text style={styles.laterLabel}>Plus tard</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function CancelBody({
  onBack,
  onConfirm,
}: {
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <View style={styles.sheet}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Revenir à mon abonnement"
        hitSlop={10}
        style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
      >
        <ArrowLeft size={IconSize.content} color={Colors.text} strokeWidth={1.8} />
      </Pressable>

      <Text style={styles.cancelEyebrow}>Résiliation</Text>

      <Text style={styles.title}>
        Attends, <Text style={styles.titleAccent}>t'es sûre</Text> ?
      </Text>

      <Text style={styles.body}>
        En résiliant maintenant, tu repasses en{' '}
        <Text style={styles.bodyEmphasis}>Membre découverte</Text> et tu perds
        immédiatement :
      </Text>

      <View style={styles.lossesList}>
        {cancelLosses.map((loss) => (
          <View key={loss} style={styles.lossRow}>
            <View style={styles.lossIcon}>
              <X size={IconSize.inline} color={Colors.danger} strokeWidth={2.5} />
            </View>
            <Text style={styles.lossText}>{loss}</Text>
          </View>
        ))}
      </View>

      <View style={styles.reassure}>
        <Text style={styles.reassureText}>
          Pas d'engagement perdu — tu peux revenir au club quand tu veux, aux
          mêmes conditions.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="Je reste au club"
          variant="primary"
          onPress={onBack}
          accessibilityLabel="Annuler la résiliation et rester au club"
        />
        <Pressable
          onPress={onConfirm}
          accessibilityRole="button"
          accessibilityLabel="Confirmer la résiliation"
          style={({ pressed }) => [
            styles.confirmCancelRow,
            pressed && styles.cancelPressed,
          ]}
        >
          <Text style={styles.confirmCancelLabel}>
            Résilier quand même
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
  sheet: {
    paddingTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.accent,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  statusChipLabel: {
    ...Typography.small,
    color: Colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 30,
    lineHeight: 34,
    color: Colors.text,
    letterSpacing: -0.4,
    marginBottom: Spacing.xs,
  },
  titleAccent: {
    fontStyle: 'italic',
    color: Colors.accent,
  },
  body: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  bodyEmphasis: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 6,
  },
  metaLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  metaValue: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  cancelRow: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  cancelPressed: {
    opacity: 0.6,
  },
  cancelLabel: {
    ...Typography.bodyBold,
    color: Colors.danger,
  },
  laterRow: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  laterPressed: {
    opacity: 0.6,
  },
  laterLabel: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  // ───── Cancel stage ─────
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  pressed: {
    opacity: 0.65,
  },
  cancelEyebrow: {
    ...Typography.label,
    color: Colors.danger,
    marginBottom: Spacing.sm,
  },
  benefitsList: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  benefitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(194, 65, 12, 0.14)',
  },
  benefitText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  lossesList: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  lossRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  lossIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(199, 57, 57, 0.12)',
  },
  lossText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  reassure: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMuted,
  },
  reassureText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  confirmCancelRow: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  confirmCancelLabel: {
    ...Typography.bodyBold,
    color: Colors.danger,
  },
});
