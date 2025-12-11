// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import {
  CreditCardIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  BanknotesIcon as CryptoIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { checkAuth } from '../../lib/auth';

interface Wallet {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'local' | 'global' | 'crypto';
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'pending';
  lastTransaction: string;
  totalTransactions: number;
}

interface Transaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedWalletType, setSelectedWalletType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  useEffect(() => {
    const mockWallets: Wallet[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'أحمد محمد',
        userEmail: 'ahmed@example.com',
        type: 'local',
        balance: 125000,
        currency: 'LYD',
        status: 'active',
        lastTransaction: '2025-01-12T10:30:00',
        totalTransactions: 45
      },
      {
        id: '2',
        userId: 'user1',
        userName: 'أحمد محمد',
        userEmail: 'ahmed@example.com',
        type: 'global',
        balance: 5000,
        currency: 'USD',
        status: 'active',
        lastTransaction: '2025-01-10T15:00:00',
        totalTransactions: 12
      },
      {
        id: '3',
        userId: 'user2',
        userName: 'سارة الطاهر',
        userEmail: 'sara@example.com',
        type: 'crypto',
        balance: 2500,
        currency: 'USDT',
        status: 'active',
        lastTransaction: '2025-01-11T09:00:00',
        totalTransactions: 8
      },
      {
        id: '4',
        userId: 'user3',
        userName: 'محمود إبراهيم',
        userEmail: 'mahmoud@example.com',
        type: 'local',
        balance: 0,
        currency: 'LYD',
        status: 'frozen',
        lastTransaction: '2024-12-30T14:00:00',
        totalTransactions: 3
      }
    ];

    const mockTransactions: Transaction[] = [
      {
        id: 't1',
        walletId: '1',
        type: 'deposit',
        amount: 5000,
        currency: 'LYD',
        status: 'completed',
        date: '2025-01-12T10:30:00',
        description: 'إيداع من البطاقة البنكية'
      },
      {
        id: 't2',
        walletId: '2',
        type: 'transfer',
        amount: 100,
        currency: 'USD',
        status: 'pending',
        date: '2025-01-12T11:00:00',
        description: 'تحويل إلى محفظة أخرى'
      },
      {
        id: 't3',
        walletId: '3',
        type: 'withdraw',
        amount: 500,
        currency: 'USDT',
        status: 'completed',
        date: '2025-01-11T09:00:00',
        description: 'سحب إلى محفظة خارجية'
      }
    ];

    setWallets(mockWallets);
    setTransactions(mockTransactions);
  }, []);

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'local':
        return BanknotesIcon;
      case 'global':
        return CurrencyDollarIcon;
      case 'crypto':
        return CryptoIcon;
      default:
        return CreditCardIcon;
    }
  };

  const getWalletColor = (type: string) => {
    switch (type) {
      case 'local':
        return 'blue';
      case 'global':
        return 'green';
      case 'crypto':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircleIcon;
      case 'frozen':
        return XCircleIcon;
      case 'pending':
        return ClockIcon;
      default:
        return ExclamationTriangleIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'frozen':
        return 'text-red-400';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const walletStats = {
    totalLocal: wallets.filter(w => w.type === 'local').reduce((sum, w) => sum + w.balance, 0),
    totalGlobal: wallets.filter(w => w.type === 'global').reduce((sum, w) => sum + w.balance, 0),
    totalCrypto: wallets.filter(w => w.type === 'crypto').reduce((sum, w) => sum + w.balance, 0),
    activeWallets: wallets.filter(w => w.status === 'active').length,
    frozenWallets: wallets.filter(w => w.status === 'frozen').length
  };

  const filteredWallets = wallets.filter(wallet => {
    const matchesType = selectedWalletType === 'all' || wallet.type === selectedWalletType;
    const matchesSearch = wallet.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wallet.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">إدارة المحافظ</h1>
              <p className="text-sm text-gray-400 mt-1">إدارة المحافظ الثلاث والمعاملات المالية</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              إضافة رصيد
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Local Wallet Stats */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <BanknotesIcon className="h-8 w-8 text-blue-500" />
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">المحفظة المحلية</p>
            <p className="text-2xl font-bold text-white">{walletStats.totalLocal.toLocaleString()} LYD</p>
            <p className="text-xs text-gray-500 mt-2">
              {wallets.filter(w => w.type === 'local').length} محفظة نشطة
            </p>
          </div>

          {/* Global Wallet Stats */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">المحفظة العالمية</p>
            <p className="text-2xl font-bold text-white">${walletStats.totalGlobal.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">
              {wallets.filter(w => w.type === 'global').length} محفظة نشطة
            </p>
          </div>

          {/* Crypto Wallet Stats */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <CryptoIcon className="h-8 w-8 text-yellow-500" />
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">محفظة العملات الرقمية</p>
            <p className="text-2xl font-bold text-white">{walletStats.totalCrypto.toLocaleString()} USDT</p>
            <p className="text-xs text-gray-500 mt-2">
              {wallets.filter(w => w.type === 'crypto').length} محفظة نشطة
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث بالاسم أو البريد الإلكتروني..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'local', 'global', 'crypto'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedWalletType(type)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedWalletType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {type === 'all' ? 'الكل' :
                   type === 'local' ? 'محلية' :
                   type === 'global' ? 'عالمية' : 'رقمية'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wallets Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50 border-b border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    المستخدم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    نوع المحفظة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    الرصيد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    آخر معاملة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredWallets.map((wallet) => {
                  const Icon = getWalletIcon(wallet.type);
                  const color = getWalletColor(wallet.type);
                  const StatusIcon = getStatusIcon(wallet.status);
                  const statusColor = getStatusColor(wallet.status);
                  
                  return (
                    <tr key={wallet.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{wallet.userName}</div>
                          <div className="text-xs text-gray-400">{wallet.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Icon className={`h-5 w-5 text-${color}-500 ml-2`} />
                          <span className="text-sm text-gray-300">
                            {wallet.type === 'local' ? 'محلية' :
                             wallet.type === 'global' ? 'عالمية' : 'رقمية'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {wallet.balance.toLocaleString()} {wallet.currency}
                        </div>
                        <div className="text-xs text-gray-400">
                          {wallet.totalTransactions} معاملة
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className={`h-4 w-4 ml-1 ${statusColor}`} />
                          <span className={`text-sm ${statusColor}`}>
                            {wallet.status === 'active' ? 'نشطة' :
                             wallet.status === 'frozen' ? 'مجمدة' : 'معلقة'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(wallet.lastTransaction).toLocaleDateString('ar-LY')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-400 hover:text-blue-300 ml-3">
                          عرض
                        </button>
                        <button className="text-yellow-400 hover:text-yellow-300 ml-3">
                          تعديل
                        </button>
                        {wallet.status === 'frozen' ? (
                          <button className="text-green-400 hover:text-green-300">
                            تفعيل
                          </button>
                        ) : (
                          <button className="text-red-400 hover:text-red-300">
                            تجميد
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">آخر المعاملات</h2>
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="divide-y divide-gray-700">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`
                        h-10 w-10 rounded-full flex items-center justify-center
                        ${transaction.type === 'deposit' ? 'bg-green-900/50' :
                          transaction.type === 'withdraw' ? 'bg-red-900/50' : 'bg-blue-900/50'}
                      `}>
                        {transaction.type === 'deposit' ? (
                          <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
                        ) : transaction.type === 'withdraw' ? (
                          <ArrowTrendingDownIcon className="h-5 w-5 text-red-400" />
                        ) : (
                          <CreditCardIcon className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                      <div className="mr-4">
                        <p className="text-sm font-medium text-white">
                          {transaction.type === 'deposit' ? 'إيداع' :
                           transaction.type === 'withdraw' ? 'سحب' : 'تحويل'}
                        </p>
                        <p className="text-xs text-gray-400">{transaction.description}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">
                        {transaction.amount.toLocaleString()} {transaction.currency}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(transaction.date).toLocaleString('ar-LY')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return checkAuth(context);
};
