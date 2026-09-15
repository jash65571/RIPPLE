# Verification record

Date: September 15, 2026

## Automated evidence

| Area | Command or method | Result |
| --- | --- | --- |
| Types | `npm run typecheck` | Passed |
| Lint | `npm run lint` | Passed |
| Unit and storage | `npm test` | 4 files, 33 tests passed |
| Level data | `npm run verify:levels` | 10 levels, 36 plans, unique solution per level |
| Copy and art provenance | `npm run verify:content` | 72 text files, no prohibited dash characters or first-party SVG files |
| Public-mode guard | `npm run verify:public-config` | Review mode passed; public mode requires identity, support, and HTTPS origin |
| Dependencies | `npm audit` and `npm audit --omit=dev` | Zero vulnerabilities in both trees |
| Production web | `npm run build` | Passed, 47 PWA precache entries |
| Embedded package | `npm run build:itch` | Passed with relative asset paths and PWA disabled |
| Browser suite | `npx playwright test` | 34 stories passed, 2 unsupported service-worker stories skipped in 1.2 minutes |
| PWA update | `npm run verify:pwa-update` | Prompt, controlled activation, reload, and save retention passed |
| Release | `npm run package:release` | Web and itch.io archives plus SHA-256 manifest |

## Browser stories

The Chromium suite covers the complete campaign, reload persistence, stale result invalidation, undo, help, text play, native settings dialog, reduced motion, invalid routes, every public page, the returning-player Continue state, offline reload, reset and reveal recovery, all three futures, keyboard playback and history keys, stale-tab notification, import and export, same-origin-only network requests, and all ten levels at 390 by 844 and 1440 by 1000. Firefox and WebKit passed every supported story and both target layouts. Their offline reload stories are skipped because Playwright supports service workers only in Chromium-based browsers.

Twenty level screenshots are written under `release/qa`. Failure traces and screenshots are retained under `test-results`. Marketing captures come from live browser sessions. The trailer source files are WebM recordings of actual interaction.

The final trailer sources measured 15.04 seconds and 30.04 seconds in system Chrome. Sample frames confirmed that the captions are visible. The three required marketing stills show actor inspection, a causal deadline failure, and a plan that passes two futures while failing the closed-lane future. Square, portrait, and wide promotional exports were checked at their intended pixel sizes.

## Manual visual review

Reviewed phone and desktop captures for hierarchy, legibility, clipping, control reachability, focus affordance, canvas scaling, plan controls, results, and fixed notices. The phone board toolbar was changed to wrap after review. The one-time offline notice was removed from clean marketing captures.

## Not run here

Physical iOS and Android hardware, screen readers, real touch interruption, safe areas, installed-app lifecycle, hosting headers, and storefront submission are outside current access.
