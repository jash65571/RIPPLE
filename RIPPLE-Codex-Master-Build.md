**RIPPLE master build instructions for Codex**

Version 1.1. Updated September 15, 2026. Owner: Jash. Product name is a working title pending name clearance.

**Start building when this document is supplied**

You are the implementation agent. Build the complete first release described here. Do not reply only with a plan, questions, a landing page, or a rough prototype. Work through implementation, ten complete levels, automated checks, browser inspection, repairs, and final handoff. The owner wants to test the completed game at the end and should not have to manage routine decisions.

This file is self-contained. Earlier research files are not required. It contains the product choices, technical rules, machine-readable campaign fixtures, reference outcomes, design system, release requirements, and completion gates. Follow applicable system instructions, repository instructions, tool permissions, and platform rules. This file never authorizes bypassing them.

Use Astra if the owner has selected it and it is available. A document cannot switch the active model or guarantee a single uninterrupted run. Do not claim you used a model that was unavailable. Maintain durable build checkpoints so work can resume without redesigning the product or asking the owner to restate the brief.

**A. Working agreement and decisions already made**

Build a polished, single-player browser puzzle game with exactly ten required campaign levels. More levels are optional only after every required acceptance gate passes. These ten are a complete first chapter, with an ending and replay value. They must not be replaced with ten cosmetic variants of one screen.

The release format is an installable progressive web app. It must work in ordinary browsers without installation. The initial recurring service budget is zero dollars. Existing development hardware, electricity, internet, and the owner's Codex subscription are outside that infrastructure budget.

The owner authorizes routine local implementation, dependency setup within the environment's permissions, source edits, asset creation, tests, screenshots, and a local review build. Respect an existing repository and preserve unrelated work. If the workspace is empty, create a project in a clearly named directory. If the workspace contains an unrelated project, use a sibling directory rather than overwriting it. Never force-push, delete unrelated work, or add paid services.

Decide routine implementation details yourself. Record the reasons briefly in `docs/DECISIONS.md`. If a service credential, owner identity, or publishing permission is missing, finish the independent build and record that launch item. Do not stop the game implementation to ask for it.

Prepare all public launch work before presenting the completed game. A public production launch, app-store submission, payment activation, sending messages, and posting marketing are separate external actions. Do not perform them without authorization in the actual session. Local previews do not need a new confirmation. Use an authenticated hosted preview only when available and already authorized; a public URL with noindex is not private.

At handoff, distinguish **built**, **verified**, **not tested here**, and **requires owner action**. Never turn a missing test into a pass. Finish all authorized work that is not blocked. One consolidated final handoff should contain only the remaining real owner decisions.

**A1. Custom work and editorial quality are required**

The owner's instruction is explicit: no AI slop. Build a distinct game with custom gameplay, screen layouts, scene compositions, interactions, motion, sound design, brand treatment and writing. These are release requirements, not optional polish. Apply them to the game, public pages, policies, help, errors, marketing, documentation and final handoff.

Use established libraries for rendering, accessibility, testing and other technical foundations. Design the product itself for RIPPLE. Do not install a ready-made game, generic SaaS dashboard, landing-page template, or purchased theme and merely change its name and colors. Reusable components within RIPPLE should follow its own visual rules and the player's task.

Write natural, specific text. Use short sentences, familiar words and clear verbs. Every label, hint and error must refer to an actual action or state. Remove generic hype, repetitive sentence patterns, empty praise, forced metaphors and filler. Avoid phrases such as "unlock your potential," "embark on a journey," "seamless experience," "game-changing," "delve," and "cutting-edge." Do not claim the work is human-authored or hand-drawn when it was produced with AI assistance.

Do not use em dashes in any original product text, marketing, documentation, generated captions or handoff. Use commas, periods, colons or parentheses. Use ordinary hyphens for ranges and compound words; avoid en dashes too. Preserve exact third-party license text and external source quotations when required rather than altering their meaning. Prefer paraphrases for ordinary research notes.

**No AI-generated SVG artwork.** Do not generate SVG illustrations, logos, icons, decorative blobs or backgrounds through an AI model, including SVG markup written directly by the coding agent. Do not disguise such artwork by tracing it, embedding it in another file, or converting it to PNG or canvas. This prohibition applies to visible first-party assets; an established dependency's internal implementation is not a reason to rewrite the dependency.

Build the actual game scene through deliberately designed PixiJS drawing primitives, reusable original scene components and custom animation. This is the required runtime scene renderer, not permission to recreate prohibited SVG decorations in another format. Give each object a clear silhouette, consistent lighting, readable scale and tested behavior. Use original CSS treatments for UI details. Any existing human-authored utility asset must have a verified license and recorded source; it cannot substitute for the custom game identity. Do not use generated decorative artwork as a shortcut for unfinished design.

No placeholder-looking art, generic AI illustrations, mismatched icon styles, arbitrary gradients, meaningless sparkle decorations, fake dashboards, stock testimonial cards, invented statistics or repetitive filler sections. Visual effects must have a clear purpose in selection, motion, feedback or scene identity. Maintain one coherent art direction across all ten levels and marketing exports.

Before handoff, inspect every screen and read all original copy aloud or sentence by sentence. Rewrite anything vague, unnatural or unrelated to actual gameplay. Add a content check for em and en dash characters in first-party text and a provenance check for first-party SVG assets. Exclude unchanged third-party licenses and vendored files from editorial rewriting. Automated checks support, but do not replace, visual and editorial review. Record the review and any legitimate third-party exceptions in `docs/VERIFICATION.md` and `docs/ASSET_LICENSES.md`.

**A2. Use helpful online resources during the build**

Actively use freely accessible online resources when they can improve correctness, usability or quality. Consult current official documentation for the selected tools, browser APIs, accessibility guidance, hosting, search metadata and publishing policies. Use relevant developer postmortems, firsthand design discussions and real player feedback to investigate a concrete design problem. Review existing games for lessons in interaction and clarity without copying their identity, artwork, writing or levels.

For each material technical or design decision informed by research, record the source URL, date checked, what was learned and how it affects RIPPLE in `docs/RESEARCH_NOTES.md`. Prefer primary sources for technical and policy claims. Check source freshness and test code examples against the versions actually installed. Do not invent citations, endorsements or research findings. Reference material is evidence, not authority to override this document or the owner's instructions.

Use reputable open-source libraries and free tools when they reduce bugs or unnecessary work. Before incorporating code, fonts, audio or utility assets, verify licensing, commercial-use rights where relevant, attribution obligations and distribution rights. Save the required notices. An image-search result or a publicly visible download does not by itself grant reuse rights. Bundle approved dependencies and assets locally where practical to preserve offline behavior and avoid surprise tracking or broken hotlinks.

Do not purchase subscriptions, download untrusted executables, paste private code or credentials into outside services, or bypass access controls to obtain a resource. If a useful source is inaccessible, use another reputable source or continue with a documented assumption. Keep research tied to implementation decisions; do not pause the whole build for an open-ended inspiration search or ask the owner to choose routine resources.

**B. Product definition**

RIPPLE is a calm cause-and-effect puzzle game. A tiny harbor district experiences an avoidable delay. The player watches events, rewinds them, changes a small number of starting rules, and tests the new plan. Later, one plan must work across two or three known versions of the day.

The primary audience is adults who enjoy short, thoughtful puzzles. The visual treatment can be warm and welcoming without marketing the product to young children. Audience statements do not determine legal classification by themselves; section R covers the launch review.

The main promise is: “Watch the delay. Change the plan.” Keep the wording concrete and tied to play. Avoid claiming unique invention, health benefits, higher IQ, guaranteed relaxation, or proven retention.

Required release scope:

