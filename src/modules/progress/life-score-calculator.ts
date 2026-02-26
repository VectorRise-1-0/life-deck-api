import { Domain } from '../../models/UserFocusArea';

export interface DomainScores {
  health: number;
  finance: number;
  productivity: number;
  mindfulness: number;
}

/**
 * Calculates the overall life score as the mean of all four domain scores.
 */
export function calculateLifeScore(domainScores: DomainScores): number {
  const total =
    domainScores.health +
    domainScores.finance +
    domainScores.productivity +
    domainScores.mindfulness;
  return parseFloat((total / 4).toFixed(2));
}

/**
 * Updates a single domain score based on card completion or snooze.
 * Clamps the result between 0 and 100.
 */
export function updateDomainScore(
  currentScore: number,
  cardDifficulty: number,
  cardImpact: number,
  actionType: 'completed' | 'snoozed' | 'skipped'
): number {
  let scoreChange = 0;

  if (actionType === 'completed') {
    scoreChange = cardImpact * (1 + cardDifficulty * 0.1);
  } else if (actionType === 'snoozed') {
    scoreChange = -0.5;
  }
  // 'skipped' has no score impact

  return parseFloat(Math.max(0, Math.min(100, currentScore + scoreChange)).toFixed(2));
}

/**
 * Maps a domain string to its corresponding UserProgress field key.
 */
export function domainToProgressField(domain: Domain): keyof DomainScores {
  return domain as keyof DomainScores;
}
