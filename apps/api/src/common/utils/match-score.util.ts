export interface MatchScoreInput {
  currentInterestCount: number;
  otherInterestCount: number;
  sharedInterestCount: number;
  sameCity: boolean;
}

export function computeMatchScore(input: MatchScoreInput): number {
  const unionCount =
    input.currentInterestCount +
    input.otherInterestCount -
    input.sharedInterestCount;

  const interestScore =
    unionCount === 0 ? 0 : input.sharedInterestCount / unionCount;

  const cityScore = input.sameCity ? 1 : 0;

  return interestScore * 0.7 + cityScore * 0.3;
}