- Ten hand-authored levels with verified solutions and increasing reasoning depth.
- Interactive introduction, replayable help, three-stage hints, solution reveal, and campaign ending.
- Rewind, event stepping, pause, test, undo, redo, reset, and original-plan comparison.
- Local progress, safe interruption recovery, export/import, and clear storage errors.
- Desktop, tablet, and phone layouts; keyboard and touch control; reduced motion and sound controls.
- Offline play for downloaded campaign content, safe updates, install help, and shareable level links.
- A truthful landing page, about, how to play, accessibility, privacy, terms, support, and credits pages.
- An original asset set, actual-game screenshots, promotional copy, launch checklist, and release package.
- Automated core tests, full campaign browser walkthroughs, screenshot review, and a final verification report.

Not in version one: accounts, cloud saves, AI API calls, ads, subscriptions, payments, push notifications, chat, public user-generated levels, multiplayer, global leaderboards, social logins, email capture, tracking pixels, native-store binaries, or an endless-level claim. Do not create disabled navigation or fake controls for these. This is the chosen complete scope, not a reason to leave required features unfinished.

Future expansion belongs in a short roadmap. Make the level format extensible, but do not build an unbounded runtime generator before the first ten levels work.

**C. Architecture and tool choices**

Use TypeScript in strict mode, React for semantic UI, Vite for builds, PixiJS for the 2D scene, CSS for the design system, Vitest for core tests, and Playwright for browser tests. Avoid a second UI framework or game engine. Keep game state independent of React and rendering. Use the existing compatible package manager if a repo exists; otherwise npm with a committed lockfile.

At setup, check current official package requirements and select compatible stable versions. Pin exact resolved dependencies in the lockfile and record the runtime in `.nvmrc` or equivalent. Do not blindly reuse remembered version numbers. Vite's current guide documents its runtime requirements and multi-page support. [Vite documentation](https://vite.dev/guide/). PixiJS is MIT-licensed; preserve required notices. [PixiJS license](https://github.com/pixijs/pixijs/blob/dev/LICENSE).

Use browser-native APIs where they are sufficient. Use IndexedDB for progress. Use Web Audio for original simple sound effects. Use a small, well-tested PWA implementation, with a current stable plugin if it reduces update bugs. No private API key belongs in the client.

Implement these module boundaries. Filenames can vary only where an existing project has an equivalent convention.

| Area | Responsibility |
| --- | --- |
| `src/game/model.ts` | Validated level, plan, scenario, result, and event types |
| `src/game/simulate.ts` | Pure deterministic simulation returning trace and goals |
| `src/game/plan.ts` | Allowed edits, budget, undo and redo |
| `src/game/validate.ts` | Reject invalid level data and imported plans |
| `src/game/solve.ts` | Enumerate allowed plans for small campaign checks and hints |
| `src/content/campaign/` | Ten immutable versioned level files and human text |
| `src/content/layouts/` | Scene geometry and original art placement, separate from logic |
| `src/render/` | Scene display, hit areas, animation and texture cleanup |
| `src/ui/` | Semantic controls, dialogs, help, menus and equivalent text view |
| `src/storage/` | Transactional saves, migration, export/import, conflict handling |
| `src/audio/` | Music/effects controls, pause/resume and safe initialization |
| `src/pwa/` | Offline status, update flow, install help |
| `src/site/` | Public information pages and truthful metadata |
| `scripts/` | Campaign verification, static page generation and release packaging |
| `tests/` | Core, integration and browser coverage |
| `docs/` | Decisions, build state, verification, operations and launch materials |

Use React only for meaningful UI state changes. Do not rerender the full component tree on every frame. The renderer reads an immutable trace and a playback position. The simulation never reads the wall clock, frame rate, DOM, storage, or network.

Expose documented commands: `dev`, `build`, `preview`, `lint`, `typecheck`, `test`, `test:e2e`, `verify:levels`, `verify:release`, and `package:release`. A clean install followed by these commands must work without undocumented manual steps. Release checks must separate product checks from owner-only launch prerequisites.

**D. Exact game rules**

Version one models movement through short shared segments such as a crossing, loading lane, or bridge. Delays produce visible consequences. Vehicles wait safely; there are no injuries or graphic collisions.

Time is an integer simulation beat, shown as `t=0`, `t=1`, and so on. Label the timeline “Time in beats” in help. At normal visual speed, one beat takes about 600 milliseconds. Provide half speed and double speed. Those affect animation only. A run may be inspected instantly by stepping to an event. No real-time deadline is imposed on the player.

Each actor has a release beat, a chosen route, a priority used only for simultaneous queue arrivals, an arrival deadline, and optional dependency on another actor's arrival. Each route is an ordered list of `[resource, duration]` steps. A null resource means private travel that cannot block anyone. Every duration is a positive integer. Named resources are single-capacity segments.

Each actor releases a resource at the end of that step before joining the next queue. There are safe off-lane waiting bays. The model does not hold multiple resources at once, permit collisions, or create physical traffic deadlocks. Draw that behavior honestly. Visual intersections that are not shared resources must show separated lanes, a bridge, or clear non-conflicting paths.

Shared resources serve requests in order of their ready beat. If requests become ready at the same beat, lower numeric priority wins, then ASCII actor ID. In this campaign B is the bus, R the delivery robot, and C the cart, with priorities 10, 20, and 30. Explain this in inspection text as “If arrivals tie: bus, robot, cart.” An earlier queued actor is never overtaken by a later request.

Occupancy intervals are half-open: `[start, end)`. A resource freed at beat 3 can be entered at beat 3. Closure intervals use the same convention. A traversal must fit wholly outside a closure; otherwise it waits until after that closure. Do not merely check the entry beat. Queued actors retain arrival order even when a later short traversal could fit in an earlier gap.

An actor with `after: R` cannot release before R arrives. Its actual release is the maximum of its configured start and R's arrival. There is no transfer delay unless a future level explicitly defines one. Dependencies must form an acyclic graph.

For each scenario, success means every actor reaches its endpoint by its scenario deadline, with equality allowed. The shared plan must pass every scenario. An actor finishing late fails its own goal even if the bus succeeds. The original plan must fail at least one scenario. No hidden random variation changes an outcome between retries.

The change cost is the number of editable fields that differ from baseline. This campaign gives each editable actor only one field: its route or release beat. Revising that same field several times still costs one change. Returning it to baseline refunds the change. Inspection, test, replay, hint, rewind, undo and redo spend no changes.

Reject edits to fields not declared in `edits`, values outside their finite domain, and plans above the budget. Keep the previous valid plan intact and explain the problem. Never allow a success by modifying fixed actors, deadlines, scenarios, or closures in an imported save.

**E. Simulation contract and event ordering**

Return `{arrivals, goalResults, trace, passed, firstFailure}` with stable event IDs. Trace steps include actor ID, step index, resource ID, ready beat, actual start, end, waiting reason, and references to relevant prior occupancy or closure. Add dependency wait records separately. Tie visual explanations to these facts, not to a generic error message.

Reference procedure:

1. Resolve the allowed plan and scenario overrides. The provided scenarios only override starts of fixed actors. Reject future content that ambiguously overrides a player's editable start unless explicit precedence is added in a new schema version.
2. Queue initial actor requests. Dependent actors wait for a completion event.
3. Order the event queue by `(readyBeat, eventKind, priority, actorId, stepIndex)`. Completion events have kind 0 and traversal requests kind 1. This allows same-beat handoffs before new traversal requests are served.
4. For a traversal, start at its ready beat or the resource's reserved-until beat, whichever is later. Advance past each conflicting sorted closure. Record the traversal and any wait. Reserve a named resource through its end.
5. Schedule the next traversal at that end beat, or a completion event for the final step.
6. On completion, record arrival and queue any directly dependent actor whose prerequisite has completed.
7. Finish all events. Compare arrival beats with deadlines and return deterministic results.

