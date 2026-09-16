# Research notes

## Toolchain and rendering

Checked September 15, 2026.

- [Vite getting started](https://vite.dev/guide/): current Vite requires Node 20.19+, 22.12+, or a newer supported line. RIPPLE records Node 22.21.1 in `.nvmrc`.
- [Three.js cleanup guide](https://threejs.org/manual/en/how-to-dispose-of-objects.html): geometries, materials, textures, and renderer resources require explicit disposal. Both RIPPLE renderers dispose owned GPU resources when a level unmounts.
- [Three.js `InstancedMesh`](https://threejs.org/docs/#api/en/objects/InstancedMesh): repeated geometry can share one draw call while retaining separate transforms. RIPPLE instances paving, planting, trees, and dock pieces where the phone view benefits.
- [Three.js orthographic camera](https://threejs.org/docs/#api/en/cameras/OrthographicCamera): an orthographic projection keeps model scale stable across depth. RIPPLE adjusts the camera frustum to the available portrait width and moves the target briefly for bottom sheets.
- [Playwright browser projects](https://playwright.dev/docs/browsers): browser projects cover Chromium, Firefox, WebKit, and mobile device profiles from one configuration. All locally supported campaign stories now pass in the three configured engines.
- [Vite production builds](https://vite.dev/guide/build): multi-page HTML entries and static assets are built through explicit Rollup inputs. RIPPLE uses that path for its public pages and separate game entry.
- [Vite PWA registration](https://vite-pwa-org.netlify.app/guide/register-service-worker): prompt registration supports a user-controlled update flow. RIPPLE waits for a saved state before offering activation.
- [Cloudflare Pages custom headers](https://developers.cloudflare.com/pages/configuration/headers/): a `_headers` file can carry CSP, MIME sniffing, referrer, and permissions controls for static assets. The release contains the file, but host behavior still needs deployment verification.
- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/): the free tier limits checked on this date fit the current static archive. Provider terms and limits must be refreshed before launch.
- [Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices): audio should start after user interaction and respect browser autoplay policy. RIPPLE only creates its audio context from an explicit control or game result.

## Accessibility

Checked September 15, 2026.

- [WCAG 2.2 target size enhanced](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html): RIPPLE uses 48px common controls as a product choice while retaining keyboard alternatives.
- [WCAG 2.2 dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html): route and timing choices use ordinary buttons. Dragging is not required.
- [WCAG 2.2 resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html): the portrait shell wraps objectives, keeps its action bar fixed, and moves longer supporting information into scrollable sheets.

## Local saves

Checked September 15, 2026.

- [IndexedDB transaction completion](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction/complete_event): the UI reports a save only after the transaction `complete` event. Individual request success is not treated as a committed save.
- [IndexedDB usage](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB): ordinary read-write transactions do not promise survival through an operating-system failure. RIPPLE keeps manual JSON export and does not promise automatic recovery.
- [Storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria): browser data is best-effort by default and can be evicted. Save copy and future help text must describe that limit plainly.
- [Page visibility](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event): moving to hidden is the last reliably observable session transition. RIPPLE will use it as a supplemental checkpoint and pause signal, not as the only save trigger.

## Name and release channels

Checked September 15, 2026.

- [RIPPLE on Steam](https://store.steampowered.com/app/601240/Ripple/) and current itch.io listings including [FortyTwo Studios](https://fortytwostudios.itch.io/ripple) show active game-name conflicts. This is evidence for a naming review, not trademark clearance.
- [Apple App Review](https://developer.apple.com/app-store/review/) requires working support and privacy links in submitted metadata. Those owner-controlled fields remain blocked in review mode.
- [Google Play User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en-GB) requires accurate privacy disclosures. A future listing must account for local saves, hosting traffic, and support messages rather than claiming that no data exists.
