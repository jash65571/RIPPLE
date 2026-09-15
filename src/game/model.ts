export const CAMPAIGN_LIMITS = {
  actors: 8,
  stepsPerRoute: 12,
  choicesPerEdit: 8,
  edits: 4,
  scenarios: 3,
  closuresPerResource: 20,
  horizon: 120,
} as const;

export type ActorId = string;
export type ResourceId = string;
export type RouteId = string;
export type ScenarioId = string;
export type PlanKey = `${string}.route` | `${string}.start`;
export type PlanValue = string | number;
export type RouteStep = readonly [ResourceId | null, number];
export type Closure = readonly [number, number];

export interface ActorDefinition {
  readonly id: ActorId;
  readonly start: number;
  readonly deadline: number;
  readonly routes: Readonly<Record<RouteId, readonly RouteStep[]>>;
  readonly defaultRoute: RouteId;
  readonly priority: number;
  readonly after?: ActorId;
}

export interface RouteEdit {
  readonly actor: ActorId;
  readonly field: 'route';
  readonly values: readonly RouteId[];
}

export interface StartEdit {
  readonly actor: ActorId;
  readonly field: 'start';
  readonly values: readonly number[];
}

export type EditDefinition = RouteEdit | StartEdit;

export interface ScenarioDefinition {
  readonly id: ScenarioId;
  readonly starts: Readonly<Record<ActorId, number>>;
  readonly deadlines: Readonly<Record<ActorId, number>>;
  readonly closures: Readonly<Record<ResourceId, readonly Closure[]>>;
}

export interface LevelDefinition {
  readonly id: string;
  readonly version: number;
  readonly budget: number;
  readonly actors: readonly ActorDefinition[];
  readonly edits: readonly EditDefinition[];
  readonly scenarios: readonly ScenarioDefinition[];
}

export type Plan = Readonly<Partial<Record<PlanKey, PlanValue>>>;

export interface OccupancyReference {
  readonly eventId: string;
  readonly actorId: ActorId;
  readonly resourceId: ResourceId;
  readonly end: number;
}

export interface ClosureReference {
  readonly resourceId: ResourceId;
  readonly start: number;
  readonly end: number;
}

export type WaitingReason =
  | { readonly kind: 'none' }
  | { readonly kind: 'occupancy'; readonly occupancy: OccupancyReference }
  | { readonly kind: 'closure'; readonly closure: ClosureReference }
  | {
      readonly kind: 'occupancy-and-closure';
      readonly occupancy: OccupancyReference;
      readonly closure: ClosureReference;
    };

export interface TraversalTraceEvent {
  readonly id: string;
  readonly kind: 'traversal';
  readonly actorId: ActorId;
  readonly stepIndex: number;
  readonly resourceId: ResourceId | null;
  readonly readyBeat: number;
  readonly start: number;
  readonly end: number;
  readonly waitingReason: WaitingReason;
}

export interface DependencyTraceEvent {
  readonly id: string;
  readonly kind: 'dependency';
  readonly actorId: ActorId;
  readonly afterActorId: ActorId;
  readonly configuredStart: number;
  readonly dependencyArrival: number;
  readonly releaseBeat: number;
}

export type TraceEvent = TraversalTraceEvent | DependencyTraceEvent;

export interface GoalResult {
  readonly actorId: ActorId;
  readonly arrival: number;
  readonly deadline: number;
  readonly passed: boolean;
}

export interface FirstFailure {
  readonly actorId: ActorId;
  readonly arrival: number;
  readonly deadline: number;
  readonly precedingWaitEventId?: string;
}

export interface SimulationResult {
  readonly arrivals: Readonly<Record<ActorId, number>>;
  readonly goalResults: readonly GoalResult[];
  readonly trace: readonly TraceEvent[];
  readonly passed: boolean;
  readonly firstFailure: FirstFailure | null;
}

export const planKey = (actorId: ActorId, field: EditDefinition['field']): PlanKey =>
  `${actorId}.${field}`;
