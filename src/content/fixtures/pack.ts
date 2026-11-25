import type { OfflinePack } from '@/api/contracts';

import rawPack from '../packs/hodlo-pack-v1.json';
import { offlinePackSchema } from '../schema';

/**
 * Fixture pack used by the mock adapter and tests. Production packs must carry
 * 8-12 prompts per lesson; this one carries four to keep tests fast.
 *
 * Parsed at module load so a broken pack fails loudly instead of reaching a
 * learner mid-lesson.
 */
export const mockPack: OfflinePack = offlinePackSchema.parse(rawPack);
