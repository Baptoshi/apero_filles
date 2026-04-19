import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

/**
 * Cross-platform image picker.
 *
 *   - Native (iOS / Android) : asks for the photo-library permission then
 *     launches the system picker. Returns a local `file://` URI.
 *   - Web : renders a native `<input type="file">` and returns a base64
 *     data URL we can persist as-is.
 *
 * We always ask the library to return a square crop (1:1) — the avatar
 * renders circular so anything non-square would be cropped visually anyway.
 *
 * Returns `null` if the user cancels or the permission is denied.
 */
export async function pickAvatarImage(): Promise<string | null> {
  // Permissions are only required on native ; the web picker works without.
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    // We run our own crop UI (`PhotoCropperSheet`) to stay consistent across
    // iOS / Android / web, so we explicitly don't ask the picker to crop.
    allowsEditing: false,
    quality: 1,
    base64: false,
  });

  if (result.canceled) return null;
  const first = result.assets[0];
  return first?.uri ?? null;
}
