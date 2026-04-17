import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AttendeesList } from '@/components/events/AttendeesList';
import { ContactSheet } from '@/components/events/ContactSheet';
import { EventActions } from '@/components/events/EventActions';
import { PaymentSheet } from '@/components/events/PaymentSheet';
import { TicketSheet } from '@/components/events/TicketSheet';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { AvatarTints, Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { FREE_TIER_MONTHLY_LIMIT, useEventActions } from '@/hooks/useEventActions';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEventsStore } from '@/stores/useEventsStore';
import type { Event } from '@/types/event';
import { formatDatePieces, formatFullDate } from '@/utils/date';
import { getEventPrice } from '@/utils/price';
import { buildEventSharePayload, sharePayload } from '@/utils/share';

/**
 * Event detail — Luma-inspired layout.
 *
 *   1. Full-width poster at the top (no floating chrome)
 *   2. Title + host + date / location / spots
 *   3. Action row containing the primary CTA (S'inscris / Mon ticket)
 *      plus Contact / Share / More
 *   4. Editorial sections : Qui vient ?, À propos
 *
 * No fixed bottom CTA bar — the registration action lives in the row so the
 * page scrolls cleanly to the bottom.
 */
export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const event = useEventsStore((s) => (id ? s.getEventById(id) : undefined));

  if (!event) {
    return <NotFound onBack={() => router.replace('/(tabs)/discover')} />;
  }

  return <EventDetail event={event} />;
}

