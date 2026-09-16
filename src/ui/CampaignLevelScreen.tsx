import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { soundEngine } from '../audio/sound';
import { ACTOR_LABELS, ROUTE_LABELS, SCENARIO_LABELS } from '../config/product';
import { levelContent } from '../content/campaign/content';
import { campaignSolutions } from '../content/campaign/solutions';
import { planKey, type ActorDefinition, type Plan, type SimulationResult, type TraversalTraceEvent } from '../game/model';
import { applyPlanEdit, createPlanState, planCost, redoPlanEdit, resetPlan, restoreRecovery, revealSolution, undoPlanEdit } from '../game/plan';
import { simulate } from '../game/simulate';
import { LEVEL_ONE_TUTORIAL_COMPLETE_STEP } from '../storage/model';
import type { LevelScreenProps } from './LevelScreen';
import { ModalDialog } from './ModalDialog';
import { SceneBoundary } from './SceneBoundary';
import { useReducedMotion } from './useReducedMotion';

const CampaignHarborScene = lazy(async () => {
  const module = await import('../render/CampaignHarborScene');
  return { default: module.CampaignHarborScene };
});

type BottomSheet = 'none' | 'vehicles' | 'actor' | 'advanced' | 'hints' | 'text';
type RunState = 'idle' | 'playing' | 'paused' | 'failed' | 'passed';

const EMPTY_PLAN: Plan = {};
const PLAYBACK_BEATS_PER_SECOND = 0.95;
const TIMELINE_STEP = 0.05;
const HELP_COMPLETE = LEVEL_ONE_TUTORIAL_COMPLETE_STEP;

const actorRoute = (actor: ActorDefinition, plan: Plan): string => {
  const value = plan[planKey(actor.id, 'route')];
  return typeof value === 'string' ? value : actor.defaultRoute;
};

const actorStart = (actor: ActorDefinition, plan: Plan): number => {
  const value = plan[planKey(actor.id, 'start')];
  return typeof value === 'number' ? value : actor.start;
};

const actorStartForScenario = (actor: ActorDefinition, plan: Plan, scenarioStarts: Readonly<Record<string, number>>): number => {
  const planned = plan[planKey(actor.id, 'start')];
  return typeof planned === 'number' ? planned : scenarioStarts[actor.id] ?? actor.start;
};

const failureText = (result: SimulationResult, scenarioId: string): string => {
  const failure = result.firstFailure;
  if (failure === null) return `${SCENARIO_LABELS[scenarioId] ?? scenarioId} passed.`;
  const label = ACTOR_LABELS[failure.actorId] ?? failure.actorId;
  return `${label} arrived at beat ${failure.arrival} in ${SCENARIO_LABELS[scenarioId] ?? scenarioId}. The deadline was beat ${failure.deadline}.`;
};

