import type { Answer, Exercise } from '@/api/contracts';

import { DcaTimeline } from './DcaTimeline';
import { FillBlank } from './FillBlank';
import { MatchPairs } from './MatchPairs';
import { MultipleChoice } from './MultipleChoice';
import { OrderSteps } from './OrderSteps';
import { ReadChart } from './ReadChart';
import { RiskCalculator } from './RiskCalculator';
import { SpotScam } from './SpotScam';
import { StoryCard } from './StoryCard';
import { TrueFalse } from './TrueFalse';

export interface ExerciseRendererProps {
  exercise: Exercise;
  answer: Answer | undefined;
  onChange(answer: Answer): void;
  disabled?: boolean;
}

/** Dispatches one exercise variant to its renderer. */
export function ExerciseRenderer({
  exercise,
  answer,
  onChange,
  disabled,
}: ExerciseRendererProps) {
  switch (exercise.type) {
    case 'multiple_choice':
      return (
        <MultipleChoice
          exercise={exercise}
          answer={answer}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'true_false':
      return (
        <TrueFalse
          exercise={exercise}
          answer={answer}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'fill_blank':
      return (
        <FillBlank
          exercise={exercise}
          answer={answer}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'match_pairs':
      return (
        <MatchPairs
          exercise={exercise}
          answer={answer}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'order_steps':
      return (
        <OrderSteps
          exercise={exercise}
          answer={answer}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'read_chart':
      return (
        <ReadChart
          exercise={exercise}
          answer={answer}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'spot_scam':
      return (
        <SpotScam
          exercise={exercise}
          answer={answer}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'risk_calculator':
      return (
        <RiskCalculator
          exercise={exercise}
          answer={answer}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'dca_timeline':
      return (
        <DcaTimeline
          exercise={exercise}
          answer={answer}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'story_card':
      return (
        <StoryCard
          exercise={exercise}
          answer={answer}
          onChange={onChange}
          disabled={disabled}
        />
      );
  }
}
