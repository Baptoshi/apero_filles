import { BlurView } from 'expo-blur';
import { Check, Lock, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PlatformModal } from '@/components/ui/PlatformModal';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Event } from '@/types/event';

/**
 * Demo card values — Stripe's public test card, pre-filled so the user
 * doesn't have to type anything to complete a payment during the demo.
 * Swap with the real Stripe Payment Sheet in production.
 */
const MOCK_CARD = {
  number: '4242 4242 4242 4242',
  expiry: '12 / 29',
  cvc: '123',
} as const;

interface PaymentSheetProps {
  visible: boolean;
  event: Event;
  /** Amount the user will pay, in euros (already tier-aware). */
  amount: number;
  onClose: () => void;
  /** Called when the simulated payment succeeds. */
  onPaid: () => void;
}

type Stage = 'form' | 'processing' | 'success';

/**
 * Stripe-style payment popup.
 *
 * A glass-blurred bottom sheet containing a simulated card input form with
 * Apple-like proportions. On "Pay", we fake a network delay with a spinner,
 * flip to a success state, and fire `onPaid` so the caller can register the
 * user and show the ticket.
 *
 * In a real implementation this would be replaced by Stripe's native Payment
 * Sheet (`@stripe/stripe-react-native`) — the shape of the component makes
 * that swap trivial: only the body is mocked, the surrounding flow is real.
 */
export function PaymentSheet({
  visible,
  event,
  amount,
  onClose,
  onPaid,
}: PaymentSheetProps) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const translate = useSharedValue(120);
  const backdrop = useSharedValue(0);

  const [cardNumber, setCardNumber] = useState<string>(MOCK_CARD.number);
  const [expiry, setExpiry] = useState<string>(MOCK_CARD.expiry);
  const [cvc, setCvc] = useState<string>(MOCK_CARD.cvc);
  const [name, setName] = useState<string>(user?.firstName ?? 'Marguerite');
  const [stage, setStage] = useState<Stage>('form');

  const canPay =
    cardNumber.replace(/\s/g, '').length >= 13 &&
    expiry.length >= 4 &&
    cvc.length >= 3 &&
    name.trim().length > 1;

  useEffect(() => {
    if (visible) {
      backdrop.value = withTiming(1, { duration: 220 });
      translate.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      backdrop.value = withTiming(0, { duration: 180 });
      translate.value = withTiming(120, { duration: 220 });
      // Reset stage after hide — keep the mock card values pre-filled so
      // reopening the sheet lets the user pay immediately again.
      const t = setTimeout(() => {
        setCardNumber(MOCK_CARD.number);
        setExpiry(MOCK_CARD.expiry);
        setCvc(MOCK_CARD.cvc);
        setName(user?.firstName ?? 'Marguerite');
        setStage('form');
      }, 240);
      return () => clearTimeout(t);
    }
  }, [visible, backdrop, translate, user?.firstName]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translate.value }],
    opacity: backdrop.value,
  }));

  const requestClose = () => {
    if (stage === 'processing') return;
    backdrop.value = withTiming(0, { duration: 180 });
    translate.value = withTiming(120, { duration: 220 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const pay = () => {
    if (!canPay) return;
    setStage('processing');
    setTimeout(() => {
      setStage('success');
      setTimeout(() => {
        onPaid();
        requestClose();
      }, 900);
    }, 1400);
  };

  return (
    <PlatformModal visible={visible} onRequestClose={requestClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFillObject, backdropStyle]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={65} tint="dark" style={StyleSheet.absoluteFillObject} />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.backdropFallback]} />
          )}
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={requestClose}
            accessibilityLabel="Fermer"
            accessibilityRole="button"
          />
        </Animated.View>

        <View
          style={[styles.slot, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}
          pointerEvents="box-none"
        >
          <Animated.View style={[styles.panelWrap, panelStyle]}>
            <GlassPanel>
              {stage === 'form' ? (
                <FormBody
                  event={event}
                  amount={amount}
                  cardNumber={cardNumber}
                  setCardNumber={setCardNumber}
                  expiry={expiry}
                  setExpiry={setExpiry}
                  cvc={cvc}
                  setCvc={setCvc}
                  name={name}
                  setName={setName}
                  canPay={canPay}
                  onPay={pay}
                  onClose={requestClose}
                />
              ) : null}

              {stage === 'processing' ? (
                <View style={styles.centered}>
                  <ActivityIndicator size="large" color={Colors.accent} />
                  <Text style={styles.processingText}>Paiement en cours…</Text>
                </View>
              ) : null}

              {stage === 'success' ? (
                <View style={styles.centered}>
                  <View style={styles.successIcon}>
                    <Check size={22} color={Colors.accentContrast} strokeWidth={3} />
                  </View>
                  <Text style={styles.successTitle}>Paiement confirmé</Text>
                  <Text style={styles.successBody}>Ton ticket est dans ton wallet.</Text>
                </View>
              ) : null}
            </GlassPanel>
          </Animated.View>
        </View>
      </View>
    </PlatformModal>
  );
}

