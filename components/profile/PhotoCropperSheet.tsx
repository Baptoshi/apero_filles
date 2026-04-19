import * as ImageManipulator from 'expo-image-manipulator';
import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlatformModal } from '@/components/ui/PlatformModal';
import { Colors } from '@/constants/colors';
import { IconSize, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

interface PhotoCropperSheetProps {
  visible: boolean;
  sourceUri: string | null;
  onClose: () => void;
  onSave: (croppedUri: string) => void;
}

/**
 * Tinder-style photo cropper.
 *
 *   - Full-screen dark modal
 *   - Square frame centred on screen, outside is dimmed
 *   - Pan + pinch on the image (Reanimated + gesture-handler)
 *   - The image always covers the frame — base scale fits `cover`, user can
 *     only zoom further in (never below)
 *   - On save : compute the crop rect in source-image coordinates and call
 *     `ImageManipulator.manipulateAsync` → outputs a jpeg data URI
 *
 * Works on iOS / Android / web thanks to `expo-image-manipulator` (which
 * falls back to the Canvas API on web).
 */

const FRAME = 300;
const MAX_ZOOM = 3; // cap so the user can't zoom past a reasonable crop
const MIN_ZOOM = 1; // below 1, empty space would appear inside the frame

export function PhotoCropperSheet({
  visible,
  sourceUri,
  onClose,
  onSave,
}: PhotoCropperSheetProps) {
  const [nativeSize, setNativeSize] = useState<{ w: number; h: number } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  // Shared values driven by gestures. Reset every time a new image comes in.
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Load native dimensions when the source changes.
  useEffect(() => {
    if (!sourceUri) {
      setNativeSize(null);
      return;
    }
    Image.getSize(
      sourceUri,
      (w, h) => setNativeSize({ w, h }),
      () => setNativeSize(null),
    );
  }, [sourceUri]);

  // Reset transforms on open.
  useEffect(() => {
    if (!visible) return;
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [visible, scale, savedScale, translateX, translateY, savedTranslateX, savedTranslateY]);

  // Derived values (JS-land) — safe to use inside the save handler.
  const baseScale = nativeSize
    ? Math.max(FRAME / nativeSize.w, FRAME / nativeSize.h)
    : 1;
  const displayedW = nativeSize ? nativeSize.w * baseScale : FRAME;
  const displayedH = nativeSize ? nativeSize.h * baseScale : FRAME;

  /**
   * Clamp the pan so the frame never escapes the image. Called after every
   * gesture so the user can't accidentally leave empty space inside the
   * frame.
   */
  const clampTranslate = (tx: number, ty: number, s: number) => {
    'worklet';
    const maxX = ((displayedW * s) - FRAME) / 2;
    const maxY = ((displayedH * s) - FRAME) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, tx)),
      y: Math.max(-maxY, Math.min(maxY, ty)),
    };
  };

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      'worklet';
      const clamped = clampTranslate(
        translateX.value,
        translateY.value,
        scale.value,
      );
      translateX.value = withTiming(clamped.x, { duration: 180 });
      translateY.value = withTiming(clamped.y, { duration: 180 });
      savedTranslateX.value = clamped.x;
      savedTranslateY.value = clamped.y;
    });

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      'worklet';
      const next = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, savedScale.value * event.scale),
      );
      scale.value = next;
    })
    .onEnd(() => {
      'worklet';
      savedScale.value = scale.value;
      const clamped = clampTranslate(
        translateX.value,
        translateY.value,
        scale.value,
      );
      translateX.value = withTiming(clamped.x, { duration: 180 });
      translateY.value = withTiming(clamped.y, { duration: 180 });
      savedTranslateX.value = clamped.x;
      savedTranslateY.value = clamped.y;
    });

  const composed = Gesture.Simultaneous(pan, pinch);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const save = async () => {
    if (!sourceUri || !nativeSize || saving) return;
    setSaving(true);

    // Current total scale at which the image is drawn on screen.
    const totalScale = baseScale * savedScale.value;

    // Top-left of the frame expressed in source-image coordinates.
    const cropSize = FRAME / totalScale;
    const originX =
      (nativeSize.w - cropSize) / 2 - savedTranslateX.value / totalScale;
    const originY =
      (nativeSize.h - cropSize) / 2 - savedTranslateY.value / totalScale;

    // Clamp inside the image just to be safe (rounding can drift a few px).
    const safeOriginX = Math.max(
      0,
      Math.min(nativeSize.w - cropSize, originX),
    );
    const safeOriginY = Math.max(
      0,
      Math.min(nativeSize.h - cropSize, originY),
    );

    try {
      const result = await ImageManipulator.manipulateAsync(
        sourceUri,
        [
          {
            crop: {
              originX: Math.round(safeOriginX),
              originY: Math.round(safeOriginY),
              width: Math.round(cropSize),
              height: Math.round(cropSize),
            },
          },
        ],
        {
          compress: 0.85,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );
      runOnJS(onSave)(result.uri);
    } catch (err) {
      // Fallback: hand back the original URI if cropping fails so the UI
      // still progresses (e.g. web CORS issue on a remote sample URL).
      onSave(sourceUri);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PlatformModal visible={visible} onRequestClose={onClose}>
      {/*
        Black wrapper sits behind the SafeAreaView so even the top /
        bottom inset bands read as solid black — prevents the onboarding
        progress bar (or any underlying content) from peeking through
        when the phone frame's rounded top edge is above the safe area.
      */}
      <View style={styles.backdrop} />
      <SafeAreaView edges={['top', 'bottom']} style={styles.root}>
        <View style={styles.topBar}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Annuler"
            hitSlop={10}
            style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
          >
            <X size={IconSize.content} color={Colors.background} strokeWidth={1.8} />
          </Pressable>
          <Text style={styles.title}>Recadrer</Text>
          {/* Spacer the same size as the close button so the title stays
              optically centred without absolute positioning. */}
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.cropArea}>
          {/* Image stage — gestures live here and fill the crop area ;
              the Animated.View is centred by the parent's alignItems. */}
          {sourceUri && nativeSize ? (
            <GestureDetector gesture={composed}>
              <Animated.View style={[styles.imageStage, imageStyle]}>
                <Image
                  source={{ uri: sourceUri }}
                  style={{ width: displayedW, height: displayedH }}
                  resizeMode="cover"
                />
              </Animated.View>
            </GestureDetector>
          ) : null}

          {/*
            Mask with a transparent square hole built entirely in flexbox :
            a top band, a middle row containing side bands + the frame
            window, then a bottom band. Auto-centres inside whatever size
            the cropArea ends up at — no absolute positioning math, no
            dependency on window dimensions.
          */}
          <View style={styles.maskOverlay} pointerEvents="none">
            <View style={styles.maskBand} />
            <View style={styles.maskMiddleRow}>
              <View style={styles.maskBand} />
              <View style={styles.frameWindow}>
                <View
                  style={[styles.guide, styles.guideVertical, { left: FRAME / 3 - 0.5 }]}
                />
                <View
                  style={[styles.guide, styles.guideVertical, { left: (FRAME * 2) / 3 - 0.5 }]}
                />
                <View
                  style={[styles.guide, styles.guideHorizontal, { top: FRAME / 3 - 0.5 }]}
                />
                <View
                  style={[styles.guide, styles.guideHorizontal, { top: (FRAME * 2) / 3 - 0.5 }]}
                />
              </View>
              <View style={styles.maskBand} />
            </View>
            <View style={styles.maskBand} />
          </View>
        </View>

        <Text style={styles.hint}>Glisse pour cadrer · pince pour zoomer</Text>

        <View style={styles.footer}>
          <Pressable
            onPress={save}
            disabled={saving || !nativeSize}
            accessibilityRole="button"
            accessibilityLabel="Enregistrer le cadrage"
            style={({ pressed }) => [
              styles.saveCta,
              (saving || !nativeSize) && styles.saveCtaDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.saveCtaLabel}>
              {saving ? 'Traitement…' : 'Enregistrer'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </PlatformModal>
  );
}

const MASK_BG = 'rgba(0, 0, 0, 0.72)';

const CTA_SIZE = 36; // used by both close button and top-bar spacer

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050505',
  },
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    zIndex: 2,
  },
  closeBtn: {
    width: CTA_SIZE,
    height: CTA_SIZE,
    borderRadius: CTA_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarSpacer: {
    width: CTA_SIZE,
    height: CTA_SIZE,
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.background,
  },
  cropArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskBand: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: MASK_BG,
  },
  maskMiddleRow: {
    flexDirection: 'row',
    height: FRAME,
    alignSelf: 'stretch',
  },
  frameWindow: {
    width: FRAME,
    height: FRAME,
    borderWidth: 2,
    borderColor: Colors.background,
    borderRadius: 8,
  },
  guide: {
    position: 'absolute',
    backgroundColor: 'rgba(251, 246, 238, 0.4)',
  },
  guideVertical: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  guideHorizontal: {
    left: 0,
    right: 0,
    height: 1,
  },
  hint: {
    ...Typography.caption,
    color: 'rgba(251, 246, 238, 0.75)',
    textAlign: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    alignItems: 'center',
  },
  saveCta: {
    minWidth: 220,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: 999,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveCtaDisabled: {
    opacity: 0.45,
  },
  saveCtaLabel: {
    ...Typography.bodyBold,
    color: Colors.accentContrast,
  },
});
