import rawLevels from './levels.json';
import { parseCampaign } from '../../game/validate';

export const campaign = parseCampaign(rawLevels);
