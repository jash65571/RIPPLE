# Campaign visual plan

Updated September 15, 2026.

## Shared presentation

All ten levels use the approved coastal miniature palette, warm stone, blue-green water, painted plaster buildings, planted garden beds, timber details, Nunito Sans typography, cream secondary controls, and coral primary controls. The simulation remains the only source of movement, waits, arrivals, deadlines, and future results.

The campaign uses one shared mobile play shell and one configurable Three.js harbor renderer. Level definitions continue to contain rules. Visual layout data contains route shapes, shorelines, buildings, gardens, docks, and landmarks. UI configuration contains short mechanic guidance. No visual configuration changes simulation outcomes.

## Mechanics and contextual controls

| Level | Mechanic | Editable control | Required visual cue | Futures |
| --- | --- | --- | --- | --- |
| 01 Market Morning | Crossing queue | Robot route | Market crossing and garden bypass | Normal |
| 02 A Little Later | Departure timing | Robot start beat | Start marker, beat choices, deadlines | Normal |
| 03 Bridge Break | Timed closure | Bus route | Raised bridge during closure and open quay | Bridge raised |
| 04 Last Connection | Handoff dependency | Robot route | Parcel transfer point where the bus waits | Normal |
| 05 The Hidden Queue | Two shared lanes | Robot route | Crossing and loading lane waiting areas | Normal |
| 06 Two Small Changes | Two simultaneous queues | Robot and cart routes | Distinct robot, cart, bus, and two change budget | Normal |
| 07 An Early Arrival | One plan across schedules | Robot route | Compact Normal and Early bus future selector | Normal, Early bus |
| 08 A Plan for Both | Timing across schedules | Robot start beat | Beat choices with both bus schedules | Normal, Late bus |
| 09 Three Possible Days | Route and closure futures | Robot route | Upper bridge state and three future selector | Normal, Upper closed, Early bus |
| 10 Harbor in Harmony | Two routes across three futures | Robot and cart routes | Crossing, upper bridge, quay, and two change budget | Normal, Upper closed, Early bus |

Vehicle sheets show route buttons only for route edits and beat buttons only for start edits. Vehicles with no edit are labeled Fixed. The bottom action remains Go, Pause, Try again, or Finish campaign as state changes. Undo stays beside it after an edit. Reset, redo, hints, help replay, settings, chapters, text play, and detailed playback live in secondary panels.

## Distinct compositions

- Levels 01, 05, and 07 use market districts with different garden and shoreline arrangements.
- Levels 02, 04, and 08 use depot districts with clear start bays and destination yards.
- Levels 03 and 09 use bridge districts with a visible movable span.
- Levels 06 and 10 use pier districts with a working quay and a third vehicle staging area.
- Building groups, docks, garden beds, trees, route curvature, and shoreline sides vary by level while retaining one material and lighting system.

## Multiple futures

Go evaluates every configured future before presenting an overall result. The renderer plays one labeled future at a time. A failed plan selects the first failed future and names its late vehicle, arrival beat, and deadline. Future buttons remain available for inspection without showing several timelines at once. Retry preserves the current plan.

## Teaching order

- Level 01 keeps its playable crossing tutorial.
- Level 02 defines a beat and introduces departure choices.
- Level 03 introduces timed closures.
- Level 04 introduces handoffs.
- Level 05 points out that queues can occur beyond the first crossing.
- Level 06 introduces the two-change budget and the cart.
- Level 07 introduces one plan across multiple futures.
- Levels 08 and 09 combine earlier ideas with short contextual reminders.
- Level 10 asks the player to combine the learned controls without revealing the solution.

Each prompt presents one idea, can be dismissed, can be replayed from the menu, and records completion without changing the saved plan.

## Performance plan

- Reuse geometries and materials within each scene.
- Instance repeated paving, trees, and garden details.
- Use one shadow-casting sun at phone-sized shadow resolution.
- Animate one low-resolution water buffer and the active vehicles only.
- Cache route curves, event lists, and actor frame objects.
- Keep the scene mounted during ordinary sheets and menu changes.
- Dispose unique geometries and materials when changing levels.
- Record draw calls, triangles, frame time, and transfer size from the final browser run.

The existing Level 01 sample reports 373 draw calls. New shared scenes target fewer than 180 draw calls before campaign capture. Level 01 geometry will be reviewed separately so visual approval is preserved while broken joins and tight cropping are corrected.