A resource reservation created from an earlier queued request is honored even if it begins after a closure. This is intentional FIFO behavior. Store enough provenance to explain why an actor waited. An unshared travel step simply advances time.

At an exact deadline, process arrivals at that beat before marking an unfinished goal late. In UI terms, the deadline succeeds through that beat. A first failure can point to the deadline event and the preceding wait; it must not falsely imply that waiting itself is always a failure.

Cap validated campaign data at 8 actors, 12 steps per route, 8 choices per edit, 4 edits, 3 scenarios, 20 closures per resource, and a 120-beat horizon. Version-one campaign content is much smaller. Refuse oversized user imports rather than launching expensive computation. Enumeration belongs in a bounded worker or a developer script, not on the animation thread.

**F. Ten-level campaign and content direction**

The JSON appendix is the source of truth for mechanics. Do not silently loosen deadlines, change queue ordering, or remove a scenario to make a level pass. All ten fixtures were enumerated in a small independent reference model during preparation. Each has one winning plan within its declared domain, and that plan uses the required budget. This proves feasibility under the stated rules, not fun, visual quality, or a finished game's correctness. Recreate the checks in TypeScript and validate the actual game through its visible controls.

| ID | Title | Scene and learning goal | Futures | Budget |
| --- | --- | --- | --- | --- |
| 01 | Market Morning | A robot occupies the market crossing and delays a bus. Learn a route change. | 1 | 1 |
| 02 | A Little Later | Use a departure delay so the bus passes first. Learn timing. | 1 | 1 |
| 03 | Bridge Break | A raised bridge creates a wait. A longer clear route is faster overall. | 1 | 1 |
| 04 | Last Connection | The bus waits for the robot's parcel. Find the upstream cause. | 1 | 1 |
| 05 | The Hidden Queue | A faster first segment still blocks a later loading lane. Trace both waits. | 1 | 1 |
| 06 | Two Small Changes | Two independent queues both need a repair. Learn a two-change budget. | 1 | 2 |
| 07 | An Early Arrival | The same plan must protect the bus and robot on two schedules. | 2 | 1 |
| 08 | A Plan for Both | One timing fix helps the first day but fails the second. Find a robust delay. | 2 | 1 |
| 09 | Three Possible Days | A tempting route fails when an upper lane closes. Compare three futures. | 3 | 1 |
| 10 | Harbor in Harmony | Repair both queues while a tempting shared shortcut closes in one future. | 3 | 2 |

Use three chapters: First Ripples (01-03), Connected Streets (04-06), and Possible Days (07-10). Offer level 01 immediately. Unlock the next two levels beyond the highest completed level, respecting the end of the ten-level campaign. This gives a small escape route when stuck. Direct shared links may open any included level, with help available; they do not mark earlier levels completed. Completion, not hint use or perfect play, advances progress.

The capstone is the hardest integration in a beginner chapter, not a claim of expert-level depth. Do not market these finite small-choice puzzles as thousands of difficult levels. Improve the art, event explanations, and level transitions without changing verified mechanics. Add a tested later chapter only after the required release is done.

Each level needs authored `intro`, `goalText`, `actorLabels`, `routeLabels`, scenario descriptions, three hints, an explicit solution explanation, and ending text. Generate these from the actual rules and validate they remain true.

Hint starting points:

| ID | First hint | Second hint | Final hint |
| --- | --- | --- | --- |
| 01 | Watch who enters the crossing first. | The robot has a path that avoids it. | Try the garden route. |
| 02 | Watch when the bus reaches the crossing. | A later robot departure can prevent the queue. | Start the robot at beat 2. |
| 03 | Inspect when the bridge is available. | Count waiting time as part of the journey. | Try the quay route. |
| 04 | The bus is waiting before its trip begins. | It cannot leave until the parcel arrives. | Send the robot on the direct route. |
| 05 | Follow the bus after the first crossing. | A quicker crossing can still leave a long queue at the next lane. | Try the robot's side-door route. |
| 06 | Watch each place where the bus waits. | Changing only one delivery leaves the other queue. | Use the robot's garden route and the cart's quay route. |
| 07 | Check who misses a deadline on each day. | The plan must protect both vehicles even when the bus is early. | Use the garden route. |
| 08 | Test your delay against both bus schedules. | Beat 2 helps one day but blocks the later bus. | Start the robot at beat 4. |
| 09 | Check the upper lane in the second future. | A route that is fast today may be closed tomorrow. | Use the garden route. |
| 10 | Compare the upper lane across all three days. | Both delivery routes must avoid the bus lanes and remain usable. | Send the robot through the garden and the cart along the quay. |

Hints must account for the current plan. If the suggested field already matches the solution, point to the remaining field or suggest testing the remaining scenario. Full solution reveal asks once before replacing a plan, stores a recovery snapshot, and explains the result. Hints have no cooldown, currency, advertisement, or public penalty.

**G. Visual system and complete asset requirements**

Style: a miniature harbor district with tidy paving, rounded vehicles, a quiet waterfront, warm daylight, and soft depth. Use a fixed three-quarter view or carefully layered top-down view. Prioritize readable lanes over dramatic perspective. Reuse original art components but compose ten distinct scenes.

Create custom PixiJS scene components for the bus, robot with parcel, cart, road segments, separated lanes, queue bays, bridge in raised/lowered states, depot, market awning, ferry pier, small ferry, trees, water, destination signs and route previews. Design clear UI controls with HTML/CSS and text labels; any external utility icons must meet section A1's provenance and licensing rules. Do not generate first-party SVG artwork. The ferry is destination scenery in these fixtures; the deadline is the latest allowed arrival. Do not invent a ferry movement rule that changes the simulation.

Assets must be complete at handoff. Do not leave developer rectangles, emoji vehicles, stock watermarks, broken texture URLs, or missing illustrations in the public UI. Inspect the custom scene drawings at actual phone size and desktop size. Keep gameplay labels and hit areas precise and editable. No paid asset purchase is required. Save source artwork and provenance, and follow section A1's restrictions throughout.

| Token | Value |
| --- | --- |
| Background | `#F7F8FC` |
| Surface | `#FFFFFF` |
| Primary text | `#1F2937` |
| Secondary text | `#526074` |
| Main action and selection | `#2952CC` |
| Passed state | `#137B55` plus check and text |
| Needs attention | `#9A4D00` plus event marker and text |
| Spacing | 4, 8, 12, 16, 24, 32 CSS px |
| Button and panel radius | 12 and 20 CSS px |
| Body and controls | 16 CSS px with relative scaling |
| Secondary labels | 14 CSS px starting point |
| Titles | 24-28 CSS px |
| Font | System sans-serif stack with appropriate local fallbacks |
| Common touch target | At least 48 by 48 CSS px where the layout allows |

These are design choices. Test actual color pairs and states. WCAG's enhanced 44px target criterion is AAA and has exceptions; our 48px choice is not a claimed universal legal rule. Use normal-text contrast of at least 4.5:1 and meaningful control/graphic contrast of at least 3:1 where applicable. [Target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), [text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

Ship one fully checked light theme. Do not introduce a second theme at the cost of core quality. Support reduced motion and text enlargement in the required theme. Global text must not shrink to fit a bigger board.

Board layout uses normalized coordinates in a 100 by 140 portrait design space. Reserve about 8 units of clear margin around the scene. Place the bus entry near the upper left and endpoint toward the lower right. Put resource X around the upper middle, Y around the lower middle, and U on a visibly separate upper-side lane. Garden and quay routes run along opposite sides with no ambiguous crossings. Mirror and reshape scenes across levels while retaining readable paths. Level 04 visibly joins the parcel endpoint to the bus departure stop. All candidate routes must be viewable before commitment.

