import { useCallback, useEffect, useRef, useState } from 'react';
import { campaign } from './content/campaign';
import { ChapterScreen } from './ui/ChapterScreen';
import { HomeScreen } from './ui/HomeScreen';
import { LevelScreen } from './ui/LevelScreen';
import type { SaveDocument, SavedPlan } from './storage/model';
import { SaveConflictError, SaveRepository } from './storage/repository';

type Route = { readonly screen: 'home' | 'chapters' } | { readonly screen: 'level'; readonly levelId: string };

const routeFromHash = (): Route => {
  const match = window.location.hash.match(/^#\/level\/(\d{2})(?:\?v=\d+)?$/);
  if (match?.[1] !== undefined) return { screen: 'level', levelId: match[1] };
  if (window.location.hash === '#/chapters') return { screen: 'chapters' };
  return { screen: 'home' };
};

const navigate = (hash: string): void => {
  window.location.hash = hash;
};

export default function App() {
  const [route, setRoute] = useState(routeFromHash);
  const [save, setSave] = useState<SaveDocument | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'failed' | 'conflict'>('saving');
  const repositoryRef = useRef<SaveRepository | null>(null);
  const saveRef = useRef<SaveDocument | null>(null);
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const updateRoute = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  useEffect(() => {
    let disposed = false;
    let stopListening: () => void = () => {};
    void SaveRepository.open().then(async (repository) => {
      if (disposed) {
        repository.close();
        return;
      }
      repositoryRef.current = repository;
      const loaded = await repository.load();
      if (disposed) return;
      saveRef.current = loaded;
      setSave(loaded);
      setSaveStatus('saved');
      stopListening = repository.onExternalSave((revision) => {
        if (revision > (saveRef.current?.revision ?? -1)) setSaveStatus('conflict');
      });
    }).catch(() => {
      if (!disposed) setSaveStatus('failed');
    });
    return () => {
      disposed = true;
      stopListening();
      repositoryRef.current?.close();
      repositoryRef.current = null;
    };
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
    }).catch((error: unknown) => {
      setSaveStatus(error instanceof SaveConflictError ? 'conflict' : 'failed');
    });
  }, []);

  if (save === null) {
    return <main className="loading-screen"><p>Opening the harbor...</p></main>;
  }

  const completed = new Set(save.completedLevelIds);

  if (route.screen === 'chapters') {
    return <ChapterScreen levels={campaign} completed={completed} onHome={() => navigate('')} onLevel={(levelId) => navigate(`#/level/${levelId}?v=1`)} />;
  }
  if (route.screen === 'level') {
    const levelIndex = campaign.findIndex((level) => level.id === route.levelId);
    const level = campaign[levelIndex];
    if (level === undefined) {
      return <main className="not-found"><h1>Puzzle not found</h1><p>That harbor plan is not part of this chapter.</p><button type="button" onClick={() => navigate('#/chapters')}>Return to chapters</button></main>;
    }
    const nextLevel = campaign[levelIndex + 1];
    return (
      <LevelScreen
        key={level.id}
        level={level}
        {...(save.plans[level.id] === undefined ? {} : { savedPlan: save.plans[level.id] })}
        saveStatus={saveStatus}
        onPlanChange={(levelId: string, plan: SavedPlan) => persist((current) => ({ ...current, currentLevelId: levelId, plans: { ...current.plans, [levelId]: plan } }))}
        onComplete={(levelId) => {
          if (!completed.has(levelId)) {
            persist((current) => ({ ...current, completedLevelIds: [...current.completedLevelIds, levelId] }));
          }
        }}
        onChapters={() => navigate('#/chapters')}
        onNext={() => navigate(nextLevel === undefined ? '#/chapters' : `#/level/${nextLevel.id}?v=${nextLevel.version}`)}
      />
    );
  }
  return <HomeScreen onStart={() => navigate('#/level/01?v=1')} onChapters={() => navigate('#/chapters')} />;
}
