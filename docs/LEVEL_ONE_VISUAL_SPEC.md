# Level 01 visual specification

Updated September 15, 2026.

## Intent

Level 01 presents a sunlit coastal harbor as a compact handcrafted miniature. The playable road network remains the clearest visual structure. Buildings, gardens, water, paving, and dock details establish place and scale without obscuring vehicles, route branches, or destinations.

The craft references are the official [LEGO Builder's Journey](https://www.lightbrick.com/builders-journey) and [Monument Valley 3](https://ustwogames.co.uk/our-games/monument-valley-3/) pages. This implementation uses original geometry, colors, layouts, models, and interface design. No reference assets ship with the game.

## Palette

- Deep water: `#2F7E83`
- Shallow water: `#69B8B3`
- Water highlight: `#A9DBCF`
- Warm limestone: `#E9D3A6`
- Pale paving: `#D9C18E`
- Road blue gray: `#465D61`
- Road edge: `#B8B39B`
- Lawn: `#76915B`
- Garden dark: `#4F7049`
- Timber: `#9A6542`
- Plaster cream: `#F2E5C2`
- Plaster coral: `#D86A54`
- Roof teal: `#3F7775`
- Bus yellow: `#E9A92F`
- Robot coral: `#D95648`
- Interface ink: `#203A3A`
- Interface canvas: `#F8F0DE`
- Primary control: `#C94F42`

Colors use sRGB output with ACES filmic tone mapping. Pale surfaces retain enough value separation to preserve edges under direct light.

## Material families

- Stone uses high roughness, restrained warm variation, visible slab joints, and shallow foundation shadows.
- Roads use a continuous dark matte surface with a lighter curb. Route highlights follow the same curves and remain above the road without intersecting vehicles.
- Lawns use shaped beds, two broad green tones, clean stone borders, and sparse grouped tufts. Tufts appear only in planted areas.
- Timber uses individual dock planks, aligned grain marks, darker supports, and a finished fascia.
- Buildings use matte plaster, inset dark windows, glass panes, projecting sills, roof caps, doors, and stone foundations.
- Water uses a large geometry extending beyond every supported camera view. Two low-cost ripple layers and shallow color variation provide depth without screen-space effects.
- Vehicles use painted bodywork, matte tires, restrained glass, visible panel breaks, and compact contact shadows.

## Model scale and proportions

- The bus is about 2.3 scene units long with a clear front, four visible wheel positions, a raised roof, windows, lights, and bumpers.
- The robot is about 1.6 scene units tall with a coral body, pale head, dark face, parcel rack, side wheels, and a low contact footprint.
- Doors are about 1.5 scene units tall. Windows and sills share a consistent scale across buildings.
- Trees remain smaller than buildings and use grouped canopies. Garden tufts stay below vehicle wheel height.
- Destination markers read as harbor bollards with matching vehicle colors and remain visible from the opening camera.

## Typography

Level 01 uses locally hosted Nunito Sans under the SIL Open Font License 1.1. Body text uses regular and semibold weights. Headings use bold sparingly. The phone scale ranges from 13 to 18 CSS pixels with 1.3 to 1.45 line height. Labels use sentence case except the compact level name.

## Controls

- All Level 01 controls share a 14-pixel corner radius, warm neutral surface, fine dark border, and shallow lower edge.
- The primary action uses painted coral, a soft top highlight, and a three-pixel lower edge. Pressing translates it downward and removes the lower edge.
- Selected routes include a visible Selected label, stronger edge, and matching in-scene path highlight.
- Disabled controls retain readable text and use a hatched neutral fill rather than whole-control opacity.
- Keyboard focus uses a two-pixel cream and ink ring. Every touch target is at least 48 CSS pixels.
- The route chooser uses two concise choices. Tutorial guidance replaces the large disabled action while a route choice is required.

## Camera and composition

- The orthographic camera targets the playable road bounds and uses a slightly lower coastal-diorama angle.
- The opening view fills the harbor region without clipping the bus, robot, destinations, dock, or garden branch.
- Tutorial guidance occupies a compact top overlay. The route sheet overlays the lower harbor while the camera shifts its target upward slightly and changes scale only enough to preserve the playable bounds.
- Camera changes interpolate briefly when motion is allowed and apply immediately when reduced motion is enabled.
- The water plane and background extend beyond the camera frustum at every supported phone size so no rectangular boundary can appear.

## Lighting

- A warm key light comes from the upper left of the scene.
- Cool sky and water fill keep shaded roads and facades readable.
- Soft VSM shadows and small authored contact shadows ground buildings, vehicles, trees, curbs, and dock supports.
- Materials avoid high metalness and strong clearcoat. Glass uses restrained color and roughness instead of expensive transmission.

## Performance budget

- Reuse material instances and common geometry where practical.
- Keep animated water to a single shared buffer update and avoid per-frame object creation.
- Cap device pixel ratio and shadow resolution for phone rendering.
- Dispose scene geometry, materials, and procedural textures when the scene unmounts.
- Report warm frame time, draw calls, triangle count, and JavaScript transfer size from the final local review environment.

## Technical references

- [Three.js WebGLRenderer](https://threejs.org/docs/#api/en/renderers/WebGLRenderer)
- [Three.js color management](https://threejs.org/manual/en/color-management.html)
- [Three.js shadows](https://threejs.org/manual/en/shadows.html)
