import { calculateAuctionProgress } from '../auctionProgressCalculator';

describe('calculateAuctionProgress', () => {
  const now = new Date('2024-01-01T12:00:00Z');

  beforeAll(() => {
    // Mock Date.now() to return a consistent time
    jest.spyOn(Date, 'now').mockImplementation(() => now.getTime());
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('ended auctions', () => {
    it('should return 100% progress for ended auctions', () => {
      const result = calculateAuctionProgress({
        auctionStatus: 'ended',
        endTime: '2024-01-01T10:00:00Z', // 2 hours ago
      });

      expect(result.progress).toBe(100);
      expect(result.isActive).toBe(true);
    });
  });

  describe('upcoming auctions', () => {
    it('should return high progress for auctions starting soon', () => {
      const result = calculateAuctionProgress({
        auctionStatus: 'upcoming',
        startTime: '2024-01-01T12:15:00Z', // 15 minutes from now
        endTime: '2024-01-01T13:00:00Z',
      });

      expect(result.progress).toBeGreaterThan(80);
      expect(result.progress).toBeLessThan(95);
    });

    it('should return medium progress for auctions starting in 2 hours', () => {
      const result = calculateAuctionProgress({
        auctionStatus: 'upcoming',
        startTime: '2024-01-01T14:00:00Z', // 2 hours from now
        endTime: '2024-01-01T15:00:00Z',
      });

      expect(result.progress).toBeGreaterThan(50);
      expect(result.progress).toBeLessThan(80);
    });

    it('should return low progress for auctions starting in many hours', () => {
      const result = calculateAuctionProgress({
        auctionStatus: 'upcoming',
        startTime: '2024-01-02T12:00:00Z', // 24 hours from now
        endTime: '2024-01-02T13:00:00Z',
      });

      expect(result.progress).toBeGreaterThan(20);
      expect(result.progress).toBeLessThan(30);
    });
  });

  describe('live auctions', () => {
    it('should return base progress for auctions with no bids', () => {
      const result = calculateAuctionProgress({
        auctionStatus: 'live',
        endTime: '2024-01-01T18:00:00Z', // 6 hours from now
        currentPrice: 0,
        startingPrice: 1000,
      });

      expect(result.progress).toBeGreaterThanOrEqual(30);
      expect(result.progress).toBeLessThan(60);
    });

    it('should return higher progress for auctions with bids near reserve price', () => {
      const result = calculateAuctionProgress({
        auctionStatus: 'live',
        endTime: '2024-01-01T18:00:00Z', // 6 hours from now
        currentPrice: 8000,
        startingPrice: 5000,
        reservePrice: 10000,
      });

      expect(result.progress).toBeGreaterThan(50);
      expect(result.progress).toBeLessThan(95);
    });

    it('should handle auctions without reserve price', () => {
      const result = calculateAuctionProgress({
        auctionStatus: 'live',
        endTime: '2024-01-01T18:00:00Z', // 6 hours from now
        currentPrice: 7000,
        startingPrice: 5000,
        reservePrice: 0,
      });

      expect(result.progress).toBeGreaterThan(30);
      expect(result.progress).toBeLessThan(95);
    });
  });

  describe('time calculations', () => {
    it('should calculate correct time left', () => {
      const result = calculateAuctionProgress({
        auctionStatus: 'live',
        endTime: '2024-01-01T14:30:00Z', // 2.5 hours from now
      });

      expect(result.timeLeft.hours).toBe(2);
      expect(result.timeLeft.minutes).toBe(30);
      expect(result.timeLeft.seconds).toBe(0);
      expect(result.timeLeft.totalSeconds).toBe(9000); // 2.5 * 60 * 60
    });

    it('should handle expired auctions', () => {
      const result = calculateAuctionProgress({
        auctionStatus: 'live',
        endTime: '2024-01-01T10:00:00Z', // 2 hours ago
      });

      expect(result.timeLeft.hours).toBe(0);
      expect(result.timeLeft.minutes).toBe(0);
      expect(result.timeLeft.seconds).toBe(0);
      expect(result.timeLeft.totalSeconds).toBe(0);
      expect(result.isActive).toBe(false);
    });
  });
});
