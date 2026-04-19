import { ArrowLeft, Mail } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppleLogo, GoogleLogo } from '@/components/onboarding/BrandIcons';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { useAuthStore, type AuthMode } from '@/stores/useAuthStore';

interface AuthStepProps {
  onAuthenticated: (mode: AuthMode) => void;
  onBack: () => void;
}

/**
 * Smart-auth flow — Tinder-style.
 *
 *   1. "providers" stage: pick a method (Google / Apple / email). No tabs,
 *       no upfront "je crée / je me connecte" toggle — the app will figure
 *       it out.
 *   2. "email" stage: single email input. On continue we look the address
 *       up (mocked here) and branch:
 *         - known account  → sign-in,  welcome-back message + password
 *         - unknown account → sign-up, "créons ton compte" + password
 *   3. "password" stage: context-aware message + password field + CTA.
 *
 * Google / Apple paths skip stages 2–3 and hand off immediately (in a real
 * integration we'd do the OAuth round-trip and detect existing vs new on
 * the backend).
 */

type Stage = 'providers' | 'email' | 'password';

interface AccountLookup {
  exists: boolean;
  firstName?: string;
}

/** Mock "does this email have an account ?" — simulates a backend call. */
function lookupAccount(email: string): Promise<AccountLookup> {
  return new Promise((resolve) => {
    // Tiny curated list so the demo feels real. Anything else = new account.
    const known: Record<string, string> = {
      'marguerite@aperos.fr': 'Marguerite',
      'sophie@aperos.fr': 'Sophie',
      'lea@aperos.fr': 'Léa',
    };
    const hit = known[email.trim().toLowerCase()];
    setTimeout(
      () => resolve(hit ? { exists: true, firstName: hit } : { exists: false }),
      450,
    );
  });
}

