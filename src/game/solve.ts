import { planKey, type LevelDefinition, type Plan, type PlanValue } from './model';
import { simulate } from './simulate';

const enumerate = (
  level: LevelDefinition,
  editIndex: number,
  plan: Partial<Record<string, PlanValue>>,
  output: Plan[],
): void => {
  const edit = level.edits[editIndex];
  if (edit === undefined) {
    output.push({ ...plan });
    return;
  }
  const key = planKey(edit.actor, edit.field);
  for (const value of edit.values) {
    enumerate(level, editIndex + 1, { ...plan, [key]: value }, output);
  }
};

export const enumeratePlans = (level: LevelDefinition): readonly Plan[] => {
  const plans: Plan[] = [];
  enumerate(level, 0, {}, plans);
  return plans;
};

export const solveLevel = (level: LevelDefinition): readonly Plan[] =>
  enumeratePlans(level).filter((plan) =>
    level.scenarios.every((scenario) => simulate(level, plan, scenario).passed),
  );
