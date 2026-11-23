import { StyleSheet, Text, View } from 'react-native';

import { toLocalDateKey } from '@/features/gamification/streak';
import { useTheme } from '@/theme/useTheme';

function parseLocalKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);

  if (!match) {
    return null;
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function recentDays(today: Date, count: number): Date[] {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return Array.from({ length: count }, (_, index) => {
    const offset = count - 1 - index;

    return new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() - offset,
    );
  });
}

function completedDays(
  lastLessonDate: string | null,
  currentStreak: number,
): Set<string> {
  const completed = new Set<string>();
  const last = lastLessonDate ? parseLocalKey(lastLessonDate) : null;

  if (!last || currentStreak <= 0) {
    return completed;
  }

  for (let offset = 0; offset < currentStreak; offset += 1) {
    const day = new Date(
      last.getFullYear(),
      last.getMonth(),
      last.getDate() - offset,
    );

    completed.add(toLocalDateKey(day));
  }

  return completed;
}

export interface StreakCalendarProps {
  lastLessonDate: string | null;
  currentStreak: number;
  today?: Date;
}

export function StreakCalendar({
  lastLessonDate,
  currentStreak,
  today = new Date(),
}: StreakCalendarProps) {
  const theme = useTheme();
  const days = recentDays(today, 30);
  const completed = completedDays(lastLessonDate, currentStreak);
  const todayKey = toLocalDateKey(today);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[theme.typography.heading, { color: theme.colors.text }]}>
            Streak calendar
          </Text>
          <Text
            style={[theme.typography.caption, { color: theme.colors.textMuted }]}
          >
            Last 30 days
          </Text>
        </View>
        <Text
          style={[theme.typography.caption, styles.streak, { color: theme.colors.primary }]}
        >
          {currentStreak} day{currentStreak === 1 ? '' : 's'}
        </Text>
      </View>

      <View style={styles.days}>
        {days.map((day) => {
          const key = toLocalDateKey(day);
          const isToday = key === todayKey;
          const isCompleted = completed.has(key);
          const label = day.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          });

          return (
            <View
              key={key}
              accessible
              accessibilityLabel={`${label}${isCompleted ? ', lesson completed' : ''}${isToday ? ', today' : ''}`}
              testID={`streak-day-${key}`}
              style={[
                styles.day,
                {
                  backgroundColor: isCompleted
                    ? theme.colors.success
                    : theme.colors.surfaceAlt,
                  borderRadius: theme.radii.sm,
                  borderColor: isToday
                    ? theme.colors.primary
                    : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  theme.typography.caption,
                  styles.dayText,
                  {
                    color: isCompleted
                      ? theme.colors.onSuccess
                      : theme.colors.textMuted,
                  },
                ]}
              >
                {day.getDate()}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    gap: 2,
  },
  streak: {
    fontWeight: '800',
  },
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  day: {
    alignItems: 'center',
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  dayText: {
    fontWeight: '700',
  },
});
