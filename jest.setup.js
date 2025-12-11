// Jest Setup File
// إعداد بيئة الاختبار

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PAYMENT_PROVIDER = 'local';
process.env.EMAIL_PROVIDER = 'smtp';
process.env.SMS_PROVIDER = 'mock';
process.env.MAPS_PROVIDER = 'leaflet';

// Mock console for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
