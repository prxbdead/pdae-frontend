import { StyleSheet, View } from 'react-native';

import type { Answer, Exercise } from '@/api/contracts';

import { CandleChart } from './CandleChart';
import { OptionList } from './OptionList';

export type ReadChartExercise = Extract<Exercise, { type: 'read_chart' }>;

export interface ReadChartProps {
  exercise: ReadChartExercise;
  answer: Answer | undefined;
  onChange(answer: Answer): void;
  disabled?: boolean;
}

export function ReadChart({
  exercise,
  answer,
  onChange,
  disabled,
}: ReadChartProps) {
  const selectedId =
    answer?.type === 'read_chart' ? answer.optionId : null;

  return (
    <View style={styles.container}>
      <CandleChart candles={exercise.candles} />
      <OptionList
        options={exercise.options}
        selectedId={selectedId}
        onSelect={(optionId) => onChange({ type: 'read_chart', optionId })}
        disabled={disabled}
        testIDPrefix={`chart-option-${exercise.id}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    width: '100%',
  },
});
