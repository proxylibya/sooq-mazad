/**
 * سياق الترجمة البسيط للمحفظة
 */

import { ReactNode, createContext, useContext } from 'react';

export interface LocalizationContextType {
  locale: string;
  direction: 'rtl' | 'ltr';
  t: (key: string, params?: Record<string, string | number>) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: Date | string) => string;
}

const translations: Record<string, Record<string, string>> = {
  ar: {
    'wallet.balance': 'الرصيد',
    'wallet.deposit': 'إيداع',
    'wallet.withdraw': 'سحب',
    'wallet.transactions': 'المعاملات',
    'wallet.history': 'السجل',
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.success': 'تمت العملية بنجاح',
  },
  en: {
    'wallet.balance': 'Balance',
    'wallet.deposit': 'Deposit',
    'wallet.withdraw': 'Withdraw',
    'wallet.transactions': 'Transactions',
    'wallet.history': 'History',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Operation successful',
  },
};

const defaultContext: LocalizationContextType = {
  locale: 'ar',
  direction: 'rtl',
  t: (key: string) => translations.ar[key] || key,
  formatNumber: (num: number) => new Intl.NumberFormat('ar-LY').format(num),
  formatCurrency: (amount: number, currency = 'LYD') =>
    new Intl.NumberFormat('ar-LY', { style: 'currency', currency }).format(amount),
  formatDate: (date: Date | string) => new Date(date).toLocaleDateString('ar-LY'),
};

const SimpleLocalizationContext = createContext<LocalizationContextType>(defaultContext);

export function SimpleLocalizationProvider({ children }: { children: ReactNode }) {
  const value: LocalizationContextType = {
    ...defaultContext,
    t: (key: string, params?: Record<string, string | number>) => {
      let text = translations.ar[key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    },
  };

  return (
    <SimpleLocalizationContext.Provider value={value}>
      {children}
    </SimpleLocalizationContext.Provider>
  );
}

export function useSimpleLocalization(): LocalizationContextType {
  return useContext(SimpleLocalizationContext);
}

export default SimpleLocalizationContext;
