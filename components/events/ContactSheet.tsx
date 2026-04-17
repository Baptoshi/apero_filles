import { BlurView } from 'expo-blur';
import { Sparkles, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
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

import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import type { Event } from '@/types/event';

interface ContactSheetProps {
  visible: boolean;
  event: Event;
  onClose: () => void;
}

/**
 * Glassmorphism contact popup.
 *
 * Floats above the event detail page with a blurred backdrop (real BlurView
 * on iOS, semi-opaque wash on Android / web) and a frosted glass panel that
 * hosts the contact form. The panel slides up on open and back down on close.
 */
export function ContactSheet({ visible, event, onClose }: ContactSheetProps) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const translate = useSharedValue(80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 220 });
      translate.value = withTiming(0, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      opacity.value = withTiming(0, { duration: 160 });
      translate.value = withTiming(80, { duration: 200 });
      // Reset state once the sheet is fully hidden.
      setTimeout(() => {
        setMessage('');
        setSent(false);
      }, 220);
    }
  }, [visible, opacity, translate]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const panelStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translate.value }],
  }));

  const requestClose = () => {
    opacity.value = withTiming(0, { duration: 160 });
    translate.value = withTiming(
      80,
      { duration: 200 },
      (finished) => {
        if (finished) runOnJS(onClose)();
      },
    );
  };

  const send = () => {
    if (!message.trim()) return;
    // In the proto we only simulate sending — a real backend would go here.
    setSent(true);
    setTimeout(requestClose, 1200);
  };

  return (
    <PlatformModal visible={visible} onRequestClose={requestClose}>
      <View style={styles.root}>
        {/* Backdrop — strong blur on iOS, backdrop-filter on web, tinted wash on Android */}
        <Animated.View style={[StyleSheet.absoluteFillObject, backdropStyle]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={65} tint="dark" style={StyleSheet.absoluteFillObject} />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.webBackdrop]} />
          )}
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={requestClose}
            accessibilityLabel="Fermer"
            accessibilityRole="button"
          />
        </Animated.View>

        <View style={[styles.bottomSlot, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Animated.View style={[styles.panelWrap, panelStyle]}>
            <GlassPanel>
              {sent ? (
                <View style={styles.sentBlock}>
                  <View style={styles.iconWrap}>
                    <Sparkles size={IconSize.content} color={Colors.accent} strokeWidth={1.8} />
                  </View>
                  <Text style={styles.sentTitle}>Message envoyé</Text>
                  <Text style={styles.sentBody}>
                    L'organisatrice te répondra dans les plus brefs délais.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.header}>
                    <View style={styles.headerText}>
                      <Text style={styles.eyebrow}>Contact</Text>
                      <Text style={styles.title}>Pose ta question</Text>
                      <Text style={styles.subtitle}>
                        L'organisatrice de « {event.title} » te répondra ici même.
                      </Text>
                    </View>
                    <Pressable
                      onPress={requestClose}
                      accessibilityLabel="Fermer"
                      accessibilityRole="button"
                      hitSlop={8}
                      style={({ pressed }) => [styles.closeBtn, pressed && styles.closePressed]}
                    >
                      <X size={IconSize.content} color={Colors.text} strokeWidth={1.8} />
                    </Pressable>
                  </View>

                  <View style={styles.inputWrap}>
                    <TextInput
                      value={message}
                      onChangeText={setMessage}
                      placeholder="Écris ta question ici…"
                      placeholderTextColor={Colors.textTertiary}
                      multiline
                      numberOfLines={4}
                      style={styles.input}
                      accessibilityLabel="Message à l'organisatrice"
                    />
                  </View>

                  <Button
                    label="Envoyer"
                    onPress={send}
                    disabled={!message.trim()}
                    accessibilityLabel="Envoyer le message"
                  />
                </>
              )}
            </GlassPanel>
          </Animated.View>
        </View>
      </View>
    </PlatformModal>
  );
}

/**
 * Opaque panel — the contact card itself is solid (cream surface). Only
 * the screen behind the backdrop gets the blur.
 */
function GlassPanel({ children }: { children: React.ReactNode }) {
  return <View style={styles.panel}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  webBackdrop: {
    backgroundColor: 'rgba(15, 10, 7, 0.35)',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(28px) saturate(130%)' } as any)
      : null),
  },
  bottomSlot: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  panelWrap: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  panel: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.lg,
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
    fontSize: 26,
    lineHeight: 30,
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
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
  inputWrap: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
  },
  input: {
    ...Typography.body,
    color: Colors.text,
    minHeight: 96,
    textAlignVertical: 'top',
    padding: 0,
  },
  sentBlock: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  sentTitle: {
    fontFamily: FontFamily.display,
    fontSize: 22,
    lineHeight: 28,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  sentBody: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
});
