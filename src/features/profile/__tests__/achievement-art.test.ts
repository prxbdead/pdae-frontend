import { achievementArtwork } from '../achievementArt';

describe('achievementArtwork', () => {
  it('matches locally derived achievements by id, ignoring the local- prefix', () => {
    expect(
      achievementArtwork({ id: 'local-seven-day-streak', title: 'Anything' }),
    ).toBe('achievement-seven-day-streak');
  });

  it('matches server achievements by title', () => {
    expect(achievementArtwork({ id: 'achievement-4', title: 'Risk aware' })).toBe(
      'achievement-risk-aware',
    );
  });

  it('falls back to the level coin for unknown achievements', () => {
    expect(achievementArtwork({ id: 'x-1', title: 'Brand new thing' })).toBe(
      'level',
    );
  });
});