Actual step durations are authored game time, not inferred from screen distance. Show duration beats in the object route panel and on optional path labels. Animate each route consistently with its configured time. Do not let a long drawn path silently take more simulation time than its data says.

The phone board must remain readable at 360px viewport width and usable at 320px. Let the details sheet collapse and provide board zoom plus a home-view button. Frequently used actions stay reachable above the safe area. Test portrait, landscape, text enlargement, and browser toolbar changes. On desktop, move object details into a right panel and cap board width so artwork does not stretch excessively.

**H. Screens and interface states**

Build every row, including error and empty states.

| Screen or state | Required behavior |
| --- | --- |
| First visit | Start action enters the first playable scene; sound control is available. |
| Returning visit | Continue resumes the saved level and plan; Chapters remains visible. |
| Chapter selection | Ten named levels, completion state, two-level lookahead, no fake locked future chapters. |
| Initial replay | Pausable, skippable demonstration of the original failure. |
| Inspecting | Shows selected object, fixed/editable status, route rules and deadlines. |
| Editing | Choice preview and clear remaining budget; no motion until test. |
| Testing | Play/pause and timeline controls; visible scenario name and current beat. |
| Failure | Explain the missed goal and offer Inspect event, Undo change, Hint. |
| Success | Show outcomes, brief celebration, Next puzzle and Done for now immediately. |
| Campaign ending | Celebrate all ten completed levels, replay access, share option, no false promised release date. |
| Help | Replay controls tutorial and explain beat timing, queues, goals, scenarios and saves. |
| Settings | Music, effects, reduced motion, UI text size, save export/import, clear progress, install help. |
| Offline ready | Only display after all required files are cached successfully. |
| Offline missing content | Explain unavailable files; cached content stays usable. |
| Save failure | Current plan remains playable; warn that persistence failed and offer export. |
| Update ready | Non-blocking notice at a safe pause; update only after save and explicit choice. |
| Unsupported rendering | Offer the structured text play view; explain any truly unsupported capability. |
| Bad level URL | Friendly not-found state and return to chapters; no crash or silent random level. |

Use plain action names: Test plan, Resume, Pause, Undo change, Redo change, Reset puzzle, Previous event, Next event. Scrubbing only changes what is being viewed. Choosing an edit returns the run to its beginning and invalidates old results. Teach that behavior in the introduction.

Keep one active full-size future on mobile. Tabs have words such as Normal day, Early bus, and Upper lane closed. Each tab displays Not tested, Passed, Needs a change, or Test again. Never carry a pass result from an older plan version. Display the exact changed starts, deadlines, and closure intervals when inspecting the scenario. A scenario changing a bus schedule also changes its linked deadline in the supplied fixtures; show both.

Tap an actor to inspect, then tap a named option to edit. Drag is optional. Use pointer release for commitment where appropriate, cancel safely on pointer cancellation, and prevent a pan from also selecting an object. Preserve pinch/page zoom outside the board. Put previews above the finger. [Dragging alternatives](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html), [pointer cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html).

Undo is immediate and has no confirmation. Reset offers recovery and keeps a snapshot. Clear all progress requires an explicit confirmation with a visible export option. Back closes the current overlay first, then leaves the level while preserving it. Closing or changing orientation never spends a move.

**I. First-session script and feedback**

The first three levels introduce concepts in play. Never require reading every rule before acting. On 01, watch the crossing, scrub backward, inspect the robot, choose a route, and test. On 02, introduce departure timing. On 03, introduce closures. On 04, reveal the dependency line only when inspecting the bus or parcel. On 07, introduce the second future. On 09, add the third.

Tutorial prompts appear beside the relevant action, remain dismissible, and never cover a critical board area. A prompt advances when the intended action occurs, not after a guessed timeout. If dismissed, help stays available. Never change the control scheme after the tutorial.

Example failure copy: “The bus arrived at beat 7. It needed to arrive by beat 5.” Provide an Inspect delay action that points to the crossing wait. The first hint can direct attention upstream; do not automatically reveal the whole solution chain.

Use gentle success audio and about 400-700ms of optional celebration, with navigation already available. Repeated attempts can skip the replay to results. Do not force a long animation to reveal an unchanged failure. No streak loss, guilt messages, artificial scarcity, or rating prompts after a loss.

UI reaction target is visible acknowledgment within 100ms on representative tests. Aim for stable 60fps with an optional stable 30fps visual fallback. The simulation must remain identical. Stop unnecessary rendering and sounds while hidden. Start sound after user interaction; blocked autoplay cannot block play. [Browser autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).

**J. Accessibility and device behavior**

Implement semantic HTML controls for the interface. Provide a structured text play view listing actors, routes, durations, deadlines, scenario differences, and event steps. The same plan actions must work through that view. Both the visual and text views use the same engine; never create different rules for the alternative view.

Keyboard users must be able to complete all ten levels. Use Tab for major controls, Enter/Space for actions, and accessible buttons for every action. Optional shortcuts may include Space for playback and Z/Y for undo/redo only when focus is not in an input. Document them. Focus is visible, dialogs trap focus correctly while open, and closing a dialog restores focus to its trigger.

