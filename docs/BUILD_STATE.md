# Build state

Updated September 15, 2026.

## Complete in the review build

- Ten immutable, versioned level files validate against the deterministic engine and each has one intended solution.
- The full campaign is playable from intro through ending with visible route and timing controls.
- Level 01 uses a separate Three.js renderer with an orthographic camera, raised harbor geometry, custom robot and bus models, animated water, soft shadows, and trace-driven movement. Levels 02 through 10 retain the established renderer.
- Level 01 uses a dedicated portrait-first play screen with a fixed-height harbor, direct vehicle taps, a labeled selection fallback, route highlighting, and compact bottom sheets. The same screen remains usable on desktop while Levels 02 through 10 retain the established interface.
- Level 01 first play demonstrates the crossing delay, asks the player to select the robot and choose a route, and saves tutorial progress. Returning players are not forced through it again.
- Level 01 uses one primary Go control that becomes Pause, Try again, or Next level as the run changes state. Advanced playback, reset, settings, chapters, tutorial replay, save state, and offline state live in the menu or inspection sheet.
- Timeline playback, rewind, pause, speed, stepping, scrubbing, original comparison, actor inspection, zoom, and structured text play are implemented.
- Hints, guarded solution reveal, reset recovery, reveal recovery, undo, redo, chapter navigation, and multiple futures are implemented.
- IndexedDB progress includes serialized writes, version checks, migration, bounded history, import, export, stale-tab protection, and transaction interruption coverage.
- PWA metadata, original PNG icons, full offline precache, explicit offline-ready notice, and user-controlled update activation are implemented.
- Keyboard operation, native modal focus containment, visible focus, large touch targets, text sizing, reduced motion, and optional sound are implemented.
- Public information pages, review policy drafts, operations notes, data inventory, license register, owner checklist, marketing kit, screenshots, promo images, trailers, and release packages are present.
- Web and embedded itch.io packages use separate path and service-worker behavior.
- First-party verification rejects em dashes, en dashes, and SVG artwork.

## Current verification

- TypeScript: passed.
- ESLint: passed.
- Vitest: 4 files and 33 tests passed.
- Level verifier: 10 levels, 36 allowed plans, and one solution per level passed.
- Content verifier: 74 first-party text files passed with no prohibited dashes or first-party SVG artwork.
- Production web and embedded builds: passed.
- Cross-browser suite: 38 stories passed and 10 platform-specific stories were skipped in 2.5 minutes. Chromium passed the four touch-emulated Level 01 stories. Firefox and WebKit passed every supported story; their touch-emulation stories and offline service-worker story are skipped.
- PWA A/B cycle: update prompt, controlled activation, reload, and save retention passed.
- Chromium desktop screenshot run: all ten levels passed without horizontal overflow.
- Offline, recovery, multiple futures, keyboard, stale-tab, local-only network, and import/export browser checks are included in the final suite.
- Dependency audit: production and complete dependency trees both reported zero vulnerabilities.
- Marketing captures: three purpose-specific gameplay stills, square, portrait, and wide promos, plus captioned 15.04-second and 30.04-second WebM sources passed visual review.
- Level 01 mobile review evidence: 360 by 800 first play, 390 by 844 route selection, and 430 by 932 success screenshots plus an 18.84-second portrait WebM recording are under `release/qa/level-01-3d`.
- Level 01 warm local scene samples in touch-emulated system Chrome measured 131, 141, and 140 frames per second at 360 by 800, 390 by 844, and 430 by 932. Each sample reported 135 draw calls and 51,790 triangles with zero document overflow.

## Owner and environment blockers

- RIPPLE is a working name with existing games using the same name. Final naming and trademark clearance are required.
- Publisher name, support route, production URL, governing terms details, and legal approval are missing.
- Physical iOS and Android acceptance, real mobile browser chrome and safe-area behavior, store accounts, listing forms, age ratings, and privacy labels require owner access.
- Hosted headers, public URLs, social previews, and production service-worker behavior can be checked only after a private deployment exists.

No public deployment, purchase, or outreach was performed.
