import { UI_COPY } from '../config/product';
import { levelContent } from '../content/campaign/content';
import type { LevelDefinition } from '../game/model';

interface ChapterScreenProps {
  readonly levels: readonly LevelDefinition[];
  readonly completed: ReadonlySet<string>;
  readonly onHome: () => void;
  readonly onLevel: (levelId: string) => void;
}

export function ChapterScreen({ levels, completed, onHome, onLevel }: ChapterScreenProps) {
  const highestCompleted = Math.max(0, ...[...completed].map(Number));
  const unlockedThrough = Math.min(10, Math.max(3, highestCompleted + 2));
  const chapters = ['First Ripples', 'Connected Streets', 'Possible Days'] as const;

  return (
    <main className="chapter-screen">
      <header className="chapter-header">
        <button type="button" onClick={onHome}>Home</button>
        <div><p className="eyebrow">Ten harbor puzzles</p><h1>{UI_COPY.chapters}</h1></div>
      </header>
      {chapters.map((chapter) => (
        <section className="chapter-group" key={chapter}>
          <h2>{chapter}</h2>
          <div className="level-grid">
            {levels.filter((level) => levelContent[level.id]!.chapter === chapter).map((level) => {
              const content = levelContent[level.id]!;
              const isUnlocked = Number(level.id) <= unlockedThrough;
              const isComplete = completed.has(level.id);
              return (
                <button key={level.id} type="button" disabled={!isUnlocked} onClick={() => onLevel(level.id)}>
                  <span className="level-number">{level.id}</span>
                  <span><strong>{content.title}</strong><small>{isComplete ? 'Completed' : isUnlocked ? `${level.scenarios.length} ${level.scenarios.length === 1 ? 'future' : 'futures'} · ${level.budget} ${level.budget === 1 ? 'change' : 'changes'}` : 'Complete an earlier puzzle to open'}</small></span>
                  <span className={isComplete ? 'completion-mark complete' : 'completion-mark'} aria-hidden="true">{isComplete ? '✓' : '→'}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
