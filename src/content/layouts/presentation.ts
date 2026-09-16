export type BuildingTone = 'cream' | 'sand' | 'coral';

export interface BuildingSpec {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly depth: number;
  readonly height: number;
  readonly tone: BuildingTone;
}

export interface GardenSpec {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly depth: number;
}

export interface LevelPresentation {
  readonly district: 'market' | 'depot' | 'bridge' | 'pier';
  readonly shorelineInset: number;
  readonly dockPosition: 'north' | 'center' | 'south';
  readonly buildings: readonly BuildingSpec[];
  readonly gardens: readonly GardenSpec[];
}

export const levelPresentations: Readonly<Record<string, LevelPresentation>> = {
  '02': {
    district: 'depot', shorelineInset: 1.8, dockPosition: 'north',
    buildings: [
      { x: 68, y: 28, width: 3.2, depth: 2.5, height: 2.4, tone: 'sand' },
      { x: 29, y: 88, width: 2.4, depth: 2.6, height: 2.8, tone: 'cream' },
      { x: 69, y: 91, width: 3.1, depth: 2.1, height: 1.9, tone: 'coral' },
    ],
    gardens: [{ x: 76, y: 67, width: 3.5, depth: 2.5 }, { x: 31, y: 111, width: 3.2, depth: 2.0 }],
  },
  '03': {
    district: 'bridge', shorelineInset: 0.7, dockPosition: 'center',
    buildings: [
      { x: 70, y: 28, width: 2.4, depth: 2.4, height: 2.1, tone: 'cream' },
      { x: 73, y: 82, width: 2.8, depth: 2.3, height: 2.6, tone: 'sand' },
    ],
    gardens: [{ x: 28, y: 95, width: 3.8, depth: 2.3 }, { x: 70, y: 110, width: 3.0, depth: 2.0 }],
  },
  '04': {
    district: 'depot', shorelineInset: 1.5, dockPosition: 'south',
    buildings: [
      { x: 67, y: 27, width: 2.8, depth: 2.4, height: 2.8, tone: 'coral' },
      { x: 24, y: 93, width: 2.7, depth: 2.5, height: 2.1, tone: 'cream' },
      { x: 68, y: 103, width: 3.0, depth: 2.2, height: 2.0, tone: 'sand' },
    ],
    gardens: [{ x: 74, y: 54, width: 3.4, depth: 2.5 }, { x: 35, y: 113, width: 3.0, depth: 1.9 }],
  },
  '05': {
    district: 'market', shorelineInset: 0.9, dockPosition: 'north',
    buildings: [
      { x: 28, y: 27, width: 2.7, depth: 2.2, height: 2.4, tone: 'sand' },
      { x: 72, y: 59, width: 2.6, depth: 2.6, height: 2.7, tone: 'coral' },
      { x: 31, y: 94, width: 3.0, depth: 2.2, height: 2.0, tone: 'cream' },
    ],
    gardens: [{ x: 69, y: 31, width: 3.5, depth: 2.2 }, { x: 26, y: 111, width: 3.7, depth: 2.1 }],
  },
  '06': {
    district: 'pier', shorelineInset: 1.7, dockPosition: 'center',
    buildings: [
      { x: 69, y: 31, width: 3.0, depth: 2.4, height: 2.2, tone: 'cream' },
      { x: 28, y: 72, width: 2.5, depth: 2.7, height: 2.8, tone: 'coral' },
      { x: 61, y: 105, width: 2.8, depth: 2.3, height: 2.0, tone: 'sand' },
    ],
    gardens: [{ x: 78, y: 73, width: 3.0, depth: 2.5 }, { x: 28, y: 103, width: 3.4, depth: 2.1 }],
  },
  '07': {
    district: 'market', shorelineInset: 0.6, dockPosition: 'south',
    buildings: [
      { x: 31, y: 28, width: 2.5, depth: 2.4, height: 2.5, tone: 'coral' },
      { x: 71, y: 47, width: 2.8, depth: 2.3, height: 2.2, tone: 'cream' },
      { x: 35, y: 96, width: 2.9, depth: 2.4, height: 2.1, tone: 'sand' },
    ],
    gardens: [{ x: 69, y: 81, width: 3.6, depth: 2.5 }, { x: 24, y: 112, width: 3.0, depth: 1.8 }],
  },
  '08': {
    district: 'depot', shorelineInset: 1.9, dockPosition: 'north',
    buildings: [
      { x: 72, y: 35, width: 3.1, depth: 2.4, height: 2.1, tone: 'sand' },
      { x: 27, y: 76, width: 2.6, depth: 2.6, height: 2.7, tone: 'cream' },
      { x: 65, y: 103, width: 2.6, depth: 2.3, height: 2.4, tone: 'coral' },
    ],
    gardens: [{ x: 75, y: 72, width: 3.1, depth: 2.3 }, { x: 31, y: 111, width: 3.2, depth: 2.0 }],
  },
  '09': {
    district: 'bridge', shorelineInset: 0.8, dockPosition: 'center',
    buildings: [
      { x: 27, y: 31, width: 2.7, depth: 2.4, height: 2.2, tone: 'cream' },
      { x: 72, y: 70, width: 2.7, depth: 2.5, height: 2.8, tone: 'coral' },
      { x: 31, y: 102, width: 2.9, depth: 2.2, height: 2.0, tone: 'sand' },
    ],
    gardens: [{ x: 67, y: 102, width: 3.7, depth: 2.2 }, { x: 25, y: 115, width: 3.0, depth: 1.7 }],
  },
  '10': {
    district: 'pier', shorelineInset: 1.5, dockPosition: 'south',
    buildings: [
      { x: 69, y: 34, width: 3.0, depth: 2.5, height: 2.5, tone: 'coral' },
      { x: 28, y: 68, width: 2.7, depth: 2.5, height: 2.2, tone: 'cream' },
      { x: 62, y: 106, width: 3.2, depth: 2.3, height: 2.0, tone: 'sand' },
    ],
    gardens: [{ x: 79, y: 71, width: 3.1, depth: 2.5 }, { x: 29, y: 108, width: 3.6, depth: 2.0 }],
  },
};
