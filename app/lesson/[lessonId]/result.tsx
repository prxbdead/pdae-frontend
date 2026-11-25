import { useLocalSearchParams } from 'expo-router';

import { ResultScreen } from '@/features/lesson/ResultScreen';

export default function LessonResultRoute() {
  const { lessonId, attemptId } = useLocalSearchParams<{
    lessonId: string;
    attemptId?: string;
  }>();

  return <ResultScreen lessonId={lessonId} attemptId={attemptId} />;
}
