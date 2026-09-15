import {
  CAMPAIGN_LIMITS,
  planKey,
  type ActorDefinition,
  type Closure,
  type EditDefinition,
  type LevelDefinition,
  type Plan,
  type PlanValue,
  type ScenarioDefinition,
} from './model';

export class ValidationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(issues.join(' '));
    this.name = 'ValidationError';
    this.issues = issues;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isSafeId = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]{0,39}$/.test(value);

const isBeat = (value: unknown): value is number =>
  Number.isInteger(value) && Number(value) >= 0 && Number(value) <= CAMPAIGN_LIMITS.horizon;

const assertRecordOfBeats = (value: unknown, path: string): Record<string, number> => {
  if (!isRecord(value)) {
    throw new ValidationError([`${path} must be an object.`]);
  }

  const result: Record<string, number> = {};
  for (const [key, beat] of Object.entries(value)) {
    if (!isSafeId(key) || !isBeat(beat)) {
      throw new ValidationError([`${path}.${key} must contain a safe ID and beat.`]);
    }
    result[key] = beat;
  }
  return result;
};

const parseActor = (value: unknown, path: string): ActorDefinition => {
  if (!isRecord(value) || !isSafeId(value.id) || !isBeat(value.start) || !isBeat(value.deadline)) {
    throw new ValidationError([`${path} has an invalid ID, start, or deadline.`]);
  }
  if (!Number.isInteger(value.priority) || !isRecord(value.routes) || !isSafeId(value.defaultRoute)) {
    throw new ValidationError([`${path} has invalid priority or routes.`]);
  }

  const routes: Record<string, readonly (readonly [string | null, number])[]> = {};
  for (const [routeId, steps] of Object.entries(value.routes)) {
    if (!isSafeId(routeId) || !Array.isArray(steps) || steps.length === 0 || steps.length > CAMPAIGN_LIMITS.stepsPerRoute) {
      throw new ValidationError([`${path}.routes.${routeId} has an invalid route.`]);
    }
    routes[routeId] = steps.map((step, stepIndex) => {
      if (!Array.isArray(step) || step.length !== 2) {
        throw new ValidationError([`${path}.routes.${routeId}[${stepIndex}] must be a resource and duration pair.`]);
      }
      const [resource, duration] = step;
      if ((resource !== null && !isSafeId(resource)) || !Number.isInteger(duration) || Number(duration) <= 0) {
        throw new ValidationError([`${path}.routes.${routeId}[${stepIndex}] has an invalid resource or duration.`]);
      }
      return [resource as string | null, Number(duration)] as const;
    });
  }

  if (!(value.defaultRoute in routes)) {
    throw new ValidationError([`${path}.defaultRoute does not name a route.`]);
  }
  if (value.after !== undefined && !isSafeId(value.after)) {
    throw new ValidationError([`${path}.after must be a safe actor ID.`]);
  }

  return {
    id: value.id,
    start: value.start,
    deadline: value.deadline,
    routes,
    defaultRoute: value.defaultRoute,
    priority: Number(value.priority),
    ...(value.after === undefined ? {} : { after: value.after }),
  };
};

const parseEdit = (value: unknown, actors: ReadonlyMap<string, ActorDefinition>, path: string): EditDefinition => {
  if (!isRecord(value) || !isSafeId(value.actor) || !actors.has(value.actor) || !Array.isArray(value.values)) {
    throw new ValidationError([`${path} is invalid.`]);
  }
  if (value.values.length === 0 || value.values.length > CAMPAIGN_LIMITS.choicesPerEdit) {
    throw new ValidationError([`${path}.values is outside the supported size.`]);
  }
  const actor = actors.get(value.actor)!;
  if (value.field === 'route') {
    if (!value.values.every((choice): choice is string => isSafeId(choice) && choice in actor.routes)) {
      throw new ValidationError([`${path} contains an unknown route.`]);
    }
    return { actor: value.actor, field: 'route', values: [...value.values] };
  }
  if (value.field === 'start') {
    if (!value.values.every(isBeat)) {
      throw new ValidationError([`${path} contains an invalid start beat.`]);
    }
    return { actor: value.actor, field: 'start', values: [...value.values] };
  }
  throw new ValidationError([`${path}.field must be route or start.`]);
};

const parseClosures = (value: unknown, path: string): Record<string, readonly Closure[]> => {
  if (!isRecord(value)) {
    throw new ValidationError([`${path} must be an object.`]);
  }
  const closures: Record<string, readonly Closure[]> = {};
  for (const [resourceId, intervals] of Object.entries(value)) {
    if (!isSafeId(resourceId) || !Array.isArray(intervals) || intervals.length > CAMPAIGN_LIMITS.closuresPerResource) {
      throw new ValidationError([`${path}.${resourceId} is invalid.`]);
    }
    let previousEnd = -1;
    closures[resourceId] = intervals.map((interval, index) => {
      if (!Array.isArray(interval) || interval.length !== 2 || !isBeat(interval[0]) || !isBeat(interval[1]) || interval[0] >= interval[1]) {
        throw new ValidationError([`${path}.${resourceId}[${index}] is not a valid half-open interval.`]);
      }
      if (interval[0] < previousEnd) {
        throw new ValidationError([`${path}.${resourceId} must be sorted and non-overlapping.`]);
      }
      previousEnd = interval[1];
      return [interval[0], interval[1]] as const;
    });
  }
  return closures;
};

