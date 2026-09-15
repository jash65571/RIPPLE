# RIPPLE

RIPPLE is a single-player cause-and-effect puzzle game set in a small harbor district. The player watches a delayed plan, changes a limited number of starting rules, and tests one plan across up to three known futures.

## Local setup and preview

Use Node 22.21.1, then install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Open the address printed by Vite. Game routes use fragments such as `#/level/01?v=1`.

For the tested production preview:

```powershell
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Open `http://127.0.0.1:4173/play/`.

## Checks

```powershell
npm run typecheck
npm run lint
npm test
npm run verify:levels
npm run verify:content
npm run test:e2e
npm run verify:pwa-update
npm run package:release
```

The completed review build is tested in system Chrome on Windows 11 at phone and desktop viewport sizes. Firefox, WebKit, physical phones, and assistive technology still require owner acceptance. See `docs/VERIFICATION.md` and `docs/OWNER_ACCEPTANCE.md`.
