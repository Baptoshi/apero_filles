import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import type { MembershipTier } from '@/types/user';

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

const tierPrices: Record<MembershipTier, string> = {
  free: '0 €',
  member: '9,99 €',
  faithful: '9,99 €',
};

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
 * Opened from the Profile screen's "Gérer mon abonnement" action — keeps the
 * profile itself focused on identity + settings and gates the billing info
 * behind an explicit tap.
 *
 *   - Subscribed  → editorial status panel (tier, description, next billing)
 *                    with actions to change plan and cancel.
 *   - Free        → inline pitch with the primary CTA to discover the club.
 */
export function SubscriptionSheet({
  visible,
  onClose,
  tier,
  memberSince,
}: SubscriptionSheetProps) {
  const router = useRouter();
  const isSubscribed = tier !== 'free';
  const nextBilling = formatNextBilling(new Date());

  const goToSubscribe = () => {
    onClose();
    router.push('/subscribe');
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeightRatio={0.85}>
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
              Rejoins{' '}
              <Text style={styles.titleAccent}>le club</Text>
            </>
          )}
        </Text>

        <Text style={styles.body}>{tierDescriptions[tier]}</Text>

        {isSubscribed ? (
          <>
            <View style={styles.divider} />

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Depuis</Text>
              <Text style={styles.metaValue}>{memberSince}</Text>
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
                onPress={goToSubscribe}
                accessibilityLabel="Voir toutes les formules d'abonnement"
              />
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Résilier l'abonnement"
                style={({ pressed }) => [
                  styles.cancelRow,
                  pressed && styles.cancelPressed,
                ]}
              >
                <Text style={styles.cancelLabel}>Résilier l'abonnement</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.actions}>
            <Button
              label="Passe au niveau supérieur"
              variant="primary"
              onPress={goToSubscribe}
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
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
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
});
