import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { PlayerSettings, SaveDocument } from '../storage/model';
import { parseSaveJson } from '../storage/validate';

interface SettingsDialogProps {
  readonly open: boolean;
  readonly settings: PlayerSettings;
  readonly onClose: () => void;
  readonly onSettingsChange: (settings: PlayerSettings) => void;
  readonly onExport: () => void;
  readonly onImport: (json: string) => Promise<void>;
  readonly onClear: () => void;
}

export function SettingsDialog({ open, settings, onClose, onSettingsChange, onExport, onImport, onClear }: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draftSettings, setDraftSettings] = useState(settings);
  const [importCandidate, setImportCandidate] = useState<{ readonly json: string; readonly save: SaveDocument } | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => setDraftSettings(settings), [settings]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const selectImport = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file === undefined) return;
    try {
      const json = await file.text();
      setImportCandidate({ json, save: parseSaveJson(json) });
      setMessage('');
    } catch (error) {
      setImportCandidate(null);
      setMessage(error instanceof Error ? error.message : 'The save could not be read.');
    }
  };

  const updateSettings = (nextSettings: PlayerSettings): void => {
    setDraftSettings(nextSettings);
    onSettingsChange(nextSettings);
  };

  return (
    <dialog ref={dialogRef} className="settings-dialog" onClose={onClose} aria-labelledby="settings-title">
      <form method="dialog" className="dialog-heading"><h2 id="settings-title">Settings and progress</h2><button type="submit" aria-label="Close settings">Close</button></form>
      <section><h3>Sound and display</h3>
        <label><input type="checkbox" checked={draftSettings.effects} onChange={(event) => updateSettings({ ...draftSettings, effects: event.target.checked })} /> Sound effects</label>
        <label><input type="checkbox" checked={draftSettings.music} onChange={(event) => updateSettings({ ...draftSettings, music: event.target.checked })} /> Quiet harbor tone</label>
        <label><input type="checkbox" checked={draftSettings.reducedMotion} onChange={(event) => updateSettings({ ...draftSettings, reducedMotion: event.target.checked })} /> Reduce motion</label>
        <label>Text size<select value={draftSettings.textScale} onChange={(event) => updateSettings({ ...draftSettings, textScale: Number(event.target.value) as PlayerSettings['textScale'] })}><option value="1">Standard</option><option value="1.125">Large</option><option value="1.25">Larger</option></select></label>
      </section>
      <section><h3>Progress backup</h3><p>Saves stay in this browser and may be cleared by browser settings. Export a copy before replacing or clearing progress.</p><div className="dialog-actions"><button type="button" onClick={onExport}>Export progress</button><label className="file-button">Import progress<input type="file" accept="application/json,.json" onChange={(event) => void selectImport(event)} /></label></div>
        {importCandidate !== null && <div className="import-summary" role="status"><p>This file has {importCandidate.save.completedLevelIds.length} completed puzzles and resumes at level {importCandidate.save.currentLevelId}.</p><button type="button" onClick={() => void onImport(importCandidate.json).then(() => { setMessage('Progress imported.'); setImportCandidate(null); })}>Replace with this save</button><button type="button" onClick={() => setImportCandidate(null)}>Cancel import</button></div>}
        {message !== '' && <p role="status">{message}</p>}
      </section>
      <section><h3>Install and offline play</h3><p>Use your browser's Install app or Add to Home Screen command. Open the game online once and wait for Offline ready before disconnecting.</p></section>
      <section className="danger-zone"><h3>Clear progress</h3><p>This removes completed puzzles and unfinished plans from this browser. Export first if you want a recovery file.</p><button type="button" onClick={() => { if (window.confirm('Clear all RIPPLE progress from this browser?')) onClear(); }}>Clear all progress</button></section>
    </dialog>
  );
}
