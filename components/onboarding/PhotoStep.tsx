import { Camera, ImageIcon, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { PhotoCropperSheet } from '@/components/profile/PhotoCropperSheet';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import { pickAvatarImage } from '@/utils/image';

interface PhotoStepProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Photo step — Tinder-inspired large-preview uploader.
 *
 * A tall rounded card sits at the centre of the screen :
 *   - Empty state → cream canvas with a camera glyph, tap to pick.
 *   - Filled state → the photo renders edge-to-edge with a soft terracotta
 *     overlay at the bottom showing the user's prénom + a small edit pill.
 *
 * The photo is strictly optional — primary CTA is `Continuer` ; a muted
 * `Plus tard` link lets the user skip. No photo, no blocker.
 */
export function PhotoStep({ onNext, onBack }: PhotoStepProps) {
  const { width: screenWidth } = useWindowDimensions();
  const firstName = useAuthStore((s) => s.onboardingDraft.firstName);
  const avatarUrl = useAuthStore((s) => s.onboardingDraft.avatarUrl);
  const setAvatarUrl = useAuthStore((s) => s.setDraftAvatarUrl);

  /**
   * Two-step flow :
   *   1. `choose()` launches the OS picker and stores the raw URI in
   *      `rawUri` so the cropper can open on top.
   *   2. When the cropper saves, we write the cropped URI to the draft.
   */
  const [rawUri, setRawUri] = useState<string | null>(null);

  // Card width capped to 320 so it stays calm on tablets / web at wider
  // viewports — at phone width it takes ~92% of the available space.
  const cardWidth = Math.min(320, screenWidth - Spacing.xxl * 2);
  const cardHeight = cardWidth * 1.25; // 4:5 ratio — portrait, close to Tinder

  const choose = async () => {
    const uri = await pickAvatarImage();
    if (uri) setRawUri(uri);
  };

  const hasPhoto = Boolean(avatarUrl);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.step}>Étape 2 sur 5</Text>
        <Text style={styles.title}>
          Une <Text style={styles.titleAccent}>photo</Text> de toi ?
        </Text>
        <Text style={styles.subtitle}>
          Facultatif, mais ça aide les autres filles à te reconnaître en vrai
          le jour de l'événement.
        </Text>
      </View>

      <View style={styles.previewWrap}>
        <Pressable
          onPress={choose}
          accessibilityRole="button"
          accessibilityLabel={
            hasPhoto ? 'Changer la photo' : 'Ajouter une photo'
          }
          style={({ pressed }) => [
            styles.card,
            { width: cardWidth, height: cardHeight },
            pressed && styles.cardPressed,
          ]}
        >
          {hasPhoto && avatarUrl ? (
            <>
              <Image source={{ uri: avatarUrl }} style={styles.cardImage} />
              <View style={styles.nameStrap}>
                <Text style={styles.nameText}>
                  {firstName || 'Toi'}
                </Text>
              </View>
              <View style={styles.editPill}>
                <Camera
                  size={IconSize.inline}
                  color={Colors.accentContrast}
                  strokeWidth={2}
                />
                <Text style={styles.editPillLabel}>Changer</Text>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <ImageIcon
                  size={32}
                  color={Colors.accent}
                  strokeWidth={1.4}
                />
              </View>
              <Text style={styles.emptyTitle}>Ajouter une photo</Text>
              <Text style={styles.emptyHelper}>
                Galerie ou appareil photo
              </Text>
            </View>
          )}
        </Pressable>

        {hasPhoto ? (
          <Pressable
            onPress={() => setAvatarUrl(null)}
            accessibilityRole="button"
            accessibilityLabel="Supprimer la photo"
            hitSlop={8}
            style={({ pressed }) => [
              styles.removeRow,
              pressed && styles.removePressed,
            ]}
          >
            <Trash2 size={14} color={Colors.danger} strokeWidth={1.8} />
            <Text style={styles.removeLabel}>Supprimer</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button
          label="Retour"
          variant="ghost"
          onPress={onBack}
          accessibilityLabel="Revenir à l'étape précédente"
        />
        {/*
          Soft-nudge pattern : when no photo is picked the CTA stays
          available but reads as muted ("Plus tard" / ghost variant) so
          we encourage adding one without blocking. As soon as a photo
          exists the button flips to the solid terracotta primary
          "Continuer" — clearly the next action.
        */}
        <Button
          label={hasPhoto ? 'Continuer' : 'Plus tard'}
          variant={hasPhoto ? 'primary' : 'ghost'}
          onPress={onNext}
          accessibilityLabel={
            hasPhoto ? "Continuer vers l'étape suivante" : 'Passer cette étape'
          }
        />
      </View>

      <PhotoCropperSheet
        visible={rawUri !== null}
        sourceUri={rawUri}
        onClose={() => setRawUri(null)}
        onSave={(uri) => {
          setAvatarUrl(uri);
          setRawUri(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  step: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
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
  previewWrap: {
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  nameStrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: 'rgba(42, 24, 16, 0.55)',
  },
  nameText: {
    fontFamily: FontFamily.display,
    fontStyle: 'italic',
    fontSize: 28,
    lineHeight: 32,
    color: Colors.accentContrast,
    letterSpacing: -0.3,
  },
  editPill: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
  },
  editPillLabel: {
    ...Typography.small,
    color: Colors.accentContrast,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(194, 65, 12, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  emptyHelper: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  removeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  removePressed: {
    opacity: 0.6,
  },
  removeLabel: {
    ...Typography.caption,
    color: Colors.danger,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: 'auto',
  },
});
