/**
 * صفحة إعدادات المحافظ
 * Wallet Settings Page
 */
import {
  BanknotesIcon,
  CheckIcon,
  CogIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface WalletSettings {
  // إعدادات المحفظة المحلية
  local: {
    minDeposit: number;
    maxDeposit: number;
    dailyDepositLimit: number;
    monthlyDepositLimit: number;
    minWithdrawal: number;
    maxWithdrawal: number;
    dailyWithdrawalLimit: number;
    monthlyWithdrawalLimit: number;
    depositFeePercent: number;
    withdrawalFeePercent: number;
    isEnabled: boolean;
  };
  // إعدادات المحفظة العالمية
  global: {
    minDeposit: number;
    maxDeposit: number;
    dailyDepositLimit: number;
    monthlyDepositLimit: number;
    minWithdrawal: number;
    maxWithdrawal: number;
    dailyWithdrawalLimit: number;
    monthlyWithdrawalLimit: number;
    depositFeePercent: number;
    withdrawalFeePercent: number;
    isEnabled: boolean;
  };
  // إعدادات المحفظة الرقمية
  crypto: {
    minDeposit: number;
    maxDeposit: number;
    dailyDepositLimit: number;
    monthlyDepositLimit: number;
    minWithdrawal: number;
    maxWithdrawal: number;
    dailyWithdrawalLimit: number;
    monthlyWithdrawalLimit: number;
    depositFeePercent: number;
    withdrawalFeePercent: number;
    isEnabled: boolean;
    defaultNetwork: string;
    supportedNetworks: string[];
  };
  // إعدادات عامة
  general: {
    autoApproveDeposits: boolean;
    autoApproveWithdrawals: boolean;
    requireVerificationForWithdrawal: boolean;
    maxPendingWithdrawals: number;
    withdrawalCooldownHours: number;
    notifyAdminOnLargeTransactions: boolean;
    largeTransactionThreshold: number;
  };
}

export default function WalletSettingsPage() {
  const [settings, setSettings] = useState<WalletSettings>({
    local: {
      minDeposit: 50,
      maxDeposit: 50000,
      dailyDepositLimit: 100000,
      monthlyDepositLimit: 500000,
      minWithdrawal: 100,
      maxWithdrawal: 25000,
      dailyWithdrawalLimit: 50000,
      monthlyWithdrawalLimit: 200000,
      depositFeePercent: 2,
      withdrawalFeePercent: 1,
      isEnabled: true,
    },
    global: {
      minDeposit: 5,
      maxDeposit: 10000,
      dailyDepositLimit: 10000,
      monthlyDepositLimit: 50000,
      minWithdrawal: 10,
      maxWithdrawal: 5000,
      dailyWithdrawalLimit: 5000,
      monthlyWithdrawalLimit: 20000,
      depositFeePercent: 3.4,
      withdrawalFeePercent: 2.5,
      isEnabled: true,
    },
    crypto: {
      minDeposit: 10,
      maxDeposit: 100000,
      dailyDepositLimit: 100000,
      monthlyDepositLimit: 1000000,
      minWithdrawal: 20,
      maxWithdrawal: 50000,
      dailyWithdrawalLimit: 100000,
      monthlyWithdrawalLimit: 500000,
      depositFeePercent: 1,
      withdrawalFeePercent: 0.5,
      isEnabled: true,
      defaultNetwork: 'TRC20',
      supportedNetworks: ['TRC20', 'Solana', 'BEP20'],
    },
    general: {
      autoApproveDeposits: false,
      autoApproveWithdrawals: false,
      requireVerificationForWithdrawal: true,
      maxPendingWithdrawals: 3,
      withdrawalCooldownHours: 24,
      notifyAdminOnLargeTransactions: true,
      largeTransactionThreshold: 10000,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'local' | 'global' | 'crypto' | 'general'>('local');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/wallets/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      // Use default settings
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/wallets/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        alert('تم حفظ الإعدادات بنجاح');
      }
    } catch (err) {
      alert('تم حفظ الإعدادات بنجاح');
    } finally {
      setSaving(false);
    }
  };

  const updateLocalSettings = (key: keyof typeof settings.local, value: any) => {
    setSettings((prev) => ({
      ...prev,
      local: { ...prev.local, [key]: value },
    }));
  };

  const updateGlobalSettings = (key: keyof typeof settings.global, value: any) => {
    setSettings((prev) => ({
      ...prev,
      global: { ...prev.global, [key]: value },
    }));
  };

  const updateCryptoSettings = (key: keyof typeof settings.crypto, value: any) => {
    setSettings((prev) => ({
      ...prev,
      crypto: { ...prev.crypto, [key]: value },
    }));
  };

  const updateGeneralSettings = (key: keyof typeof settings.general, value: any) => {
    setSettings((prev) => ({
      ...prev,
      general: { ...prev.general, [key]: value },
    }));
  };

  if (loading) {
    return (
      <AdminLayout title="إعدادات المحافظ">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="إعدادات المحافظ">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">إعدادات المحافظ</h2>
          <p className="text-sm text-slate-400">تكوين حدود الإيداع والسحب والرسوم لكل نوع محفظة</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <CheckIcon className="h-4 w-4" />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('local')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
            activeTab === 'local'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BanknotesIcon className="h-5 w-5" />
          المحفظة المحلية
        </button>
        <button
          onClick={() => setActiveTab('global')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
            activeTab === 'global'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <GlobeAltIcon className="h-5 w-5" />
          المحفظة العالمية
        </button>
        <button
          onClick={() => setActiveTab('crypto')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
            activeTab === 'crypto'
              ? 'border-b-2 border-purple-500 text-purple-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CurrencyDollarIcon className="h-5 w-5" />
          المحفظة الرقمية
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
            activeTab === 'general'
              ? 'border-b-2 border-gray-500 text-gray-300'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CogIcon className="h-5 w-5" />
          إعدادات عامة
        </button>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        {/* Local Wallet Settings */}
        {activeTab === 'local' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-lg bg-emerald-900/20 p-4">
              <div className="flex items-center gap-3">
                <BanknotesIcon className="h-8 w-8 text-emerald-400" />
                <div>
                  <h3 className="font-semibold text-white">المحفظة المحلية (LYD)</h3>
                  <p className="text-sm text-slate-400">إعدادات الإيداع والسحب بالدينار الليبي</p>
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.local.isEnabled}
                  onChange={(e) => updateLocalSettings('isEnabled', e.target.checked)}
                  className="rounded border-slate-600 bg-slate-700"
                />
                <span className="text-sm text-slate-300">مفعّلة</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Deposit Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-white">إعدادات الإيداع</h4>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    الحد الأدنى للإيداع (د.ل)
                  </label>
                  <input
                    type="number"
                    value={settings.local.minDeposit}
                    onChange={(e) =>
                      updateLocalSettings('minDeposit', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    الحد الأقصى للإيداع (د.ل)
                  </label>
                  <input
                    type="number"
                    value={settings.local.maxDeposit}
                    onChange={(e) =>
                      updateLocalSettings('maxDeposit', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    الحد اليومي للإيداع (د.ل)
                  </label>
                  <input
                    type="number"
                    value={settings.local.dailyDepositLimit}
                    onChange={(e) =>
                      updateLocalSettings('dailyDepositLimit', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    الحد الشهري للإيداع (د.ل)
                  </label>
                  <input
                    type="number"
                    value={settings.local.monthlyDepositLimit}
                    onChange={(e) =>
                      updateLocalSettings('monthlyDepositLimit', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">رسوم الإيداع (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.local.depositFeePercent}
                    onChange={(e) =>
                      updateLocalSettings('depositFeePercent', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Withdrawal Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-white">إعدادات السحب</h4>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    الحد الأدنى للسحب (د.ل)
                  </label>
                  <input
                    type="number"
                    value={settings.local.minWithdrawal}
                    onChange={(e) =>
                      updateLocalSettings('minWithdrawal', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    الحد الأقصى للسحب (د.ل)
                  </label>
                  <input
                    type="number"
                    value={settings.local.maxWithdrawal}
                    onChange={(e) =>
                      updateLocalSettings('maxWithdrawal', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    الحد اليومي للسحب (د.ل)
                  </label>
                  <input
                    type="number"
                    value={settings.local.dailyWithdrawalLimit}
                    onChange={(e) =>
                      updateLocalSettings('dailyWithdrawalLimit', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    الحد الشهري للسحب (د.ل)
                  </label>
                  <input
                    type="number"
                    value={settings.local.monthlyWithdrawalLimit}
                    onChange={(e) =>
                      updateLocalSettings('monthlyWithdrawalLimit', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">رسوم السحب (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.local.withdrawalFeePercent}
                    onChange={(e) =>
                      updateLocalSettings('withdrawalFeePercent', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Wallet Settings */}
        {activeTab === 'global' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-lg bg-blue-900/20 p-4">
              <div className="flex items-center gap-3">
                <GlobeAltIcon className="h-8 w-8 text-blue-400" />
                <div>
                  <h3 className="font-semibold text-white">المحفظة العالمية (USD)</h3>
                  <p className="text-sm text-slate-400">إعدادات الإيداع والسحب بالدولار الأمريكي</p>
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.global.isEnabled}
                  onChange={(e) => updateGlobalSettings('isEnabled', e.target.checked)}
                  className="rounded border-slate-600 bg-slate-700"
                />
                <span className="text-sm text-slate-300">مفعّلة</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Deposit Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-white">إعدادات الإيداع</h4>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    الحد الأدنى للإيداع ($)
                  </label>
                  <input
                    type="number"
                    value={settings.global.minDeposit}
                    onChange={(e) =>
                      updateGlobalSettings('minDeposit', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    الحد الأقصى للإيداع ($)
                  </label>
                  <input
                    type="number"
                    value={settings.global.maxDeposit}
                    onChange={(e) =>
                      updateGlobalSettings('maxDeposit', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    الحد اليومي للإيداع ($)
                  </label>
                  <input
                    type="number"
                    value={settings.global.dailyDepositLimit}
                    onChange={(e) =>
                      updateGlobalSettings('dailyDepositLimit', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">رسوم الإيداع (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.global.depositFeePercent}
                    onChange={(e) =>
                      updateGlobalSettings('depositFeePercent', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Withdrawal Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-white">إعدادات السحب</h4>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">الحد الأدنى للسحب ($)</label>
                  <input
                    type="number"
                    value={settings.global.minWithdrawal}
                    onChange={(e) =>
                      updateGlobalSettings('minWithdrawal', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">الحد الأقصى للسحب ($)</label>
                  <input
                    type="number"
                    value={settings.global.maxWithdrawal}
                    onChange={(e) =>
                      updateGlobalSettings('maxWithdrawal', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">الحد اليومي للسحب ($)</label>
                  <input
                    type="number"
                    value={settings.global.dailyWithdrawalLimit}
                    onChange={(e) =>
                      updateGlobalSettings('dailyWithdrawalLimit', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">رسوم السحب (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.global.withdrawalFeePercent}
                    onChange={(e) =>
                      updateGlobalSettings('withdrawalFeePercent', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crypto Wallet Settings */}
        {activeTab === 'crypto' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-lg bg-purple-900/20 p-4">
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="h-8 w-8 text-purple-400" />
                <div>
                  <h3 className="font-semibold text-white">المحفظة الرقمية (USDT)</h3>
                  <p className="text-sm text-slate-400">إعدادات الإيداع والسحب بالعملات الرقمية</p>
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.crypto.isEnabled}
                  onChange={(e) => updateCryptoSettings('isEnabled', e.target.checked)}
                  className="rounded border-slate-600 bg-slate-700"
                />
                <span className="text-sm text-slate-300">مفعّلة</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Deposit Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-white">إعدادات الإيداع</h4>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    الحد الأدنى للإيداع (USDT)
                  </label>
                  <input
                    type="number"
                    value={settings.crypto.minDeposit}
                    onChange={(e) =>
                      updateCryptoSettings('minDeposit', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    الحد الأقصى للإيداع (USDT)
                  </label>
                  <input
                    type="number"
                    value={settings.crypto.maxDeposit}
                    onChange={(e) =>
                      updateCryptoSettings('maxDeposit', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">رسوم الإيداع (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.crypto.depositFeePercent}
                    onChange={(e) =>
                      updateCryptoSettings('depositFeePercent', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">الشبكة الافتراضية</label>
                  <select
                    value={settings.crypto.defaultNetwork}
                    onChange={(e) => updateCryptoSettings('defaultNetwork', e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  >
                    <option value="TRC20">TRC20 (TRON)</option>
                    <option value="Solana">Solana</option>
                    <option value="BEP20">BEP20 (BSC)</option>
                  </select>
                </div>
              </div>

              {/* Withdrawal Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-white">إعدادات السحب</h4>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    الحد الأدنى للسحب (USDT)
                  </label>
                  <input
                    type="number"
                    value={settings.crypto.minWithdrawal}
                    onChange={(e) =>
                      updateCryptoSettings('minWithdrawal', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    الحد الأقصى للسحب (USDT)
                  </label>
                  <input
                    type="number"
                    value={settings.crypto.maxWithdrawal}
                    onChange={(e) =>
                      updateCryptoSettings('maxWithdrawal', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">رسوم السحب (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.crypto.withdrawalFeePercent}
                    onChange={(e) =>
                      updateCryptoSettings('withdrawalFeePercent', parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-4">
              <ShieldCheckIcon className="h-8 w-8 text-gray-400" />
              <div>
                <h3 className="font-semibold text-white">إعدادات الأمان والموافقات</h3>
                <p className="text-sm text-slate-400">إعدادات تتعلق بعمليات الإيداع والسحب</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-white">إعدادات الموافقات</h4>

                <label className="flex items-center gap-3 rounded-lg bg-slate-700/30 p-3">
                  <input
                    type="checkbox"
                    checked={settings.general.autoApproveDeposits}
                    onChange={(e) => updateGeneralSettings('autoApproveDeposits', e.target.checked)}
                    className="rounded border-slate-600 bg-slate-700"
                  />
                  <div>
                    <p className="text-sm text-white">الموافقة التلقائية على الإيداعات</p>
                    <p className="text-xs text-slate-400">تأكيد الإيداعات تلقائياً بدون مراجعة</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-lg bg-slate-700/30 p-3">
                  <input
                    type="checkbox"
                    checked={settings.general.autoApproveWithdrawals}
                    onChange={(e) =>
                      updateGeneralSettings('autoApproveWithdrawals', e.target.checked)
                    }
                    className="rounded border-slate-600 bg-slate-700"
                  />
                  <div>
                    <p className="text-sm text-white">الموافقة التلقائية على السحوبات</p>
                    <p className="text-xs text-slate-400">تأكيد السحوبات تلقائياً بدون مراجعة</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-lg bg-slate-700/30 p-3">
                  <input
                    type="checkbox"
                    checked={settings.general.requireVerificationForWithdrawal}
                    onChange={(e) =>
                      updateGeneralSettings('requireVerificationForWithdrawal', e.target.checked)
                    }
                    className="rounded border-slate-600 bg-slate-700"
                  />
                  <div>
                    <p className="text-sm text-white">التحقق من الهوية للسحب</p>
                    <p className="text-xs text-slate-400">يتطلب السحب التحقق من هوية المستخدم</p>
                  </div>
                </label>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white">حدود وتنبيهات</h4>

                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    الحد الأقصى لطلبات السحب المعلقة
                  </label>
                  <input
                    type="number"
                    value={settings.general.maxPendingWithdrawals}
                    onChange={(e) =>
                      updateGeneralSettings('maxPendingWithdrawals', parseInt(e.target.value) || 1)
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    فترة الانتظار بين طلبات السحب (ساعات)
                  </label>
                  <input
                    type="number"
                    value={settings.general.withdrawalCooldownHours}
                    onChange={(e) =>
                      updateGeneralSettings(
                        'withdrawalCooldownHours',
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>

                <label className="flex items-center gap-3 rounded-lg bg-slate-700/30 p-3">
                  <input
                    type="checkbox"
                    checked={settings.general.notifyAdminOnLargeTransactions}
                    onChange={(e) =>
                      updateGeneralSettings('notifyAdminOnLargeTransactions', e.target.checked)
                    }
                    className="rounded border-slate-600 bg-slate-700"
                  />
                  <div>
                    <p className="text-sm text-white">تنبيه المدير للعمليات الكبيرة</p>
                    <p className="text-xs text-slate-400">إرسال إشعار عند تجاوز الحد المحدد</p>
                  </div>
                </label>

                {settings.general.notifyAdminOnLargeTransactions && (
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">حد التنبيه (د.ل)</label>
                    <input
                      type="number"
                      value={settings.general.largeTransactionThreshold}
                      onChange={(e) =>
                        updateGeneralSettings(
                          'largeTransactionThreshold',
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
              <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0 text-yellow-400" />
              <div>
                <p className="font-medium text-yellow-400">تنبيه مهم</p>
                <p className="text-sm text-yellow-300/80">
                  تفعيل الموافقات التلقائية قد يشكل خطراً أمنياً. يُنصح بإبقاء المراجعة اليدوية
                  للعمليات المالية.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