interface FormBodyProps {
  event: Event;
  amount: number;
  cardNumber: string;
  setCardNumber: (v: string) => void;
  expiry: string;
  setExpiry: (v: string) => void;
  cvc: string;
  setCvc: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  canPay: boolean;
  onPay: () => void;
  onClose: () => void;
}

function FormBody({
  event,
  amount,
  cardNumber,
  setCardNumber,
  expiry,
  setExpiry,
  cvc,
  setCvc,
  name,
  setName,
  canPay,
  onPay,
  onClose,
}: FormBodyProps) {
  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Paiement sécurisé</Text>
          <Text style={styles.title}>{amount === 0 ? 'Confirmer' : `Payer ${amount}€`}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {event.title}
          </Text>
        </View>
        <Pressable
          onPress={onClose}
          accessibilityLabel="Fermer"
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.closePressed]}
        >
          <X size={IconSize.content} color={Colors.text} strokeWidth={1.8} />
        </Pressable>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Numéro de carte</Text>
        <TextInput
          value={cardNumber}
          onChangeText={(raw) => setCardNumber(formatCardNumber(raw))}
          placeholder="1234 1234 1234 1234"
          placeholderTextColor={Colors.textTertiary}
          keyboardType="number-pad"
          maxLength={19}
          style={styles.input}
          accessibilityLabel="Numéro de carte"
        />
      </View>

      <View style={styles.fieldRow}>
        <View style={[styles.field, styles.fieldHalf]}>
          <Text style={styles.fieldLabel}>Expiration</Text>
          <TextInput
            value={expiry}
            onChangeText={(raw) => setExpiry(formatExpiry(raw))}
            placeholder="MM / AA"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="number-pad"
            maxLength={7}
            style={styles.input}
            accessibilityLabel="Date d'expiration"
          />
        </View>
        <View style={[styles.field, styles.fieldHalf]}>
          <Text style={styles.fieldLabel}>CVC</Text>
          <TextInput
            value={cvc}
            onChangeText={(raw) => setCvc(raw.replace(/\D/g, '').slice(0, 4))}
            placeholder="123"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="number-pad"
            maxLength={4}
            style={styles.input}
            accessibilityLabel="Cryptogramme"
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Titulaire</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nom sur la carte"
          placeholderTextColor={Colors.textTertiary}
          style={styles.input}
          autoCapitalize="words"
          accessibilityLabel="Titulaire de la carte"
        />
      </View>

      <Pressable
        onPress={onPay}
        disabled={!canPay}
        accessibilityRole="button"
        accessibilityLabel={amount === 0 ? 'Confirmer' : `Payer ${amount}€`}
        style={({ pressed }) => [
          styles.payBtn,
          !canPay && styles.payDisabled,
          pressed && canPay && styles.payPressed,
        ]}
      >
        <Lock size={14} color={Colors.accentContrast} strokeWidth={1.8} />
        <Text style={styles.payLabel}>
          {amount === 0 ? 'Confirmer la réservation' : `Payer ${amount}€`}
        </Text>
      </Pressable>

      <Text style={styles.secureLine}>
        Paiement chiffré · Stripe · Annulation possible jusqu'à 24 h avant l'événement.
      </Text>
    </>
  );
}

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

/**
 * Opaque panel — the popup itself is solid (cream surface), only the
 * background screen behind the backdrop is blurred.
 */
function GlassPanel({ children }: { children: React.ReactNode }) {
  return <View style={styles.panel}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropFallback: {
    backgroundColor: 'rgba(15, 10, 7, 0.35)',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(28px) saturate(130%)' } as any)
      : null),
  },
  slot: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  panelWrap: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  panel: {
    padding: Spacing.xl,
    gap: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
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
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceMuted,
  },
  closePressed: {
    opacity: 0.6,
  },
  field: {
    gap: 6,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fieldHalf: {
    flex: 1,
  },
  fieldLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  payBtn: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs + 2,
    paddingVertical: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
  },
  payPressed: {
    opacity: 0.85,
  },
  payDisabled: {
    opacity: 0.4,
  },
  payLabel: {
    ...Typography.bodyBold,
    color: Colors.accentContrast,
  },
  secureLine: {
    ...Typography.small,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  processingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  successTitle: {
    fontFamily: FontFamily.display,
    fontSize: 22,
    lineHeight: 28,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  successBody: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
