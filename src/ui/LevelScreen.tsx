import { lazy, Suspense, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { soundEngine } from '../audio/sound';
import { ACTOR_LABELS, ROUTE_LABELS, SCENARIO_LABELS, UI_COPY } from '../config/product';
import { levelContent } from '../content/campaign/content';
import { campaignSolutions } from '../content/campaign/solutions';
import { planKey, type LevelDefinition, type Plan, type PlanKey, type PlanValue, type SimulationResult, type TraversalTraceEvent } from '../game/model';
import { applyPlanEdit, createPlanState, planCost, redoPlanEdit, resetPlan, restoreRecovery, revealSolution, undoPlanEdit } from '../game/plan';
import { simulate } from '../game/simulate';
import type { SavedPlan } from '../storage/model';
import type { PlayerSettings } from '../storage/model';
import { ModalDialog } from './ModalDialog';
import { LevelOneScreen } from './LevelOneScreen';
import { SceneBoundary } from './SceneBoundary';

export interface LevelScreenProps {
  readonly level: LevelDefinition;
  readonly onComplete: (levelId: string) => void;
  readonly onChapters: () => void;
  readonly onNext: () => void;
  readonly savedPlan?: SavedPlan;
  readonly saveStatus: 'saved' | 'saving' | 'failed' | 'conflict';
  readonly onPlanChange: (levelId: string, plan: SavedPlan) => void;
  readonly onTutorialProgress: (levelId: string, tutorialStep: number) => void;
  readonly offlineReady: boolean;
  readonly onDismissOffline: () => void;
  readonly settings: PlayerSettings;
  readonly onOpenSettings: () => void;
}

type ScenarioResults = Readonly<Record<string, SimulationResult>>;

const describeWait = (event: TraversalTraceEvent): string => {
  if (event.waitingReason.kind === 'occupancy') {
    return `waited for ${ACTOR_LABELS[event.waitingReason.occupancy.actorId] ?? event.waitingReason.occupancy.actorId} until beat ${event.waitingReason.occupancy.end}`;
  }
  if (event.waitingReason.kind === 'closure') {
    return `waited for the closure until beat ${event.waitingReason.closure.end}`;
  }
  if (event.waitingReason.kind === 'occupancy-and-closure') {
    return `waited for another vehicle, then for the closure until beat ${event.waitingReason.closure.end}`;
  }
  return 'moved without waiting';
};

const EMPTY_PLAN: Plan = {};
const ZOOM_LEVELS = [0.8, 1, 1.2] as const;
const HarborScene = lazy(async () => {
  const module = await import('../render/HarborScene');
  return { default: module.HarborScene };
});

export function LevelScreen(props: LevelScreenProps) {
  return props.level.id === '01' ? <LevelOneScreen {...props} /> : <LegacyLevelScreen {...props} />;
}

function LegacyLevelScreen({ level, onComplete, onChapters, onNext, savedPlan, saveStatus, onPlanChange, settings, onOpenSettings }: LevelScreenProps) {
  const content = levelContent[level.id]!;
  const [planState, setPlanState] = useState(() => savedPlan === undefined ? createPlanState() : { ...savedPlan, recovery: null });
  const [results, setResults] = useState<ScenarioResults>({});
  const [selectedScenarioId, setSelectedScenarioId] = useState(level.scenarios[0]!.id);
  const [eventIndex, setEventIndex] = useState(0);
  const [hintIndex, setHintIndex] = useState(-1);
  const [showTextView, setShowTextView] = useState(false);
  const [compareOriginal, setCompareOriginal] = useState(false);
  const [playing, setPlaying] = useState(!settings.reducedMotion);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);
  const [helpOpen, setHelpOpen] = useState(false);
  const [tutorialVisible, setTutorialVisible] = useState(Number(level.id) <= 3 || ['07', '09'].includes(level.id));
  const [revealPending, setRevealPending] = useState(false);
  const [selectedActorId, setSelectedActorId] = useState(level.actors[0]!.id);
  const [zoomIndex, setZoomIndex] = useState(1);

  const selectedScenario = level.scenarios.find((scenario) => scenario.id === selectedScenarioId)!;
  const viewedPlan: Plan = compareOriginal ? EMPTY_PLAN : planState.plan;
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
  const selectedActor = level.actors.find((actor) => actor.id === selectedActorId) ?? level.actors[0]!;
  const selectedRouteValue = viewedPlan[planKey(selectedActor.id, 'route')];
  const selectedRoute = typeof selectedRouteValue === 'string' ? selectedRouteValue : selectedActor.defaultRoute;
  const selectedStartValue = viewedPlan[planKey(selectedActor.id, 'start')];
  const selectedStart = typeof selectedStartValue === 'number' ? selectedStartValue : selectedScenario.starts[selectedActor.id] ?? selectedActor.start;
  const solutionEntries = Object.entries(campaignSolutions[level.id]!) as readonly [PlanKey, PlanValue][];
  const unresolvedSolutionEntries = solutionEntries.filter(([key, value]) => planState.plan[key] !== value);
  const specificHint = unresolvedSolutionEntries.length === 0
    ? 'Your plan already matches the solution. Test it across every possible day.'
    : unresolvedSolutionEntries.length < solutionEntries.length
      ? `Keep the choice you already found. The remaining change is ${unresolvedSolutionEntries.map(([key, value]) => `${ACTOR_LABELS[key.split('.')[0]!] ?? key} ${key.endsWith('.start') ? `start at beat ${value}` : `route to ${ROUTE_LABELS[String(value)] ?? value}`}`).join(' and ')}.`
      : content.hints[2];

  useEffect(() => {
    if (!playing || settings.reducedMotion || traversalEvents.length === 0) return;
    const timer = window.setTimeout(() => {
      setEventIndex((index) => {
        if (index >= traversalEvents.length - 1) { setPlaying(false); return index; }
        return index + 1;
      });
    }, 600 / speed);
    return () => window.clearTimeout(timer);
  }, [eventIndex, playing, settings.reducedMotion, speed, traversalEvents.length]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.code === 'Space') { event.preventDefault(); setPlaying((value) => !value); }
      if (event.key.toLowerCase() === 'z') changeHistory('undo');
      if (event.key.toLowerCase() === 'y') changeHistory('redo');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const editPlan = (actorId: string, field: 'route' | 'start', value: string | number): void => {
    const next = applyPlanEdit(level, planState, planKey(actorId, field), value);
    setPlanState(next);
    onPlanChange(level.id, { plan: next.plan, undo: next.undo, redo: next.redo, revision: next.revision });
    setResults({});
    setEventIndex(0);
    setCompareOriginal(false);
    setPlaying(false);
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
      void soundEngine.effect('success', settings.effects);
    } else {
      void soundEngine.effect('failure', settings.effects);
    }
  };

  const changeHistory = (action: 'undo' | 'redo' | 'reset'): void => {
    const next = action === 'undo' ? undoPlanEdit(planState) : action === 'redo' ? redoPlanEdit(planState) : resetPlan(planState);
    setPlanState(next);
    onPlanChange(level.id, { plan: next.plan, undo: next.undo, redo: next.redo, revision: next.revision });
    setResults({});
    setEventIndex(0);
    setCompareOriginal(false);
    setPlaying(false);
  };

  const persistPlanState = (next: typeof planState): void => {
    setPlanState(next);
    onPlanChange(level.id, { plan: next.plan, undo: next.undo, redo: next.redo, revision: next.revision });
    setResults({});
    setEventIndex(0);
    setPlaying(false);
  };

  const confirmReveal = (): void => {
    const next = revealSolution(level, planState, campaignSolutions[level.id]!);
    persistPlanState(next);
    setRevealPending(false);
    setHintIndex(2);
  };

  return (
    <main className="game-shell">
      <header className="game-header">
        <button className="quiet-button" type="button" onClick={onChapters}>{UI_COPY.chapters}</button>
        <div>
          <p className="eyebrow">Level {level.id} · {content.chapter}</p>
          <h1>{content.title}</h1>
        </div>
        <div className="header-actions"><button type="button" onClick={() => setHelpOpen(true)}>Help</button><button type="button" onClick={onOpenSettings}>Settings</button></div>
        <span className={`save-status ${saveStatus}`} role="status">
          {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving' : saveStatus === 'conflict' ? 'Newer save found' : 'Save failed'}
        </span>
      </header>

      {tutorialVisible && <aside className="tutorial-prompt" role="status"><strong>{level.id === '01' ? 'Watch the original delay first.' : level.id === '02' ? 'This time, change a departure beat.' : level.id === '03' ? 'A closure can make the shorter route slower.' : level.id === '07' ? 'Your plan now has two possible days.' : 'Compare all three possible days.'}</strong><button type="button" onClick={() => setTutorialVisible(false)}>Got it</button></aside>}

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
      <details className="scenario-details"><summary>Inspect this possible day</summary><p>{Object.keys(selectedScenario.starts).length === 0 ? 'Standard departure times.' : Object.entries(selectedScenario.starts).map(([actorId, beat]) => `${ACTOR_LABELS[actorId] ?? actorId} starts at beat ${beat}`).join('. ')} {Object.entries(selectedScenario.deadlines).map(([actorId, beat]) => `${ACTOR_LABELS[actorId] ?? actorId} deadline is beat ${beat}`).join('. ')} {Object.entries(selectedScenario.closures).map(([resourceId, closures]) => `${resourceId} closed ${closures.map(([start, end]) => `from beat ${start} until beat ${end}`).join(', ')}`).join('. ')}</p></details>

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
            <button type="button" onClick={() => setZoomIndex((value) => Math.max(0, value - 1))} disabled={zoomIndex === 0}>Zoom out</button>
            <button type="button" onClick={() => setZoomIndex(1)} disabled={zoomIndex === 1}>Center</button>
            <button type="button" onClick={() => setZoomIndex((value) => Math.min(ZOOM_LEVELS.length - 1, value + 1))} disabled={zoomIndex === ZOOM_LEVELS.length - 1}>Zoom in</button>
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
            <div className="scene-zoom" style={{ '--scene-zoom': ZOOM_LEVELS[zoomIndex] } as CSSProperties}><SceneBoundary onUseTextView={() => setShowTextView(true)}><Suspense fallback={<div className="scene-loading" role="status">Drawing the harbor...</div>}><HarborScene level={level} plan={viewedPlan} result={viewedResult} eventIndex={eventIndex} /></Suspense></SceneBoundary></div>
          )}
          <div className="actor-inspection" aria-label="Vehicle details">
            <div>{level.actors.map((actor) => <button key={actor.id} type="button" aria-pressed={selectedActor.id === actor.id} onClick={() => setSelectedActorId(actor.id)}>{ACTOR_LABELS[actor.id] ?? actor.id}</button>)}</div>
            <p><strong>{ACTOR_LABELS[selectedActor.id] ?? selectedActor.id}</strong> starts at beat {selectedStart}, follows {ROUTE_LABELS[selectedRoute] ?? selectedRoute}, and needs to arrive by beat {selectedScenario.deadlines[selectedActor.id] ?? selectedActor.deadline}.</p>
          </div>
          <div className="timeline-controls">
            <button type="button" onClick={() => setEventIndex((index) => Math.max(0, index - 1))} disabled={eventIndex === 0}>{UI_COPY.previousEvent}</button>
            <div aria-live="polite">
              <span>{UI_COPY.timelineLabel}</span>
              <strong>{activeEvent === undefined ? 'Start' : `t=${activeEvent.end}`}</strong>
            </div>
            <button type="button" onClick={() => setEventIndex((index) => Math.min(traversalEvents.length - 1, index + 1))} disabled={eventIndex >= traversalEvents.length - 1}>{UI_COPY.nextEvent}</button>
          </div>
          <div className="playback-controls"><button type="button" onClick={() => setEventIndex(0)}>Rewind</button><button type="button" onClick={() => setPlaying((value) => !value)}>{playing ? 'Pause' : 'Resume'}</button><label>Speed<select value={speed} onChange={(event) => setSpeed(Number(event.target.value) as 0.5 | 1 | 2)}><option value="0.5">Half</option><option value="1">Normal</option><option value="2">Double</option></select></label><label className="timeline-slider">Time in beats<input type="range" min="0" max={Math.max(0, traversalEvents.length - 1)} value={eventIndex} onChange={(event) => { setPlaying(false); setEventIndex(Number(event.target.value)); }} aria-valuetext={activeEvent === undefined ? 'Start' : `Beat ${activeEvent.end}`} /></label></div>
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
            {hintIndex >= 0 && <p>{hintIndex === 2 ? specificHint : content.hints[hintIndex]}</p>}
            {hintIndex === 2 && <button type="button" onClick={() => setRevealPending(true)}>Show the solution</button>}
            {planState.recovery !== null && <button type="button" onClick={() => persistPlanState(restoreRecovery(level, planState))}>Restore my plan</button>}
          </section>
        </aside>
      </div>
      <ModalDialog open={revealPending} labelledBy="reveal-title" onClose={() => setRevealPending(false)}><h2 id="reveal-title">Replace your plan with the solution?</h2><p>Your current plan will stay available as a recovery snapshot.</p><div><button className="primary-button" type="button" onClick={confirmReveal}>Show solution</button><button type="button" onClick={() => setRevealPending(false)}>Keep my plan</button></div></ModalDialog>
      <ModalDialog open={helpOpen} labelledBy="help-title" className="help-dialog" onClose={() => setHelpOpen(false)}><h2 id="help-title">How this harbor works</h2><p>Time is measured in beats. Shared segments hold one vehicle at a time. Earlier arrivals stay first. If arrivals tie: bus, robot, cart.</p><p>Choose a route or start beat, then select Test plan. Later puzzles test the same plan across every possible day. Scrubbing only changes the event you are viewing.</p><p>Progress stays in this browser. Use Settings to export a backup.</p><button className="primary-button" type="button" onClick={() => setHelpOpen(false)}>Back to the puzzle</button></ModalDialog>
    </main>
  );
}
