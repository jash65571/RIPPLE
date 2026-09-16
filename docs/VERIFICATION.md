# Verification record

Date: September 15, 2026

## Automated evidence

| Area | Command or method | Result |
| --- | --- | --- |
| Types | `npm run typecheck` | Passed |
| Lint | `npm run lint` | Passed |
| Unit and storage | `npm test` | 4 files, 33 tests passed |
| Level data | `npm run verify:levels` | 10 levels, 36 plans, unique solution per level |
| Copy and art provenance | `npm run verify:content` | 79 text files, no prohibited dash characters or first-party SVG files |
| Public-mode guard | `npm run verify:public-config` | Review mode passed; public mode still requires identity, support, and HTTPS origin |
| Dependencies | `npm audit` and `npm audit --omit=dev` | Zero vulnerabilities in both trees |
| Production web | `npm run build` | Passed, 36 PWA precache entries totaling 975.92 KiB |
| Embedded build | `npm run build:itch` | Passed with local relative assets and PWA disabled |
| PWA update | `npm run verify:pwa-update` | Update prompt, controlled activation, reload, and save retention passed |
| Browser suite | `npx playwright test` | 40 supported stories passed, 20 Chromium-specific stories skipped in Firefox and WebKit |
| Campaign captures | `npx playwright test tests/e2e/visual.spec.ts --project=chromium` | All ten levels passed at 360 by 800, 390 by 844, and 430 by 932 |
| Review recording | `npm run capture:campaign` | Four Level 9 state captures and one 21.92-second portrait WebM produced |
| Performance | `npm run profile:campaign` | 30 warm scene samples plus cache-disabled Level 1 and Level 10 load samples written |

## Browser stories

The campaign suite solves all ten levels through visible touch controls and reaches the ending. A separate story runs the original plan on Levels 2 through 10, confirms a useful late-vehicle explanation, presses Try again, and verifies the plan remains editable. Level 10 checks all three future labels and the explicit Finish campaign action.

Recovery coverage includes undo, reset recovery, guarded solution reveal cancellation, scenario inspection, detailed playback, keyboard history keys, reload persistence, tutorial recovery, stale-tab notification, import and export, offline reload, and same-origin-only runtime requests.

Chromium checks each level at 360 by 800, 390 by 844, and 430 by 932. It asserts zero document overflow, a fully visible action bar, and touch targets at least 48 CSS pixels across. The 360 by 800 capstone also passes with the 1.25 text setting. Level 1 retains direct model touch, wrong-choice retry, first-play progression, and interrupted-tutorial coverage.

Firefox and WebKit run the full campaign, failure, save, keyboard, import, export, and network stories. Touch-device geometry and service-worker offline checks remain Chromium-specific because those tests depend on Chromium emulation capabilities.

## Visual evidence

Thirty native-size normal-play captures are stored under `release/qa/campaign/{360x800,390x844,430x932}`. Each size includes Levels 1 through 10. The review folder adds 390 by 844 captures of the Level 9 tutorial, route chooser, Upper lane closed failure, and corrected success.

The portrait recording is `release/qa/campaign/review/campaign-failed-future-correction-390x844.webm`. It is a 390 by 844 VP8 WebM at 25 frames per second and lasts 21.92 seconds. The recording shows Upper lane passing Normal day and Early bus, failing Upper lane closed, preserving the choice, changing to Garden path, and passing all three futures.

Native-size review covered goal and future labels, road continuity, route highlights, actor and destination visibility, bridge and handoff landmarks, sheet framing, action-bar reach, result placement, and decorative occlusion. Playable objects remain visible in the captured states. The Level 1 crossing overlap and island margin were widened during this pass.

## Performance and load measurements

The performance file is `release/qa/campaign/performance.json`. Measurements used the local production preview in headless Chrome 153.0.8010.37 on Windows with an NVIDIA GeForce RTX 4050 Laptop GPU through ANGLE Direct3D 11. The browser reported 16 logical processors, 16 GiB device memory, one emulated touch point, and device scale factor 1.

Across 30 warm samples, reported scene rates ranged from 109 to 141 frames per second, or 7.07 to 9.21 milliseconds per frame. Draw calls ranged from 90 to 205 and triangles ranged from 46,472 to 106,036. Level 1 was the highest-cost scene at 205 draw calls and 106,036 triangles. Levels 2 through 10 ranged from 90 to 153 draw calls and from 46,472 to 62,656 triangles.

Cache-disabled initial loads at 390 by 844 each used 9 requests. Level 1 transferred 276,340 bytes with 273,640 encoded bytes and 925,851 decoded bytes. Level 10 transferred 276,346 bytes with 273,646 encoded bytes and 927,354 decoded bytes.

These measurements come from a laptop GPU with desktop touch emulation. They do not establish physical-phone frame pacing, memory pressure, battery cost, or thermal behavior.

## Asset and package status

The PixiJS renderer and dependency were removed after confirming no remaining imports. Three.js, React, Workbox, and Nunito Sans remain documented in `docs/ASSET_LICENSES.md`, and the release packager now gathers the Three.js license.

The older marketing images, trailers, and release archives show the replaced interface. Their index and release notes mark them outdated. They were not regenerated because campaign visual approval and physical-phone acceptance are still pending.

## Not run here

Physical iOS and Android hardware, screen readers, real-device browser chrome, hardware safe areas, sustained mobile thermal tests, installed-app lifecycle, hosted security headers, public URLs, and storefront submission were not available. No deployment or publication was performed.
