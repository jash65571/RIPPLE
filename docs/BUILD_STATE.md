# Build state

Updated September 15, 2026.

## Complete in the review build

- Ten immutable, versioned level files validate against the deterministic engine and each has one intended solution.
- The full campaign is playable from intro through ending with visible route and timing controls.
- Level 01 uses a separate Three.js renderer with an orthographic camera, connected route geometry, planted garden beds, jointed stone paving, detailed waterfront buildings, a finished timber dock, animated water, soft shadows, custom vehicle models, and trace-driven movement. Levels 02 through 10 retain the established renderer.
- Level 01 uses a dedicated portrait-first play screen with a fixed-height harbor, locally hosted Nunito Sans typography, tactile painted controls, direct vehicle taps, a labeled selection fallback, route highlighting, and compact bottom sheets. The same screen remains usable on desktop while Levels 02 through 10 retain the established interface.
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
- Content verifier: 75 first-party text files passed with no prohibited dashes or first-party SVG artwork.
- Production web and embedded builds: passed.
- Cross-browser suite: 39 stories passed and 12 platform-specific stories were skipped. Chromium passed the five touch-emulated Level 01 stories. Firefox and WebKit passed every supported story; their touch-emulation stories and offline service-worker story are skipped.
- PWA A/B cycle: update prompt, controlled activation, reload, and save retention passed.
- Chromium desktop screenshot run: all ten levels passed without horizontal overflow.
- Offline, recovery, multiple futures, keyboard, stale-tab, local-only network, and import/export browser checks are included in the final suite.
- Dependency audit: production and complete dependency trees both reported zero vulnerabilities.
- Marketing captures: three purpose-specific gameplay stills, square, portrait, and wide promos, plus captioned 15.04-second and 30.04-second WebM sources passed visual review.
- Level 01 premium review evidence includes first play, normal play, route selection, failure, and success at 360 by 800, 390 by 844, and 430 by 932. The 15 screenshots, metrics, and 12.60-second portrait gameplay recording are under `release/qa/level-01-premium`.
- Warm local scene samples in touch-emulated headless Chrome 153 on an NVIDIA RTX 4050 measured 109, 134, and 134 frames per second at 360 by 800, 390 by 844, and 430 by 932. Frame samples were 9.19, 7.45, and 7.47 milliseconds. Each sample reported 373 draw calls, 124,810 triangles, and zero document overflow.
- The measured initial Level 01 load used 8 requests and 275,162 transfer bytes. The production Level 01 renderer chunk is 574.95 KB raw and 146.31 KB gzip. The renderer chunk remains the main bundle-size concern for later optimization.

## Remaining Level 01 review limits

- No clipping, road disconnection, route drift, unreadable control, or accidental empty-area defect remains in the captured review states.
- Physical-phone color, thermal behavior, sustained frame pacing, browser chrome, and safe-area behavior remain unverified. The measured desktop GPU results cannot predict real phone performance.
- Visual approval remains with the owner. This pass has not been extended to Levels 02 through 10.

## Owner and environment blockers

- RIPPLE is a working name with existing games using the same name. Final naming and trademark clearance are required.
- Publisher name, support route, production URL, governing terms details, and legal approval are missing.
- Physical iOS and Android acceptance, real mobile browser chrome and safe-area behavior, store accounts, listing forms, age ratings, and privacy labels require owner access.
- Hosted headers, public URLs, social previews, and production service-worker behavior can be checked only after a private deployment exists.

No public deployment, purchase, or outreach was performed.
