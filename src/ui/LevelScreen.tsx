import { useMemo, useState } from 'react';
import { ACTOR_LABELS, ROUTE_LABELS, SCENARIO_LABELS, UI_COPY } from '../config/product';
import { levelContent } from '../content/campaign/content';
import { planKey, type LevelDefinition, type Plan, type SimulationResult, type TraversalTraceEvent } from '../game/model';
import { applyPlanEdit, createPlanState, planCost, redoPlanEdit, resetPlan, undoPlanEdit } from '../game/plan';
import { simulate } from '../game/simulate';
import { HarborScene } from '../render/HarborScene';
import type { SavedPlan } from '../storage/model';

interface LevelScreenProps {
  readonly level: LevelDefinition;
  readonly onComplete: (levelId: string) => void;
  readonly onChapters: () => void;
  readonly onNext: () => void;
  readonly savedPlan?: SavedPlan;
  readonly saveStatus: 'saved' | 'saving' | 'failed' | 'conflict';
  readonly onPlanChange: (levelId: string, plan: SavedPlan) => void;
}

type ScenarioResults = Readonly<Record<string, SimulationResult>>;

const describeWait = (event: TraversalTraceEvent): string => {
  if (event.waitingReason.kind === 'occupancy') {
    return `waited for ${ACTOR_LABELS[event.waitingReason.occupancy.actorId] ?? event.waitingReason.occupancy.actorId} until beat ${event.waitingReason.occupancy.end}`;
  }
  if (event.waitingReason.kind === 'closure') {
    return `waited for the closure through beat ${event.waitingReason.closure.end}`;
  }
  if (event.waitingReason.kind === 'occupancy-and-closure') {
    return `waited for another vehicle, then for the closure through beat ${event.waitingReason.closure.end}`;
  }
  return 'moved without waiting';
};

