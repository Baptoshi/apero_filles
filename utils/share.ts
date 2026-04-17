import { Platform, Share } from 'react-native';

import type { Event } from '@/types/event';
import { formatFullDate } from './date';

interface SharePayload {
  title: string;
  message: string;
  /** Optional deep link / web URL that accompanies the share on iOS and web. */
  url?: string;
}

/**
 * Build the share payload used by both the native share sheet and the web
 * navigator.share API. Kept separate so we compose the copy once.
 */
export function buildEventSharePayload(event: Event): SharePayload {
  const date = formatFullDate(event.date);
  const message = [
    `${event.title} — Les Apéros Filles`,
    `${date} · ${event.time}`,
    `${event.location}, ${event.city}`,
    '',
    'Rejoins-moi !',
  ].join('\n');
  return {
    title: event.title,
    message,
    // Deep-link to the in-app event page; resolves via Expo Router scheme.
    url: `laf://event/${event.id}`,
  };
}

/**
 * Trigger the system share sheet.
 *
 *   - iOS  → UIActivityViewController (AirDrop, Messages, Mail, social apps…)
 *   - Android → native chooser intent
 *   - Web → navigator.share() on supporting browsers (Safari, iOS Chrome,
 *           recent Edge); otherwise falls back to copying the message to the
 *           clipboard so the user can still paste it manually.
 *
 * Always resolves — the caller doesn't need to worry about failures.
 */
export async function sharePayload(payload: SharePayload): Promise<void> {
  if (Platform.OS === 'web') {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    if (nav && 'share' in nav && typeof nav.share === 'function') {
      try {
        await nav.share({
          title: payload.title,
          text: payload.message,
          url: payload.url,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard.
      }
    }
    if (nav && 'clipboard' in nav && nav.clipboard?.writeText) {
      try {
        await nav.clipboard.writeText(
          payload.url ? `${payload.message}\n${payload.url}` : payload.message,
        );
      } catch {
        // clipboard not available — silent no-op
      }
    }
    return;
  }

  try {
    await Share.share(
      {
        title: payload.title,
        message: payload.message,
        // iOS honors `url` as a separate field; Android uses message only.
        ...(Platform.OS === 'ios' && payload.url ? { url: payload.url } : null),
      },
      {
        dialogTitle: payload.title,
        subject: payload.title, // Android email subject / iOS activity subject
      },
    );
  } catch {
    // User cancelled or share rejected — silent no-op, we don't want to surface it.
  }
}
