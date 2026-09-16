# Decisions

## 2026-09-15

- Use Node 22.21.1 because it is installed locally and satisfies current Vite and Vitest requirements.
- Use TypeScript 6.0.3 instead of 7.0.2 because the current TypeScript ESLint release supports TypeScript versions below 6.1. This keeps dependency resolution valid without peer overrides.
- Keep simulation state independent of React and Three.js. React owns discrete plan and navigation state. Each renderer receives an immutable simulation result and timeline beat.
- Validate the supplied campaign JSON at import time. Invalid content fails before a puzzle can render.
- Keep the product name and public identity in one configuration module. Missing publisher and support values remain empty in review mode and must block a later public release check.
- Spread the Vite PWA plugin list into Vite's top-level plugin array. Vite 8.3 omitted the plugin's service-worker generation hook when the returned plugin list remained nested.
- Draw all visible first-party scene objects with authored Three.js geometry or CSS. Do not add first-party SVG assets.
- Keep the Level 1 renderer specialized while Levels 2 through 10 share one data-driven renderer. Dispose renderer-owned GPU resources when a level unmounts.
- Use instancing for repeated paving, planting, tree, and dock geometry. Keep actor animation tied to deterministic traversal events instead of visual interpolation rules.
- Generate sound with the Web Audio API so the game ships no sample library or licensed recording.
- Generate service workers in the standalone web build, but disable them in the embedded itch.io build to avoid scope and update conflicts.
- Require explicit update activation only after the current save reports as complete.
- Use original PNG icons and real-game browser captures for public and marketing images.
- Package the web and embedded builds separately with runtime license notices, manifests, and SHA-256 checksums.