export function LevelScreen({ level, onComplete, onChapters, onNext, savedPlan, saveStatus, onPlanChange }: LevelScreenProps) {
  const content = levelContent[level.id]!;
  const [planState, setPlanState] = useState(() => savedPlan === undefined ? createPlanState() : { ...savedPlan, recovery: null });
  const [results, setResults] = useState<ScenarioResults>({});
  const [selectedScenarioId, setSelectedScenarioId] = useState(level.scenarios[0]!.id);
  const [eventIndex, setEventIndex] = useState(0);
  const [hintIndex, setHintIndex] = useState(-1);
  const [showTextView, setShowTextView] = useState(false);
  const [compareOriginal, setCompareOriginal] = useState(false);

  const selectedScenario = level.scenarios.find((scenario) => scenario.id === selectedScenarioId)!;
  const viewedPlan: Plan = compareOriginal ? {} : planState.plan;
  const viewedResult = useMemo(
    () => simulate(level, viewedPlan, selectedScenario),
    [level, selectedScenario, viewedPlan],
  );
  const testedResult = results[selectedScenarioId];
  const traversalEvents = viewedResult.trace.filter((event): event is TraversalTraceEvent => event.kind === 'traversal');
  const activeEvent = traversalEvents[eventIndex];
  const allTested = level.scenarios.every((scenario) => results[scenario.id] !== undefined);
  const allPassed = allTested && level.scenarios.every((scenario) => results[scenario.id]!.passed);
  const changesUsed = planCost(level, planState.plan);

  const editPlan = (actorId: string, field: 'route' | 'start', value: string | number): void => {
    const next = applyPlanEdit(level, planState, planKey(actorId, field), value);
    setPlanState(next);
    onPlanChange(level.id, { plan: next.plan, undo: next.undo, redo: next.redo, revision: next.revision });
    setResults({});
    setEventIndex(0);
    setCompareOriginal(false);
  };

  const testPlan = (): void => {
    const nextResults = Object.fromEntries(
      level.scenarios.map((scenario) => [scenario.id, simulate(level, planState.plan, scenario)]),
    );
    setResults(nextResults);
    setEventIndex(0);
    setCompareOriginal(false);
    if (Object.values(nextResults).every((result) => result.passed)) {
      onComplete(level.id);
    }
  };

  const changeHistory = (action: 'undo' | 'redo' | 'reset'): void => {
    const next = action === 'undo' ? undoPlanEdit(planState) : action === 'redo' ? redoPlanEdit(planState) : resetPlan(planState);
    setPlanState(next);
    onPlanChange(level.id, { plan: next.plan, undo: next.undo, redo: next.redo, revision: next.revision });
    setResults({});
    setEventIndex(0);
    setCompareOriginal(false);
  };

  return (
    <main className="game-shell">
      <header className="game-header">
        <button className="quiet-button" type="button" onClick={onChapters}>{UI_COPY.chapters}</button>
        <div>
          <p className="eyebrow">Level {level.id} · {content.chapter}</p>
          <h1>{content.title}</h1>
        </div>
        <details className="settings-menu">
          <summary>Settings</summary>
          <label><input type="checkbox" /> Reduce motion</label>
          <label><input type="checkbox" /> Mute effects</label>
        </details>
        <span className={`save-status ${saveStatus}`} role="status">
          {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving' : saveStatus === 'conflict' ? 'Newer save found' : 'Save failed'}
        </span>
      </header>

      <section className="goal-strip" aria-label="Puzzle goal">
        <div>
          <p>{content.intro}</p>
          <strong>{content.goalText}</strong>
        </div>
        <div className="budget-meter" aria-label={`${changesUsed} of ${level.budget} changes used`}>
          <span>{UI_COPY.budgetLabel}</span>
          <strong>{changesUsed}/{level.budget}</strong>
        </div>
      </section>

      <div className="scenario-tabs" role="tablist" aria-label="Possible days">
        {level.scenarios.map((scenario) => {
          const result = results[scenario.id];
          const status = result === undefined ? UI_COPY.notTested : result.passed ? UI_COPY.passed : UI_COPY.needsChange;
          return (
            <button
              key={scenario.id}
              type="button"
              role="tab"
              aria-selected={scenario.id === selectedScenarioId}
              onClick={() => { setSelectedScenarioId(scenario.id); setEventIndex(0); }}
            >
              <span>{SCENARIO_LABELS[scenario.id] ?? scenario.id}</span>
              <small>{status}</small>
            </button>
          );
        })}
      </div>

      <div className="play-layout">
        <section className="board-panel" aria-label="Harbor board">
          <div className="board-toolbar">
            <button type="button" onClick={() => setShowTextView((value) => !value)}>
              {showTextView ? UI_COPY.showScene : UI_COPY.showTextView}
            </button>
            <button
              type="button"
              aria-pressed={compareOriginal}
              onClick={() => { setCompareOriginal((value) => !value); setEventIndex(0); }}
            >
              {UI_COPY.compareOriginal}
            </button>
          </div>
          {showTextView ? (
            <div className="text-play-view">
              <h2>Plan and event details</h2>
              {level.actors.map((actor) => {
                const routeChoice = viewedPlan[planKey(actor.id, 'route')];
                const routeId = typeof routeChoice === 'string' ? routeChoice : actor.defaultRoute;
                const startChoice = viewedPlan[planKey(actor.id, 'start')];
                const start = typeof startChoice === 'number' ? startChoice : selectedScenario.starts[actor.id] ?? actor.start;
                return (
                  <article key={actor.id}>
                    <h3>{ACTOR_LABELS[actor.id] ?? actor.id}</h3>
                    <p>Starts at beat {start}. Deadline: beat {selectedScenario.deadlines[actor.id] ?? actor.deadline}. Route: {ROUTE_LABELS[routeId] ?? routeId}.</p>
                    <ol>
                      {actor.routes[routeId]!.map(([resource, duration], index) => (
                        <li key={`${actor.id}-${routeId}-${index}`}>{duration} {duration === 1 ? 'beat' : 'beats'} through {resource === null ? 'a private lane' : `shared segment ${resource}`}</li>
                      ))}
                    </ol>
                  </article>
                );
              })}
              <h3>Event trace</h3>
              <ol>
                {traversalEvents.map((event, index) => (
                  <li key={event.id} aria-current={index === eventIndex ? 'step' : undefined}>
                    {ACTOR_LABELS[event.actorId] ?? event.actorId}: beat {event.start} to {event.end}, {describeWait(event)}.
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <HarborScene level={level} plan={viewedPlan} result={viewedResult} eventIndex={eventIndex} />
          )}
          <div className="timeline-controls">
            <button type="button" onClick={() => setEventIndex((index) => Math.max(0, index - 1))} disabled={eventIndex === 0}>{UI_COPY.previousEvent}</button>
            <div aria-live="polite">
              <span>{UI_COPY.timelineLabel}</span>
              <strong>{activeEvent === undefined ? 'Start' : `t=${activeEvent.end}`}</strong>
            </div>
            <button type="button" onClick={() => setEventIndex((index) => Math.min(traversalEvents.length - 1, index + 1))} disabled={eventIndex >= traversalEvents.length - 1}>{UI_COPY.nextEvent}</button>
          </div>
        </section>

        <aside className="plan-panel" aria-label="Plan controls">
          <h2>Change the plan</h2>
          {level.edits.map((edit) => {
            const actor = level.actors.find((candidate) => candidate.id === edit.actor)!;
            const current = planState.plan[planKey(edit.actor, edit.field)] ?? (edit.field === 'route' ? actor.defaultRoute : actor.start);
            return (
              <fieldset key={`${edit.actor}.${edit.field}`}>
                <legend>{ACTOR_LABELS[edit.actor] ?? edit.actor} {edit.field === 'route' ? 'route' : 'start'}</legend>
                <div className="choice-grid">
                  {edit.values.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={current === value ? 'selected-choice' : ''}
                      aria-pressed={current === value}
                      onClick={() => editPlan(edit.actor, edit.field, value)}
                    >
                      {edit.field === 'route' ? ROUTE_LABELS[String(value)] ?? value : `Beat ${value}`}
                    </button>
                  ))}
                </div>
              </fieldset>
            );
          })}

          <div className="history-controls">
            <button type="button" onClick={() => changeHistory('undo')} disabled={planState.undo.length === 0}>{UI_COPY.undo}</button>
            <button type="button" onClick={() => changeHistory('redo')} disabled={planState.redo.length === 0}>{UI_COPY.redo}</button>
            <button type="button" onClick={() => changeHistory('reset')}>{UI_COPY.reset}</button>
          </div>
          <button className="primary-button test-button" type="button" onClick={testPlan}>{UI_COPY.testPlan}</button>

          {allTested && (
            <section className={allPassed ? 'result-card passed' : 'result-card failed'} aria-live="polite">
              <h2>{allPassed ? 'Plan works for every day' : 'This plan needs a change'}</h2>
              {allPassed ? (
                <>
                  <p>{content.solution}</p>
                  <div className="success-actions">
                    <button className="primary-button" type="button" onClick={onNext}>{UI_COPY.nextPuzzle}</button>
                    <button type="button" onClick={onChapters}>{UI_COPY.doneForNow}</button>
                  </div>
                </>
              ) : (
                <p>{testedResult?.firstFailure === null || testedResult === undefined
                  ? 'Open each possible day to compare its result.'
                  : `${ACTOR_LABELS[testedResult.firstFailure.actorId] ?? testedResult.firstFailure.actorId} arrived at beat ${testedResult.firstFailure.arrival}. It needed to arrive by beat ${testedResult.firstFailure.deadline}.`}</p>
              )}
            </section>
          )}

          <section className="hint-card">
            <button type="button" onClick={() => setHintIndex((index) => Math.min(2, index + 1))}>{UI_COPY.hint}</button>
            {hintIndex >= 0 && <p>{content.hints[hintIndex]}</p>}
          </section>
        </aside>
      </div>
    </main>
  );
}
