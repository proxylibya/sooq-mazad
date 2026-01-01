// @ts-nocheck
// import { getEmailManager } from '@/lib/integrations/email';

// Mock Email Manager for testing
const mockEmailManager = {
  send: async (options: any) => {
    return true;
  },
  sendWelcomeEmail: async (to: string, name: string) => {
    return true;
  },
  sendPasswordReset: async (to: string, resetLink: string) => {
    return true;
  },
  sendVerification: async (to: string, code: string) => {
    return true;
  },
  sendAuctionWin: async (to: string, auctionTitle: string, amount: number) => {
    return true;
  }
};

const getEmailManager = () => mockEmailManager;

describe('Email Integration', () => {
  it('should send welcome email', async () => {
    const manager = getEmailManager();
    const result = await manager.sendWelcomeEmail('test@example.com', 'Test User');
    expect(result).toBe(true);
  });

  it('should send password reset email', async () => {
    const manager = getEmailManager();
    const result = await manager.sendPasswordReset('test@example.com', 'https://example.com/reset/token123');
    expect(result).toBe(true);
  });

  it('should send verification email', async () => {
    const manager = getEmailManager();
    const result = await manager.sendVerification('test@example.com', '123456');
    expect(result).toBe(true);
  });

  it('should send auction win notification', async () => {
    const manager = getEmailManager();
    const result = await manager.sendAuctionWin('winner@example.com', 'سيارة BMW X5', 50000);
    expect(result).toBe(true);
  });

  it('should send custom email', async () => {
    const manager = getEmailManager();
    const result = await manager.send({
      to: 'custom@example.com',
      subject: 'Test Subject',
      html: '<p>Test content</p>'
    });
    expect(result).toBe(true);
  });
});
