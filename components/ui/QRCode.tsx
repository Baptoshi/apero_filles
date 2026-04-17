import { StyleSheet, View, type ViewStyle } from 'react-native';
import QRCodeSvg from 'react-native-qrcode-svg';

import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';

interface QRCodeProps {
  value: string;
  size?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Thin wrapper around react-native-qrcode-svg to enforce our visual identity.
 * Keeps a consistent light frame so the QR is always readable against cream backgrounds.
 */
export function QRCode({ value, size = 180, style }: QRCodeProps) {
  return (
    <View style={[styles.frame, style]}>
      <QRCodeSvg
        value={value}
        size={size}
        color={Colors.darkBrown}
        backgroundColor={Colors.warmWhite}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.warmWhite,
    borderWidth: 1,
    borderColor: Colors.lightPeach,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
