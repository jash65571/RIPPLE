# Build state

Updated September 15, 2026.

## Complete in the review build

- Ten immutable, versioned level files still validate against the deterministic engine and each has one intended solution.
- The approved coastal miniature style and portrait touch shell now cover the complete campaign. Level 1 keeps its specialized Three.js scene, while Levels 2 through 10 use one shared, data-driven Three.js renderer.
- Scene presentation data is separate from simulation rules. Each level has its own shoreline, road network, building group, gardens, dock placement, and mechanic-specific landmark.
- Roads, route highlights, and trace-driven vehicle motion use the same route curves. Bridge closures visibly raise the bridge, Level 4 marks its handoff, queue levels show their shared waiting lanes, and three-actor levels keep distinct vehicle silhouettes and destinations.
- Repeated paving, planting, trees, and dock parts use instancing. Materials, route curves, event lists, and frame state are shared or cached, and renderer-owned GPU resources are disposed on unmount.
- The mobile interface uses direct vehicle taps plus a labeled fallback, contextual route or departure sheets, fixed-vehicle explanations, one Go control, visible Undo, and secondary playback tools in the menu.
- Go evaluates every required future. The future strip labels each result, focuses the first failed future, preserves the plan for retry, and reports overall success only after every future passes.
- Level 1 keeps its full playable tutorial. Later levels introduce timing, closures, handoffs, change limits, queues, and multiple futures with one saved contextual instruction when each mechanic first appears.
- Start, Continue, chapters, settings, menus, saved progress, next level, and the ending use the cream, coral, teal, and warm stone design system. Level 10 uses Finish campaign and routes to the ending.
- The shell respects safe areas, 48 CSS pixel targets, keyboard input, larger text, the in-game reduced-motion setting, and the operating-system reduced-motion preference. Normal play does not require document scrolling at 360 by 800, 390 by 844, or 430 by 932.
- IndexedDB progress, bounded undo and redo, reset recovery, guarded solution reveal, import, export, stale-tab protection, offline play, and user-controlled update activation remain implemented.
- The obsolete PixiJS renderer and dependency were removed after reference checks. Three.js, React, Workbox, and the local Nunito Sans font remain registered in the license and release-notice workflow.

## Current verification

- TypeScript and ESLint passed.
- Vitest passed 4 files and 33 tests.
- The level verifier passed all 10 levels, 36 allowed plans, and one solution per level.
- The content verifier checked 79 first-party text files with no prohibited dash characters or first-party SVG artwork.
- Production web build passed with 36 PWA precache entries totaling 975.92 KiB.
- Chromium passed all 20 browser stories, including complete campaign success, a meaningful failed plan on every level, all three portrait sizes, larger text, touch input, offline reload, tutorial recovery, save recovery, and final ending behavior.
- Firefox and WebKit passed every supported campaign, save, keyboard, import, export, and local-network story. Their Chromium-specific touch and service-worker stories are skipped.
- Thirty current level captures are under `release/qa/campaign`, covering all ten levels at 360 by 800, 390 by 844, and 430 by 932.
- Level 9 review evidence includes tutorial, route chooser, failed future, corrected success, and a 21.92-second portrait WebM walkthrough under `release/qa/campaign/review`.
- Warm local rendering samples in touch-emulated headless Chrome 153 on an NVIDIA RTX 4050 Laptop GPU measured 109 to 141 frames per second and 7.07 to 9.21 milliseconds per frame. Scenes reported 90 to 205 draw calls and 46,472 to 106,036 triangles.
- Level 1 now reports 205 draw calls instead of the earlier 373 after instancing and shadow-pass changes. Levels 2 through 10 report 90 to 153 draw calls.
- Cache-disabled initial loads at 390 by 844 used 9 requests and 276,340 transfer bytes for Level 1 or 276,346 transfer bytes for Level 10.
- Both dependency audits reported zero vulnerabilities.

## Review limits and follow-up

- Mobile testing used desktop browser touch emulation. No physical iOS or Android phone was available, so thermal behavior, sustained mobile GPU performance, real browser chrome, and hardware-specific safe areas remain unverified.
- The current water has gentle geometric ripples and depth color variation. More water depth can be considered after campaign playtesting if it does not add phone rendering cost.
- The owner-approved Level 1 direction is the baseline. The other nine level compositions still require owner playtesting and visual review.
- Existing release archives and marketing captures predate this campaign presentation. Their documentation marks them outdated, and they must be regenerated only after owner approval.

## Owner and environment blockers

- RIPPLE is a working name with existing games using the same name. Final naming and trademark clearance are required.
- Publisher name, support route, production URL, governing terms details, and legal approval are missing.
- Physical iOS and Android acceptance, real mobile browser chrome and safe-area behavior, store accounts, listing forms, age ratings, and privacy labels require owner access.
- Hosted headers, public URLs, social previews, and production service-worker behavior can be checked only after a private deployment exists.

No public deployment, purchase, or outreach was performed.