function EventDetail({ event }: { event: Event }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  const tier = useAuthStore((s) => s.tier);
  const ticket = useEventsStore((s) => s.getTicketForEvent(event.id));
  const actions = useEventActions(event);

  const [ticketVisible, setTicketVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);

  // Swipe-down-to-dismiss gesture — the page follows the cursor / finger
  // vertically and is dismissed past a threshold. Only activates when the
  // inner ScrollView is already at its top to avoid fighting content scroll.
  const translateY = useSharedValue(0);
  const scrollY = useSharedValue(0);

  const goBack = () => router.back();

  const pan = Gesture.Pan()
    .activeOffsetY([12, 9999])
    .failOffsetY([-10, 0])
    .onUpdate((event_) => {
      'worklet';
      if (scrollY.value <= 0 && event_.translationY > 0) {
        translateY.value = event_.translationY;
      }
    })
    .onEnd((event_) => {
      'worklet';
      if (event_.translationY > 160 || event_.velocityY > 900) {
        translateY.value = withTiming(
          screenHeight,
          { duration: 260 },
          (finished) => {
            if (finished) runOnJS(goBack)();
          },
        );
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 180 });
      }
    });

  const pageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(
      translateY.value,
      [0, screenHeight * 0.6],
      [1, 0.4],
      Extrapolation.CLAMP,
    ),
  }));

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.value = e.nativeEvent.contentOffset.y;
  };

  const price = useMemo(() => getEventPrice(event, tier), [event, tier]);
  const pieces = formatDatePieces(event.date);
  const tint = AvatarTints[event.imageGradient];

  const registerLabel =
    actions.registrationIntent.reason === 'tier-limit'
      ? 'Rejoindre le club'
      : actions.registrationIntent.reason === 'sold-out'
        ? 'Complet'
        : 'Je m’inscris';

  const registerDisabled =
    !actions.isRegistered && actions.registrationIntent.reason === 'sold-out';

  const onRegister = () => {
    // Tier-limit / sold-out → keep the existing paywall-or-bail flow.
    if (actions.registrationIntent.status !== 'ok') {
      actions.registerOrPaywall();
      return;
    }
    // Otherwise open the Stripe payment sheet before committing the registration.
    setPaymentVisible(true);
  };

  const onPaid = () => {
    actions.register();
  };

  const handleShare = () => {
    sharePayload(buildEventSharePayload(event));
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.screen, pageStyle]}>
        <StatusBar style="dark" />

        <View style={[styles.dragHandleWrap, { paddingTop: insets.top + 6 }]}>
          <View style={styles.dragHandle} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Spacing.md, paddingBottom: insets.bottom + Spacing.xxxl },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
        {/* Poster */}
        <View style={styles.posterFrame}>
          {event.imageUrl ? (
            <ImageBackground
              source={{ uri: event.imageUrl }}
              style={styles.poster}
              imageStyle={styles.posterImage}
            >
              <PosterContent
                event={event}
                pieces={pieces}
                priceLabel={price.label}
                priceStrike={price.strikethroughLabel}
                priceHint={price.memberHint}
              />
            </ImageBackground>
          ) : (
            <View style={[styles.poster, { backgroundColor: tint }]}>
              <PosterContent
                event={event}
                pieces={pieces}
                priceLabel={price.label}
                priceStrike={price.strikethroughLabel}
                priceHint={price.memberHint}
              />
            </View>
          )}
        </View>

        <View style={styles.body}>
          {actions.isRegistered ? (
            <Animated.View entering={FadeIn.duration(220)} style={styles.goingBadge}>
              <View style={styles.goingDot} />
              <Text style={styles.goingText}>Tu es inscrite</Text>
            </Animated.View>
          ) : null}

          <Text style={styles.title}>{event.title}</Text>

          <HostRow city={event.city} />

          <Text style={styles.dateLine}>{formatFullDate(event.date)} · {event.time}</Text>
          <Text style={styles.locationLine}>{event.location} — {event.city}</Text>
          <Text style={styles.spotsLine}>
            {event.spots > 0
              ? `${event.spots} place${event.spots > 1 ? 's' : ''} disponible${event.spots > 1 ? 's' : ''}`
              : 'Complet'}
          </Text>

          <EventActions
            hasTicket={actions.isRegistered}
            registerLabel={registerLabel}
            registerDisabled={registerDisabled}
            onRegister={onRegister}
            onTicket={() => setTicketVisible(true)}
            onContact={() => setContactVisible(true)}
            onShare={handleShare}
          />

          {price.memberHint && !actions.isRegistered ? (
            <Pressable
              onPress={() => router.push('/subscribe')}
              accessibilityRole="button"
              accessibilityLabel="Voir les formules d'abonnement"
              style={({ pressed }) => [styles.savingsCard, pressed && styles.savingsPressed]}
            >
              <View style={styles.savingsRow}>
                <View style={styles.savingsAmountBlock}>
                  <Text style={styles.savingsAmount}>-{price.savings}€</Text>
                  <Text style={styles.savingsAmountLabel}>économie</Text>
                </View>
                <View style={styles.savingsText}>
                  <Text style={styles.savingsEyebrow}>Avec l'abonnement</Text>
                  <Text style={styles.savingsBody}>
                    Membre {price.memberHint.replace('Membre ', '')} · non-membre {price.strikethroughLabel ?? `${event.priceFull}€`}
                  </Text>
                  <Text style={styles.savingsCta}>Voir les formules →</Text>
                </View>
              </View>
            </Pressable>
          ) : null}

          <AttendeesList attendees={event.attendees} locked={tier === 'free'} />

          <View style={styles.section}>
            <Text style={styles.sectionTitleItalic}>À propos</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {tier === 'free' ? (
            <View style={styles.limitCard}>
              <Text style={styles.limitTitle}>Membre découverte</Text>
              <Text style={styles.limitBody}>
                Tu peux t'inscrire à {FREE_TIER_MONTHLY_LIMIT} événement ce mois-ci au prix
                non-membre. Rejoins le club pour des tarifs réduits et un accès illimité.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <TicketSheet
        visible={ticketVisible}
        ticket={ticket}
        onClose={() => setTicketVisible(false)}
      />

      <ContactSheet
        visible={contactVisible}
        event={event}
        onClose={() => setContactVisible(false)}
      />

      <PaymentSheet
        visible={paymentVisible}
        event={event}
        amount={price.amount}
        onClose={() => setPaymentVisible(false)}
        onPaid={onPaid}
      />
      </Animated.View>
    </GestureDetector>
  );
}

function HostRow({ city }: { city: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Voir l'organisateur"
      style={({ pressed }) => [styles.hostRow, pressed && styles.hostPressed]}
    >
      <Avatar firstName="L" gradient="terracotta" size={24} />
      <Text style={styles.hostName}>Les Apéros Filles · {city}</Text>
      <ChevronRight size={14} color={Colors.textTertiary} strokeWidth={1.8} />
    </Pressable>
  );
}

