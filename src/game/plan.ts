import { planKey, type LevelDefinition, type Plan, type PlanKey, type PlanValue } from './model';
import { validatePlan } from './validate';

export interface PlanState {
  readonly plan: Plan;
  readonly undo: readonly Plan[];
  readonly redo: readonly Plan[];
  readonly recovery: Plan | null;
  readonly revision: number;
}

const HISTORY_LIMIT = 40;

export const createPlanState = (plan: Plan = {}): PlanState => ({
  plan,
  undo: [],
  redo: [],
  recovery: null,
  revision: 0,
});

export const planCost = (level: LevelDefinition, plan: Plan): number =>
  level.edits.reduce((cost, edit) => {
    const actor = level.actors.find((candidate) => candidate.id === edit.actor)!;
    const baseline = edit.field === 'route' ? actor.defaultRoute : actor.start;
    return cost + (plan[planKey(edit.actor, edit.field)] !== undefined && plan[planKey(edit.actor, edit.field)] !== baseline ? 1 : 0);
  }, 0);

const withPlan = (state: PlanState, nextPlan: Plan): PlanState => ({
  plan: nextPlan,
  undo: [...state.undo, state.plan].slice(-HISTORY_LIMIT),
  redo: [],
  recovery: state.recovery,
  revision: state.revision + 1,
});

export const applyPlanEdit = (
  level: LevelDefinition,
  state: PlanState,
  key: PlanKey,
  value: PlanValue,
): PlanState => {
  const next = validatePlan(level, { ...state.plan, [key]: value });
  if (state.plan[key] === next[key]) {
    return state;
  }
  return withPlan(state, next);
};

export const undoPlanEdit = (state: PlanState): PlanState => {
  const previous = state.undo.at(-1);
  if (previous === undefined) {
    return state;
  }
  return {
    plan: previous,
    undo: state.undo.slice(0, -1),
    redo: [state.plan, ...state.redo].slice(0, HISTORY_LIMIT),
    recovery: state.recovery,
    revision: state.revision + 1,
  };
};

export const redoPlanEdit = (state: PlanState): PlanState => {
  const next = state.redo[0];
  if (next === undefined) {
    return state;
  }
  return {
    plan: next,
    undo: [...state.undo, state.plan].slice(-HISTORY_LIMIT),
    redo: state.redo.slice(1),
    recovery: state.recovery,
    revision: state.revision + 1,
  };
};

export const resetPlan = (state: PlanState): PlanState => ({
  plan: {},
  undo: [...state.undo, state.plan].slice(-HISTORY_LIMIT),
  redo: [],
  recovery: state.plan,
  revision: state.revision + 1,
});

export const revealSolution = (level: LevelDefinition, state: PlanState, solution: Plan): PlanState => ({
  ...withPlan(state, validatePlan(level, solution)),
  recovery: state.plan,
});

export const restoreRecovery = (level: LevelDefinition, state: PlanState): PlanState => {
  if (state.recovery === null) {
    return state;
  }
  return {
    ...withPlan(state, validatePlan(level, state.recovery)),
    recovery: null,
  };
};
