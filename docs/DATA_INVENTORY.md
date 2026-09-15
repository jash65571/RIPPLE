# Data inventory

RIPPLE has no account, advertising, analytics, telemetry, remote save, or gameplay API. The production application should make requests only to its own origin for its static files and service worker.

## Browser storage

IndexedDB database `com.jash.ripple.saves` stores the active save and local safety backups. A save contains product and schema versions, revision and save time, current level, completed level IDs, route and timing choices, bounded undo and redo history, and sound, motion, and text-size settings.

The service worker cache stores static application files needed for offline play. Browser controls can remove IndexedDB and caches. The in-game Clear progress action removes gameplay progress while preserving current settings. Export creates a JSON file chosen by the player. Import reads only the file the player selects.

## Network and permissions

No device permission is requested. Audio starts only after a user action. Share uses the browser share sheet when available and otherwise copies the public play URL. No entered or generated content is uploaded.
