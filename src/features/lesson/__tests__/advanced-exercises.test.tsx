import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState, type ReactElement } from 'react';

import type { Answer, Exercise } from '@/api/contracts';
import { mockPack } from '@/content/fixtures/pack';
import { ThemeProvider } from '@/theme/ThemeProvider';

import { DcaTimeline } from '../components/DcaTimeline';
import { FillBlank } from '../components/FillBlank';
import { MatchPairs } from '../components/MatchPairs';
import { MultipleChoice } from '../components/MultipleChoice';
import { OrderSteps } from '../components/OrderSteps';
import { ReadChart } from '../components/ReadChart';
import { RiskCalculator } from '../components/RiskCalculator';
import { SpotScam } from '../components/SpotScam';
import { StoryCard } from '../components/StoryCard';
import { TrueFalse } from '../components/TrueFalse';

function fixture<Type extends Exercise['type']>(
  exerciseId: string,
): Extract<Exercise, { type: Type }> {
  for (const lesson of mockPack.lessons) {
    const exercise = lesson.exercises.find((entry) => entry.id === exerciseId);

    if (exercise) {
      return exercise as Extract<Exercise, { type: Type }>;
    }
  }

  throw new Error(`Missing exercise ${exerciseId}`);
}

function renderExercise(node: ReactElement) {
  return render(<ThemeProvider>{node}</ThemeProvider>);
}

describe('MultipleChoice', () => {
  it('emits the selected option id', () => {
    const onChange = jest.fn();

    renderExercise(
      <MultipleChoice
        exercise={fixture<'multiple_choice'>('foundations-1-e1')}
        answer={undefined}
        onChange={onChange}
      />,
    );

    fireEvent.press(screen.getByTestId('option-foundations-1-e1-b'));

    expect(onChange).toHaveBeenCalledWith({
      type: 'multiple_choice',
      optionId: 'b',
    });
  });

  it('marks the current answer as selected', () => {
    renderExercise(
      <MultipleChoice
        exercise={fixture<'multiple_choice'>('foundations-1-e1')}
        answer={{ type: 'multiple_choice', optionId: 'a' }}
        onChange={jest.fn()}
      />,
    );

    expect(
      screen.getByTestId('option-foundations-1-e1-a').props.accessibilityState,
    ).toMatchObject({ selected: true });
  });
});

describe('TrueFalse', () => {
  it('emits the chosen boolean', () => {
    const onChange = jest.fn();

    renderExercise(
      <TrueFalse
        exercise={fixture<'true_false'>('foundations-1-e2')}
        answer={undefined}
        onChange={onChange}
      />,
    );

    fireEvent.press(screen.getByTestId('true-false-foundations-1-e2-false'));

    expect(onChange).toHaveBeenCalledWith({
      type: 'true_false',
      value: false,
    });
  });
});

describe('FillBlank', () => {
  it('reports every typed blank', () => {
    const onChange = jest.fn();

    function Controlled() {
      const [answer, setAnswer] = useState<Answer | undefined>(undefined);

      return (
        <FillBlank
          exercise={fixture<'fill_blank'>('foundations-1-e3')}
          answer={answer}
          onChange={(next) => {
            onChange(next);
            setAnswer(next);
          }}
        />
      );
    }

    renderExercise(<Controlled />);

    fireEvent.changeText(
      screen.getByTestId('fill-blank-foundations-1-e3-0'),
      'wallet',
    );

    expect(onChange).toHaveBeenLastCalledWith({
      type: 'fill_blank',
      values: ['wallet', ''],
    });
    // The controlled parent now feeds the first value back in.

    fireEvent.changeText(
      screen.getByTestId('fill-blank-foundations-1-e3-1'),
      'key',
    );

    expect(onChange).toHaveBeenLastCalledWith({
      type: 'fill_blank',
      values: ['wallet', 'key'],
    });
  });
});

