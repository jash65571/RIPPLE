export interface LevelContent {
  readonly title: string;
  readonly chapter: 'First Ripples' | 'Connected Streets' | 'Possible Days';
  readonly intro: string;
  readonly goalText: string;
  readonly hints: readonly [string, string, string];
  readonly solution: string;
}

export const levelContent: Readonly<Record<string, LevelContent>> = {
  '01': {
    title: 'Market Morning',
    chapter: 'First Ripples',
    intro: 'The delivery robot reaches the market crossing before the bus. Watch the first plan, then change one route.',
    goalText: 'Get the robot and bus to their stops by beat 5.',
    hints: ['Watch who enters the crossing first.', 'The robot has a path that avoids it.', 'Try the garden route.'],
    solution: 'The garden keeps the robot off the crossing. The bus arrives at beat 5 and the robot at beat 4.',
  },
  '02': {
    title: 'A Little Later',
    chapter: 'First Ripples',
    intro: 'A short delay can give the bus a clear crossing without making the robot late.',
    goalText: 'Choose one robot departure that meets both deadlines.',
    hints: ['Watch when the bus reaches the crossing.', 'A later robot departure can prevent the queue.', 'Start the robot at beat 2.'],
    solution: 'Starting the robot at beat 2 lets the bus cross first. Both arrive exactly on time.',
  },
  '03': {
    title: 'Bridge Break',
    chapter: 'First Ripples',
    intro: 'The bridge is raised through beat 3. The shortest-looking route now includes a wait.',
    goalText: 'Get the bus to its stop by beat 6.',
    hints: ['Inspect when the bridge is available.', 'Count waiting time as part of the journey.', 'Try the quay route.'],
    solution: 'The quay takes five beats with no closure wait, so the bus arrives by beat 5.',
  },
  '04': {
    title: 'Last Connection',
    chapter: 'Connected Streets',
    intro: 'The bus carries a parcel from the robot. It cannot leave until the robot arrives.',
    goalText: 'Complete the parcel handoff and bus trip by beat 6.',
    hints: ['The bus is waiting before its trip begins.', 'It cannot leave until the parcel arrives.', 'Send the robot on the direct route.'],
    solution: 'The direct route delivers the parcel at beat 3. The bus then arrives at beat 6.',
  },
  '05': {
    title: 'The Hidden Queue',
    chapter: 'Connected Streets',
    intro: 'The crossing is only the first shared lane. Follow each vehicle through the whole route.',
    goalText: 'Keep both arrivals at or before beat 6.',
    hints: ['Follow the bus after the first crossing.', 'A quicker crossing can still leave a long queue at the next lane.', 'Try the robot\'s side-door route.'],
    solution: 'The side door avoids the loading lane. Both vehicles arrive at beat 6.',
  },
  '06': {
    title: 'Two Small Changes',
    chapter: 'Connected Streets',
    intro: 'Two deliveries occupy two different lanes. This plan allows two changes.',
    goalText: 'Clear both bus queues while keeping every delivery on time.',
    hints: ['Watch each place where the bus waits.', 'Changing only one delivery leaves the other queue.', 'Use the robot\'s garden route and the cart\'s quay route.'],
    solution: 'The garden clears the crossing and the quay clears the loading lane. The bus arrives at beat 4.',
  },
  '07': {
    title: 'An Early Arrival',
    chapter: 'Possible Days',
    intro: 'The bus may follow its usual schedule or arrive early. One route must work for both days.',
    goalText: 'Pass Normal day and Early bus with one shared plan.',
    hints: ['Check who misses a deadline on each day.', 'The plan must protect both vehicles even when the bus is early.', 'Use the garden route.'],
    solution: 'The garden avoids the crossing on both schedules and keeps both vehicles on time.',
  },
  '08': {
    title: 'A Plan for Both',
    chapter: 'Possible Days',
    intro: 'The bus may reach the crossing two beats later. Test one departure against both schedules.',
    goalText: 'Find one robot start that passes both futures.',
    hints: ['Test your delay against both bus schedules.', 'Beat 2 helps one day but blocks the later bus.', 'Start the robot at beat 4.'],
    solution: 'Starting at beat 4 leaves the crossing clear for either bus schedule.',
  },
  '09': {
    title: 'Three Possible Days',
    chapter: 'Possible Days',
    intro: 'A shortcut is open on some days and closed on another. Compare all three futures.',
    goalText: 'Use one route that passes every possible day.',
    hints: ['Check the upper lane in the second future.', 'A route that is fast today may be closed tomorrow.', 'Use the garden route.'],
    solution: 'The garden avoids both the crossing queue and the upper-lane closure in every future.',
  },
  '10': {
    title: 'Harbor in Harmony',
    chapter: 'Possible Days',
    intro: 'Three vehicles, two shared lanes, and three futures must all fit one plan.',
    goalText: 'Make two route changes that pass all three futures.',
    hints: ['Compare the upper lane across all three days.', 'Both delivery routes must avoid the bus lanes and remain usable.', 'Send the robot through the garden and the cart along the quay.'],
    solution: 'The garden and quay clear both bus lanes without relying on the upper shortcut.',
  },
};
