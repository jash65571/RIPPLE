export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface LevelLayout {
  readonly waterEdge: 'left' | 'right';
  readonly resourcePositions: Readonly<Record<string, Point>>;
  readonly actorStarts: Readonly<Record<string, Point>>;
  readonly actorEnds: Readonly<Record<string, Point>>;
  readonly routeBends: Readonly<Record<string, readonly Point[]>>;
  readonly landmark: 'market' | 'bridge' | 'depot' | 'pier';
  readonly trees: readonly Point[];
}

export const levelLayouts: Readonly<Record<string, LevelLayout>> = {
  '01': { waterEdge: 'right', resourcePositions: { X: { x: 51, y: 53 } }, actorStarts: { B: { x: 14, y: 23 }, R: { x: 20, y: 46 } }, actorEnds: { B: { x: 80, y: 118 }, R: { x: 72, y: 100 } }, routeBends: { 'R.garden': [{ x: 14, y: 78 }, { x: 40, y: 112 }] }, landmark: 'market', trees: [{ x: 14, y: 100 }, { x: 25, y: 111 }] },
  '02': { waterEdge: 'left', resourcePositions: { X: { x: 52, y: 51 } }, actorStarts: { B: { x: 16, y: 19 }, R: { x: 27, y: 31 } }, actorEnds: { B: { x: 82, y: 112 }, R: { x: 73, y: 122 } }, routeBends: {}, landmark: 'depot', trees: [{ x: 84, y: 77 }, { x: 75, y: 89 }] },
  '03': { waterEdge: 'right', resourcePositions: { X: { x: 51, y: 58 } }, actorStarts: { B: { x: 18, y: 20 } }, actorEnds: { B: { x: 78, y: 116 } }, routeBends: { 'B.quay': [{ x: 22, y: 77 }, { x: 58, y: 111 }] }, landmark: 'bridge', trees: [{ x: 20, y: 101 }] },
  '04': { waterEdge: 'left', resourcePositions: {}, actorStarts: { B: { x: 35, y: 72 }, R: { x: 18, y: 24 } }, actorEnds: { B: { x: 82, y: 116 }, R: { x: 35, y: 72 } }, routeBends: { 'R.scenic': [{ x: 12, y: 75 }], 'R.direct': [{ x: 29, y: 48 }], 'R.canal': [{ x: 63, y: 39 }] }, landmark: 'depot', trees: [{ x: 78, y: 35 }, { x: 68, y: 47 }] },
  '05': { waterEdge: 'right', resourcePositions: { X: { x: 45, y: 45 }, Y: { x: 58, y: 85 } }, actorStarts: { B: { x: 14, y: 20 }, R: { x: 24, y: 34 } }, actorEnds: { B: { x: 82, y: 119 }, R: { x: 72, y: 108 } }, routeBends: { 'R.side-door': [{ x: 45, y: 45 }, { x: 79, y: 67 }] }, landmark: 'market', trees: [{ x: 20, y: 102 }, { x: 31, y: 114 }] },
  '06': { waterEdge: 'left', resourcePositions: { X: { x: 47, y: 43 }, Y: { x: 57, y: 87 } }, actorStarts: { B: { x: 13, y: 18 }, R: { x: 24, y: 34 }, C: { x: 80, y: 58 } }, actorEnds: { B: { x: 82, y: 119 }, R: { x: 75, y: 107 }, C: { x: 32, y: 117 } }, routeBends: { 'R.garden': [{ x: 16, y: 75 }], 'C.quay': [{ x: 83, y: 97 }] }, landmark: 'pier', trees: [{ x: 19, y: 94 }, { x: 29, y: 103 }] },
  '07': { waterEdge: 'right', resourcePositions: { X: { x: 53, y: 54 } }, actorStarts: { B: { x: 15, y: 19 }, R: { x: 20, y: 42 } }, actorEnds: { B: { x: 83, y: 116 }, R: { x: 71, y: 103 } }, routeBends: { 'R.garden': [{ x: 13, y: 81 }], 'R.scenic': [{ x: 26, y: 116 }] }, landmark: 'market', trees: [{ x: 14, y: 102 }, { x: 28, y: 109 }] },
  '08': { waterEdge: 'left', resourcePositions: { X: { x: 49, y: 59 } }, actorStarts: { B: { x: 13, y: 21 }, R: { x: 30, y: 33 } }, actorEnds: { B: { x: 82, y: 116 }, R: { x: 70, y: 124 } }, routeBends: {}, landmark: 'depot', trees: [{ x: 80, y: 83 }, { x: 72, y: 94 }] },
  '09': { waterEdge: 'right', resourcePositions: { X: { x: 48, y: 58 }, U: { x: 67, y: 31 } }, actorStarts: { B: { x: 14, y: 18 }, R: { x: 22, y: 40 } }, actorEnds: { B: { x: 81, y: 116 }, R: { x: 73, y: 104 } }, routeBends: { 'R.garden': [{ x: 14, y: 83 }], 'R.upper': [{ x: 67, y: 31 }] }, landmark: 'bridge', trees: [{ x: 17, y: 101 }, { x: 29, y: 111 }] },
  '10': { waterEdge: 'left', resourcePositions: { X: { x: 45, y: 47 }, Y: { x: 56, y: 87 }, U: { x: 72, y: 29 } }, actorStarts: { B: { x: 13, y: 18 }, R: { x: 21, y: 39 }, C: { x: 82, y: 57 } }, actorEnds: { B: { x: 83, y: 119 }, R: { x: 72, y: 107 }, C: { x: 32, y: 120 } }, routeBends: { 'R.garden': [{ x: 14, y: 82 }], 'R.upper': [{ x: 72, y: 29 }], 'C.quay': [{ x: 83, y: 98 }], 'C.upper': [{ x: 72, y: 29 }] }, landmark: 'pier', trees: [{ x: 20, y: 101 }, { x: 30, y: 109 }] },
};
