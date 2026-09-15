# Research notes

## Toolchain and rendering

Checked September 15, 2026.

- [Vite getting started](https://vite.dev/guide/): current Vite requires Node 20.19+, 22.12+, or a newer supported line. RIPPLE records Node 22.21.1 in `.nvmrc`.
- [PixiJS application guide](https://pixijs.com/8.x/guides/components/application): PixiJS 8 applications use asynchronous `Application.init()`, expose `app.canvas`, and support explicit render control. The scene wrapper follows that lifecycle and cleans up the application when React replaces it.
- [PixiJS 8 migration guide](https://pixijs.com/8.x/guides/migrations/v8): PixiJS 8 uses one `pixi.js` package and only containers accept children. RIPPLE composes scene objects with `Container` and `Graphics` accordingly.
- [Playwright browser projects](https://playwright.dev/docs/browsers): browser projects can cover Chromium, Firefox, WebKit, and mobile device profiles from one configuration. This will drive the browser-test matrix after the local review server is owner-started.

## Accessibility

Checked September 15, 2026.

- [WCAG 2.2 target size enhanced](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html): RIPPLE uses 48px common controls as a product choice while retaining keyboard alternatives.
- [WCAG 2.2 dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html): route and timing choices use ordinary buttons. Dragging is not required.
- [WCAG 2.2 resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html): the responsive layout allows wrapped labels and moves the plan panel above the board on narrow screens.

## Local saves

Checked September 15, 2026.

- [IndexedDB transaction completion](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction/complete_event): the UI reports a save only after the transaction `complete` event. Individual request success is not treated as a committed save.
- [IndexedDB usage](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB): ordinary read-write transactions do not promise survival through an operating-system failure. RIPPLE keeps manual JSON export and does not promise automatic recovery.
- [Storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria): browser data is best-effort by default and can be evicted. Save copy and future help text must describe that limit plainly.
- [Page visibility](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event): moving to hidden is the last reliably observable session transition. RIPPLE will use it as a supplemental checkpoint and pause signal, not as the only save trigger.
