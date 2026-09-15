# Verification record

Date: September 15, 2026

## Automated evidence

| Area | Command or method | Result |
| --- | --- | --- |
| Types | `npm run typecheck` | Passed |
| Lint | `npm run lint` | Passed |
| Unit and storage | `npm test` | 4 files, 33 tests passed |
| Level data | `npm run verify:levels` | 10 levels, 36 plans, unique solution per level |
| Copy and art provenance | `npm run verify:content` | 74 text files, no prohibited dash characters or first-party SVG files |
| Public-mode guard | `npm run verify:public-config` | Review mode passed; public mode requires identity, support, and HTTPS origin |
| Dependencies | `npm audit` and `npm audit --omit=dev` | Zero vulnerabilities in both trees |
| Production web | `npm run build` | Passed, 48 PWA precache entries |
| Embedded package | `npm run build:itch` | Passed with relative asset paths and PWA disabled |
| Browser suite | `npx playwright test` | 38 stories passed, 10 platform-specific stories skipped in 2.5 minutes |
| PWA update | `npm run verify:pwa-update` | Prompt, controlled activation, reload, and save retention passed |
| Release | `npm run package:release` | Web and itch.io archives plus SHA-256 manifest |

## Browser stories

The Chromium suite covers the complete campaign, reload persistence, undo, help, text play, native settings dialog, reduced motion, invalid routes, every public page, the returning-player Continue state, offline reload, reset and reveal recovery, all three futures, keyboard playback and history keys, stale-tab notification, import and export, same-origin-only network requests, and all ten levels at 390 by 844 and 1440 by 1000. It also checks Level 01 at 360 by 800, 390 by 844, and 430 by 932 with touch and coarse-pointer emulation, direct robot selection, 48-pixel targets, no page overflow, wrong-choice retry, success, reload, and interrupted tutorial recovery. Firefox and WebKit passed every supported story and both general target layouts. Their touch-emulation stories and offline reload stories are skipped because those checks depend on Chromium capabilities.

Twenty level screenshots are written under `release/qa`. Failure traces and screenshots are retained under `test-results`. Marketing captures come from live browser sessions. The trailer source files are WebM recordings of actual interaction.

The Level 01 mobile pass adds `release/qa/level-01-3d/mobile-touch-360x800.png`, `mobile-touch-390x844-routes.png`, `mobile-touch-430x932-success.png`, and an 18.84-second `mobile-touch-gameplay.webm`. Touch-emulated system Chrome reported no page or console errors. Warm scene samples measured 131, 141, and 140 frames per second at those three sizes. Each reported 135 draw calls and 51,790 triangles with zero document overflow. These are local measurements, not a hardware-wide benchmark.

The final trailer sources measured 15.04 seconds and 30.04 seconds in system Chrome. Sample frames confirmed that the captions are visible. The three required marketing stills show actor inspection, a causal deadline failure, and a plan that passes two futures while failing the closed-lane future. Square, portrait, and wide promotional exports were checked at their intended pixel sizes.

## Manual visual review

Reviewed the three portrait captures and portrait recording for hierarchy, legibility, vehicle clipping, control reachability, route-sheet fit, canvas reframing, route highlighting, result placement, and fixed notices. The offline-ready state now lives in the Level 01 menu so it cannot cover a route choice.

The Level 01 pass checked the first-play demonstration, direct and labeled vehicle selection, wrong-route failure, preserved retry, successful route, tutorial skip and replay, interrupted tutorial recovery, reload persistence, reduced motion, advanced playback access, continuous trace-driven movement, full campaign completion, desktop fit, and the Level 02 transition. All relevant vehicles, destinations, and route choices remain visible while the route sheet is open.

## Not run here

Physical iOS and Android hardware, screen readers, real device browser chrome and safe-area behavior, installed-app lifecycle, hosting headers, and storefront submission are outside current access. Mobile interaction testing used browser touch emulation.
