import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import type { Answer, Exercise } from '@/api/contracts';
import { useTheme } from '@/theme/useTheme';

export type RiskCalculatorExercise = Extract<
  Exercise,
  { type: 'risk_calculator' }
>;

export interface RiskCalculatorProps {
  exercise: RiskCalculatorExercise;
  answer: Answer | undefined;
  onChange(answer: Answer): void;
  disabled?: boolean;
}

export function RiskCalculator({
  exercise,
  answer,
  onChange,
  disabled,
}: RiskCalculatorProps) {
  const theme = useTheme();
  const [positionInput, setPositionInput] = useState(
    answer?.type === 'risk_calculator' && answer.positionSize > 0
      ? String(answer.positionSize)
      : '',
  );

  const parsed = Number(positionInput);
  const valid =
    positionInput.trim().length > 0 && Number.isFinite(parsed) && parsed > 0;
  const perUnitRisk = Math.abs(exercise.entry - exercise.stop);
  const riskAmount = valid ? perUnitRisk * parsed : 0;
  const riskPercent = valid ? (riskAmount / exercise.balance) * 100 : 0;

  const handleChange = (text: string) => {
    setPositionInput(text);

    const next = Number(text);

    onChange({
      type: 'risk_calculator',
      positionSize: Number.isFinite(next) && next > 0 ? next : 0,
    });
  };

  return (
    <View style={styles.form}>
      <Text style={[theme.typography.body, { color: theme.colors.text }]}>
        Balance {exercise.balance} · risking {exercise.riskPercent}% · entry{' '}
        {exercise.entry} · stop {exercise.stop}
      </Text>

      <Text
        style={[theme.typography.caption, { color: theme.colors.textMuted }]}
      >
        Position size (units)
      </Text>
      <TextInput
        accessibilityLabel="Position size"
        editable={!disabled}
        inputMode="decimal"
        keyboardType="decimal-pad"
        onChangeText={handleChange}
        placeholder="0"
        placeholderTextColor={theme.colors.textMuted}
        testID={`risk-input-${exercise.id}`}
        value={positionInput}
        style={[
          theme.typography.body,
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: valid || positionInput.length === 0
              ? theme.colors.border
              : theme.colors.danger,
            borderRadius: theme.radii.sm,
            color: theme.colors.text,
          },
        ]}
      />

      {!valid && positionInput.length > 0 ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[theme.typography.caption, { color: theme.colors.danger }]}
        >
          Enter a size greater than zero.
        </Text>
      ) : null}

      <Text
        style={[theme.typography.caption, { color: theme.colors.textMuted }]}
      >
        Risk at that size: {riskAmount.toFixed(2)} units (
        {riskPercent.toFixed(1)}% of balance)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 10,
    width: '100%',
  },
  input: {
    borderWidth: 2,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
