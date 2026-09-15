import {
  planKey,
  type ActorDefinition,
  type ClosureReference,
  type GoalResult,
  type LevelDefinition,
  type OccupancyReference,
  type Plan,
  type ScenarioDefinition,
  type SimulationResult,
  type TraceEvent,
  type TraversalTraceEvent,
  type WaitingReason,
} from './model';
import { validatePlan } from './validate';

interface QueueEvent {
  readonly readyBeat: number;
  readonly kind: 0 | 1;
  readonly priority: number;
  readonly actorId: string;
  readonly stepIndex: number;
}

interface Reservation extends OccupancyReference {
  readonly start: number;
}

const compareQueueEvents = (left: QueueEvent, right: QueueEvent): number =>
  left.readyBeat - right.readyBeat ||
  left.kind - right.kind ||
  left.priority - right.priority ||
  (left.actorId < right.actorId ? -1 : left.actorId > right.actorId ? 1 : 0) ||
  left.stepIndex - right.stepIndex;

const routeFor = (actor: ActorDefinition, plan: Plan) => {
  const chosen = plan[planKey(actor.id, 'route')];
  return actor.routes[typeof chosen === 'string' ? chosen : actor.defaultRoute]!;
};

const configuredStartFor = (actor: ActorDefinition, plan: Plan, scenario: ScenarioDefinition): number => {
  const edited = plan[planKey(actor.id, 'start')];
  if (typeof edited === 'number') {
    return edited;
  }
  return scenario.starts[actor.id] ?? actor.start;
};

const waitingReasonFor = (
  occupancy: OccupancyReference | undefined,
  closure: ClosureReference | undefined,
): WaitingReason => {
  if (occupancy !== undefined && closure !== undefined) {
    return { kind: 'occupancy-and-closure', occupancy, closure };
  }
  if (occupancy !== undefined) {
    return { kind: 'occupancy', occupancy };
  }
  if (closure !== undefined) {
    return { kind: 'closure', closure };
  }
  return { kind: 'none' };
};

export const simulate = (
  level: LevelDefinition,
  rawPlan: Plan,
  scenario: ScenarioDefinition,
): SimulationResult => {
  const plan = validatePlan(level, rawPlan);
  const actors = new Map(level.actors.map((actor) => [actor.id, actor]));
  if (!level.scenarios.some((candidate) => candidate.id === scenario.id)) {
    throw new Error(`Scenario ${scenario.id} does not belong to level ${level.id}.`);
  }

  const queue: QueueEvent[] = [];
  const reservations = new Map<string, Reservation>();
  const arrivals: Record<string, number> = {};
  const trace: TraceEvent[] = [];

  const enqueue = (actor: ActorDefinition, dependencyArrival?: number): void => {
    const configuredStart = configuredStartFor(actor, plan, scenario);
    const releaseBeat = Math.max(configuredStart, dependencyArrival ?? 0);
    if (actor.after !== undefined && dependencyArrival !== undefined) {
      trace.push({
        id: `${scenario.id}:${actor.id}:dependency`,
        kind: 'dependency',
        actorId: actor.id,
        afterActorId: actor.after,
        configuredStart,
        dependencyArrival,
        releaseBeat,
      });
    }
    queue.push({
      readyBeat: releaseBeat,
      kind: 1,
      priority: actor.priority,
      actorId: actor.id,
      stepIndex: 0,
    });
  };

  for (const actor of level.actors) {
    if (actor.after === undefined) {
      enqueue(actor);
    }
  }

  while (queue.length > 0) {
    queue.sort(compareQueueEvents);
    const current = queue.shift()!;
    const actor = actors.get(current.actorId)!;
    const route = routeFor(actor, plan);

    if (current.stepIndex === route.length) {
      arrivals[actor.id] = current.readyBeat;
      for (const dependent of level.actors) {
        if (dependent.after === actor.id) {
          enqueue(dependent, current.readyBeat);
        }
      }
      continue;
    }

    const [resourceId, duration] = route[current.stepIndex]!;
    let start = current.readyBeat;
    let occupancyReference: OccupancyReference | undefined;
    let closureReference: ClosureReference | undefined;

    if (resourceId !== null) {
      const prior = reservations.get(resourceId);
      if (prior !== undefined && prior.end > start) {
        start = prior.end;
        occupancyReference = {
          eventId: prior.eventId,
          actorId: prior.actorId,
          resourceId: prior.resourceId,
          end: prior.end,
        };
      }
      for (const [closureStart, closureEnd] of scenario.closures[resourceId] ?? []) {
        if (start < closureEnd && start + duration > closureStart) {
          start = closureEnd;
          closureReference = { resourceId, start: closureStart, end: closureEnd };
        }
      }
    }

    const eventId = `${scenario.id}:${actor.id}:step:${current.stepIndex}`;
    const end = start + duration;
    const event: TraversalTraceEvent = {
      id: eventId,
      kind: 'traversal',
      actorId: actor.id,
      stepIndex: current.stepIndex,
      resourceId,
      readyBeat: current.readyBeat,
      start,
      end,
      waitingReason: waitingReasonFor(occupancyReference, closureReference),
    };
    trace.push(event);

    if (resourceId !== null) {
      reservations.set(resourceId, {
        eventId,
        actorId: actor.id,
        resourceId,
        start,
        end,
      });
    }
    const nextStepIndex = current.stepIndex + 1;
    queue.push({
      readyBeat: end,
      kind: nextStepIndex === route.length ? 0 : 1,
      priority: actor.priority,
      actorId: actor.id,
      stepIndex: nextStepIndex,
    });
  }

  const goalResults: GoalResult[] = level.actors.map((actor) => {
    const arrival = arrivals[actor.id]!;
    const deadline = scenario.deadlines[actor.id] ?? actor.deadline;
    return { actorId: actor.id, arrival, deadline, passed: arrival <= deadline };
  });
  const failedGoals = goalResults
    .filter((goal) => !goal.passed)
    .sort((left, right) => left.deadline - right.deadline || left.actorId.localeCompare(right.actorId));
  const failed = failedGoals[0];
  const precedingWait = failed === undefined
    ? undefined
    : [...trace]
        .reverse()
        .find(
          (event): event is TraversalTraceEvent =>
            event.kind === 'traversal' &&
            event.actorId === failed.actorId &&
            event.waitingReason.kind !== 'none',
        );

  return {
    arrivals,
    goalResults,
    trace,
    passed: failed === undefined,
    firstFailure:
      failed === undefined
        ? null
        : {
            actorId: failed.actorId,
            arrival: failed.arrival,
            deadline: failed.deadline,
            ...(precedingWait === undefined ? {} : { precedingWaitEventId: precedingWait.id }),
          },
  };
};
