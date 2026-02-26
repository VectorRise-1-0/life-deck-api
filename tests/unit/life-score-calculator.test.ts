import {
  calculateLifeScore,
  updateDomainScore,
} from '../../src/modules/progress/life-score-calculator';

describe('Life Score Calculator', () => {
  describe('calculateLifeScore', () => {
    it('returns the average of four domain scores', () => {
      expect(calculateLifeScore({ health: 80, finance: 60, productivity: 70, mindfulness: 90 })).toBe(75);
    });

    it('returns 50 when all scores are 50 (default)', () => {
      expect(calculateLifeScore({ health: 50, finance: 50, productivity: 50, mindfulness: 50 })).toBe(50);
    });

    it('handles edge case of all zeros', () => {
      expect(calculateLifeScore({ health: 0, finance: 0, productivity: 0, mindfulness: 0 })).toBe(0);
    });
  });

  describe('updateDomainScore', () => {
    it('increases score on card completion', () => {
      const newScore = updateDomainScore(50, 2, 5, 'completed');
      // scoreChange = 5 * (1 + 2 * 0.1) = 5 * 1.2 = 6
      expect(newScore).toBe(56);
    });

    it('decreases score by 0.5 on snooze', () => {
      const newScore = updateDomainScore(50, 2, 5, 'snoozed');
      expect(newScore).toBe(49.5);
    });

    it('does not change score on skip', () => {
      const newScore = updateDomainScore(50, 2, 5, 'skipped');
      expect(newScore).toBe(50);
    });

    it('clamps score at 100 maximum', () => {
      const newScore = updateDomainScore(99, 1, 100, 'completed');
      expect(newScore).toBe(100);
    });

    it('clamps score at 0 minimum', () => {
      const newScore = updateDomainScore(0.3, 0, 0, 'snoozed');
      expect(newScore).toBe(0);
    });
  });
});