describe('MatchPairs', () => {
  it('pairs a selected left item with a right item', () => {
    const onChange = jest.fn();

    renderExercise(
      <MatchPairs
        exercise={fixture<'match_pairs'>('foundations-1-e4')}
        answer={undefined}
        onChange={onChange}
      />,
    );

    fireEvent.press(screen.getByTestId('match-left-l1'));
    fireEvent.press(screen.getByTestId('match-right-r1'));

    expect(onChange).toHaveBeenCalledWith({
      type: 'match_pairs',
      pairs: [{ left: 'l1', right: 'r1' }],
    });
  });

  it('removes an existing pair', () => {
    const onChange = jest.fn();

    renderExercise(
      <MatchPairs
        exercise={fixture<'match_pairs'>('foundations-1-e4')}
        answer={{
          type: 'match_pairs',
          pairs: [{ left: 'l1', right: 'r1' }],
        }}
        onChange={onChange}
      />,
    );

    expect(screen.getByText(/Private key → Never share it/)).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('match-remove-l1-r1'));

    expect(onChange).toHaveBeenCalledWith({
      type: 'match_pairs',
      pairs: [],
    });
  });
});

describe('OrderSteps', () => {
  it('moves a step and emits the new order', () => {
    const onChange = jest.fn();

    renderExercise(
      <OrderSteps
        exercise={fixture<'order_steps'>('foundations-2-e2')}
        answer={undefined}
        onChange={onChange}
      />,
    );

    expect(screen.getByText('Step 1 of 3')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('order-down-s2'));

    expect(onChange).toHaveBeenCalledWith({
      type: 'order_steps',
      stepIds: ['s3', 's2', 's1'],
    });
  });
});

describe('ReadChart', () => {
  it('renders the chart accessibly and emits an option', () => {
    const onChange = jest.fn();

    renderExercise(
      <ReadChart
        exercise={fixture<'read_chart'>('price-action-1-e1')}
        answer={undefined}
        onChange={onChange}
      />,
    );

    expect(
      screen.getByLabelText(/Chart with 3 candles/),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('chart-option-price-action-1-e1-c2'));

    expect(onChange).toHaveBeenCalledWith({
      type: 'read_chart',
      optionId: 'c2',
    });
  });
});

describe('SpotScam', () => {
  it('toggles a hotspot into the selected set', () => {
    const onChange = jest.fn();

    renderExercise(
      <SpotScam
        exercise={fixture<'spot_scam'>('safety-1-e1')}
        answer={undefined}
        onChange={onChange}
      />,
    );

    fireEvent.press(screen.getByTestId('hotspot-h1'));

    expect(onChange).toHaveBeenCalledWith({
      type: 'spot_scam',
      hotspotIds: ['h1'],
    });
  });
});

describe('RiskCalculator', () => {
  it('rejects a zero size and emits a valid one', () => {
    const onChange = jest.fn();

    renderExercise(
      <RiskCalculator
        exercise={fixture<'risk_calculator'>('investing-1-e3')}
        answer={undefined}
        onChange={onChange}
      />,
    );

    fireEvent.changeText(
      screen.getByTestId('risk-input-investing-1-e3'),
      '0',
    );

    expect(onChange).toHaveBeenLastCalledWith({
      type: 'risk_calculator',
      positionSize: 0,
    });
    expect(screen.getByText(/greater than zero/)).toBeOnTheScreen();

    fireEvent.changeText(
      screen.getByTestId('risk-input-investing-1-e3'),
      '200',
    );

    expect(onChange).toHaveBeenLastCalledWith({
      type: 'risk_calculator',
      positionSize: 200,
    });
  });
});

describe('DcaTimeline', () => {
  it('emits the chosen action', () => {
    const onChange = jest.fn();

    renderExercise(
      <DcaTimeline
        exercise={fixture<'dca_timeline'>('investing-1-e1')}
        answer={undefined}
        onChange={onChange}
      />,
    );

    fireEvent.press(screen.getByTestId('dca-buy'));

    expect(onChange).toHaveBeenCalledWith({
      type: 'dca_timeline',
      action: 'buy',
    });
  });
});

describe('StoryCard', () => {
  it('emits the chosen option', () => {
    const onChange = jest.fn();

    renderExercise(
      <StoryCard
        exercise={fixture<'story_card'>('foundations-2-e4')}
        answer={undefined}
        onChange={onChange}
      />,
    );

    fireEvent.press(screen.getByTestId('story-option-foundations-2-e4-b'));

    expect(onChange).toHaveBeenCalledWith({
      type: 'story_card',
      optionId: 'b',
    });
  });
});

it('every bundled lesson exposes an answer key for each exercise', () => {
  mockPack.lessons.forEach((lesson) => {
    lesson.exercises.forEach((exercise) => {
      expect(lesson.answerKey[exercise.id]).toBeDefined();
    });
  });
});
