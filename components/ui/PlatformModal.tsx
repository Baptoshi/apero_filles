import type { ReactNode } from 'react';
import { Modal, Platform, StyleSheet, View } from 'react-native';

interface PlatformModalProps {
  visible: boolean;
  onRequestClose: () => void;
  children: ReactNode;
}

/**
 * Cross-platform modal shell.
 *
 * On native platforms this delegates to React Native's `Modal`, which gives
 * us hardware-back handling, focus trapping and translucent presentation.
 *
 * On **web**, the built-in `Modal` escapes the React tree and mounts at the
 * document root — which breaks our `PhoneFrame` demo wrapper (the modal
 * spills outside the iPhone viewport on desktop). So we render the overlay
 * inline as an `absoluteFill` view that stays inside the phone frame and is
 * naturally bounded by it.
 */
export function PlatformModal({ visible, onRequestClose, children }: PlatformModalProps) {
  if (Platform.OS === 'web') {
    if (!visible) return null;
    // We intentionally ignore `onRequestClose` on web — the sheet contents
    // handle backdrop taps themselves, and there's no hardware back button.
    void onRequestClose;
    return (
      <View
        style={[StyleSheet.absoluteFillObject, styles.webOverlay]}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({ pointerEvents: 'box-none' } as any)}
      >
        {children}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      {children}
    </Modal>
  );
}

const styles = StyleSheet.create({
  webOverlay: {
    // Sit above the current screen's content but inside the phone frame.
    zIndex: 9999,
  },
});
