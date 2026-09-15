# Decisions

## 2026-09-15

- Use Node 22.21.1 because it is installed locally and satisfies current Vite and Vitest requirements.
- Use TypeScript 6.0.3 instead of 7.0.2 because the current TypeScript ESLint release supports TypeScript versions below 6.1. This keeps dependency resolution valid without peer overrides.
- Keep simulation state independent of React and PixiJS. React owns discrete plan and navigation state. PixiJS receives an immutable result and event index.
- Validate the supplied campaign JSON at import time. Invalid content fails before a puzzle can render.
- Keep the product name and public identity in one configuration module. Missing publisher and support values remain empty in review mode and must block a later public release check.
- Draw all visible first-party scene objects with PixiJS primitives or CSS. Do not add first-party SVG assets.
