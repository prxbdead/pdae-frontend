import { StyleSheet, Text, View } from 'react-native';

import { toLocalDateKey } from '@/features/gamification/streak';
import { Card } from '@/components/ui';
import { textVariants } from '@/theme/tokens';
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

  const rows: Date[][] = [];

  for (let index = 0; index < days.length; index += 7) {
    rows.push(days.slice(index, index + 7));
  }

  return (
    <Card style={{ gap: theme.spacing.md }}>
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
        <Text style={[textVariants.bodyStrong, { color: theme.colors.focus }]}>
          {currentStreak} day{currentStreak === 1 ? '' : 's'}
        </Text>
      </View>

      <View style={styles.days}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.week}>
            {Array.from({ length: 7 }, (_, column) => {
              const day = row[column];

              if (!day) {
                return <View key={`empty-${column}`} style={styles.day} />;
              }

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
                    styles.dayFilled,
                    {
                      backgroundColor: isCompleted
                        ? theme.colors.success
                        : theme.colors.surfaceAlt,
                      borderRadius: theme.radii.sm,
                      borderColor: isToday
                        ? theme.colors.focus
                        : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      textVariants.label,
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
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    gap: 2,
  },
  days: {
    gap: 6,
  },
  week: {
    flexDirection: 'row',
    gap: 6,
  },
  day: {
    flex: 1,
    height: 40,
  },
  dayFilled: {
    alignItems: 'center',
    borderWidth: 2,
    justifyContent: 'center',
  },
});