const parseScenario = (
  value: unknown,
  actors: ReadonlyMap<string, ActorDefinition>,
  editableStarts: ReadonlySet<string>,
  path: string,
): ScenarioDefinition => {
  if (!isRecord(value) || !isSafeId(value.id)) {
    throw new ValidationError([`${path} has an invalid ID.`]);
  }
  const starts = assertRecordOfBeats(value.starts, `${path}.starts`);
  const deadlines = assertRecordOfBeats(value.deadlines, `${path}.deadlines`);
  for (const actorId of [...Object.keys(starts), ...Object.keys(deadlines)]) {
    if (!actors.has(actorId)) {
      throw new ValidationError([`${path} overrides unknown actor ${actorId}.`]);
    }
  }
  for (const actorId of Object.keys(starts)) {
    if (editableStarts.has(actorId)) {
      throw new ValidationError([`${path} cannot override editable start for ${actorId}.`]);
    }
  }
  return { id: value.id, starts, deadlines, closures: parseClosures(value.closures, `${path}.closures`) };
};

const assertAcyclicDependencies = (actors: readonly ActorDefinition[]): void => {
  const byId = new Map(actors.map((actor) => [actor.id, actor]));
  for (const actor of actors) {
    const seen = new Set<string>();
    let current: ActorDefinition | undefined = actor;
    while (current?.after !== undefined) {
      if (!byId.has(current.after)) {
        throw new ValidationError([`Actor ${current.id} depends on unknown actor ${current.after}.`]);
      }
      if (seen.has(current.after) || current.after === actor.id) {
        throw new ValidationError([`Dependency cycle includes actor ${actor.id}.`]);
      }
      seen.add(current.after);
      current = byId.get(current.after);
    }
  }
};

export const parseLevel = (value: unknown): LevelDefinition => {
  if (!isRecord(value) || !isSafeId(value.id) || !Number.isInteger(value.version) || Number(value.version) < 1) {
    throw new ValidationError(['Level has an invalid ID or version.']);
  }
  if (!Number.isInteger(value.budget) || Number(value.budget) < 0 || !Array.isArray(value.actors)) {
    throw new ValidationError([`Level ${value.id} has an invalid budget or actors.`]);
  }
  if (value.actors.length === 0 || value.actors.length > CAMPAIGN_LIMITS.actors) {
    throw new ValidationError([`Level ${value.id} has too many or no actors.`]);
  }
  const actors = value.actors.map((actor, index) => parseActor(actor, `Level ${value.id} actor ${index}`));
  const actorsById = new Map(actors.map((actor) => [actor.id, actor]));
  if (actorsById.size !== actors.length) {
    throw new ValidationError([`Level ${value.id} contains duplicate actor IDs.`]);
  }
  assertAcyclicDependencies(actors);
  if (!Array.isArray(value.edits) || value.edits.length > CAMPAIGN_LIMITS.edits) {
    throw new ValidationError([`Level ${value.id} has too many edits.`]);
  }
  const edits = value.edits.map((edit, index) => parseEdit(edit, actorsById, `Level ${value.id} edit ${index}`));
  const editKeys = edits.map((edit) => planKey(edit.actor, edit.field));
  if (new Set(editKeys).size !== editKeys.length || Number(value.budget) > edits.length) {
    throw new ValidationError([`Level ${value.id} has duplicate edits or an impossible budget.`]);
  }
  if (!Array.isArray(value.scenarios) || value.scenarios.length === 0 || value.scenarios.length > CAMPAIGN_LIMITS.scenarios) {
    throw new ValidationError([`Level ${value.id} has an invalid scenario count.`]);
  }
  const editableStarts = new Set(edits.filter((edit) => edit.field === 'start').map((edit) => edit.actor));
  const scenarios = value.scenarios.map((scenario, index) =>
    parseScenario(scenario, actorsById, editableStarts, `Level ${value.id} scenario ${index}`),
  );
  if (new Set(scenarios.map((scenario) => scenario.id)).size !== scenarios.length) {
    throw new ValidationError([`Level ${value.id} contains duplicate scenario IDs.`]);
  }
  return { id: value.id, version: Number(value.version), budget: Number(value.budget), actors, edits, scenarios };
};

export const parseCampaign = (value: unknown): readonly LevelDefinition[] => {
  if (!Array.isArray(value) || value.length !== 10) {
    throw new ValidationError(['The first campaign must contain exactly ten levels.']);
  }
  const levels = value.map(parseLevel);
  if (new Set(levels.map((level) => level.id)).size !== levels.length) {
    throw new ValidationError(['Campaign level IDs must be unique.']);
  }
  return levels;
};

export const validatePlan = (level: LevelDefinition, plan: Plan): Plan => {
  const rules = new Map(level.edits.map((edit) => [planKey(edit.actor, edit.field), edit]));
  const valid: Partial<Record<keyof Plan, PlanValue>> = {};
  for (const [rawKey, value] of Object.entries(plan)) {
    if (rawKey === '__proto__' || rawKey === 'constructor' || rawKey === 'prototype') {
      throw new ValidationError(['Plan contains a forbidden key.']);
    }
    const key = rawKey as keyof Plan;
    const rule = rules.get(key);
    if (rule === undefined || !rule.values.includes(value as never)) {
      throw new ValidationError([`Plan value for ${rawKey} is not allowed.`]);
    }
    valid[key] = value;
  }
  const baselineByKey = new Map<string, PlanValue>(
    level.edits.map((edit) => {
      const actor = level.actors.find((candidate) => candidate.id === edit.actor)!;
      return [planKey(edit.actor, edit.field), edit.field === 'route' ? actor.defaultRoute : actor.start];
    }),
  );
  const cost = Object.entries(valid).filter(([key, value]) => baselineByKey.get(key) !== value).length;
  if (cost > level.budget) {
    throw new ValidationError([`Plan costs ${cost} changes, but this level allows ${level.budget}.`]);
  }
  return valid;
};
