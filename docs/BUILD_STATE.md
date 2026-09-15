# Build state

Updated September 15, 2026.

## Complete in the review build

- Ten immutable, versioned level files validate against the deterministic engine and each has one intended solution.
- The full campaign is playable from intro through ending with visible route and timing controls.
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
- Content verifier: 72 first-party text files passed with no prohibited dashes or first-party SVG artwork.
- Production web and embedded builds: passed.
- Chromium browser suite: 12 stories passed in 46.0 seconds, including all ten levels, the returning-player landing state, and both target layouts.
- PWA A/B cycle: update prompt, controlled activation, reload, and save retention passed.
- Chromium desktop screenshot run: all ten levels passed without horizontal overflow.
- Offline, recovery, multiple futures, keyboard, stale-tab, local-only network, and import/export browser checks are included in the final suite.
- Dependency audit: production and complete dependency trees both reported zero vulnerabilities.
- Marketing captures: three purpose-specific gameplay stills, square, portrait, and wide promos, plus captioned 15.04-second and 30.04-second WebM sources passed visual review.

## Owner and environment blockers

- RIPPLE is a working name with existing games using the same name. Final naming and trademark clearance are required.
- Publisher name, support route, production URL, governing terms details, and legal approval are missing.
- Physical iOS and Android acceptance, store accounts, listing forms, age ratings, and privacy labels require owner access.
- Playwright Firefox and WebKit downloads timed out across available mirrors, so those engine runs require another network or machine.
- Hosted headers, public URLs, social previews, and production service-worker behavior can be checked only after a private deployment exists.

No public deployment, purchase, outreach, commit, or push was performed.
