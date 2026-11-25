import Constants from 'expo-constants';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useApi } from '@/api/ApiProvider';
import type { CharacterId } from '@/api/contracts';
import type { IconName } from '@/assets/icons';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Icon,
  PageHeader,
  Sheet,
  TextField,
} from '@/components/ui';
import { screenContent } from '@/components/layout/screen';
import { CHARACTERS } from '@/components/mascot/types';
import { useSession } from '@/auth/useSession';
import { SyncBanner } from '@/offline/SyncBanner';
import { useSyncStatus } from '@/offline/useSyncStatus';
import { useProgressStore } from '@/stores/progressStore';
import { textVariants } from '@/theme/tokens';
import { useBreakpoint } from '@/theme/useBreakpoint';
import { useTheme } from '@/theme/useTheme';

import {
  avatarColor,
  avatarInitials,
  avatarTextColor,
} from './avatar';
import { BadgeGrid } from './BadgeGrid';
import { StatsGrid } from './StatsGrid';
import { StreakCalendar } from './StreakCalendar';
import { useAchievements } from './useAchievements';

const CHARACTER_IDS: CharacterId[] = [
  'hodlo',
  'chip',
  'tank',
  'grizz',
  'vex',
];

function ProfileLink({
  icon,
  label,
  testID,
}: {
  icon: IconName;
  label: string;
  testID: string;
}) {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${label}, coming soon`}
      accessibilityState={{ disabled: true }}
      testID={testID}
      style={[styles.link, { borderBottomColor: theme.colors.border }]}
    >
      <Icon name={icon} color={theme.colors.textMuted} size={28} />
      <Text
        style={[
          textVariants.bodyStrong,
          styles.linkText,
          { color: theme.colors.textMuted },
        ]}
      >
        {label}
      </Text>
      <View style={styles.soon}>
        <Badge label="Soon" tone="neutral" />
      </View>
    </View>
  );
}

export function ProfileScreen() {
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const { client } = useApi();
  const sync = useSyncStatus();
  const { user, updateUser } = useSession();
  const lessons = useProgressStore((state) => state.lessons);
  const pendingXp = useProgressStore((state) => state.pendingXp);
  const progressStreak = useProgressStore((state) => state.streak);
  const achievements = useAchievements();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [characterId, setCharacterId] = useState<CharacterId>('hodlo');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const offline = sync.state === 'offline';

  const lessonEntries = Object.values(lessons);
  const completedLessons = lessonEntries.filter(
    (lesson) => lesson.status === 'completed',
  ).length;
  const scored = lessonEntries
    .map((lesson) => lesson.bestScore)
    .filter((score): score is number => typeof score === 'number');
  const accuracy =
    scored.length === 0
      ? null
      : scored.reduce((sum, score) => sum + score, 0) / scored.length;
  const streak = Math.max(progressStreak.current, user?.streak.current ?? 0);

  if (!user) {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <PageHeader
        title="Profile"
        subtitle="Your progress and badges"
        tier="standard"
      />
        <EmptyState
          icon="profile"
          title="Sign in to see your profile"
          message="Your streak, stats, and badges live with your account."
        />
      </View>
    );
  }

  const openEdit = () => {
    setName(user.displayName);
    setCharacterId(user.characterId);
    setEditError(null);
    setEditOpen(true);
  };

  const save = async () => {
    const displayName = name.trim();

    if (displayName.length === 0) {
      setEditError('Enter a display name.');

      return;
    }

    setSaving(true);
    setEditError(null);

    try {
      const updated = await client.profile.update({
        displayName: displayName.slice(0, 40),
        characterId,
      });

      updateUser(updated);
      setEditOpen(false);
    } catch (caught) {
      setEditError(
        caught instanceof Error
          ? caught.message
          : 'Could not update your profile.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <PageHeader
        title="Profile"
        subtitle="Your progress and badges"
        tier="standard"
      />

      <SyncBanner testID="profile-offline-banner" />

      <ScrollView contentContainerStyle={screenContent}>
        <Card padded={false}>
          <View
            style={[
              styles.identity,
              isMobile && styles.identityMobile,
              { padding: theme.spacing.md },
            ]}
          >
            <View style={styles.identityMain}>
              <View
                testID="profile-avatar"
                style={[
                  styles.avatar,
                  {
                    backgroundColor: avatarColor(user.id),
                    borderRadius: theme.radii.pill,
                  },
                ]}
              >
                <Text
                  style={[
                    theme.typography.title,
                    { color: avatarTextColor(user.id) },
                  ]}
                >
                  {avatarInitials(user.displayName)}
                </Text>
              </View>

              <View style={styles.identityText}>
                <Text
                  numberOfLines={1}
                  style={[theme.typography.title, { color: theme.colors.text }]}
                >
                  {user.displayName}
                </Text>
                <Text
                  style={[
                    theme.typography.caption,
                    { color: theme.colors.textMuted },
                  ]}
                >
                  {CHARACTERS[user.characterId].name} ·{' '}
                  {CHARACTERS[user.characterId].catchphrase}
                </Text>
              </View>

            </View>

            <Button
              label="Edit profile"
              onPress={openEdit}
              size="sm"
              variant="contrast"
              disabled={offline}
              fullWidth={isMobile}
              testID="profile-edit"
            />
          </View>
        </Card>

        {offline ? (
          <Text
            testID="profile-cached"
            style={[
              theme.typography.caption,
              { color: theme.colors.textMuted },
            ]}
          >
            Showing your saved profile. New badges sync when you reconnect.
          </Text>
        ) : null}

        <StatsGrid
          xp={user.xp + pendingXp}
          streak={streak}
          lessonsCompleted={completedLessons}
          accuracy={accuracy}
        />

        <StreakCalendar
          lastLessonDate={progressStreak.lastLessonDate}
          currentStreak={streak}
        />

        <View style={styles.sectionHeader}>
          <Text style={[theme.typography.heading, { color: theme.colors.text }]}>
            Achievements
          </Text>
          {achievements.isLocal ? (
            <Text
              testID="achievements-local"
              style={[
                theme.typography.caption,
                { color: theme.colors.textMuted },
              ]}
            >
              Saved on this device
            </Text>
          ) : null}
        </View>

        {achievements.isLoading && achievements.data.length === 0 ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <BadgeGrid achievements={achievements.data} />
        )}

        <Card padded={false}>
          <ProfileLink
            icon="settings"
            label="Settings"
            testID="profile-settings"
          />
          <ProfileLink icon="book" label="Glossary" testID="profile-glossary" />
          <ProfileLink
            icon="shield"
            label="Disclaimer"
            testID="profile-disclaimer"
          />
          <View style={styles.version}>
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.textMuted },
              ]}
            >
              Hodlo v{Constants.expoConfig?.version ?? '0.0.1'}
            </Text>
          </View>
        </Card>
      </ScrollView>

      <Sheet
        visible={editOpen}
        title="Edit profile"
        onClose={() => setEditOpen(false)}
      >
        <TextField
          label="Display name"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setEditError(null);
          }}
          maxLength={40}
          testID="profile-name"
        />

        <Text
          style={[textVariants.label, { color: theme.colors.textMuted }]}
        >
          Pick your guide
        </Text>
        <View style={styles.characters}>
          {CHARACTER_IDS.map((id) => (
            <Chip
              key={id}
              label={CHARACTERS[id].name}
              selected={id === characterId}
              onPress={() => setCharacterId(id)}
              testID={`character-chip-${id}`}
            />
          ))}
        </View>

        {editError ? (
          <Text
            accessibilityRole="alert"
            style={[theme.typography.caption, { color: theme.colors.danger }]}
          >
            {editError}
          </Text>
        ) : null}

        <Button
          label="Save"
          onPress={() => {
            void save();
          }}
          loading={saving}
          disabled={offline}
          fullWidth
          testID="profile-save"
        />
        <Button
          label="Cancel"
          onPress={() => setEditOpen(false)}
          variant="ghost"
          fullWidth
          disabled={saving}
        />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  identity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  identityMobile: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  identityMain: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
  },
  avatar: {
    alignItems: 'center',
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  identityText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: {
    alignItems: 'center',
    borderBottomWidth: 2,
    flexDirection: 'row',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  linkText: {
    flex: 1,
  },
  soon: {
    alignSelf: 'center',
  },
  version: {
    alignItems: 'center',
    padding: 16,
  },
  characters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
