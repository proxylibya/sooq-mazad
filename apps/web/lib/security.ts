/* eslint-disable @typescript-eslint/no-explicit-any */
// Security Module - Re-exports
export * from './security/sessionManager';
export * from './security/activityLogger';
export * from './security/ddosProtection';

import * as ddosProtectionModule from './security/ddosProtection';
export const ddosProtection = ddosProtectionModule;

// Security Logger
import logger from './logger';
export const SecurityLogger = {
  log: (message: string, data?: any) => logger.info(message, data as any),
  error: (message: string, data?: any) => logger.error(message, data as any),
  warn: (message: string, data?: any) => logger.warn(message, data as any),
};

// Message Security Functions (stubs for now)
export const validateMessageSecurity = (message: string): boolean => {
  // Basic validation - can be enhanced later
  return !!(message && message.trim().length > 0 && message.length < 10000);
};

export class MessageEncryption {
  static encrypt(message: string): string {
    // Simple encoding for now - can be enhanced with real encryption
    return Buffer.from(message, 'utf8').toString('base64');
  }

  static decrypt(encryptedMessage: string): string {
    try {
      return Buffer.from(encryptedMessage, 'base64').toString('utf8');
    } catch {
      return encryptedMessage; // Return original if decryption fails
    }
  }
}
