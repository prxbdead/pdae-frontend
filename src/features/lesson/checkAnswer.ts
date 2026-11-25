import type { Answer, AnswerKey, Exercise } from '@/api/contracts';

export interface AnswerCheck {
  correct: boolean;
  explanation?: string;
  correctAnswer: Answer;
}

const RISK_TOLERANCE = 0.01;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function sameOrdered(left: string[], right: string[]): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function sameUnordered(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const a = [...left].sort();
  const b = [...right].sort();

  return a.every((value, index) => value === b[index]);
}

/**
 * Grades one answer against the bundled answer key. Comparison is per
 * exercise type: text is trimmed and case-folded, pairs and hotspots are
 * unordered sets, steps are an exact order, and risk accepts a small numeric
 * tolerance so a rounded position size still passes.
 */
export function checkAnswer(
  exercise: Exercise,
  answer: Answer,
  answerKey: AnswerKey,
): AnswerCheck {
  const key = answerKey[exercise.id];
  const explanation = exercise.explanation;
  const verdict = (correct: boolean): AnswerCheck => ({
    correct,
    explanation,
    correctAnswer: key ?? answer,
  });

  if (!key) {
    return verdict(false);
  }

  switch (exercise.type) {
    case 'multiple_choice':
      if (answer.type === 'multiple_choice' && key.type === 'multiple_choice') {
        return verdict(answer.optionId === key.optionId);
      }
      break;

    case 'true_false':
      if (answer.type === 'true_false' && key.type === 'true_false') {
        return verdict(answer.value === key.value);
      }
      break;

    case 'fill_blank':
      if (answer.type === 'fill_blank' && key.type === 'fill_blank') {
        return verdict(
          sameOrdered(
            answer.values.map(normalize),
            key.values.map(normalize),
          ),
        );
      }
      break;

    case 'match_pairs':
      if (answer.type === 'match_pairs' && key.type === 'match_pairs') {
        return verdict(
          sameOrdered(
            answer.pairs.map((pair) => `${pair.left}::${pair.right}`).sort(),
            key.pairs.map((pair) => `${pair.left}::${pair.right}`).sort(),
          ),
        );
      }
      break;

    case 'order_steps':
      if (answer.type === 'order_steps' && key.type === 'order_steps') {
        return verdict(sameOrdered(answer.stepIds, key.stepIds));
      }
      break;

    case 'read_chart':
      if (answer.type === 'read_chart' && key.type === 'read_chart') {
        return verdict(answer.optionId === key.optionId);
      }
      break;

    case 'spot_scam':
      if (answer.type === 'spot_scam' && key.type === 'spot_scam') {
        return verdict(sameUnordered(answer.hotspotIds, key.hotspotIds));
      }
      break;

    case 'risk_calculator':
      if (
        answer.type === 'risk_calculator' &&
        key.type === 'risk_calculator'
      ) {
        return verdict(
          Math.abs(answer.positionSize - key.positionSize) <= RISK_TOLERANCE,
        );
      }
      break;

    case 'dca_timeline':
      if (answer.type === 'dca_timeline' && key.type === 'dca_timeline') {
        return verdict(answer.action === key.action);
      }
      break;

    case 'story_card':
      if (answer.type === 'story_card' && key.type === 'story_card') {
        return verdict(answer.optionId === key.optionId);
      }
      break;
  }

  return verdict(false);
}

/**
 * Whether an answer is complete enough to check. A partially filled blank or
 * a half-built pair list keeps the Check button disabled.
 */
export function isAnswerReady(
  exercise: Exercise,
  answer: Answer | undefined,
): boolean {
  if (!answer || answer.type !== exercise.type) {
    return false;
  }

  switch (exercise.type) {
    case 'multiple_choice':
      return (
        answer.type === 'multiple_choice' &&
        exercise.options.some((option) => option.id === answer.optionId)
      );

    case 'true_false':
      return answer.type === 'true_false';

    case 'fill_blank':
      return (
        answer.type === 'fill_blank' &&
        answer.values.length === exercise.blankCount &&
        answer.values.every((value) => value.trim().length > 0)
      );

    case 'match_pairs':
      return (
        answer.type === 'match_pairs' &&
        answer.pairs.length === exercise.left.length
      );

    case 'order_steps':
      return (
        answer.type === 'order_steps' &&
        answer.stepIds.length === exercise.steps.length
      );

    case 'read_chart':
      return (
        answer.type === 'read_chart' &&
        exercise.options.some((option) => option.id === answer.optionId)
      );

    case 'spot_scam':
      return answer.type === 'spot_scam' && answer.hotspotIds.length > 0;

    case 'risk_calculator':
      return (
        answer.type === 'risk_calculator' &&
        Number.isFinite(answer.positionSize) &&
        answer.positionSize > 0
      );

    case 'dca_timeline':
      return (
        answer.type === 'dca_timeline' &&
        exercise.options.includes(answer.action)
      );

    case 'story_card':
      return (
        answer.type === 'story_card' &&
        exercise.options.some((option) => option.id === answer.optionId)
      );
  }
}

/** Human-readable text for the correct answer shown after a miss. */
export function describeAnswer(
  exercise: Exercise,
  answer: Answer | undefined,
): string {
  if (!answer || answer.type !== exercise.type) {
    return '';
  }

  switch (exercise.type) {
    case 'multiple_choice':
    case 'read_chart':
    case 'story_card': {
      if (
        answer.type !== 'multiple_choice' &&
        answer.type !== 'read_chart' &&
        answer.type !== 'story_card'
      ) {
        return '';
      }

      const option = exercise.options.find(
        (entry) => entry.id === answer.optionId,
      );

      return option?.text ?? '';
    }

    case 'true_false':
      return answer.type === 'true_false'
        ? answer.value
          ? 'True'
          : 'False'
        : '';

    case 'fill_blank':
      return answer.type === 'fill_blank' ? answer.values.join(', ') : '';

    case 'match_pairs':
      if (answer.type !== 'match_pairs') {
        return '';
      }

      return answer.pairs
        .map((pair) => {
          const left = exercise.left.find((entry) => entry.id === pair.left);
          const right = exercise.right.find((entry) => entry.id === pair.right);

          return `${left?.text ?? pair.left} → ${right?.text ?? pair.right}`;
        })
        .join('; ');

    case 'order_steps':
      if (answer.type !== 'order_steps') {
        return '';
      }

      return answer.stepIds
        .map((id) => exercise.steps.find((step) => step.id === id)?.text ?? id)
        .join(' → ');

    case 'spot_scam':
      if (answer.type !== 'spot_scam') {
        return '';
      }

      return answer.hotspotIds
        .map(
          (id) =>
            exercise.hotspots.find((hotspot) => hotspot.id === id)?.label ?? id,
        )
        .join(', ');

    case 'risk_calculator':
      return answer.type === 'risk_calculator'
        ? `${answer.positionSize} units`
        : '';

    case 'dca_timeline':
      return answer.type === 'dca_timeline' ? answer.action : '';
  }
}
