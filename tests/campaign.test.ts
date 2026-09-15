import { describe, expect, it } from 'vitest';
import { campaign } from '../src/content/campaign';
import { enumeratePlans, solveLevel } from '../src/game/solve';
import { simulate } from '../src/game/simulate';

const baselineArrivals: Readonly<Record<string, readonly Readonly<Record<string, number>>[]>> = {
  '01': [{ B: 7, R: 4 }],
  '02': [{ B: 5, R: 3 }],
  '03': [{ B: 7 }],
  '04': [{ B: 8, R: 5 }],
  '05': [{ B: 7, R: 5 }],
  '06': [{ B: 7, C: 6, R: 4 }],
  '07': [{ B: 7, R: 4 }, { B: 4, R: 6 }],
  '08': [{ B: 5, R: 3 }, { B: 6, R: 3 }],
  '09': [{ B: 6, R: 4 }, { B: 6, R: 4 }, { B: 3, R: 6 }],
  '10': [{ B: 6, C: 5, R: 4 }, { B: 6, C: 5, R: 4 }, { B: 6, C: 5, R: 5 }],
};

const winningArrivals: Readonly<Record<string, readonly Readonly<Record<string, number>>[]>> = {
  '01': [{ B: 5, R: 4 }],
  '02': [{ B: 4, R: 6 }],
  '03': [{ B: 5 }],
  '04': [{ B: 6, R: 3 }],
  '05': [{ B: 6, R: 6 }],
  '06': [{ B: 4, C: 6, R: 4 }],
  '07': [{ B: 5, R: 4 }, { B: 4, R: 4 }],
  '08': [{ B: 4, R: 7 }, { B: 6, R: 8 }],
  '09': [{ B: 4, R: 5 }, { B: 4, R: 5 }, { B: 3, R: 5 }],
  '10': [{ B: 4, C: 6, R: 5 }, { B: 4, C: 6, R: 5 }, { B: 3, C: 6, R: 5 }],
};

describe('campaign', () => {
  it('contains ten valid levels and 36 finite plan combinations', () => {
    expect(campaign).toHaveLength(10);
    expect(campaign.reduce((count, level) => count + enumeratePlans(level).length, 0)).toBe(36);
  });

  it.each(campaign.map((level) => [level.id, level] as const))(
    'reproduces the baseline and unique winning outcomes for level %s',
    (levelId, level) => {
      expect(level.scenarios.map((scenario) => simulate(level, {}, scenario).arrivals)).toEqual(baselineArrivals[levelId]);
      const solutions = solveLevel(level);
      expect(solutions).toHaveLength(1);
      expect(level.scenarios.map((scenario) => simulate(level, solutions[0]!, scenario).arrivals)).toEqual(
        winningArrivals[levelId],
      );
    },
  );

  it('returns the same trace for repeated runs', () => {
    const level = campaign[9]!;
    const scenario = level.scenarios[2]!;
    const first = simulate(level, {}, scenario);
    expect(simulate(level, {}, scenario)).toEqual(first);
  });
});
