import type { Answer, Exercise } from '@/api/contracts';

import { OptionList } from './OptionList';

export type MultipleChoiceExercise = Extract<
  Exercise,
  { type: 'multiple_choice' }
>;

export interface MultipleChoiceProps {
  exercise: MultipleChoiceExercise;
  answer: Answer | undefined;
  onChange(answer: Answer): void;
  disabled?: boolean;
}

export function MultipleChoice({
  exercise,
  answer,
  onChange,
  disabled,
}: MultipleChoiceProps) {
  const selectedId =
    answer?.type === 'multiple_choice' ? answer.optionId : null;

  return (
    <OptionList
      options={exercise.options}
      selectedId={selectedId}
      onSelect={(optionId) => onChange({ type: 'multiple_choice', optionId })}
      disabled={disabled}
      testIDPrefix={`option-${exercise.id}`}
    />
  );
}
