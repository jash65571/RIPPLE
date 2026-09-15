import { campaign } from '../src/content/campaign/index.ts';
import { planCost } from '../src/game/plan.ts';
import { enumeratePlans, solveLevel } from '../src/game/solve.ts';
import { simulate } from '../src/game/simulate.ts';

const expectedSolutions: Readonly<Record<string, Readonly<Record<string, string | number>>>> = {
  '01': { 'R.route': 'garden' },
  '02': { 'R.start': 2 },
  '03': { 'B.route': 'quay' },
  '04': { 'R.route': 'direct' },
  '05': { 'R.route': 'side-door' },
  '06': { 'R.route': 'garden', 'C.route': 'quay' },
  '07': { 'R.route': 'garden' },
  '08': { 'R.start': 4 },
  '09': { 'R.route': 'garden' },
  '10': { 'R.route': 'garden', 'C.route': 'quay' },
};

let enumeratedCount = 0;
for (const level of campaign) {
  const baselinePasses = level.scenarios.every((scenario) => simulate(level, {}, scenario).passed);
  if (baselinePasses) {
    throw new Error(`Level ${level.id} baseline unexpectedly passes.`);
  }
  const plans = enumeratePlans(level);
  enumeratedCount += plans.length;
  const solutions = solveLevel(level);
  if (solutions.length !== 1) {
    throw new Error(`Level ${level.id} has ${solutions.length} passing plans instead of one.`);
  }
  const solution = solutions[0]!;
  if (JSON.stringify(solution) !== JSON.stringify(expectedSolutions[level.id])) {
    throw new Error(`Level ${level.id} solution does not match the reference outcome.`);
  }
  if (planCost(level, solution) !== level.budget) {
    throw new Error(`Level ${level.id} solution does not use its declared budget.`);
  }
  const outcomes = level.scenarios.map((scenario) => {
    const result = simulate(level, solution, scenario);
    return `${scenario.id} ${Object.entries(result.arrivals).map(([actor, beat]) => `${actor}=${beat}`).join(', ')}`;
  });
  console.log(`Level ${level.id}: ${plans.length} plans, unique solution, ${outcomes.join('; ')}`);
}

if (enumeratedCount !== 36) {
  throw new Error(`Enumerated ${enumeratedCount} plans instead of 36.`);
}

console.log(`Verified ${campaign.length} levels and ${enumeratedCount} allowed plan combinations.`);
