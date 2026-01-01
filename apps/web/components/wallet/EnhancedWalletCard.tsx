import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  WalletIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BanknotesIcon,
  CreditCardIcon,
  KeyIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { formatNumber } from '../../utils/numberUtils';
import QRCodeGenerator from '../QRCodeGenerator';

interface WalletCardProps {
  type: 'local' | 'global' | 'crypto';
  balance: number;
  currency: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  buttonColor: string;
  showBalance: boolean;
  onToggleBalance: () => void;
  isLoading?: boolean;
  address?: string;
  network?: string;
  lastTransaction?: {
    amount: number;
    type: 'deposit' | 'withdrawal';
    date: string;
    status: 'completed' | 'pending' | 'failed';
  };
  stats?: {
    totalDeposits: number;
    totalWithdrawals: number;
    monthlyChange: number;
  };
  features?: string[];
  depositUrl: string;
}

const EnhancedWalletCard: React.FC<WalletCardProps> = ({
  type,
  balance,
  currency,
  title,
  description,
  icon: Icon,
  gradientFrom,
  gradientTo,
  borderColor,
  buttonColor,
  showBalance,
  onToggleBalance,
  isLoading = false,
  address,
  network,
  lastTransaction,
  stats,
  features = [],
  depositUrl,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    const symbols = {
      LYD: 'د.ل',
      USD: '$',
      USDT: 'USDT',
      'USDT-TRC20': 'USDT',
    };
    const symbol = symbols[currency as keyof typeof symbols] || currency;
    return `${formatNumber(amount)} ${symbol}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتملة';
      case 'pending':
        return 'قيد المعالجة';
      case 'failed':
        return 'فاشلة';
      default:
        return 'غير معروف';
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border-2 ${borderColor} bg-gradient-to-br ${gradientFrom} ${gradientTo} p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-16 translate-x-16 transform rounded-full bg-white"></div>
        <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 transform rounded-full bg-white"></div>
      </div>

      {/* Header */}
      <div className="relative mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`rounded-2xl bg-white/20 p-3 shadow-lg backdrop-blur-sm`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="text-sm text-white/80">{description}</p>
              {network && (
                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs font-medium text-white">
                  <ShieldCheckIcon className="h-3 w-3" />
                  {network}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onToggleBalance}
            className="rounded-xl bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            {showBalance ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>

        {/* Balance Display */}
        <div className="text-center">
          <div className="mb-2 text-4xl font-bold text-white">
            {isLoading ? (
              <div className="mx-auto h-12 w-48 animate-pulse rounded bg-white/20"></div>
            ) : showBalance ? (
              formatCurrency(balance)
            ) : (
              '••••••••'
            )}
          </div>
          <p className="text-white/80">الرصيد المتاح</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="relative mb-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{formatNumber(stats.totalDeposits)}</div>
            <div className="text-xs text-white/70">إجمالي الإيداعات</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {formatNumber(stats.totalWithdrawals)}
            </div>
            <div className="text-xs text-white/70">إجمالي السحوبات</div>
          </div>
          <div className="text-center">
            <div
              className={`text-lg font-bold ${stats.monthlyChange >= 0 ? 'text-green-200' : 'text-red-200'}`}
            >
              {stats.monthlyChange >= 0 ? '+' : ''}
              {stats.monthlyChange.toFixed(1)}%
            </div>
            <div className="text-xs text-white/70">التغيير الشهري</div>
          </div>
        </div>
      )}

      {/* Last Transaction */}
      {lastTransaction && (
        <div className="relative mb-6 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${lastTransaction.type === 'deposit' ? 'bg-green-500/20' : 'bg-red-500/20'}`}
              >
                {lastTransaction.type === 'deposit' ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-200" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-200" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  آخر {lastTransaction.type === 'deposit' ? 'إيداع' : 'سحب'}
                </p>
                <p className="text-xs text-white/70">{lastTransaction.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">
                {lastTransaction.type === 'deposit' ? '+' : '-'}
                {formatCurrency(lastTransaction.amount)}
              </p>
              <div
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${getStatusColor(lastTransaction.status)}`}
              >
                {lastTransaction.status === 'completed' ? (
                  <CheckCircleIcon className="h-3 w-3" />
                ) : (
                  <ExclamationTriangleIcon className="h-3 w-3" />
                )}
                {getStatusText(lastTransaction.status)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Address (for crypto) */}
      {type === 'crypto' && address && (
        <div className="relative mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full rounded-2xl bg-white/10 p-4 text-left backdrop-blur-sm transition-all hover:bg-white/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <KeyIcon className="h-5 w-5 text-white/80" />
                <div>
                  <p className="text-sm font-medium text-white">عنوان المحفظة</p>
                  <p className="text-xs text-white/70">انقر لعرض التفاصيل</p>
                </div>
              </div>
              <div className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>
                <ArrowDownIcon className="h-4 w-4 text-white/80" />
              </div>
            </div>
          </button>

          {showDetails && (
            <div className="mt-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-white">ا��عنوان:</span>
                <button
                  onClick={() => copyToClipboard(address)}
                  className="text-xs font-medium text-white/80 hover:text-white"
                >
                  {copied ? 'تم النسخ!' : 'نسخ'}
                </button>
              </div>
              <div className="break-all rounded-lg bg-black/20 p-3 font-mono text-xs text-white">
                {address}
              </div>

              {/* QR Code */}
              <div className="mt-4 flex justify-center">
                <div className="rounded-lg bg-white p-2">
                  <QRCodeGenerator value={`tron:${address}`} size={120} errorCorrectionLevel="M" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Features */}
      {features.length > 0 && (
        <div className="relative mb-6">
          <h4 className="mb-3 text-sm font-semibold text-white">المميزات:</h4>
          <div className="flex flex-wrap gap-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white"
              >
                <SparklesIcon className="h-3 w-3" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="relative flex gap-3">
        <Link
          href={depositUrl}
          className={`flex-1 rounded-2xl ${buttonColor} px-6 py-3 text-center font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl`}
        >
          بدء الإيداع
        </Link>
        <Link
          href={`/wallet/transactions?type=${type}`}
          className="rounded-2xl bg-white/20 px-4 py-3 text-white backdrop-blur-sm transition-all hover:bg-white/30"
        >
          <ChartBarIcon className="h-5 w-5" />
        </Link>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 transition-opacity group-hover:opacity-100"></div>
    </div>
  );
};

export default EnhancedWalletCard;
