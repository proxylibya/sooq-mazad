// تعريفات عامة لحل مشاكل TypeScript

declare global {
  // تعريفات المتغيرات العامة
  var prisma: any;
  
  // تعريفات النوافذ
  interface Window {
    gtag?: any;
    dataLayer?: any[];
  }
}

// تعريفات المكتبات المفقودة
declare module 'authenticator' {
  const authenticator: any;
  export = authenticator;
}

declare module 'otplib' {
  export const authenticator: any;
}

// تعريفات إضافية
interface AuctionState {
  id: string;
  [key: string]: any;
}

interface SecurityAlert {
  notes?: string;
  [key: string]: any;
}

enum TwoFactorType {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  TOTP = 'TOTP'
}

interface TwoFactorAuthentication {
  verifySMSOrEmailCode?: (code: string, data: any) => any;
  verifyEmailCode: (code: string, data: any) => any;
}

// تصدير فارغ لجعل هذا Module
export {};