Give the timeline an accessible name, current value, range, and equivalent stepping controls. Announce selected meaningful events and goal results, not every animation frame. No pass/fail state depends on color or sound alone. Reduced motion removes sweeps, camera movement and bouncing while retaining understandable state changes. [Animation guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

Check 200% text enlargement without losing controls or goals. Route text must wrap. Use icons with labels for important actions. Test high zoom and narrow screens. Do not claim full screen-reader accessibility from an automated audit alone; implement the text view and report any manual assistive-technology checks still outstanding. [Text resizing](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html).

Test Chromium, Firefox and WebKit through Playwright where installed. Test at least 360x800, 390x844, 768x1024, 1280x800, a short landscape viewport, and a 320px-wide layout. Playwright WebKit is not proof of real iPhone or installed-PWA behavior. Record physical-device checks honestly. [Playwright projects](https://playwright.dev/docs/test-projects).

**K. Saves and data format**

Use IndexedDB with a namespaced database, schema version and transactional writes. Store campaign progress, each unfinished plan, hint position if useful, playback position, settings, and a small bounded undo history. Keep game-rule version and level version separate from save-schema version.

Persist after committed edits, level completion and settings changes. Mark Saved only after the transaction succeeds. Pause on `visibilitychange` to hidden and use a background checkpoint as a supplement, not the only saving event. Do not advance simulation time while the page is backgrounded. [Visibility changes](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event).

Save exports are JSON with product ID, schema version, timestamp, level versions, progress, plans and settings. Limit imports to 256 KiB and bounded records. Validate plain data, reject dangerous keys and invalid values, show a short import summary, preserve a recovery snapshot, and confirm before replacement. Never use eval or execute anything from an import. Unknown future schemas explain that a newer app may be needed.

No email, full name, account ID, precise location, or authentication token goes into a save. Share links must contain only level ID and content version, not personal progress or a solution. Allow a user to export their own progress without uploading it anywhere.

For simultaneous tabs, use a safe write-owner or version-check approach with cross-tab notification where supported. A stale tab must not silently erase a newer save. Provide a read-only recovery choice or explicit reload when a conflict is detected. Test interrupted writes and schema upgrades.

Browser storage may be cleared or evicted. Provide manual export/import and request persistent storage only if helpful and supported. Do not promise automatic cloud recovery or that browser and installed-app storage always match. [Browser storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

**L. Offline installation and release updates**

Serve production over HTTPS. Provide manifest ID, name, short name, start URL, scope, theme/background colors, standalone display mode, and original 192px/512px icons plus maskable variants and an appropriate touch icon. Use correct icon safe areas and test the manifest. Install instructions must handle platforms with no browser install prompt.

Use `/play/` as the game entry. Route internal game views in the URL fragment, such as `/play/#/level/01?v=1`, so a static host can refresh any shared game link without server routing. Keep stable level IDs. Do not change the host when building share links; use the current trusted origin unless a validated production origin is configured.

Precache the small app shell and all ten levels and required assets. Report offline readiness only after successful completion. Do not cache user export downloads, arbitrary remote URLs, or error responses as valid assets. Avoid third-party asset runtime requests by bundling what is needed.

Version caches and asset filenames. Keep the old running build alive until a successful save and user-selected update at a safe boundary. Do not call an unconditional forced reload or activate an incompatible worker mid-puzzle. Verify update from build A to build B with progress retained. Test stale tabs and retained old assets. Save-schema migration must preserve a rollback copy when possible.

A rollback can revert code and assets; it cannot always reverse a destructive data migration. Therefore version one uses additive, tested migrations and retains backups. Document recovery in operations notes.

**M. Public pages and discoverability**

Build static HTML pages for `/`, `/about/`, `/how-to-play/`, `/accessibility/`, `/privacy/`, `/terms/`, `/support/`, and `/credits/`, plus a real `404.html`. Use Vite multi-page inputs or a small deterministic build script. Public copy must be present in HTML without requiring the game canvas. The game itself can use React at `/play/`.

The landing page includes a real gameplay image, a short explanation, Play free, the three-step watch/change/test explanation, and an honest feature list. Returning visitors can see Continue when local progress exists. Never make an email form the main gateway.

Use one configuration source for working name, product ID, support contact, publisher details, production URL, and release mode. Keep product ID stable if the marketing name changes. Do not derive public identity from a computer username or private user profile.

In review mode, legal pages may explain actual local behavior but must visibly remain a private-review draft if owner fields are unresolved. Product play still works. In public mode, `verify:release` must fail on missing required publisher/contact values or unresolved policy review items. Never publish bracket placeholders or invented legal details.

Add meaningful page titles, descriptions, favicon, Open Graph image from the real game, canonical URLs only when the origin is confirmed, and a sitemap of real public pages. Exclude internal play fragments, saves, debug routes and solution data from indexing. Review builds must emit noindex and disallow indexing, but access control is still needed for privacy.

Do not fabricate reviews or rating counts to obtain search features. Software-app rich-result eligibility has requirements beyond basic schema; omit unsupported rating markup and do not promise a rich result. Basic accurate structured data is optional. [Google software-app guidance](https://developers.google.com/search/docs/appearance/structured-data/software-app). Do not create hundreds of thin level landing pages. [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies).

**N. Security and supply-chain controls**

Keep the game static and offline-capable. No runtime secret, database, admin login, or server endpoint is required. Bundle assets locally. Validate all query/fragment values and save imports. Use text rendering for user-visible imported strings; do not inject raw HTML. Apply length and numeric limits before simulation or allocation.

Add a practical Content Security Policy for the chosen build, preferably same-origin scripts and styles with no eval, no external connections by default, restricted object sources and frame ancestors. If development needs broader rules, isolate those from production. Add appropriate MIME sniffing and referrer controls. Test headers in the chosen static host. Do not break the game with an untested blanket policy.

Keep dependencies small. Preserve third-party notices. Run the dependency audit, assess reachable production vulnerabilities, and fix relevant critical/high issues or report a concrete remaining blocker. Do not apply destructive blanket upgrades just to clear an audit count. No raw tokens, saved credentials, or private paths in screenshots, logs, marketing images, or bug exports.

Source code remains private by default unless the owner authorizes a public repository or open-source license. Do not apply a license granting rights to original code or art on the owner's behalf. Dependency license notices remain required regardless.

**O. Zero-service-cost hosting and packaging**

The primary deployment target is Cloudflare Pages Free with a supplied subdomain. Generate a static `dist` and include the host headers and 404 behavior. There must be no Pages Functions, Workers backend, paid database, paid analytics, paid image transforms, or scheduled jobs in the required architecture.

Cloudflare currently lists static asset requests as free and unlimited; the free Pages plan allows 500 builds monthly. These terms can change, and free hosting is not a promise of unlimited service forever. Check the current terms before production. [Pricing](https://developers.cloudflare.com/pages/functions/pricing/), [limits](https://developers.cloudflare.com/pages/platform/limits/).

The build must run locally even without a Cloudflare account. Produce a deployment-ready archive and exact deployment instructions. Configure production deployment only when account access and session authorization exist. A custom domain is optional and not zero cost by default.

Create `release/ripple-web-v1.zip` containing the tested static site and a version manifest. Produce a checksums file and a rollback note. Exclude node_modules, secrets, personal diagnostics, unneeded test videos, and hidden environment files.

Also prepare `release/ripple-itch-v1.zip` as an optional browser-game distribution package with root `index.html`, relative asset paths and an iframe-safe layout. Disable service-worker installation in the embedded build to avoid scope or hosting assumptions. In embedded mode, explain that offline installation and storage behavior may differ and offer the standalone link only when configured. Test the package locally in an iframe. Do not upload it automatically. [itch.io HTML5 packaging](https://itch.io/docs/creators/html5).

**P. Testing requirements before owner handoff**

The owner is the final acceptance tester, not the person who must find basic implementation failures. Run the relevant automated and visual checks yourself, fix failures, and repeat only the affected checks plus required release gates. Do not stop after the homepage renders.

| Test area | Required evidence |
| --- | --- |
| Rule validation | Reject negative times, zero durations, missing routes, duplicate IDs, invalid dependencies, conflicting overrides and oversized inputs. |
| Queue behavior | Exact-boundary release, simultaneous priority, earlier queue retention, multiple closures, dependency handoff. |
| Campaign feasibility | Enumerate every allowed plan; check baseline fails and reference solution passes each future. |
| Determinism | Repeated runs yield the same trace and outcome; rendering speeds cannot change results. |
| Budget | Revisions do not double-charge; baseline restoration refunds; fixed actors cannot be edited. |
| Plan history | Undo/redo, branch after undo, reset recovery, invalidation of stale results. |
| Saves | Reload, background, failed write, import/export, corrupted file, version migration, two-tab conflict. |
| Full game | Solve all ten levels through visible controls in the browser; verify progress and ending. |
| Multiple futures | Test all scenario states; old pass results never survive a plan edit. |
| Help | Tutorial dismiss/reopen, three hints, reveal confirmation, recovery after reveal. |
| Accessibility | Keyboard play, focus, names, contrast, text enlargement, reduced motion, text-view equivalence. |
| Offline | Cache-complete state, airplane-mode reload, missing-cache message, version update without lost plan. |
| Routes | Public pages load directly; game fragment links refresh; bad URLs recover. |
| Security and privacy | Production network requests match the data inventory; no tracking SDKs or secrets. |
| Custom design and writing | Review every screen and text surface for generic templates, filler, inconsistent art, prohibited dashes and AI-generated SVG assets; verify external asset provenance. |
| Release | Clean install, build, tested archive contents, no broken links, no required TODOs or disabled fake features. |

End-to-end tests must interact with the public UI to select routes/timing and press Test plan. A test may use fixtures to know the expected action, but cannot set solved progress directly and claim a gameplay pass. Maintain core fixture tests as separate evidence.

Capture and visually inspect the first playable screen, selection state, failure, success, multi-future state, settings, chapter screen and ending at phone and desktop sizes. Inspect all ten board compositions. Check clipping, touch occlusion, low contrast, stale indicators, route ambiguity, empty spaces and offscreen controls. Repair visual issues. Screenshots existing on disk are not proof that someone inspected them.

Use console and network logs to find errors. Test normal production build, not only dev mode. Measure load readiness, input response and frame pacing separately. Initial targets: first playable puzzle within about 3 seconds on a documented representative network/device; prompt tap and undo feedback; no game-breaking frame stalls. Published web targets are LCP at most 2.5 seconds, INP at most 200ms and CLS at most 0.1 at the 75th percentile. Lab measurements cannot be labeled field percentiles. [Web Vitals](https://web.dev/articles/vitals).

If physical phones or screen readers are unavailable, complete browser/emulation tests and state the gap. Do not fabricate human playtesting or retention results. The owner receives a short final device checklist, not unfinished routine engineering tasks.

**Q. Marketing package and honest growth plan**

Create a finished marketing kit from the actual completed build. No live posting or outreach is part of the build authorization.

Required files in `docs/marketing/` and `release/marketing/`:

- A one-page positioning brief defining the audience, value, differentiator and truthful scope.
- Landing-page copy used in the actual site, not an unrelated sales concept.
- A 15-second and a 30-second gameplay trailer, captured from real interactions with readable captions. If the runtime cannot encode a requested format, supply a working available format plus source capture and record the conversion step; do not mislabel file types.
- Three polished screenshots showing inspection, a causal delay, and multiple futures.
- Square, portrait and wide promotional images, composed from the real game rather than impossible gameplay. Use 1080x1080, 1080x1920 and 1200x630 as starting exports; recheck a channel's current required sizes at posting time.
- A short press sheet, feature list, controls, supported platforms, asset credits and current release status.
- Draft posts for a personal LinkedIn account, an allowed game-testing community, and a game-focused short video caption.
- Draft outreach to five categories of suitable small puzzle-game creators. Do not invent actual contacts or claim anyone agreed to feature the game.
- A four-week launch checklist with stop/go conditions and zero required ad spend.

Approved message direction: “I built a small puzzle game about fixing a chain of delays. Watch what happens, change one rule, and test the new plan. Ten levels, no login, no ads.” Adapt tense to actual status. Mention two or three futures only when demonstrating a level that has them.

The first trailer should show a bus missing its target, one visible route change, and a successful replay. The second can show a change passing one future and failing another, then invite the viewer to try. Do not deliberately fake dumb play or hide that the clip shows the actual product.

Draft launch cadence:

| Period | Owner action after approval | Success signal |
| --- | --- | --- |
| Prelaunch | Verify name, policies, contact and real-device behavior; test the complete preview. | No release-blocking defects or unresolved required legal fields. |
| Week 1 | Share a small number of honest clips through permitted channels. | People can start and finish early puzzles without coaching. |
| Week 2 | Invite voluntary feedback from interested players. | Specific reports about controls, difficulty and favorite moments. |
| Week 3 | Publish a real improvement with a short change note. | Repeat play and fewer repeated usability complaints. |
| Week 4 | Decide whether a second chapter is worth building. | Evidence of return interest, not just views or likes. |

Read each community's current self-promotion rules before posting. Do not scrape users for unsolicited messages, send bulk DMs, buy votes, manufacture reviews, or hide developer involvement. Reddit's spam policy applies alongside community rules. [Reddit spam policy](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam).

Analytics remains local in version one. A diagnostic mode can record bounded, non-personal events on the device for voluntary export: level opened, valid edit, test result, hint stage, level completed, save error and render error. Keep it off by default unless the owner explicitly enables a disclosed tester mode. Never upload those events silently. Local exports cannot establish population-wide retention or unique-person counts.

Marketing can be prepared at zero spend, but attention, sales and retention are not guaranteed. Do not implement payments in this release. A later optional paid chapter is a business experiment that needs separate pricing, taxes, refunds, entitlements and platform-payment review.

**R. Publishing policies and legal work**

This section is a practical release checklist based on official sources checked September 15, 2026. It is not a claim of legal clearance or a substitute for review when the product's actual audience, location or data practices require one. Refresh sources at publication. The implementation agent must complete the technical and factual preparation; it cannot invent identity, approve contracts, guarantee approval, or impersonate the publisher.

**Web release first.** A browser/PWA release avoids native-store enrollment as a prerequisite. It still needs truthful public information, lawful assets, appropriate data practices and compliance with the hosting provider's terms. No account or checkout is required for these ten free levels.

**Name and intellectual property.** RIPPLE is a working title. Search the proposed final name in the web, app stores, game catalogs and relevant trademark registries. Record potential conflicts; do not declare trademark clearance from a search result. Centralize the name so the owner can approve a rename without changing save IDs. Do not imitate an existing game's logo, screenshots, level geometry, music or protected characters. Preserve asset origins and license notices. [USPTO search guidance](https://www.uspto.gov/trademarks/search).

**Privacy and local storage.** Write a concrete data inventory covering local saves, optional local diagnostics, user-exported files, hosting traffic, support messages and third-party SDKs. The application is designed not to send gameplay telemetry, but hosting may process IP addresses and request metadata. Verify actual provider settings and network behavior. Do not publish “we collect absolutely no data” or invent a provider retention period. [Cloudflare privacy policy](https://www.cloudflare.com/privacypolicy/), [Cloudflare cookie documentation](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/).

Generate a readable privacy page from actual verified behavior: who operates the service, contact, data categories and purposes, provider roles, local deletion/export, support handling, applicable rights/contact route, and the effective date. If owner contact or legal identity is missing, keep it as a review-only draft and list those fields as public-release blockers. Do not insert a fake email address or business address.

Avoid ad/analytics cookies and nonessential identifiers in version one. Assess storage and hosting cookies actually used, including security features. Consent requirements depend on purpose and jurisdiction; “localStorage” is not a universal exemption. Do not add a cosmetic cookie banner when there is nothing meaningful to choose. If a later feature needs consent, implement the real behavior and withdrawal before release. [ICO storage and access guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/).

**Children and audience.** Make no child-directed marketing, birthday collection, targeted ads or social features in this release. A general-audience label or a “13+” sentence is not a legal workaround if the content, marketing or actual operation is child-directed. Review the actual product and any support collection. Do not add a fake age gate to claim compliance. If child-directed features or data collection become part of scope, treat that as a separate legal and product review. [FTC COPPA guidance](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions).

**Terms and support.** Create plain terms describing the free game, permitted use, ownership/third-party credits, local-save limits, service changes and support contact. Do not invent governing law, dispute clauses, broad waivers or promises about uptime. Mark jurisdiction-dependent wording for the publisher's final review. A support page can explain save recovery, offline limits and how to export a redacted bug report. Send nothing automatically. A support email or issue link must be real and configured before public launch.

**Google Play later.** Google currently lists a US$25 one-time developer registration fee. Personal developer accounts created after November 13, 2023 must meet its closed-testing requirement, currently at least 12 opted-in testers continuously for 14 days, before applying for production access. Codex cannot satisfy genuine tester participation or identity verification by simulating it. [Enrollment](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en), [testing requirement](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en).

Prepare a future Google checklist covering verified publisher account, current target API and signing requirements, truthful target audience and content rating, privacy policy, actual Data safety declarations, screenshots, content ownership, and complete review instructions. If accounts are added later, account deletion requirements must be evaluated. This release has no accounts to delete. Do not prefill “no data collected” solely because progress is local. [User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en), [review preparation](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en), [content ratings](https://support.google.com/googleplay/android-developer/answer/9859655?hl=en).

**Apple App Store later.** Apple currently lists US$99 per membership year, with local pricing or limited waivers where applicable. Native submission also needs publisher access, signing/build tools and review. A web wrapper is not a guarantee of acceptance. A future native version must meet current completeness, minimum-functionality, privacy, metadata and payment rules applicable to its storefront. [Membership](https://developer.apple.com/programs/whats-included/), [review guidelines](https://developer.apple.com/app-store/review/guidelines/).

Provide a future Apple checklist for signing, archive/build, actual device tests, screenshots, support/privacy URLs, age questionnaire, data declarations and review notes. Never claim an official age rating before completing the relevant platform process. If digital sales are added, recheck the current storefront rules rather than assuming external payment links are universally allowed. [Age-rating workflow](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/).

Keep native store work as prepared documentation, not a hidden requirement to pay or recruit testers before the browser game is complete. No real publisher signatures, legal confirmations, fees or marketing posts are authorized by the existence of this file alone.

**S. Operations and future maintenance**

Create `docs/OPERATIONS.md` with local setup, build, static deployment, host settings, cache/update behavior, save migration, rollback, content versioning and support triage. Include how to reproduce a bug from level version and allowed plan values without personal data.

Use a simple issue severity model. Release-blocking: data loss, inability to complete a required level, incorrect rules, broken first launch, exposed private data, or missing required public identity/policy fields. High: repeated unusable touch target, crash recovery failure, or stale multi-future results. Ordinary polish can be tracked without pretending it blocks all development.

After launch, check for broken public pages and support reports, verify the host remains on the intended free plan, and review dependency updates at a manageable cadence. These are a proposed operator checklist, not background automations already installed. No paid monitoring or recurring job is required.

New content gets a new stable level ID or explicit content version. Keep old shared links and saves meaningful. Avoid changing shipped deadlines without a migration and release note. Never add analytics, payments, accounts or user-generated content through an incidental dependency upgrade.

**T. Build execution sequence**

1. Inspect the workspace and its applicable instructions. Write a short implementation plan, record scope and start coding. Do not wait for owner approval of routine choices.
2. Implement schema, pure engine and all campaign fixtures. Verify the reference outcomes before building decorative scenes.
3. Implement plan editing, playback, trace inspection, goals and budget. Build the first usable scene and confirm a full failure-to-success path.
4. Implement local saves, history, safe interruption and recovery. Add integration tests for these trust-critical paths.
5. Complete all ten levels, per-level text, scenario tabs, tutorial, hints, ending and chapter progression.
6. Apply the full visual system, original assets, sound, responsive behavior, keyboard access and structured text play.
7. Complete PWA caching/update flow and static public pages. Draft factual policy pages and separate any unresolved owner fields.
8. Build marketing assets from real gameplay, release archives and deployment/operations documentation.
9. Run every applicable release gate, including the custom-design, writing and asset-provenance requirements in A1. Inspect browser screenshots, read the full product copy, repair issues, and record honest test evidence. Remove replaced components, unused assets and abandoned code after confirming no import or link references them.
10. Deliver the completed local/review game, evidence, source, packages, concise owner test checklist and one consolidated list of remaining external launch items.

Update `docs/BUILD_STATE.md` after each material milestone with completed work, failing checks, exact commands, key decisions and next task. After a context reset, read that checkpoint and continue. A milestone is not a reason to stop the whole task. Do not add fake results, skip a required feature silently, or shift routine testing to the owner.

**U. Definition of done and final handoff**

The build is complete only when every required feature is implemented, all ten levels are playable, their known solutions work through visible controls, and the game reaches its campaign ending. A polished homepage with incomplete gameplay does not satisfy the task.

Required handoff artifacts:

- Working source and lockfile in the project repository or workspace.
- `README.md` with one-command setup/run instructions and supported/tested environments.
- `docs/VERIFICATION.md` with commands, pass/fail results, scenario outcomes, screenshot paths, measured conditions and remaining gaps.
- `docs/BUILD_STATE.md` and `docs/DECISIONS.md` reflecting the final state.
- `docs/RESEARCH_NOTES.md` recording useful online sources, dates checked and the implementation decisions they informed.
- `docs/OPERATIONS.md`, `docs/DATA_INVENTORY.md`, `docs/ASSET_LICENSES.md` and `docs/LAUNCH_CHECKLIST.md`.
- The completed public-page copy and the marketing kit.
- Standalone and optional embedded release archives, version manifest and checksums.
- `docs/OWNER_ACCEPTANCE.md`, a short final test script.

The owner acceptance script must let Jash: open the game without login; finish level 01; use undo and reload; inspect a two-future level; test the capstone; try offline play after download; and check sound/text settings on a real phone. Provide optional spoiler solutions separately so final testing does not require guessing every puzzle.

Classify the final state precisely. **Ready for owner test** means the built game and engineering verification are complete enough for acceptance. **Ready for public release** additionally requires owner identity/contact, name review, policy review, real-device checks as needed, production account readiness, and actual launch authorization. **Published** means deployment actually occurred and was verified. Never confuse these states.

The final response should give the playable local or authorized preview address, the build status, ten-level completion evidence, artifact locations, and only real unresolved launch items. Do not claim that a master prompt can guarantee store acceptance, uninterrupted agent execution, human enjoyment, or commercial success.

**Appendix 1 Campaign data**

Extract the following JSON into the campaign content source and validate it. Each step is `[resourceIdOrNull, positiveIntegerDuration]`. Resource IDs are local to a level. `starts` and `deadlines` are scenario overrides by actor ID. `closures` maps resource IDs to sorted half-open intervals. Preserve the semantic values while adding display content and geometry in separate files.

```json
[
{"id":"01","version":1,"budget":1,"actors":[{"id":"R","start":0,"deadline":5,"routes":{"crossing":[["X",3],[null,1]],"garden":[[null,4]]},"defaultRoute":"crossing","priority":20},{"id":"B","start":1,"deadline":5,"routes":{"main":[["X",2],[null,2]]},"defaultRoute":"main","priority":10}],"edits":[{"actor":"R","field":"route","values":["crossing","garden"]}],"scenarios":[{"id":"normal","starts":{},"deadlines":{},"closures":{}}]},
{"id":"02","version":1,"budget":1,"actors":[{"id":"R","start":0,"deadline":6,"routes":{"main":[["X",2],[null,1]]},"defaultRoute":"main","priority":20},{"id":"B","start":1,"deadline":4,"routes":{"main":[["X",2],[null,1]]},"defaultRoute":"main","priority":10}],"edits":[{"actor":"R","field":"start","values":[0,2,4]}],"scenarios":[{"id":"normal","starts":{},"deadlines":{},"closures":{}}]},
{"id":"03","version":1,"budget":1,"actors":[{"id":"B","start":0,"deadline":6,"routes":{"bridge":[["X",3],[null,1]],"quay":[[null,5]]},"defaultRoute":"bridge","priority":10}],"edits":[{"actor":"B","field":"route","values":["bridge","quay"]}],"scenarios":[{"id":"bridge-raised","starts":{},"deadlines":{},"closures":{"X":[[0,3]]}}]},
{"id":"04","version":1,"budget":1,"actors":[{"id":"R","start":0,"deadline":5,"routes":{"scenic":[[null,5]],"direct":[[null,3]],"canal":[[null,4]]},"defaultRoute":"scenic","priority":20},{"id":"B","start":0,"deadline":6,"routes":{"main":[[null,3]]},"defaultRoute":"main","priority":10,"after":"R"}],"edits":[{"actor":"R","field":"route","values":["scenic","direct","canal"]}],"scenarios":[{"id":"normal","starts":{},"deadlines":{},"closures":{}}]},
{"id":"05","version":1,"budget":1,"actors":[{"id":"R","start":0,"deadline":6,"routes":{"main":[["X",3],["Y",2]],"quick-crossing":[["X",1],["Y",4]],"side-door":[["X",3],[null,3]]},"defaultRoute":"main","priority":20},{"id":"B","start":1,"deadline":6,"routes":{"main":[["X",1],["Y",1],[null,1]]},"defaultRoute":"main","priority":10}],"edits":[{"actor":"R","field":"route","values":["main","quick-crossing","side-door"]}],"scenarios":[{"id":"normal","starts":{},"deadlines":{},"closures":{}}]},
{"id":"06","version":1,"budget":2,"actors":[{"id":"R","start":0,"deadline":8,"routes":{"main":[["X",3],[null,1]],"garden":[[null,4]]},"defaultRoute":"main","priority":20},{"id":"C","start":0,"deadline":8,"routes":{"main":[["Y",5],[null,1]],"quay":[[null,6]]},"defaultRoute":"main","priority":30},{"id":"B","start":1,"deadline":4,"routes":{"main":[["X",1],["Y",1],[null,1]]},"defaultRoute":"main","priority":10}],"edits":[{"actor":"R","field":"route","values":["main","garden"]},{"actor":"C","field":"route","values":["main","quay"]}],"scenarios":[{"id":"normal","starts":{},"deadlines":{},"closures":{}}]},
{"id":"07","version":1,"budget":1,"actors":[{"id":"R","start":0,"deadline":5,"routes":{"crossing":[["X",3],[null,1]],"garden":[[null,4]],"scenic":[[null,6]]},"defaultRoute":"crossing","priority":20},{"id":"B","start":1,"deadline":5,"routes":{"main":[["X",2],[null,2]]},"defaultRoute":"main","priority":10}],"edits":[{"actor":"R","field":"route","values":["crossing","garden","scenic"]}],"scenarios":[{"id":"normal","starts":{},"deadlines":{},"closures":{}},{"id":"early-bus","starts":{"B":0},"deadlines":{"B":4},"closures":{}}]},
{"id":"08","version":1,"budget":1,"actors":[{"id":"R","start":0,"deadline":8,"routes":{"main":[["X",2],[null,1]]},"defaultRoute":"main","priority":20},{"id":"B","start":1,"deadline":4,"routes":{"main":[["X",2],[null,1]]},"defaultRoute":"main","priority":10}],"edits":[{"actor":"R","field":"start","values":[0,2,4,6]}],"scenarios":[{"id":"normal","starts":{},"deadlines":{},"closures":{}},{"id":"late-bus","starts":{"B":3},"deadlines":{"B":6},"closures":{}}]},
{"id":"09","version":1,"budget":1,"actors":[{"id":"R","start":0,"deadline":7,"routes":{"crossing":[["X",3],[null,1]],"upper":[["U",2],[null,1]],"garden":[[null,5]]},"defaultRoute":"crossing","priority":20},{"id":"B","start":1,"deadline":4,"routes":{"main":[["X",2],[null,1]]},"defaultRoute":"main","priority":10}],"edits":[{"actor":"R","field":"route","values":["crossing","upper","garden"]}],"scenarios":[{"id":"normal","starts":{},"deadlines":{},"closures":{}},{"id":"upper-closed","starts":{},"deadlines":{},"closures":{"U":[[0,5]]}},{"id":"early-bus","starts":{"B":0},"deadlines":{"B":3},"closures":{}}]},
{"id":"10","version":1,"budget":2,"actors":[{"id":"R","start":0,"deadline":6,"routes":{"crossing":[["X",3],[null,1]],"upper":[["U",2],[null,1]],"garden":[[null,5]]},"defaultRoute":"crossing","priority":20},{"id":"C","start":0,"deadline":7,"routes":{"crossing":[["Y",4],[null,1]],"upper":[["U",3],[null,1]],"quay":[[null,6]]},"defaultRoute":"crossing","priority":30},{"id":"B","start":1,"deadline":4,"routes":{"main":[["X",1],["Y",1],[null,1]]},"defaultRoute":"main","priority":10}],"edits":[{"actor":"R","field":"route","values":["crossing","upper","garden"]},{"actor":"C","field":"route","values":["crossing","upper","quay"]}],"scenarios":[{"id":"normal","starts":{},"deadlines":{},"closures":{}},{"id":"upper-closed","starts":{},"deadlines":{},"closures":{"U":[[0,4]]}},{"id":"early-bus","starts":{"B":0},"deadlines":{"B":3},"closures":{}}]}
]
```

**Appendix 2 Verified reference outcomes**

These outcomes come from enumeration of all 36 allowed plan combinations across the ten supplied levels, evaluated over their scenarios. Every level has exactly one passing plan under the stated rules. The builder must independently reproduce them in its implementation. Arrival maps use actor IDs and simulation beats.

| Level | Baseline arrivals by scenario | Winning plan | Winning arrivals by scenario |
| --- | --- | --- | --- |
| 01 | normal: B=7, R=4 | R.route=garden | normal: B=5, R=4 |
| 02 | normal: B=5, R=3 | R.start=2 | normal: B=4, R=6 |
| 03 | bridge-raised: B=7 | B.route=quay | bridge-raised: B=5 |
| 04 | normal: B=8, R=5 | R.route=direct | normal: B=6, R=3 |
| 05 | normal: B=7, R=5 | R.route=side-door | normal: B=6, R=6 |
| 06 | normal: B=7, C=6, R=4 | R.route=garden, C.route=quay | normal: B=4, C=6, R=4 |
| 07 | normal: B=7, R=4; early-bus: B=4, R=6 | R.route=garden | normal: B=5, R=4; early-bus: B=4, R=4 |
| 08 | normal: B=5, R=3; late-bus: B=6, R=3 | R.start=4 | normal: B=4, R=7; late-bus: B=6, R=8 |
| 09 | normal: B=6, R=4; upper-closed: B=6, R=4; early-bus: B=3, R=6 | R.route=garden | normal: B=4, R=5; upper-closed: B=4, R=5; early-bus: B=3, R=5 |
| 10 | normal: B=6, C=5, R=4; upper-closed: B=6, C=5, R=4; early-bus: B=6, C=5, R=5 | R.route=garden, C.route=quay | normal: B=4, C=6, R=5; upper-closed: B=4, C=6, R=5; early-bus: B=3, C=6, R=5 |

**Appendix 3 Reference simulation for independent comparison**

This compact Python reference is specification support, not the browser game's implementation. It assumes already-validated fixtures and does not include all production guards, provenance, storage, or UI behavior. Port the semantics into the TypeScript engine. Keep input validation and release tests separate.

```python
import heapq

def simulate(l, plan, s):
    actors={a['id']:a for a in l['actors']}
    free={}; q=[]; arrivals={}; trace=[]
    def launch(a, dependency=0):
        # Scenario start overrides are only used on fixed actors in this campaign.
        release=plan.get(a['id']+'.start',s['starts'].get(a['id'],a['start']))
        heapq.heappush(q,(max(release,dependency),1,a['priority'],a['id'],0))
    for a in l['actors']:
        if 'after' not in a: launch(a)
    while q:
        ready,kind,_,aid,i=heapq.heappop(q); a=actors[aid]
        steps=a['routes'][plan.get(aid+'.route',a['defaultRoute'])]
        if i==len(steps):
            arrivals[aid]=ready
            for b in l['actors']:
                if b.get('after')==aid: launch(b,ready)
            continue
        resource,duration=steps[i]; t=ready
        if resource is not None:
            t=max(t,free.get(resource,0))
            for lo,hi in sorted(s['closures'].get(resource,[])):
                if t < hi and t+duration > lo: t=hi
            free[resource]=t+duration
        trace.append(dict(actor=aid,step=i,resource=resource,ready=ready,start=t,end=t+duration))
        heapq.heappush(q,(t+duration,0 if i+1==len(steps) else 1,a['priority'],aid,i+1))
    ok=len(arrivals)==len(actors) and all(arrivals[a['id']]<=s['deadlines'].get(a['id'],a['deadline']) for a in l['actors'])
    return dict(pass_=ok,arrivals=arrivals,trace=trace)
```
