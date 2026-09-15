# Build state

Updated September 15, 2026.

## Completed

- Created the strict React, Vite, TypeScript, PixiJS, Vitest, ESLint, and Playwright project foundation.
- Extracted and runtime-validated all ten campaign fixtures.
- Implemented deterministic simulation, closures, FIFO reservations, simultaneous priority, dependency release, goal results, trace provenance, stable trace IDs, and bounded validation.
- Implemented finite plan enumeration, budget calculation, undo, redo, branching, reset recovery, and solution recovery support.
- Reproduced the supplied baseline and winning arrival maps for every scenario.
- Built the first playable UI across all ten levels with chapter navigation, route and timing choices, multi-future tabs, plan testing, result copy, hints, timeline stepping, original-plan comparison, and structured text play.
- Added ten distinct normalized harbor layouts and custom PixiJS primitive drawings for the bus, parcel robot, cart, resources, water, trees, market, bridge, depot, and pier.
- Added responsive desktop and phone layouts plus visible keyboard focus and reduced-motion CSS.
- Implemented IndexedDB saves with transactional commit reporting, bounded plan history, schema and product validation, import/export validation, pre-import recovery backup, and stale-tab conflict detection.
- Wired plan edits, undo, redo, reset, and level completion into serialized browser saves.
- Added automated first-party copy and SVG provenance gates.

## Checks

- `npm install`: passed, 471 packages installed, 0 vulnerabilities reported.
- `npm run typecheck`: passed with no output.
- `npm run lint`: passed with no output.
- `npm test`: passed, 4 files and 31 tests.
- `npm run verify:levels`: passed, 10 levels and 36 plan combinations, exactly one solution per level.
- `npm run verify:content`: passed, 24 text files checked, no prohibited dash characters or first-party SVG assets.

## Not yet complete

- Save settings UI, import/export UI, schema migration fixtures, and interrupted-write browser coverage.
- Playback timing, sound, tutorial progression, solution reveal dialog, and campaign ending treatment.
- PWA manifest, service worker, install/update flow, and offline tests.
- Static public pages, policy drafts, marketing assets, release archives, and launch verification.
- Browser and screenshot inspection. Repository rules reserve starting Vite or asset builds for the owner, so no browser server was started here.

## Next task

Implement the IndexedDB save boundary and persist plan history, settings, and campaign completion with import/export validation.
