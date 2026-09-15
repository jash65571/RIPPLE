import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { soundEngine } from '../audio/sound';
import { ROUTE_LABELS } from '../config/product';
import { levelContent } from '../content/campaign/content';
import { planKey, type Plan, type TraversalTraceEvent } from '../game/model';
import { applyPlanEdit, createPlanState, resetPlan, undoPlanEdit } from '../game/plan';
import { simulate } from '../game/simulate';
import { LEVEL_ONE_TUTORIAL_COMPLETE_STEP } from '../storage/model';
import type { LevelScreenProps } from './LevelScreen';
import { SceneBoundary } from './SceneBoundary';

const LevelOneHarborScene = lazy(async () => {
  const module = await import('../render/LevelOneHarborScene');
  return { default: module.LevelOneHarborScene };
});

type BottomSheet = 'none' | 'vehicles' | 'robot' | 'bus' | 'advanced';
type PlaybackMode = 'idle' | 'demo' | 'run';
type RunOutcome = 'none' | 'failed' | 'passed';

const EMPTY_PLAN: Plan = {};
const PLAYBACK_BEATS_PER_SECOND = 0.9;
const TIMELINE_STEP = 0.05;
const DEMO_CONFLICT_BEAT = 3;
const TUTORIAL_STEP = {
  goal: 0,
  demo: 1,
  delay: 2,
  choose: 3,
  ready: 4,
  run: 5,
  complete: LEVEL_ONE_TUTORIAL_COMPLETE_STEP,
} as const;

const initialTutorialStep = (savedStep: number | undefined, hasSavedPlan: boolean): number => {
  if (savedStep === undefined) return hasSavedPlan ? TUTORIAL_STEP.complete : TUTORIAL_STEP.goal;
  if (savedStep === TUTORIAL_STEP.demo) return TUTORIAL_STEP.goal;
  if (savedStep === TUTORIAL_STEP.run) return TUTORIAL_STEP.ready;
  return savedStep;
};