export function AuthStep({ onAuthenticated, onBack }: AuthStepProps) {
  const email = useAuthStore((s) => s.onboardingDraft.email);
  const setEmail = useAuthStore((s) => s.setDraftEmail);
  const setMode = useAuthStore((s) => s.setDraftMode);
  const setProvider = useAuthStore((s) => s.setDraftProvider);
  const setFirstName = useAuthStore((s) => s.setDraftFirstName);

  const [stage, setStage] = useState<Stage>('providers');
  const [password, setPassword] = useState('');
  const [looking, setLooking] = useState(false);
  const [lookup, setLookup] = useState<AccountLookup | null>(null);

  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const passwordValid = password.length >= 6;

  const goBackStage = () => {
    if (stage === 'password') {
      setStage('email');
      setPassword('');
      return;
    }
    if (stage === 'email') {
      setStage('providers');
      return;
    }
    onBack();
  };

  const onContinueEmail = async () => {
    if (!emailValid || looking) return;
    setLooking(true);
    const res = await lookupAccount(email);
    setLookup(res);
    setMode(res.exists ? 'sign-in' : 'sign-up');
    if (res.exists && res.firstName) {
      // Pre-fill the first name so welcome copy + later greeting feel alive.
      setFirstName(res.firstName);
    }
    setLooking(false);
    setStage('password');
  };

  const onSubmitPassword = () => {
    if (!passwordValid || !lookup) return;
    setProvider('email');
    onAuthenticated(lookup.exists ? 'sign-in' : 'sign-up');
  };

  const onContinueGoogle = () => {
    // Mocked OAuth — we assume a fresh signup so the demo shows the full
    // flow. A real integration would ask the backend whether the Google
    // email is already linked and branch like the email path does.
    setProvider('google');
    setMode('sign-up');
    onAuthenticated('sign-up');
  };

  const onContinueApple = () => {
    setProvider('google'); // reuse 'google' slot — the draft field is purely a marker
    setMode('sign-up');
    onAuthenticated('sign-up');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable
          onPress={goBackStage}
          accessibilityRole="button"
          accessibilityLabel="Revenir en arrière"
          hitSlop={10}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <ArrowLeft size={IconSize.content} color={Colors.text} strokeWidth={1.8} />
        </Pressable>
      </View>

      {stage === 'providers' ? (
        <ProvidersStage
          onGoogle={onContinueGoogle}
          onApple={onContinueApple}
          onEmail={() => setStage('email')}
        />
      ) : null}

      {stage === 'email' ? (
        <EmailStage
          email={email}
          onChange={setEmail}
          onContinue={onContinueEmail}
          looking={looking}
          canContinue={emailValid}
        />
      ) : null}

      {stage === 'password' && lookup ? (
        <PasswordStage
          lookup={lookup}
          password={password}
          onChange={setPassword}
          onSubmit={onSubmitPassword}
          canSubmit={passwordValid}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}

function ProvidersStage({
  onGoogle,
  onApple,
  onEmail,
}: {
  onGoogle: () => void;
  onApple: () => void;
  onEmail: () => void;
}) {
  return (
    <View style={styles.stage}>
      <View style={styles.pitch}>
        <Text style={styles.title}>
          Bienvenue <Text style={styles.titleAccent}>chez toi.</Text>
        </Text>
        <Text style={styles.subtitle}>
          On te reconnaît ou on te rencontre — dans les deux cas, c'est par
          ici.
        </Text>
      </View>

      <View style={styles.providers}>
        <ProviderButton
          label="Continuer avec Google"
          glyph={<GoogleLogo size={18} />}
          onPress={onGoogle}
        />
        <ProviderButton
          label="Continuer avec Apple"
          glyph={<AppleLogo size={18} />}
          onPress={onApple}
        />
        <ProviderButton
          label="Continuer avec un email"
          glyph={<Mail size={18} color={Colors.text} strokeWidth={1.8} />}
          onPress={onEmail}
        />
      </View>

      <Text style={styles.legal}>
        En continuant, tu acceptes nos{' '}
        <Text style={styles.legalLink}>conditions</Text> et notre{' '}
        <Text style={styles.legalLink}>politique de confidentialité</Text>.
      </Text>
    </View>
  );
}

function EmailStage({
  email,
  onChange,
  onContinue,
  looking,
  canContinue,
}: {
  email: string;
  onChange: (v: string) => void;
  onContinue: () => void;
  looking: boolean;
  canContinue: boolean;
}) {
  return (
    <View style={styles.stage}>
      <View style={styles.pitch}>
        <Text style={styles.title}>
          Ton <Text style={styles.titleAccent}>email</Text> ?
        </Text>
        <Text style={styles.subtitle}>
          On vérifie en coulisses si tu as déjà un compte.
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Email</Text>
        <TextInput
          value={email}
          onChangeText={onChange}
          onSubmitEditing={onContinue}
          placeholder="prenom@exemple.com"
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize="none"
          autoComplete="email"
          autoFocus
          keyboardType="email-address"
          returnKeyType="next"
          style={styles.input}
        />
      </View>

      <View style={styles.footer}>
        <Button
          label={looking ? 'On te cherche…' : 'Continuer'}
          onPress={onContinue}
          disabled={!canContinue || looking}
          accessibilityLabel="Continuer"
          leftIcon={
            looking ? (
              <ActivityIndicator size="small" color={Colors.accentContrast} />
            ) : undefined
          }
        />
      </View>
    </View>
  );
}

function PasswordStage({
  lookup,
  password,
  onChange,
  onSubmit,
  canSubmit,
}: {
  lookup: AccountLookup;
  password: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
}) {
  return (
    <View style={styles.stage}>
      <View style={styles.pitch}>
        {lookup.exists ? (
          <>
            <Text style={styles.title}>
              Ravie de te{' '}
              <Text style={styles.titleAccent}>revoir, {lookup.firstName}.</Text>
            </Text>
            <Text style={styles.subtitle}>
              Ton mot de passe et on te replonge dans l'ambiance.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>
              Crée ton <Text style={styles.titleAccent}>mot de passe.</Text>
            </Text>
            <Text style={styles.subtitle}>
              Six caractères minimum — mélange chiffres et lettres, l'idée
              c'est que personne d'autre ne l'ait.
            </Text>
          </>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Mot de passe</Text>
        <TextInput
          value={password}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
          placeholder={lookup.exists ? '••••••' : '6 caractères minimum'}
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize="none"
          autoComplete={lookup.exists ? 'current-password' : 'new-password'}
          autoFocus
          secureTextEntry
          returnKeyType="done"
          style={styles.input}
        />
        {lookup.exists ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mot de passe oublié"
            style={({ pressed }) => [styles.forgotRow, pressed && styles.pressed]}
          >
            <Text style={styles.forgotLabel}>Mot de passe oublié ?</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button
          label={lookup.exists ? 'Se connecter' : 'Créer mon compte'}
          onPress={onSubmit}
          disabled={!canSubmit}
          accessibilityLabel={lookup.exists ? 'Se connecter' : 'Créer mon compte'}
        />
      </View>
    </View>
  );
}

function ProviderButton({
  label,
  glyph,
  onPress,
}: {
  label: string;
  glyph: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.providerBtn, pressed && styles.pressed]}
    >
      <View style={styles.providerGlyph}>{glyph}</View>
      <Text style={styles.providerLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  stage: {
    flex: 1,
  },
  pitch: {
    marginBottom: Spacing.xxl,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 32,
    lineHeight: 38,
    color: Colors.text,
    letterSpacing: -0.4,
  },
  titleAccent: {
    fontStyle: 'italic',
    color: Colors.accent,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  providers: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  providerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md + 4,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  providerGlyph: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
    marginRight: 22, // symmetric padding since glyph is on the left
  },
  field: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  input: {
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md + 2,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    fontFamily: FontFamily.regular,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.xs,
    marginTop: Spacing.xs,
  },
  forgotLabel: {
    ...Typography.caption,
    color: Colors.accent,
  },
  footer: {
    marginTop: 'auto',
    gap: Spacing.md,
    paddingTop: Spacing.lg,
  },
  legal: {
    ...Typography.small,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 'auto',
    paddingBottom: Spacing.md,
  },
  legalLink: {
    color: Colors.accent,
  },
});
