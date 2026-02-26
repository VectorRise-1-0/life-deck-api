import { computeStreak } from '../../src/modules/progress/streak.service';

describe('computeStreak', () => {
  const today = new Date('2024-01-15T00:00:00.000Z');
  const yesterday = new Date('2024-01-14T00:00:00.000Z');
  const twoDaysAgo = new Date('2024-01-13T00:00:00.000Z');

  it('starts streak at 1 for first ever activity', () => {
    const result = computeStreak(undefined, today, 0, 0);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
  });

  it('extends streak when active yesterday', () => {
    const result = computeStreak(yesterday, today, 5, 5);
    expect(result.currentStreak).toBe(6);
    expect(result.longestStreak).toBe(6);
  });

  it('keeps streak when active today already', () => {
    const result = computeStreak(today, today, 5, 10);
    expect(result.currentStreak).toBe(5);
    expect(result.longestStreak).toBe(10);
  });

  it('resets streak to 1 when more than 1 day missed', () => {
    const result = computeStreak(twoDaysAgo, today, 10, 15);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(15); // longest preserved
  });

  it('updates longestStreak when new streak exceeds it', () => {
    const result = computeStreak(yesterday, today, 20, 15);
    expect(result.currentStreak).toBe(21);
    expect(result.longestStreak).toBe(21);
  });
});
