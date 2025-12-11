import {
  ArrowRightIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { OpensooqNavbar } from '../../components/common';
import { useUserContext } from '../../contexts/UserContext';
import { useMultiWalletBalance } from '../../hooks/useMultiWalletBalance';

export default function SendPage() {
  const router = useRouter();
  const { user } = useUserContext();
  const { walletData, isLoading } = useMultiWalletBalance(user?.id);

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [walletType, setWalletType] = useState<'local' | 'global' | 'crypto'>('local');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const walletOptions = [
    {
      id: 'local',
      name: 'المحفظة المحلية',
      currency: 'دينار',
      balance: walletData?.local?.balance || 0,
    },
    {
      id: 'global',
      name: 'المحفظة العالمية',
      currency: 'دولار',
      balance: walletData?.global?.balance || 0,
    },
    {
      id: 'crypto',
      name: 'المحفظة الرقمية',
      currency: 'USDT',
      balance: walletData?.crypto?.balance || 0,
    },
  ];

  const selectedWallet = walletOptions.find((w) => w.id === walletType);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recipient.trim()) {
      setError('يرجى إدخال رقم هاتف أو معرف المستلم');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('يرجى إدخال مبلغ صحيح');
      return;
    }

    if (selectedWallet && amountNum > selectedWallet.balance) {
      setError('الرصيد غير كافي');
      return;
    }

    setSending(true);

    try {
      const res = await fetch('/api/wallet/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient,
          amount: amountNum,
          walletType,
          note,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'فشل في إرسال الأموال');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/wallet');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الإرسال');
    } finally {
      setSending(false);
    }
  };

  if (success) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <Head>
          <title>تم الإرسال بنجاح | المحفظة</title>
        </Head>
        <OpensooqNavbar />
        <main className="mx-auto max-w-lg px-4 py-16">
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">تم الإرسال بنجاح!</h1>
            <p className="mb-6 text-gray-600">
              تم إرسال {amount} {selectedWallet?.currency} إلى {recipient}
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
        <title>إرسال الأموال | المحفظة</title>
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
          <h1 className="text-2xl font-bold text-gray-900">إرسال الأموال</h1>
          <p className="mt-2 text-gray-600">أرسل الأموال لمستخدم آخر بسرعة وأمان</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Wallet Selection */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-semibold text-gray-900">اختر المحفظة</label>
              <div className="grid grid-cols-3 gap-3">
                {walletOptions.map((wallet) => (
                  <button
                    key={wallet.id}
                    type="button"
                    onClick={() => setWalletType(wallet.id as any)}
                    className={`rounded-xl border-2 p-3 text-center transition-all ${
                      walletType === wallet.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-900">{wallet.name}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      {isLoading ? '...' : `${wallet.balance.toLocaleString()} ${wallet.currency}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                رقم هاتف أو معرف المستلم
              </label>
              <div className="relative">
                <UserIcon className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="مثال: 09XXXXXXXX أو @username"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-4 pr-12 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                المبلغ ({selectedWallet?.currency})
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-4 pr-12 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {selectedWallet && (
                <p className="mt-2 text-sm text-gray-500">
                  الرصيد المتاح: {selectedWallet.balance.toLocaleString()} {selectedWallet.currency}
                </p>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                ملاحظة (اختياري)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="أضف ملاحظة للمستلم..."
                rows={3}
                className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
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
            disabled={sending || !recipient || !amount}
            className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {sending ? 'جاري الإرسال...' : 'إرسال الآن'}
          </button>
        </form>
      </main>
    </div>
  );
}