function PosterContent({
  event,
  pieces,
  priceLabel,
  priceStrike,
  priceHint,
}: {
  event: Event;
  pieces: { weekday: string; day: string; month: string };
  priceLabel: string;
  priceStrike: string | null;
  priceHint: string | null;
}) {
  return (
    <>
      <View style={styles.posterScrim} pointerEvents="none" />

      <View style={styles.posterTop}>
        <Text style={styles.posterCategory}>{event.category}</Text>
        <View style={styles.priceChip}>
          <Text style={styles.priceValue}>{priceLabel}</Text>
          {priceStrike ? <Text style={styles.priceOld}>{priceStrike}</Text> : null}
          {priceHint ? <Text style={styles.priceHint}>{priceHint}</Text> : null}
        </View>
      </View>

      <View style={styles.posterBottom}>
        <Text style={styles.posterDay} allowFontScaling={false}>
          {pieces.day}
        </Text>
        <Text style={styles.posterMonth}>
          {pieces.month.toUpperCase()} · {event.time}
        </Text>
      </View>
    </>
  );
}

function NotFound({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.notFound, { paddingTop: insets.top + Spacing.xxl }]}>
      <Text style={styles.notFoundTitle}>Événement introuvable</Text>
      <Text style={styles.notFoundBody}>Cet événement n'existe plus ou a été retiré.</Text>
      <Button
        label="Retour aux événements"
        onPress={onBack}
        accessibilityLabel="Retour aux événements"
        style={styles.notFoundCta}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  dragHandleWrap: {
    alignItems: 'center',
    paddingBottom: Spacing.xs,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderStrong,
  },
  posterFrame: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  poster: {
    height: 380,
    borderRadius: 28,
    padding: Spacing.xl,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
    backgroundColor: Colors.surfaceMuted,
  },
  posterImage: {
    borderRadius: 28,
  },
  posterScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 10, 7, 0.2)',
    borderRadius: 28,
  },
  posterTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  posterCategory: {
    ...Typography.small,
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    opacity: 0.9,
  },
  posterBottom: {
    gap: Spacing.xs,
  },
  posterDay: {
    fontFamily: FontFamily.display,
    fontSize: 108,
    lineHeight: 108,
    color: Colors.white,
    letterSpacing: -2,
  },
  posterMonth: {
    ...Typography.caption,
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.9,
  },
  priceChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minWidth: 84,
    alignItems: 'flex-end',
  },
  priceValue: {
    ...Typography.h3,
    color: Colors.white,
  },
  priceOld: {
    ...Typography.small,
    color: 'rgba(255, 255, 255, 0.65)',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  priceHint: {
    ...Typography.small,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 2,
  },
  body: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  goingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(90, 122, 62, 0.12)',
  },
  goingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  goingText: {
    ...Typography.small,
    color: Colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    fontSize: 32,
    lineHeight: 38,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginTop: -Spacing.sm,
  },
  hostPressed: {
    opacity: 0.65,
  },
  hostName: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  dateLine: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  locationLine: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: -Spacing.sm,
  },
  spotsLine: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: -Spacing.sm,
  },
  savingsCard: {
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  savingsPressed: {
    opacity: 0.65,
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  savingsAmountBlock: {
    alignItems: 'center',
  },
  savingsAmount: {
    fontFamily: FontFamily.display,
    fontSize: 36,
    lineHeight: 40,
    color: Colors.accent,
    letterSpacing: -0.8,
    fontStyle: 'italic',
  },
  savingsAmountLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  savingsText: {
    flex: 1,
    gap: 2,
  },
  savingsEyebrow: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  savingsBody: {
    ...Typography.caption,
    color: Colors.text,
    marginTop: 2,
    marginBottom: Spacing.xs,
  },
  savingsCta: {
    ...Typography.bodyBold,
    color: Colors.accent,
  },
  section: {
    gap: Spacing.sm,
    marginTop: Spacing.xxl,
  },
  sectionTitleItalic: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 28,
    color: Colors.text,
    letterSpacing: -0.3,
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 24,
  },
  limitCard: {
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  limitTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  limitBody: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  notFound: {
    flex: 1,
    padding: Spacing.xl,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  notFoundBody: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  notFoundCta: {
    alignSelf: 'stretch',
  },
});
