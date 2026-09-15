import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { soundEngine } from './audio/sound';
import { campaign } from './content/campaign';
import { usePwa } from './pwa/usePwa';
import type { PlayerSettings, SaveDocument, SavedPlan } from './storage/model';
import { createEmptySave, SaveConflictError, SaveRepository } from './storage/repository';
import { ChapterScreen } from './ui/ChapterScreen';
import { EndingScreen } from './ui/EndingScreen';
import { HomeScreen } from './ui/HomeScreen';
import { LevelScreen } from './ui/LevelScreen';
import { SettingsDialog } from './ui/SettingsDialog';

type Route = { readonly screen: 'home' | 'chapters' | 'ending' } | { readonly screen: 'level'; readonly levelId: string; readonly version?: number };
type SaveStatus = 'saved' | 'saving' | 'failed' | 'conflict';

const routeFromHash = (): Route => {
  const match = window.location.hash.match(/^#\/level\/(\d{2})(?:\?v=(\d+))?$/);
  if (match?.[1] !== undefined) return { screen: 'level', levelId: match[1], ...(match[2] === undefined ? {} : { version: Number(match[2]) }) };
  if (window.location.hash === '#/chapters') return { screen: 'chapters' };
  if (window.location.hash === '#/ending') return { screen: 'ending' };
  return { screen: 'home' };
};

const navigate = (hash: string): void => { window.location.hash = hash; };

export default function App() {
  const [route, setRoute] = useState(routeFromHash);
  const [save, setSave] = useState<SaveDocument | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saving');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const repositoryRef = useRef<SaveRepository | null>(null);
  const saveRef = useRef<SaveDocument | null>(null);
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());
  const pwa = usePwa();
  const embedded = import.meta.env.BASE_URL === './';

  useEffect(() => {
    const updateRoute = () => setRoute(routeFromHash());
    document.documentElement.dataset.buildId = __RIPPLE_BUILD_ID__;
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  useEffect(() => {
    let disposed = false;
    let stopListening: () => void = () => {};
    void SaveRepository.open().then(async (repository) => {
      if (disposed) { repository.close(); return; }
      repositoryRef.current = repository;
      const loaded = await repository.load();
      if (disposed) return;
      saveRef.current = loaded;
      setSave(loaded);
      setSaveStatus('saved');
      stopListening = repository.onExternalSave((revision) => {
        if (revision > (saveRef.current?.revision ?? -1)) setSaveStatus('conflict');
      });
    }).catch(() => { if (!disposed) setSaveStatus('failed'); });
    return () => { disposed = true; stopListening(); repositoryRef.current?.close(); repositoryRef.current = null; };
  }, []);

  useEffect(() => {
    if (save === null) return;
    document.documentElement.style.fontSize = `${save.settings.textScale * 100}%`;
    document.documentElement.dataset.reducedMotion = String(save.settings.reducedMotion);
    void soundEngine.setMusic(save.settings.music);
  }, [save]);

  useEffect(() => {
    const handleVisibility = () => { if (document.hidden) soundEngine.suspend(); };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const persist = useCallback((update: (current: SaveDocument) => SaveDocument): void => {
    setSaveStatus('saving');
    writeQueueRef.current = writeQueueRef.current.then(async () => {
      const repository = repositoryRef.current;
      const current = saveRef.current;
      if (repository === null || current === null) throw new Error('Browser storage is not ready.');
      const saved = await repository.save(update(current), current.revision);
      saveRef.current = saved;
      setSave(saved);
      setSaveStatus('saved');
    }).catch((error: unknown) => setSaveStatus(error instanceof SaveConflictError ? 'conflict' : 'failed'));
  }, []);

  const importProgress = async (json: string): Promise<void> => {
    await writeQueueRef.current;
    const repository = repositoryRef.current;
    const current = saveRef.current;
    if (repository === null || current === null) throw new Error('Browser storage is not ready.');
    const imported = await repository.importJson(json, current.revision);
    saveRef.current = imported;
    setSave(imported);
    setSaveStatus('saved');
  };

  const exportProgress = (): void => {
    const repository = repositoryRef.current;
    const current = saveRef.current;
    if (repository === null || current === null) return;
    const url = URL.createObjectURL(new Blob([repository.exportJson(current)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ripple-progress.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (save === null) return <main className="loading-screen"><p>Opening the harbor...</p></main>;

  const completed = new Set(save.completedLevelIds);
  let screen: ReactNode;
  if (route.screen === 'chapters') {
    screen = <ChapterScreen levels={campaign} completed={completed} onHome={() => navigate('')} onLevel={(levelId) => navigate(`#/level/${levelId}?v=1`)} />;
  } else if (route.screen === 'ending') {
    screen = <EndingScreen onChapters={() => navigate('#/chapters')} onReplay={() => navigate('#/level/01?v=1')} onShare={() => void (navigator.share?.({ title: 'RIPPLE', text: 'Watch a harbor delay, change one rule, and test the plan.', url: `${location.origin}/play/` }) ?? navigator.clipboard.writeText(`${location.origin}/play/`))} />;
  } else if (route.screen === 'level') {
    const levelIndex = campaign.findIndex((level) => level.id === route.levelId);
    const level = campaign[levelIndex];
    if (level === undefined || (route.version !== undefined && route.version !== level.version)) {
      screen = <main className="not-found"><h1>Puzzle not found</h1><p>That harbor plan is not part of this chapter.</p><button type="button" onClick={() => navigate('#/chapters')}>Return to chapters</button></main>;
    } else {
      const nextLevel = campaign[levelIndex + 1];
      screen = <LevelScreen key={level.id} level={level} settings={save.settings} onOpenSettings={() => setSettingsOpen(true)} offlineReady={pwa.offlineReady} onDismissOffline={pwa.dismissOffline} {...(save.plans[level.id] === undefined ? {} : { savedPlan: save.plans[level.id] })} saveStatus={saveStatus} onPlanChange={(levelId: string, plan: SavedPlan) => persist((current) => ({ ...current, currentLevelId: levelId, plans: { ...current.plans, [levelId]: { ...current.plans[levelId], ...plan } } }))} onTutorialProgress={(levelId, tutorialStep) => persist((current) => { const existing = current.plans[levelId] ?? { plan: {}, undo: [], redo: [], revision: 0 }; return { ...current, currentLevelId: levelId, plans: { ...current.plans, [levelId]: { ...existing, tutorialStep } } }; })} onComplete={(levelId) => { if (!completed.has(levelId)) persist((current) => ({ ...current, completedLevelIds: [...current.completedLevelIds, levelId] })); }} onChapters={() => navigate('#/chapters')} onNext={() => navigate(nextLevel === undefined ? '#/ending' : `#/level/${nextLevel.id}?v=${nextLevel.version}`)} />;
    }
  } else {
    screen = <HomeScreen hasProgress={save.completedLevelIds.length > 0 || Object.keys(save.plans).length > 0} onStart={() => navigate(`#/level/${save.currentLevelId}?v=1`)} onChapters={() => navigate('#/chapters')} />;
  }

  const levelOneOpen = route.screen === 'level' && route.levelId === '01';
  return <>{embedded && <div className="embedded-notice" role="status">Embedded build: progress belongs to this frame. Use the web release for installation and offline updates.</div>}{screen}{route.screen !== 'level' && <button className="global-settings" type="button" onClick={() => setSettingsOpen(true)}>Settings</button>}{pwa.offlineReady && !levelOneOpen && <div className="pwa-notice" role="status">Offline ready. All ten puzzles are available.<button type="button" onClick={pwa.dismissOffline}>Dismiss</button></div>}{pwa.updateReady && <div className="pwa-notice" role="status">{saveStatus === 'saved' ? 'An update is ready. Your progress is saved.' : 'An update is ready. Wait for saving to finish.'}<button type="button" disabled={saveStatus !== 'saved'} onClick={() => void pwa.update()}>Update now</button></div>}<SettingsDialog open={settingsOpen} settings={save.settings} onClose={() => setSettingsOpen(false)} onSettingsChange={(settings: PlayerSettings) => persist((current) => ({ ...current, settings }))} onExport={exportProgress} onImport={importProgress} onClear={() => { const empty = createEmptySave(); persist((current) => ({ ...empty, revision: current.revision, settings: current.settings })); navigate(''); }} /></>;
}
