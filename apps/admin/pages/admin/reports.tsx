/**
 * صفحة التقارير والإحصائيات
 */
import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TruckIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

interface ReportData {
  users: { total: number; new: number; active: number };
  auctions: { total: number; active: number; completed: number; revenue: number };
  transport: { total: number; completed: number; revenue: number };
  wallets: { totalBalance: number; deposits: number; withdrawals: number };
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(false);

  const [data] = useState<ReportData>({
    users: { total: 1250, new: 85, active: 450 },
    auctions: { total: 320, active: 45, completed: 275, revenue: 125000 },
    transport: { total: 180, completed: 165, revenue: 45000 },
    wallets: { totalBalance: 850000, deposits: 1200000, withdrawals: 350000 },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-LY', { style: 'decimal' }).format(amount) + ' د.ل';
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    alert(`سيتم تصدير التقرير بصيغة ${format.toUpperCase()}`);
  };

  const reports = [
    {
      id: 'users',
      title: 'تقرير المستخدمين',
      icon: UsersIcon,
      color: 'blue',
      stats: [
        { label: 'إجمالي المستخدمين', value: data.users.total },
        { label: 'مستخدمين جدد', value: data.users.new },
        { label: 'مستخدمين نشطين', value: data.users.active },
      ],
    },
    {
      id: 'auctions',
      title: 'تقرير المزادات',
      icon: ChartBarIcon,
      color: 'green',
      stats: [
        { label: 'إجمالي المزادات', value: data.auctions.total },
        { label: 'مزادات نشطة', value: data.auctions.active },
        { label: 'مزادات مكتملة', value: data.auctions.completed },
        { label: 'الإيرادات', value: formatCurrency(data.auctions.revenue) },
      ],
    },
    {
      id: 'transport',
      title: 'تقرير النقل',
      icon: TruckIcon,
      color: 'amber',
      stats: [
        { label: 'إجمالي الطلبات', value: data.transport.total },
        { label: 'طلبات مكتملة', value: data.transport.completed },
        { label: 'الإيرادات', value: formatCurrency(data.transport.revenue) },
      ],
    },
    {
      id: 'financial',
      title: 'التقرير المالي',
      icon: CurrencyDollarIcon,
      color: 'purple',
      stats: [
        { label: 'إجمالي الأرصدة', value: formatCurrency(data.wallets.totalBalance) },
        { label: 'الإيداعات', value: formatCurrency(data.wallets.deposits) },
        { label: 'السحوبات', value: formatCurrency(data.wallets.withdrawals) },
      ],
    },
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
      green: { bg: 'bg-green-500/20', text: 'text-green-400' },
      amber: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
      purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <AdminLayout title="التقارير">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="today">اليوم</option>
            <option value="week">هذا الأسبوع</option>
            <option value="month">هذا الشهر</option>
            <option value="quarter">هذا الربع</option>
            <option value="year">هذه السنة</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
          >
            <DocumentTextIcon className="h-4 w-4" />
            تصدير PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            تصدير Excel
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {reports.map((report) => {
          const colorClass = getColorClass(report.color);
          return (
            <div key={report.id} className="rounded-xl border border-slate-700 bg-slate-800 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className={`rounded-lg p-2 ${colorClass.bg}`}>
                  <report.icon className={`h-6 w-6 ${colorClass.text}`} />
                </div>
                <h3 className="text-lg font-semibold text-white">{report.title}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {report.stats.map((stat, i) => (
                  <div key={i} className="rounded-lg bg-slate-700/50 p-3">
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="mt-1 text-xl font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Placeholder */}
      <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">الرسم البياني</h3>
        <div className="flex h-64 items-center justify-center rounded-lg bg-slate-700/30">
          <div className="text-center">
            <ChartBarIcon className="mx-auto h-12 w-12 text-slate-500" />
            <p className="mt-2 text-slate-400">الرسوم البيانية قريباً</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">النشاط الأخير</h3>
        <div className="space-y-3">
          {[
            { text: 'تم إكمال مزاد Toyota Camry 2021', time: 'منذ 5 دقائق', type: 'success' },
            { text: 'مستخدم جديد: محمد أحمد', time: 'منذ 15 دقيقة', type: 'info' },
            { text: 'طلب سحب جديد بقيمة 5,000 د.ل', time: 'منذ 30 دقيقة', type: 'warning' },
            { text: 'تم تفعيل معرض السيارات الفاخرة', time: 'منذ ساعة', type: 'success' },
          ].map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-slate-700/30 px-4 py-3"
            >
              <span className="text-slate-300">{activity.text}</span>
              <span className="text-sm text-slate-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
