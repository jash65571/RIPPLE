export const PRODUCT = {
  name: 'RIPPLE',
  productId: 'com.jash.ripple',
  releaseMode: 'review',
  version: '1.0.0',
  supportContact: '',
  publisherName: '',
  productionUrl: '',
} as const;

export const UI_COPY = {
  start: 'Start with Market Morning',
  chapters: 'Chapters',
  testPlan: 'Test plan',
  undo: 'Undo change',
  redo: 'Redo change',
  reset: 'Reset puzzle',
  previousEvent: 'Previous event',
  nextEvent: 'Next event',
  nextPuzzle: 'Next puzzle',
  doneForNow: 'Done for now',
  showTextView: 'Show text view',
  showScene: 'Show harbor scene',
  hint: 'Hint',
  compareOriginal: 'Compare original plan',
  notTested: 'Not tested',
  passed: 'Passed',
  needsChange: 'Needs a change',
  testAgain: 'Test again',
  budgetLabel: 'Changes used',
  timelineLabel: 'Time in beats',
} as const;

export const ACTOR_LABELS: Readonly<Record<string, string>> = {
  B: 'Harbor bus',
  R: 'Parcel robot',
  C: 'Market cart',
};

export const ROUTE_LABELS: Readonly<Record<string, string>> = {
  main: 'Main lane',
  crossing: 'Market crossing',
  garden: 'Garden path',
  bridge: 'Harbor bridge',
  quay: 'Quay path',
  scenic: 'Scenic route',
  direct: 'Direct route',
  canal: 'Canal route',
  'quick-crossing': 'Quick crossing',
  'side-door': 'Side door',
  upper: 'Upper lane',
};

export const SCENARIO_LABELS: Readonly<Record<string, string>> = {
  normal: 'Normal day',
  'bridge-raised': 'Bridge raised',
  'early-bus': 'Early bus',
  'late-bus': 'Late bus',
  'upper-closed': 'Upper lane closed',
};
