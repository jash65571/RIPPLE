import type { Plan } from '../../game/model';

export const campaignSolutions: Readonly<Record<string, Plan>> = {
  '01': { 'R.route': 'garden' },
  '02': { 'R.start': 2 },
  '03': { 'B.route': 'quay' },
  '04': { 'R.route': 'direct' },
  '05': { 'R.route': 'side-door' },
  '06': { 'R.route': 'garden', 'C.route': 'quay' },
  '07': { 'R.route': 'garden' },
  '08': { 'R.start': 4 },
  '09': { 'R.route': 'garden' },
  '10': { 'R.route': 'garden', 'C.route': 'quay' },
};
