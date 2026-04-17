import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FilleProfile } from '@/components/filles/FilleProfile';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Colors } from '@/constants/colors';
import { IconSize, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { mockUsers } from '@/data/mock';

export default function FilleRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const user = useMemo(() => mockUsers.find((u) => u.id === id), [id]);

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        <IconButton
          icon={<ChevronLeft size={IconSize.content} color={Colors.darkBrown} strokeWidth={1.8} />}
          accessibilityLabel="Retour"
          onPress={() => router.back()}
        />
      </View>

      {user ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + Spacing.xxxl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <FilleProfile user={user} />
        </ScrollView>
      ) : (
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Profil introuvable</Text>
          <Text style={styles.notFoundBody}>
            Cette personne n'est plus membre du club.
          </Text>
          <Button
            label="Retour à l'annuaire"
            onPress={() => router.replace('/(tabs)/filles')}
            style={styles.notFoundCta}
            accessibilityLabel="Retour à l'annuaire"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  content: {
    padding: Spacing.xl,
  },
  notFound: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundTitle: {
    ...Typography.h2,
    color: Colors.darkBrown,
    marginBottom: Spacing.sm,
  },
  notFoundBody: {
    ...Typography.body,
    color: Colors.brown,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  notFoundCta: {
    alignSelf: 'stretch',
  },
});
