import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { screenContent } from '@/components/layout/screen';
import { Button, Card, PageHeader } from '@/components/ui';
import { useInstallPrompt } from '@/pwa/useInstallPrompt';
import { textVariants } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

/**
 * Settings holds only the web install row for now. Other preferences arrive
 * with the settings task (#16). The row appears only when the browser has
 * offered an install, so native builds and installed web apps show nothing.
 */
export default function SettingsRoute() {
  const router = useRouter();
  const theme = useTheme();
  const { canInstall, promptInstall } = useInstallPrompt();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ContentColumn>
        <PageHeader
          title="Settings"
          tier="compact"
          onBack={() => router.back()}
        />

        <ScrollView contentContainerStyle={screenContent}>
          {canInstall ? (
            <Card padded={false} accessibilityRole="button" testID="settings-install-row">
              <View style={styles.row}>
                <View style={styles.copy}>
                  <Text style={[textVariants.label, { color: theme.colors.text }]}>
                    Install app
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
                    Add Hodlo to your home screen. It opens full screen and works offline.
                  </Text>
                </View>
                <Button
                  label="Install app"
                  size="sm"
                  onPress={() => {
                    void promptInstall();
                  }}
                  testID="settings-install-button"
                />
              </View>
            </Card>
          ) : (
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
              More settings are coming soon.
            </Text>
          )}
        </ScrollView>
      </ContentColumn>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 16,
  },
  copy: {
    flexShrink: 1,
  },
});
