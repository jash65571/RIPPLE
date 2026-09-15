# Verification record

Date: September 15, 2026

## Automated evidence

| Area | Command or method | Result |
| --- | --- | --- |
| Types | `npm run typecheck` | Passed |
| Lint | `npm run lint` | Passed |
| Unit and storage | `npm test` | 4 files, 33 tests passed |
| Level data | `npm run verify:levels` | 10 levels, 36 plans, unique solution per level |
| Copy and art provenance | `npm run verify:content` | 75 text files, no prohibited dash characters or first-party SVG files |
| Public-mode guard | `npm run verify:public-config` | Review mode passed; public mode requires identity, support, and HTTPS origin |
| Dependencies | `npm audit` and `npm audit --omit=dev` | Zero vulnerabilities in both trees |
| Production web | `npm run build` | Passed, 48 PWA precache entries |
| Embedded package | `npm run build:itch` | Passed with relative asset paths and PWA disabled |
| Browser suite | `npx playwright test` | 39 stories passed, 12 platform-specific stories skipped |
| PWA update | `npm run verify:pwa-update` | Prompt, controlled activation, reload, and save retention passed |
| Release | `npm run package:release` | Web and itch.io archives plus SHA-256 manifest |

## Browser stories

The Chromium suite covers the complete campaign, reload persistence, undo, help, text play, native settings dialog, reduced motion, invalid routes, every public page, the returning-player Continue state, offline reload, reset and reveal recovery, all three futures, keyboard playback and history keys, stale-tab notification, import and export, same-origin-only network requests, and all ten levels at 390 by 844 and 1440 by 1000. It also checks Level 01 at 360 by 800, 390 by 844, and 430 by 932 with touch and coarse-pointer emulation, direct robot selection, 48-pixel targets, no page overflow, wrong-choice retry, success, reload, interrupted tutorial recovery, keyboard activation, larger text, and the in-game reduced-motion setting. Firefox and WebKit passed every supported story and both general target layouts. Their touch-emulation stories and offline reload stories are skipped because those checks depend on Chromium capabilities.

Twenty level screenshots are written under `release/qa`. Failure traces and screenshots are retained under `test-results`. Marketing captures come from live browser sessions. The trailer source files are WebM recordings of actual interaction.

The premium Level 01 pass adds 15 state captures under `release/qa/level-01-premium`: first play, normal play, route selection, failure, and success at 360 by 800, 390 by 844, and 430 by 932. The same directory contains a 390 by 844, 12.60-second WebM recording of route selection, live playback, and success.

Touch-emulated headless Chrome 153 on Windows 10 with an NVIDIA RTX 4050 reported no page overflow. Warm scene samples measured 109, 134, and 134 frames per second, or 9.19, 7.45, and 7.47 milliseconds per frame, at those three sizes. Each reported 373 draw calls and 124,810 triangles. Initial loading used 8 requests, 275,162 transfer bytes, 272,762 encoded bytes, and 920,879 decoded bytes. The production Level 01 renderer chunk measured 574.95 KB raw and 146.31 KB gzip. These desktop GPU results are not evidence of physical phone performance.

The final trailer sources measured 15.04 seconds and 30.04 seconds in system Chrome. Sample frames confirmed that the captions are visible. The three required marketing stills show actor inspection, a causal deadline failure, and a plan that passes two futures while failing the closed-lane future. Square, portrait, and wide promotional exports were checked at their intended pixel sizes.

## Manual visual review

Reviewed all 15 portrait captures at native pixel size and sampled the portrait recording at route selection, playback, and success. The review covered material distinction, hierarchy, label legibility, vehicle and destination clipping, control reachability, route-sheet fit, camera framing, route alignment, result placement, and fixed notices. The offline-ready state lives in the Level 01 menu so it cannot cover a route choice.

The Level 01 pass checked the first-play demonstration, direct and labeled vehicle selection, wrong-route failure, preserved retry, successful route, tutorial skip and replay, interrupted tutorial recovery, reload persistence, reduced motion, advanced playback access, continuous trace-driven movement, full campaign completion, desktop fit, and the Level 02 transition. All relevant vehicles, destinations, and route choices remain visible while the route sheet is open.

## Not run here

Physical iOS and Android hardware, screen readers, real device browser chrome and safe-area behavior, sustained mobile GPU performance, installed-app lifecycle, hosting headers, and storefront submission are outside current access. Mobile interaction testing used desktop browser touch emulation.
