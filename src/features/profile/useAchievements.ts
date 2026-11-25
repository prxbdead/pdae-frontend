import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useApi } from '@/api/ApiProvider';
import type { Achievement } from '@/api/contracts';
import { mergeAchievements } from '@/features/gamification/achievements';
import { useProgressStore } from '@/stores/progressStore';

export interface LocalAchievementInput {
  completedLessons: number;
  perfectLessons: number;
  currentStreak: number;
  xpToday: number;
  dailyGoalXp: number;
}

/**
 * The small set of badges the device can prove without the server. They only
 * fill the grid when the achievements request cannot reach the API.
 */
export function buildLocalAchievements(
  input: LocalAchievementInput,
): Achievement[] {
  const now = new Date().toISOString();
  const firstEarned = input.completedLessons >= 1;
  const streakEarned = input.currentStreak >= 7;
  const perfectEarned = input.perfectLessons >= 1;
  const goalEarned = input.xpToday >= input.dailyGoalXp;

  return [
    {
      id: 'local-first-steps',
      title: 'First steps',
      description: 'Complete your first lesson.',
      icon: 'star',
      earnedAt: firstEarned ? now : null,
      progress: Math.min(input.completedLessons, 1),
      target: 1,
    },
    {
      id: 'local-seven-day-streak',
      title: 'Seven-day streak',
      description: 'Keep a lesson streak alive for seven days.',
      icon: 'fire',
      earnedAt: streakEarned ? now : null,
      progress: Math.min(input.currentStreak, 7),
      target: 7,
    },
    {
      id: 'local-perfect-lesson',
      title: 'Perfect lesson',
      description: 'Finish a lesson with every answer right first time.',
      icon: 'check',
      earnedAt: perfectEarned ? now : null,
      progress: Math.min(input.perfectLessons, 1),
      target: 1,
    },
    {
      id: 'local-daily-goal',
      title: 'Daily goal',
      description: 'Reach your XP goal in a single day.',
      icon: 'bolt',
      earnedAt: goalEarned ? now : null,
      progress: Math.min(input.xpToday, input.dailyGoalXp),
      target: input.dailyGoalXp,
    },
  ];
}

export interface AchievementsQuery {
  data: Achievement[];
  isLoading: boolean;
  error: unknown;
  isLocal: boolean;
  refresh(): void;
}

export function useAchievements(): AchievementsQuery {
  const { client } = useApi();
  const lessons = useProgressStore((state) => state.lessons);
  const currentStreak = useProgressStore((state) => state.streak.current);
  const xpToday = useProgressStore((state) => state.xpToday);
  const dailyGoalXp = useProgressStore((state) => state.dailyGoalXp);
  const query = useQuery({
    queryKey: ['achievements'],
    queryFn: () => client.achievements.list(),
    staleTime: 60_000,
  });

  const local = useMemo(() => {
    const entries = Object.values(lessons);

    return buildLocalAchievements({
      completedLessons: entries.filter((lesson) => lesson.status === 'completed')
        .length,
      perfectLessons: entries.filter((lesson) => lesson.bestScore === 1).length,
      currentStreak,
      xpToday,
      dailyGoalXp,
    });
  }, [currentStreak, dailyGoalXp, lessons, xpToday]);

  const data = useMemo(
    () =>
      query.data ? mergeAchievements(query.data, []) : local,
    [local, query.data],
  );

  return {
    data,
    isLoading: query.isPending && !query.data,
    error: query.error ?? null,
    isLocal: !query.data && Boolean(query.error),
    refresh: () => {
      void query.refetch();
    },
  };
}
