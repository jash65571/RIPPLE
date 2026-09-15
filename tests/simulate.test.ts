import { describe, expect, it } from 'vitest';
import type { LevelDefinition } from '../src/game/model';
import { simulate } from '../src/game/simulate';
import { parseLevel, ValidationError } from '../src/game/validate';

const makeLevel = (overrides: Partial<LevelDefinition> = {}): LevelDefinition => ({
  id: 'test',
  version: 1,
  budget: 0,
  actors: [
    {
      id: 'B',
      start: 0,
      deadline: 10,
      routes: { main: [['X', 2]] },
      defaultRoute: 'main',
      priority: 10,
    },
    {
      id: 'R',
      start: 0,
      deadline: 10,
      routes: { main: [['X', 2]] },
      defaultRoute: 'main',
      priority: 20,
    },
  ],
  edits: [],
  scenarios: [{ id: 'normal', starts: {}, deadlines: {}, closures: {} }],
  ...overrides,
});

describe('simulate', () => {
  it('uses priority for same-beat arrivals and allows exact-boundary handoff', () => {
    const level = makeLevel();
    const result = simulate(level, {}, level.scenarios[0]!);
    expect(result.arrivals).toEqual({ B: 2, R: 4 });
    expect(result.trace).toMatchObject([
      { actorId: 'B', start: 0, end: 2 },
      { actorId: 'R', readyBeat: 0, start: 2, end: 4 },
    ]);
  });

  it('keeps an earlier request ahead when a later short traversal could fit', () => {
    const level = makeLevel({
      actors: [
        { id: 'B', start: 0, deadline: 20, routes: { main: [['X', 5]] }, defaultRoute: 'main', priority: 10 },
        { id: 'R', start: 1, deadline: 20, routes: { main: [['X', 1]] }, defaultRoute: 'main', priority: 20 },
      ],
      scenarios: [{ id: 'normal', starts: {}, deadlines: {}, closures: { X: [[0, 4]] } }],
    });
    const result = simulate(level, {}, level.scenarios[0]!);
    expect(result.arrivals).toEqual({ B: 9, R: 10 });
  });

  it('advances through every conflicting closure', () => {
    const level = makeLevel({
      actors: [{ id: 'B', start: 0, deadline: 20, routes: { main: [['X', 3]] }, defaultRoute: 'main', priority: 10 }],
      scenarios: [{ id: 'normal', starts: {}, deadlines: {}, closures: { X: [[1, 3], [4, 7]] } }],
    });
    expect(simulate(level, {}, level.scenarios[0]!).arrivals).toEqual({ B: 10 });
  });

  it('releases a dependent actor at the later configured or dependency beat', () => {
    const level = makeLevel({
      actors: [
        { id: 'R', start: 0, deadline: 10, routes: { main: [[null, 3]] }, defaultRoute: 'main', priority: 20 },
        { id: 'B', start: 5, deadline: 10, routes: { main: [[null, 2]] }, defaultRoute: 'main', priority: 10, after: 'R' },
      ],
    });
    const result = simulate(level, {}, level.scenarios[0]!);
    expect(result.arrivals).toEqual({ R: 3, B: 7 });
    expect(result.trace).toContainEqual(expect.objectContaining({ kind: 'dependency', releaseBeat: 5 }));
  });

  it('allows an arrival exactly at its deadline', () => {
    const level = makeLevel({ actors: [{ id: 'B', start: 0, deadline: 2, routes: { main: [['X', 2]] }, defaultRoute: 'main', priority: 10 }] });
    expect(simulate(level, {}, level.scenarios[0]!).passed).toBe(true);
  });
});

describe('validation', () => {
  it.each([
    ['negative start', { start: -1 }],
    ['zero duration', { routes: { main: [['X', 0]] } }],
    ['missing default route', { defaultRoute: 'missing' }],
  ])('rejects %s', (_name, actorOverride) => {
    const level = makeLevel({ actors: [{ ...makeLevel().actors[0]!, ...actorOverride }] as never });
    expect(() => parseLevel(level)).toThrow(ValidationError);
  });

  it('rejects duplicate actors and dependency cycles', () => {
    const duplicate = makeLevel({ actors: [makeLevel().actors[0]!, makeLevel().actors[0]!] });
    expect(() => parseLevel(duplicate)).toThrow(/duplicate actor/i);

    const cycle = makeLevel({
      actors: [
        { ...makeLevel().actors[0]!, id: 'B', after: 'R' },
        { ...makeLevel().actors[1]!, id: 'R', after: 'B' },
      ],
    });
    expect(() => parseLevel(cycle)).toThrow(/cycle/i);
  });
});
