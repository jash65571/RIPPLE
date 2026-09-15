# RIPPLE

RIPPLE is a single-player cause-and-effect puzzle game set in a small harbor district. The player watches a delayed plan, changes a limited number of starting rules, and tests one plan across up to three known futures.

## Local setup

Use Node 22.21.1, then install dependencies:

```powershell
npm install
```

The owner runs the local asset server manually:

```powershell
npm run dev
```

Open the address printed by Vite. Game routes use fragments such as `#/level/01?v=1`.

## Checks

```powershell
npm run typecheck
npm run lint
npm test
npm run verify:levels
```

Production, browser, offline, and release packaging checks will be added as their milestones are completed.
