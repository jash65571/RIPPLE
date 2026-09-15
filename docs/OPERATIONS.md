# Operations

## Preview and verify

1. Run `npm ci`.
2. Run `npm run verify:release`.
3. Run `npm run build`.
4. Run `npm run preview -- --host 127.0.0.1 --port 4173`.
5. Open `http://127.0.0.1:4173/play/`.
6. Run `npm run test:e2e -- --project=chromium` in another terminal.

The `dist` directory is the web release. The `dist-itch` directory is the relative-path HTML5 build. `npm run package:release` creates both release archives and SHA-256 checksums.

## Cloudflare Pages draft setup

- Framework preset: None
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: choose only when the owner is ready to publish
- Environment variables: none
- Custom headers: supplied by `public/_headers`

After the first private preview, verify `/`, `/play/`, every policy page, a level hash URL, `404.html`, the service worker, and the response headers. Keep the current `noindex` controls until launch approval.

## Rollback

Keep the prior `ripple-web` archive and its checksum. If a release fails smoke testing, restore the prior archive or use the hosting provider's deployment rollback, then confirm the prior game opens and retains an exported save. Never roll back a player's IndexedDB data.

## Save recovery

Ask the player to export progress before clearing site storage or replacing a device. Import validates product, schema, rule version, level IDs, edit values, history bounds, JSON depth, dangerous keys, and the 256 KiB limit. A stale tab must reload instead of overwriting a newer revision.
