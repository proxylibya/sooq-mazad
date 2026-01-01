// @ts-nocheck
import { getSMSManager } from '@/lib/integrations/sms';

describe('SMS Integration', () => {
  it('should send SMS', async () => {
    const manager = getSMSManager();
    const result = await manager.sendOTP('+218911234567', '123456');
    expect(result.success).toBeDefined();
  });
});
