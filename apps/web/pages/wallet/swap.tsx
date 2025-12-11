import {
  ArrowRightIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { OpensooqNavbar } from '../../components/common';
import { useUserContext } from '../../contexts/UserContext';
import { useMultiWalletBalance } from '../../hooks/useMultiWalletBalance';

type WalletType = 'local' | 'global' | 'crypto';

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
}

// أسعار الصرف التقريبية (يجب استبدالها بأسعار حقيقية من API)
const exchangeRates: ExchangeRate[] = [
  { from: 'LYD', to: 'USD', rate: 0.2 }, // 1 دينار = 0.20 دولار
  { from: 'LYD', to: 'USDT', rate: 0.2 },
  { from: 'USD', to: 'LYD', rate: 5.0 }, // 1 دولار = 5 دينار
  { from: 'USD', to: 'USDT', rate: 1.0 },
  { from: 'USDT', to: 'LYD', rate: 5.0 },
  { from: 'USDT', to: 'USD', rate: 1.0 },
];

const getExchangeRate = (from: string, to: string): number => {
  if (from === to) return 1;
  const rate = exchangeRates.find((r) => r.from === from && r.to === to);
  return rate?.rate || 1;
};

const walletInfo: Record<WalletType, { name: string; currency: string; color: string }> = {
  local: { name: 'المحفظة المحلية', currency: 'LYD', color: 'emerald' },
  global: { name: 'المحفظة العالمية', currency: 'USD', color: 'blue' },
  crypto: { name: 'المحفظة الرقمية', currency: 'USDT', color: 'purple' },
};

export default function SwapPage() {
  const router = useRouter();
  const { user } = useUserContext();
  const { walletData, isLoading } = useMultiWalletBalance(user?.id);

  const [fromWallet, setFromWallet] = useState<WalletType>('local');
  const [toWallet, setToWallet] = useState<WalletType>('global');
  const [amount, setAmount] = useState('');
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fromInfo = walletInfo[fromWallet];
  const toInfo = walletInfo[toWallet];
  const rate = getExchangeRate(fromInfo.currency, toInfo.currency);
  const convertedAmount = parseFloat(amount || '0') * rate;

  const getBalance = (type: WalletType): number => {
    if (!walletData) return 0;
    switch (type) {
      case 'local':
        return walletData.local?.balance || 0;
      case 'global':
        return walletData.global?.balance || 0;
      case 'crypto':
        return walletData.crypto?.balance || 0;
    }
  };

  const handleSwapDirection = () => {
    const temp = fromWallet;
    setFromWallet(toWallet);
    setToWallet(temp);
  };

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('يرجى إدخال مبلغ صحيح');
      return;
    }

    if (amountNum > getBalance(fromWallet)) {
      setError('الرصيد غير كافي');
      return;
    }

    if (fromWallet === toWallet) {
      setError('يرجى اختيار محفظتين مختلفتين');
      return;
    }

    setSwapping(true);

    try {
      const res = await fetch('/api/wallet/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromWallet,
          toWallet,
          amount: amountNum,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'فشل في تبديل العملة');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/wallet');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التبديل');
    } finally {
      setSwapping(false);
    }
  };

  if (success) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <Head>
          <title>تم التبديل بنجاح | المحفظة</title>
        </Head>
        <OpensooqNavbar />
        <main className="mx-auto max-w-lg px-4 py-16">
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">تم التبديل بنجاح!</h1>
            <p className="mb-6 text-gray-600">
              تم تبديل {amount} {fromInfo.currency} إلى {convertedAmount.toFixed(2)}{' '}
              {toInfo.currency}
            </p>
            <Link
              href="/wallet"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              العودة للمحفظة
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Head>
        <title>تبديل العملات | المحفظة</title>
      </Head>

      <OpensooqNavbar />

      <main className="mx-auto max-w-lg px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/wallet"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowRightIcon className="h-4 w-4 rotate-180" />
            العودة للمحفظة
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">تبديل العملات</h1>
          <p className="mt-2 text-gray-600">بدّل بين محافظك المختلفة بسهولة</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSwap} className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* From Wallet */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-900">من</label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <select
                    value={fromWallet}
                    onChange={(e) => setFromWallet(e.target.value as WalletType)}
                    className="rounded-lg border-0 bg-transparent text-lg font-semibold text-gray-900 focus:ring-0"
                  >
                    <option value="local">المحفظة المحلية (دينار)</option>
                    <option value="global">المحفظة العالمية (دولار)</option>
                    <option value="crypto">المحفظة الرقمية (USDT)</option>
                  </select>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full border-0 bg-transparent text-3xl font-bold text-gray-900 placeholder-gray-300 focus:ring-0"
                />
                <p className="mt-2 text-sm text-gray-500">
                  الرصيد المتاح: {isLoading ? '...' : getBalance(fromWallet).toLocaleString()}{' '}
                  {fromInfo.currency}
                </p>
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSwapDirection}
                className="rounded-full border-2 border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50"
              >
                <ArrowsRightLeftIcon className="h-6 w-6 rotate-90 text-gray-600" />
              </button>
            </div>

            {/* To Wallet */}
            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-gray-900">إلى</label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <select
                    value={toWallet}
                    onChange={(e) => setToWallet(e.target.value as WalletType)}
                    className="rounded-lg border-0 bg-transparent text-lg font-semibold text-gray-900 focus:ring-0"
                  >
                    <option value="local">المحفظة المحلية (دينار)</option>
                    <option value="global">المحفظة العالمية (دولار)</option>
                    <option value="crypto">المحفظة الرقمية (USDT)</option>
                  </select>
                </div>
                <div className="text-3xl font-bold text-gray-900">{convertedAmount.toFixed(2)}</div>
                <p className="mt-2 text-sm text-gray-500">
                  الرصيد الحالي: {isLoading ? '...' : getBalance(toWallet).toLocaleString()}{' '}
                  {toInfo.currency}
                </p>
              </div>
            </div>

            {/* Exchange Rate Info */}
            <div className="mt-6 rounded-xl bg-blue-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">سعر الصرف</span>
                <span className="font-semibold text-gray-900">
                  1 {fromInfo.currency} = {rate.toFixed(4)} {toInfo.currency}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-600">رسوم التبديل</span>
                <span className="font-semibold text-green-600">مجاناً</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={swapping || !amount || fromWallet === toWallet}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-4 text-lg font-bold text-white transition-all hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300"
          >
            {swapping ? 'جاري التبديل...' : 'تبديل الآن'}
          </button>
        </form>

        {/* Info */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">ملاحظات مهمة</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
              التبديل فوري ويتم في ثوانٍ معدودة
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
              أسعار الصرف قد تتغير حسب السوق
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
              لا توجد رسوم إضافية على عمليات التبديل
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