export function LevelOneScreen({
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
  settings,
  onOpenSettings,
}: LevelScreenProps) {
  const content = levelContent[level.id]!;
  const [planState, setPlanState] = useState(() => savedPlan === undefined ? createPlanState() : { ...savedPlan, recovery: null });
  const startingTutorialStep = initialTutorialStep(savedPlan?.tutorialStep, savedPlan !== undefined);
  const [tutorialStep, setTutorialStep] = useState(startingTutorialStep);
  const savedTutorialStepRef = useRef(savedPlan?.tutorialStep ?? (savedPlan === undefined ? TUTORIAL_STEP.goal : TUTORIAL_STEP.complete));
  const [timelineBeat, setTimelineBeat] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('idle');
  const [runOutcome, setRunOutcome] = useState<RunOutcome>('none');
  const [bottomSheet, setBottomSheet] = useState<BottomSheet>('none');
  const [selectedActorId, setSelectedActorId] = useState('');
  const [showOriginal, setShowOriginal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);

  const scenario = level.scenarios[0]!;
  const viewedPlan = showOriginal ? EMPTY_PLAN : planState.plan;
  const result = useMemo(() => simulate(level, viewedPlan, scenario), [level, scenario, viewedPlan]);
  const traversalEvents = result.trace.filter((event): event is TraversalTraceEvent => event.kind === 'traversal');
  const timelineEnd = Math.max(0, ...traversalEvents.map((event) => event.end));
  const timelineStops = [...new Set([0, ...traversalEvents.flatMap((event) => [event.start, event.end])])].sort((a, b) => a - b);
  const routeValue = planState.plan[planKey('R', 'route')];
  const selectedRoute = typeof routeValue === 'string' ? routeValue : level.actors.find((actor) => actor.id === 'R')!.defaultRoute;
  const tutorialActive = tutorialStep < TUTORIAL_STEP.complete;

  const savePlanState = (next: typeof planState): void => {
    setPlanState(next);
    onPlanChange(level.id, { plan: next.plan, undo: next.undo, redo: next.redo, revision: next.revision });
  };

  const advanceTutorial = (nextStep: number): void => {
    setTutorialStep(nextStep);
    if (nextStep > savedTutorialStepRef.current) {
      savedTutorialStepRef.current = nextStep;
      onTutorialProgress(level.id, nextStep);
    }
  };

  const selectActor = (actorId: string): void => {
    setSelectedActorId(actorId);
    setBottomSheet(actorId === 'R' ? 'robot' : 'bus');
    if (tutorialStep === TUTORIAL_STEP.delay && actorId === 'R') {
      setShowOriginal(false);
      advanceTutorial(TUTORIAL_STEP.choose);
    }
  };

  const editRobotRoute = (routeId: string): void => {
    const next = applyPlanEdit(level, planState, planKey('R', 'route'), routeId);
    savePlanState(next);
    setShowOriginal(false);
    setTimelineBeat(0);
    setRunOutcome('none');
    setSelectedActorId('R');
    setBottomSheet('none');
    if (tutorialStep === TUTORIAL_STEP.choose) advanceTutorial(TUTORIAL_STEP.ready);
  };

  const startPlayback = (mode: Exclude<PlaybackMode, 'idle'>): void => {
    setBottomSheet('none');
    setMenuOpen(false);
    setRunOutcome('none');
    setPlaybackMode(mode);
    setTimelineBeat(0);
    if (settings.reducedMotion) {
      setPlaying(false);
      setTimelineBeat(mode === 'demo' ? DEMO_CONFLICT_BEAT : timelineEnd);
    } else {
      setPlaying(true);
    }
  };

  const startDemo = (): void => {
    setShowOriginal(true);
    advanceTutorial(TUTORIAL_STEP.demo);
    startPlayback('demo');
  };

  const runPlan = (): void => {
    setShowOriginal(false);
    if (tutorialActive) advanceTutorial(TUTORIAL_STEP.run);
    startPlayback('run');
  };

  const finishRun = (): void => {
    setPlaybackMode('idle');
    setPlaying(false);
    if (result.passed) {
      setRunOutcome('passed');
      setSelectedActorId('R');
      onComplete(level.id);
      void soundEngine.effect('success', settings.effects);
    } else {
      setRunOutcome('failed');
      setSelectedActorId(result.firstFailure?.actorId ?? 'B');
      void soundEngine.effect('failure', settings.effects);
    }
    if (tutorialActive) advanceTutorial(TUTORIAL_STEP.complete);
  };

  useEffect(() => {
    if (!playing || settings.reducedMotion || timelineEnd === 0) return;
    let frame = 0;
    let previous = performance.now();
    const advance = (now: number): void => {
      const seconds = Math.min(0.1, (now - previous) / 1000);
      previous = now;
      const playbackScale = playbackMode === 'demo' ? 1.6 : 1;
      setTimelineBeat((beat) => Math.min(timelineEnd, beat + seconds * speed * PLAYBACK_BEATS_PER_SECOND * playbackScale));
      frame = window.requestAnimationFrame(advance);
    };
    frame = window.requestAnimationFrame(advance);
    return () => window.cancelAnimationFrame(frame);
  }, [playbackMode, playing, settings.reducedMotion, speed, timelineEnd]);

  useEffect(() => {
    if (playbackMode === 'idle') return;
    if (playbackMode === 'demo' && (settings.reducedMotion || timelineBeat >= timelineEnd)) {
      setPlaybackMode('idle');
      setPlaying(false);
      setTimelineBeat(DEMO_CONFLICT_BEAT);
      advanceTutorial(TUTORIAL_STEP.delay);
      return;
    }
    if (playbackMode === 'run' && timelineBeat >= timelineEnd) finishRun();
  });

  useEffect(() => {
    if (settings.reducedMotion) setPlaying(false);
  }, [settings.reducedMotion]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent): void => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.code === 'Space') {
        event.preventDefault();
        if (playbackMode !== 'idle' && !settings.reducedMotion) setPlaying((value) => !value);
      }
      if (event.key.toLowerCase() === 'z' && planState.undo.length > 0) savePlanState(undoPlanEdit(planState));
      if (event.key === 'Escape') { setMenuOpen(false); setBottomSheet('none'); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const pauseOrGo = (): void => {
    if (playing) { setPlaying(false); return; }
    if (playbackMode !== 'idle') { setPlaying(true); return; }
    if (tutorialStep === TUTORIAL_STEP.goal) { startDemo(); return; }
    if (tutorialStep === TUTORIAL_STEP.delay) { selectActor('R'); return; }
    if (tutorialStep === TUTORIAL_STEP.choose) return;
    runPlan();
  };

  const primaryLabel = runOutcome === 'failed'
    ? 'Try again'
    : runOutcome === 'passed'
      ? 'Next level'
      : playing
        ? 'Pause'
        : tutorialStep === TUTORIAL_STEP.delay
          ? 'Select robot'
          : tutorialStep === TUTORIAL_STEP.choose
            ? 'Choose a route'
            : 'Go';

  const primaryAction = (): void => {
    if (runOutcome === 'passed') { onNext(); return; }
    if (runOutcome === 'failed') {
      setRunOutcome('none');
      setTimelineBeat(0);
      selectActor('R');
      return;
    }
    pauseOrGo();
  };

  const previousStop = [...timelineStops].reverse().find((stop) => stop < timelineBeat - TIMELINE_STEP) ?? 0;
  const nextStop = timelineStops.find((stop) => stop > timelineBeat + TIMELINE_STEP) ?? timelineEnd;
  const sheetOpen = bottomSheet !== 'none';
  const showRoutes = selectedActorId === 'R' || bottomSheet === 'robot' || tutorialStep === TUTORIAL_STEP.choose || tutorialStep === TUTORIAL_STEP.ready;

  return (
    <main className="level-one-touch-shell">
      <header className="touch-header">
        <button className="touch-menu-button" type="button" aria-expanded={menuOpen} aria-controls="level-one-menu" onClick={() => setMenuOpen((open) => !open)}>Menu</button>
        <div>
          <h1>{content.title}</h1>
          <p>Get both vehicles to their stops.</p>
        </div>
      </header>

      {menuOpen && (
        <section className="touch-menu-panel" id="level-one-menu" aria-label="Game menu">
          <button type="button" onClick={onChapters}>Chapters</button>
          <button type="button" onClick={() => { setMenuOpen(false); onOpenSettings(); }}>Settings</button>
          <button type="button" onClick={() => { setMenuOpen(false); setBottomSheet('advanced'); }}>Inspect playback</button>
          <button type="button" onClick={() => { setMenuOpen(false); setRunOutcome('none'); setShowOriginal(false); setTimelineBeat(0); setTutorialStep(TUTORIAL_STEP.goal); }}>Replay tutorial</button>
          {offlineReady && <button type="button" onClick={onDismissOffline}>Offline ready</button>}
          <span className={`save-status ${saveStatus}`} role="status">{saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving' : saveStatus === 'conflict' ? 'Newer save found' : 'Save failed'}</span>
        </section>
      )}

      <section className="touch-harbor" aria-label="Harbor puzzle">
        <SceneBoundary onUseTextView={() => setBottomSheet('advanced')}>
          <Suspense fallback={<div className="scene-loading" role="status">Drawing the harbor...</div>}>
            <LevelOneHarborScene
              level={level}
              plan={viewedPlan}
              result={result}
              timelineBeat={timelineBeat}
              selectedActorId={selectedActorId}
              zoom={1}
              reducedMotion={settings.reducedMotion}
              showRobotRoutes={showRoutes}
              emphasizeDestinations={tutorialStep === TUTORIAL_STEP.goal}
              bottomSheetOpen={sheetOpen}
              onSelectActor={selectActor}
            />
          </Suspense>
        </SceneBoundary>

        {tutorialActive && tutorialStep !== TUTORIAL_STEP.choose && tutorialStep !== TUTORIAL_STEP.run && (
          <aside className="touch-coach" role="status">
            <p>{tutorialStep === TUTORIAL_STEP.goal
              ? 'The red and yellow markers are the two stops. Press Go to watch the traffic.'
              : tutorialStep === TUTORIAL_STEP.delay
                ? 'The robot takes the crossing first. The bus has to wait. Tap the robot.'
                : 'The route is highlighted. Press Go to try your choice.'}</p>
            <button type="button" onClick={() => advanceTutorial(TUTORIAL_STEP.complete)}>Skip tutorial</button>
          </aside>
        )}

        {runOutcome !== 'none' && (
          <aside className={`touch-result-callout ${runOutcome}`} role="status">
            <span className={`vehicle-swatch vehicle-${selectedActorId.toLowerCase()}`} aria-hidden="true" />
            <p>{runOutcome === 'passed'
              ? 'Both vehicles reached their stops on time.'
              : 'The bus reached its stop too late. The crossing kept it waiting.'}</p>
          </aside>
        )}

        {!sheetOpen && playbackMode === 'idle' && runOutcome === 'none' && tutorialStep !== TUTORIAL_STEP.delay && (
          <button className="labeled-vehicle-select" type="button" onClick={() => setBottomSheet('vehicles')}>Select vehicle</button>
        )}

        {bottomSheet === 'vehicles' && (
          <section className="touch-bottom-sheet" aria-label="Select a vehicle">
            <div className="sheet-heading"><h2>Select a vehicle</h2><button type="button" onClick={() => setBottomSheet('none')}>Close</button></div>
            <div className="touch-choice-grid"><button type="button" onClick={() => selectActor('R')}>Parcel robot</button><button type="button" onClick={() => selectActor('B')}>Harbor bus</button></div>
          </section>
        )}

        {bottomSheet === 'robot' && (
          <section className="touch-bottom-sheet route-sheet" aria-label="Parcel robot routes">
            <div className="sheet-heading"><div><p className="eyebrow">Parcel robot</p><h2>Choose a route</h2></div><button type="button" onClick={() => setBottomSheet('none')}>Close</button></div>
            {tutorialStep === TUTORIAL_STEP.choose && <p className="sheet-instruction">Choose either route. Watch the highlighted line change on the harbor.</p>}
            <div className="touch-choice-grid">
              {['crossing', 'garden'].map((routeId) => <button key={routeId} type="button" className={selectedRoute === routeId ? 'selected-choice' : ''} aria-pressed={selectedRoute === routeId} onClick={() => editRobotRoute(routeId)}>{ROUTE_LABELS[routeId] ?? routeId}</button>)}
            </div>
          </section>
        )}

        {bottomSheet === 'bus' && (
          <section className="touch-bottom-sheet" aria-label="Harbor bus details">
            <div className="sheet-heading"><div><p className="eyebrow">Harbor bus</p><h2>Main road</h2></div><button type="button" onClick={() => setBottomSheet('none')}>Close</button></div>
            <p>The bus route is fixed. Change the robot route to clear the crossing.</p>
            <button type="button" onClick={() => selectActor('R')}>Select parcel robot</button>
          </section>
        )}

        {bottomSheet === 'advanced' && (
          <section className="touch-bottom-sheet advanced-sheet" aria-label="Playback details">
            <div className="sheet-heading"><h2>Inspect playback</h2><button type="button" onClick={() => setBottomSheet('none')}>Close</button></div>
            <label className="advanced-timeline">Time<input type="range" min="0" max={timelineEnd} step={TIMELINE_STEP} value={timelineBeat} onChange={(event) => { setPlaying(false); setPlaybackMode('idle'); setTimelineBeat(Number(event.target.value)); }} /></label>
            <div className="advanced-actions">
              <button type="button" onClick={() => setTimelineBeat(previousStop)} disabled={timelineBeat <= 0}>Previous</button>
              <button type="button" onClick={() => setTimelineBeat(nextStop)} disabled={timelineBeat >= timelineEnd}>Next</button>
              <label>Speed<select value={speed} onChange={(event) => setSpeed(Number(event.target.value) as 0.5 | 1 | 2)}><option value="0.5">Slow</option><option value="1">Normal</option><option value="2">Fast</option></select></label>
            </div>
            <button type="button" onClick={() => { const next = resetPlan(planState); savePlanState(next); setTimelineBeat(0); setRunOutcome('none'); setShowOriginal(false); setBottomSheet('none'); }}>Reset puzzle</button>
          </section>
        )}
      </section>

      <footer className="touch-action-bar">
        {planState.undo.length > 0 && runOutcome === 'none' && !playing && <button className="touch-undo" type="button" onClick={() => { savePlanState(undoPlanEdit(planState)); setRunOutcome('none'); setTimelineBeat(0); }}>Undo</button>}
        <button className="touch-primary" type="button" disabled={tutorialStep === TUTORIAL_STEP.choose} onClick={primaryAction}>{primaryLabel}</button>
      </footer>
    </main>
  );
}
