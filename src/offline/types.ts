import type { SubmittedAnswer } from '@/api/contracts';

export interface LocalAttemptResult {
  clientAttemptId: string;
  lessonId: string;
  startedAt: string;
  completedAt: string;
  answers: SubmittedAnswer[];
  score: number;
  passed: boolean;
  xpEarned: number;
  heartsLost: number;
  mistakes: string[];
}

export interface LocalLessonProgress {
  lessonId: string;
  status: 'in_progress' | 'completed';
  bestScore?: number;
  attempts: number;
  lastAttemptAt?: string;
}

export type SyncState =
  | 'idle'
  | 'syncing'
  | 'offline'
  | 'paused_auth'
  | 'error';

export interface SyncStatus {
  state: SyncState;
  pending: number;
  lastSyncedAt: string | null;
  lastError?: string;
}
