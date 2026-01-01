// @ts-nocheck
import { getMapsManager } from '@/lib/integrations/maps';

describe('Maps Integration', () => {
  it('should geocode address', async () => {
    const manager = getMapsManager();
    const result = await manager.geocode('طرابلس');
    expect(result.success).toBe(true);
    expect(result.location).toBeDefined();
  });
});
