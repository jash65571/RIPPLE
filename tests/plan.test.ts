import { describe, expect, it } from 'vitest';
import { campaign } from '../src/content/campaign';
import { applyPlanEdit, createPlanState, planCost, redoPlanEdit, resetPlan, undoPlanEdit } from '../src/game/plan';

describe('plan history', () => {
  const level = campaign[0]!;

  it('charges a field once and refunds a return to baseline', () => {
    let state = createPlanState();
    state = applyPlanEdit(level, state, 'R.route', 'garden');
    expect(planCost(level, state.plan)).toBe(1);
    state = applyPlanEdit(level, state, 'R.route', 'crossing');
    expect(planCost(level, state.plan)).toBe(0);
  });

  it('undoes, redoes, and clears redo after a branch', () => {
    const changed = applyPlanEdit(level, createPlanState(), 'R.route', 'garden');
    const undone = undoPlanEdit(changed);
    expect(undone.plan).toEqual({});
    expect(redoPlanEdit(undone).plan).toEqual({ 'R.route': 'garden' });
    expect(applyPlanEdit(level, undone, 'R.route', 'crossing').redo).toEqual([]);
  });

  it('keeps a recovery snapshot when reset', () => {
    const changed = applyPlanEdit(level, createPlanState(), 'R.route', 'garden');
    const reset = resetPlan(changed);
    expect(reset.plan).toEqual({});
    expect(reset.recovery).toEqual({ 'R.route': 'garden' });
  });

  it('rejects edits to fixed fields and values outside the domain', () => {
    expect(() => applyPlanEdit(level, createPlanState(), 'B.route', 'main')).toThrow(/not allowed/i);
    expect(() => applyPlanEdit(level, createPlanState(), 'R.route', 'quay')).toThrow(/not allowed/i);
  });
});
