import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { textVariants } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const MINUTE_MS = 60_000;

function remaining(endsAt: string, now: number): string {
  const end = new Date(endsAt).getTime();

  if (!Number.isFinite(end)) {
    return 'Ends soon';
  }

  const delta = end - now;

  if (delta <= 0) {
    return 'Ended';
  }

  const totalMinutes = Math.floor(delta / MINUTE_MS);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return `Ends in ${days}d ${hours}h ${minutes}m`;
}

export interface CountdownProps {
  endsAt: string;
  color?: string;
  /** Test seam; defaults to the real clock. */
  now?: number;
}

export function Countdown({ endsAt, color, now }: CountdownProps) {
  const theme = useTheme();
  const [current, setCurrent] = useState(() => now ?? Date.now());

  useEffect(() => {
    if (now !== undefined) {
      return;
    }

    const timer = setInterval(() => setCurrent(Date.now()), MINUTE_MS);

    return () => clearInterval(timer);
  }, [now]);

  return (
    <Text
      testID="league-countdown"
      style={[textVariants.label, { color: color ?? theme.colors.text }]}
    >
      {remaining(endsAt, now ?? current)}
    </Text>
  );
}