export function CampaignLevelScreen({
  level,
  onComplete,
  onChapters,
  onNext,
  savedPlan,
  saveStatus,
  onPlanChange,
  onTutorialProgress,
  offlineReady,
  onDismissOffline,
  updateReady,
  onUpdate,
  settings,
  onOpenSettings,
}: LevelScreenProps) {
  const content = levelContent[level.id]!;
  const reducedMotion = useReducedMotion(settings.reducedMotion);
  const [planState, setPlanState] = useState(() => savedPlan === undefined
    ? createPlanState()
    : { plan: savedPlan.plan, undo: savedPlan.undo, redo: savedPlan.redo, recovery: null, revision: savedPlan.revision });
  const [selectedScenarioId, setSelectedScenarioId] = useState(level.scenarios[0]!.id);
  const [selectedActorId, setSelectedActorId] = useState(level.edits[0]?.actor ?? level.actors[0]!.id);
  const [timelineBeat, setTimelineBeat] = useState(0);
  const [runState, setRunState] = useState<RunState>('idle');
  const [bottomSheet, setBottomSheet] = useState<BottomSheet>('none');
  const [menuOpen, setMenuOpen] = useState(false);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);
  const [tested, setTested] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [hintIndex, setHintIndex] = useState(-1);
  const [helpActive, setHelpActive] = useState(savedPlan === undefined || (savedPlan.tutorialStep ?? HELP_COMPLETE) < HELP_COMPLETE);
  const [helpOpen, setHelpOpen] = useState(false);
  const [revealPending, setRevealPending] = useState(false);
  const helpSavedRef = useRef(savedPlan?.tutorialStep ?? (savedPlan === undefined ? 0 : HELP_COMPLETE));

  const viewedPlan = showOriginal ? EMPTY_PLAN : planState.plan;
  const results = useMemo(() => new Map(level.scenarios.map((scenario) => [scenario.id, simulate(level, viewedPlan, scenario)])), [level, viewedPlan]);
  const selectedScenario = level.scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? level.scenarios[0]!;
  const selectedResult = results.get(selectedScenario.id)!;
  const traversalEvents = selectedResult.trace.filter((event): event is TraversalTraceEvent => event.kind === 'traversal');
  const timelineEnd = Math.max(0, ...traversalEvents.map((event) => event.end));
  const timelineStops = [...new Set([0, ...traversalEvents.flatMap((event) => [event.start, event.end])])].sort((left, right) => left - right);
  const selectedActor = level.actors.find((actor) => actor.id === selectedActorId) ?? level.actors[0]!;
  const selectedEdit = level.edits.find((edit) => edit.actor === selectedActor.id);
  const changesUsed = planCost(level, planState.plan);
  const changesLeft = Math.max(0, level.budget - changesUsed);
  const allPassed = level.scenarios.every((scenario) => results.get(scenario.id)!.passed);
  const sheetOpen = bottomSheet !== 'none';

  const savePlanState = (next: typeof planState): void => {
    setPlanState(next);
    onPlanChange(level.id, { plan: next.plan, undo: next.undo, redo: next.redo, revision: next.revision });
  };

  const dismissHelp = (): void => {
    setHelpActive(false);
    if (helpSavedRef.current < HELP_COMPLETE) {
      helpSavedRef.current = HELP_COMPLETE;
      onTutorialProgress(level.id, HELP_COMPLETE);
    }
  };

  const selectActor = (actorId: string): void => {
    setSelectedActorId(actorId);
    setBottomSheet('actor');
  };

  const editPlan = (actorId: string, field: 'route' | 'start', value: string | number): void => {
    const next = applyPlanEdit(level, planState, planKey(actorId, field), value);
    savePlanState(next);
    setShowOriginal(false);
    setTested(false);
    setRunState('idle');
    setTimelineBeat(0);
    setBottomSheet('none');
  };

  const finishRun = (): void => {
    setTested(true);
    if (allPassed) {
      setRunState('passed');
      onComplete(level.id);
      void soundEngine.effect('success', settings.effects);
    } else {
      const failedScenario = level.scenarios.find((scenario) => !results.get(scenario.id)!.passed) ?? level.scenarios[0]!;
      const failedResult = results.get(failedScenario.id)!;
      setSelectedScenarioId(failedScenario.id);
      setSelectedActorId(failedResult.firstFailure?.actorId ?? level.actors[0]!.id);
      setRunState('failed');
      void soundEngine.effect('failure', settings.effects);
    }
  };

  const runPlan = (): void => {
    const failedScenario = level.scenarios.find((scenario) => !results.get(scenario.id)!.passed);
    const targetScenario = failedScenario ?? level.scenarios[0]!;
    const targetResult = results.get(targetScenario.id)!;
    const targetEvents = targetResult.trace.filter((event): event is TraversalTraceEvent => event.kind === 'traversal');
    const targetEnd = Math.max(0, ...targetEvents.map((event) => event.end));
    setSelectedScenarioId(targetScenario.id);
    setBottomSheet('none');
    setMenuOpen(false);
    setShowOriginal(false);
    setTested(false);
    setTimelineBeat(reducedMotion ? targetEnd : 0);
    if (reducedMotion) {
      setRunState(allPassed ? 'passed' : 'failed');
      setTested(true);
      if (allPassed) {
        onComplete(level.id);
        void soundEngine.effect('success', settings.effects);
      } else {
        setSelectedActorId(targetResult.firstFailure?.actorId ?? level.actors[0]!.id);
        void soundEngine.effect('failure', settings.effects);
      }
    } else {
      setRunState('playing');
    }
  };

  useEffect(() => {
    if (runState !== 'playing' || reducedMotion || timelineEnd === 0) return;
    let frame = 0;
    let previous = performance.now();
    const advance = (now: number): void => {
      const seconds = Math.min(0.1, (now - previous) / 1000);
      previous = now;
      setTimelineBeat((beat) => Math.min(timelineEnd, beat + seconds * speed * PLAYBACK_BEATS_PER_SECOND));
      frame = window.requestAnimationFrame(advance);
    };
    frame = window.requestAnimationFrame(advance);
    return () => window.cancelAnimationFrame(frame);
  }, [reducedMotion, runState, speed, timelineEnd]);

  useEffect(() => {
    if (runState === 'playing' && timelineBeat >= timelineEnd) finishRun();
  });

  useEffect(() => {
    const handleKey = (event: KeyboardEvent): void => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.code === 'Space' && (runState === 'playing' || runState === 'paused')) {
        event.preventDefault();
        setRunState((state) => state === 'playing' ? 'paused' : 'playing');
      }
      if (event.key.toLowerCase() === 'z' && planState.undo.length > 0) savePlanState(undoPlanEdit(planState));
      if (event.key.toLowerCase() === 'y' && planState.redo.length > 0) savePlanState(redoPlanEdit(planState));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const selectScenario = (scenarioId: string): void => {
    setSelectedScenarioId(scenarioId);
    setTimelineBeat(0);
    if (runState === 'playing' || runState === 'paused') setRunState('idle');
  };

  const primaryAction = (): void => {
    if (runState === 'playing') { setRunState('paused'); return; }
    if (runState === 'paused') { setRunState('playing'); return; }
    if (runState === 'failed') { setRunState('idle'); setTested(false); setTimelineBeat(0); return; }
    if (runState === 'passed') { onNext(); return; }
    runPlan();
  };

  const primaryLabel = runState === 'playing'
    ? 'Pause'
    : runState === 'paused'
      ? 'Resume'
      : runState === 'failed'
        ? 'Try again'
        : runState === 'passed'
          ? level.id === '10' ? 'Finish campaign' : 'Next level'
          : 'Go';

  const nextStop = timelineStops.find((stop) => stop > timelineBeat + 0.001) ?? timelineEnd;
  const previousStop = [...timelineStops].reverse().find((stop) => stop < timelineBeat - 0.001) ?? 0;
  const activeEvent = traversalEvents.find((event) => timelineBeat >= event.start && timelineBeat <= event.end) ?? [...traversalEvents].reverse().find((event) => event.end <= timelineBeat);

  const resetCurrentPlan = (): void => {
    savePlanState(resetPlan(planState));
    setTested(false);
    setRunState('idle');
    setTimelineBeat(0);
    setBottomSheet('none');
    setMenuOpen(false);
  };

  const confirmReveal = (): void => {
    savePlanState(revealSolution(level, planState, campaignSolutions[level.id]!));
    setRevealPending(false);
    setBottomSheet('none');
    setRunState('idle');
    setTested(false);
    setTimelineBeat(0);
  };

  return (
    <main className={`level-one-touch-shell campaign-touch-shell${level.scenarios.length > 1 ? ' has-futures' : ''}`}>
      <header className="touch-header">
        <button className="touch-menu-button" type="button" aria-expanded={menuOpen} aria-controls="campaign-menu" onClick={() => setMenuOpen((open) => !open)}>Menu</button>
        <div className="touch-objective">
          <h1>{level.id} {content.title}</h1>
          <p>{content.goalText}</p>
        </div>
        {level.budget > 1 && <span className="change-counter">{changesLeft} {changesLeft === 1 ? 'change' : 'changes'} left</span>}
      </header>

      {menuOpen && (
        <section className="touch-menu-panel" id="campaign-menu" aria-label="Game menu">
          <button type="button" onClick={onChapters}>Chapters</button>
          <button type="button" onClick={() => { setMenuOpen(false); onOpenSettings(); }}>Settings</button>
          <button type="button" onClick={() => { setMenuOpen(false); setHelpOpen(true); }}>Help</button>
          <button type="button" onClick={() => { setMenuOpen(false); setBottomSheet('hints'); }}>Hints</button>
          <button type="button" onClick={() => { setMenuOpen(false); setBottomSheet('advanced'); }}>Inspect playback</button>
          <button type="button" onClick={() => { setMenuOpen(false); setBottomSheet('text'); }}>Show text view</button>
          <button type="button" onClick={() => { setMenuOpen(false); setHelpActive(true); }}>Replay help</button>
          <button type="button" onClick={resetCurrentPlan}>Reset puzzle</button>
          {planState.redo.length > 0 && <button type="button" onClick={() => { savePlanState(redoPlanEdit(planState)); setMenuOpen(false); }}>Redo change</button>}
          {planState.recovery !== null && <button type="button" onClick={() => { savePlanState(restoreRecovery(level, planState)); setMenuOpen(false); }}>Restore my plan</button>}
          {offlineReady && <button type="button" onClick={onDismissOffline}>Offline ready</button>}
          {updateReady && <button type="button" disabled={saveStatus !== 'saved'} onClick={onUpdate}>Update now</button>}
          <span className={`save-status ${saveStatus}`} role="status">{saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving' : saveStatus === 'conflict' ? 'Newer save found' : 'Save failed'}</span>
        </section>
      )}

      <section className="touch-harbor" aria-label="Harbor puzzle">
        <SceneBoundary onUseTextView={() => setBottomSheet('text')}>
          <Suspense fallback={<div className="scene-loading" role="status">Drawing the harbor...</div>}>
            <CampaignHarborScene
              level={level}
              plan={viewedPlan}
              result={selectedResult}
              scenario={selectedScenario}
              timelineBeat={timelineBeat}
              selectedActorId={selectedActorId}
              showRouteOptions={bottomSheet === 'actor' && selectedEdit?.field === 'route'}
              bottomSheetOpen={sheetOpen}
              reducedMotion={reducedMotion}
              onSelectActor={selectActor}
            />
          </Suspense>
        </SceneBoundary>

        {level.scenarios.length > 1 && (
          <div className="future-strip" role="tablist" aria-label="Possible futures">
            {level.scenarios.map((scenario) => {
              const result = results.get(scenario.id)!;
              const resultLabel = tested ? result.passed ? 'Passed' : 'Needs a change' : '';
              return <button key={scenario.id} type="button" role="tab" aria-selected={selectedScenario.id === scenario.id} aria-label={`${SCENARIO_LABELS[scenario.id] ?? scenario.id}${resultLabel === '' ? '' : ` ${resultLabel}`}`} onClick={() => selectScenario(scenario.id)}><span>{SCENARIO_LABELS[scenario.id] ?? scenario.id}</span>{resultLabel !== '' && <small>{resultLabel}</small>}</button>;
            })}
          </div>
        )}

        {helpActive && runState === 'idle' && bottomSheet === 'none' && (
          <aside className="touch-coach campaign-coach" role="status">
            <p>{content.teaching}</p>
            <button type="button" onClick={dismissHelp}>Got it</button>
          </aside>
        )}

        {(runState === 'failed' || runState === 'passed') && (
          <aside className={`touch-result-callout ${runState}`} role="status" aria-live="polite">
            <span className={`vehicle-swatch vehicle-${selectedActorId.toLowerCase()}`} aria-hidden="true" />
            <p>{runState === 'passed' ? `All ${level.scenarios.length} ${level.scenarios.length === 1 ? 'future' : 'futures'} passed.` : failureText(selectedResult, selectedScenario.id)}</p>
          </aside>
        )}

        {!sheetOpen && runState === 'idle' && !helpActive && (
          <button className="labeled-vehicle-select" type="button" onClick={() => setBottomSheet('vehicles')}>Choose vehicle</button>
        )}

        {bottomSheet === 'vehicles' && (
          <section className="touch-bottom-sheet" aria-label="Select a vehicle">
            <div className="sheet-heading"><h2>Select a vehicle</h2><button type="button" onClick={() => setBottomSheet('none')}>Close</button></div>
            <div className="touch-choice-grid vehicle-choice-grid">
              {level.actors.map((actor) => <button key={actor.id} type="button" onClick={() => selectActor(actor.id)}><span>{ACTOR_LABELS[actor.id] ?? actor.id}</span><small>{level.edits.some((edit) => edit.actor === actor.id) ? 'Can change' : 'Fixed'}</small></button>)}
            </div>
          </section>
        )}

        {bottomSheet === 'actor' && (
          <section className="touch-bottom-sheet route-sheet" aria-label={`${ACTOR_LABELS[selectedActor.id] ?? selectedActor.id} controls`}>
            <div className="sheet-heading"><div><p className="sheet-kicker">{ACTOR_LABELS[selectedActor.id] ?? selectedActor.id}</p><h2>{selectedEdit === undefined ? 'Fixed plan' : selectedEdit.field === 'route' ? 'Choose a route' : 'Choose a start beat'}</h2></div><button type="button" onClick={() => setBottomSheet('none')}>Close</button></div>
            {selectedEdit === undefined ? (
              <p>This vehicle is fixed. It starts at beat {selectedScenario.starts[selectedActor.id] ?? selectedActor.start} and must arrive by beat {selectedScenario.deadlines[selectedActor.id] ?? selectedActor.deadline}.</p>
            ) : (
              <>
                <p className="sheet-detail">Deadline beat {selectedScenario.deadlines[selectedActor.id] ?? selectedActor.deadline}. {changesLeft} {changesLeft === 1 ? 'change' : 'changes'} left.</p>
                <div className="touch-choice-grid">
                  {selectedEdit.values.map((value) => {
                    const selected = selectedEdit.field === 'route' ? actorRoute(selectedActor, planState.plan) === value : actorStart(selectedActor, planState.plan) === value;
                    const label = selectedEdit.field === 'route' ? ROUTE_LABELS[String(value)] ?? String(value) : `Beat ${value}`;
                    return <button key={value} type="button" className={selected ? 'selected-choice' : ''} aria-pressed={selected} onClick={() => editPlan(selectedActor.id, selectedEdit.field, value)}><span>{label}</span>{selected && <small>Selected</small>}</button>;
                  })}
                </div>
              </>
            )}
          </section>
        )}

        {bottomSheet === 'advanced' && (
          <section className="touch-bottom-sheet advanced-sheet" aria-label="Playback details">
            <div className="sheet-heading"><h2>Inspect playback</h2><button type="button" onClick={() => setBottomSheet('none')}>Close</button></div>
            <p>{SCENARIO_LABELS[selectedScenario.id] ?? selectedScenario.id}, beat {timelineBeat.toFixed(1)} of {timelineEnd}.</p>
            <label className="advanced-timeline">Time in beats<input type="range" min="0" max={timelineEnd} step={TIMELINE_STEP} value={timelineBeat} onChange={(event) => { setRunState('idle'); setTimelineBeat(Number(event.target.value)); }} /></label>
            <div className="advanced-actions">
              <button type="button" onClick={() => setTimelineBeat(previousStop)} disabled={timelineBeat <= 0}>Previous event</button>
              <button type="button" onClick={() => setTimelineBeat(nextStop)} disabled={timelineBeat >= timelineEnd}>Next event</button>
              <label>Speed<select value={speed} onChange={(event) => setSpeed(Number(event.target.value) as 0.5 | 1 | 2)}><option value="0.5">Slow</option><option value="1">Normal</option><option value="2">Fast</option></select></label>
            </div>
            <button type="button" onClick={() => { setShowOriginal((value) => !value); setTimelineBeat(0); setTested(false); setRunState('idle'); }}>{showOriginal ? 'Return to current plan' : 'Compare original plan'}</button>
          </section>
        )}

        {bottomSheet === 'hints' && (
          <section className="touch-bottom-sheet hint-sheet" aria-label="Hints">
            <div className="sheet-heading"><h2>Hints</h2><button type="button" onClick={() => setBottomSheet('none')}>Close</button></div>
            {hintIndex >= 0 ? <p>{content.hints[Math.min(hintIndex, 2)]}</p> : <p>Reveal one clue at a time.</p>}
            <button type="button" onClick={() => setHintIndex((index) => Math.min(2, index + 1))}>Hint</button>
            {hintIndex === 2 && <button type="button" onClick={() => setRevealPending(true)}>Show the solution</button>}
          </section>
        )}

        {bottomSheet === 'text' && (
          <section className="touch-bottom-sheet text-play-sheet" aria-label="Text play view">
            <div className="sheet-heading"><h2>Plan and event details</h2><button type="button" onClick={() => setBottomSheet('none')}>Close</button></div>
            {level.actors.map((actor) => <article key={actor.id}><h3>{ACTOR_LABELS[actor.id] ?? actor.id}</h3><p>Starts at beat {actorStartForScenario(actor, viewedPlan, selectedScenario.starts)}. Deadline beat {selectedScenario.deadlines[actor.id] ?? actor.deadline}. Route: {ROUTE_LABELS[actorRoute(actor, viewedPlan)] ?? actorRoute(actor, viewedPlan)}.</p></article>)}
            <h3>Event trace</h3>
            <ol>{traversalEvents.map((event) => <li key={event.id} aria-current={activeEvent?.id === event.id ? 'step' : undefined}>{ACTOR_LABELS[event.actorId] ?? event.actorId}: beat {event.start} to {event.end}{event.waitingReason.kind === 'none' ? '' : ', waited before moving'}.</li>)}</ol>
          </section>
        )}
      </section>

      <footer className="touch-action-bar">
        {planState.undo.length > 0 && runState !== 'playing' && runState !== 'passed' && <button className="touch-undo" type="button" onClick={() => { savePlanState(undoPlanEdit(planState)); setTested(false); setRunState('idle'); setTimelineBeat(0); }}>Undo</button>}
        <button className="touch-primary" type="button" onClick={primaryAction}>{primaryLabel}</button>
      </footer>

      <ModalDialog open={revealPending} labelledBy="reveal-title" onClose={() => setRevealPending(false)}><h2 id="reveal-title">Replace your plan with the solution?</h2><p>Your current plan will stay available as a recovery snapshot.</p><div><button className="primary-button" type="button" onClick={confirmReveal}>Show solution</button><button type="button" onClick={() => setRevealPending(false)}>Keep my plan</button></div></ModalDialog>
      <ModalDialog open={helpOpen} labelledBy="help-title" className="help-dialog" onClose={() => setHelpOpen(false)}><h2 id="help-title">How this harbor works</h2><p>A beat is one step of harbor time. Shared road sections hold one vehicle at a time. Earlier arrivals move first.</p><p>Tap a vehicle to change its route or start beat. Go tests the plan in every listed future. Detailed playback changes only what you are viewing.</p><button className="primary-button" type="button" onClick={() => setHelpOpen(false)}>Back to the puzzle</button></ModalDialog>
    </main>
  );
}
