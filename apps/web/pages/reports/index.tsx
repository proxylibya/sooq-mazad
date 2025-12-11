// @ts-nocheck
import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { 
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ShoppingCartIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { checkAuth } from '../../lib/auth';

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('overview');

  // Mock statistics
  const stats: StatCard[] = [
    {
      title: 'إجمالي الإيرادات',
      value: '2,456,789 LYD',
      change: 12.5,
      icon: CurrencyDollarIcon,
      color: 'green'
    },
    {
      title: 'عدد المزادات',
      value: 1234,
      change: 8.3,
      icon: ShoppingCartIcon,
      color: 'blue'
    },
    {
      title: 'المستخدمون الجدد',
      value: 456,
      change: -5.2,
      icon: UsersIcon,
      color: 'purple'
    },
    {
      title: 'متوسط قيمة المزاد',
      value: '45,678 LYD',
      change: 15.7,
      icon: ChartPieIcon,
      color: 'yellow'
    }
  ];

  // Mock chart data
  const monthlyData = [
    { month: 'يناير', revenue: 180000, auctions: 120 },
    { month: 'فبراير', revenue: 220000, auctions: 145 },
    { month: 'مارس', revenue: 195000, auctions: 138 },
    { month: 'أبريل', revenue: 245000, auctions: 162 },
    { month: 'مايو', revenue: 280000, auctions: 189 },
    { month: 'يونيو', revenue: 310000, auctions: 201 }
  ];

  // Top sellers
  const topSellers = [
    { name: 'معرض السيارات الحديثة', sales: 45, revenue: '1,234,567 LYD' },
    { name: 'شركة الوكيل للسيارات', sales: 38, revenue: '987,654 LYD' },
    { name: 'معرض النخبة', sales: 32, revenue: '876,543 LYD' },
    { name: 'مركز السيارات المميزة', sales: 28, revenue: '765,432 LYD' },
    { name: 'معرض الثقة للسيارات', sales: 24, revenue: '654,321 LYD' }
  ];

  const getStatColor = (color: string) => {
    const colors = {
      green: 'border-green-500 bg-green-900/20',
      blue: 'border-blue-500 bg-blue-900/20',
      purple: 'border-purple-500 bg-purple-900/20',
      yellow: 'border-yellow-500 bg-yellow-900/20'
    };
    return colors[color as keyof typeof colors] || 'border-gray-500 bg-gray-900/20';
  };

  const getIconColor = (color: string) => {
    const colors = {
      green: 'text-green-500',
      blue: 'text-blue-500',
      purple: 'text-purple-500',
      yellow: 'text-yellow-500'
    };
    return colors[color as keyof typeof colors] || 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">التقارير والإحصائيات</h1>
              <p className="text-sm text-gray-400 mt-1">تحليل شامل لأداء المنصة</p>
            </div>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <DocumentArrowDownIcon className="h-5 w-5 ml-2" />
              تصدير التقرير
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">آخر أسبوع</option>
              <option value="month">آخر شهر</option>
              <option value="quarter">آخر 3 شهور</option>
              <option value="year">آخر سنة</option>
            </select>
          </div>

          {/* Report Type */}
          <div className="flex gap-2">
            {['overview', 'sales', 'users', 'auctions'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  reportType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {type === 'overview' ? 'نظرة عامة' :
                 type === 'sales' ? 'المبيعات' :
                 type === 'users' ? 'المستخدمون' : 'المزادات'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className={`rounded-lg border p-6 ${getStatColor(stat.color)}`}>
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 ${getIconColor(stat.color)}`} />
                <div className={`flex items-center text-sm ${
                  stat.change > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 ml-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 ml-1" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">الإيرادات الشهرية</h2>
              <ChartBarIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{data.month}</span>
                    <span className="text-white font-medium">{data.revenue.toLocaleString()} LYD</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(data.revenue / 350000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auctions Chart */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">عدد المزادات</h2>
              <ChartPieIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{data.month}</span>
                    <span className="text-white font-medium">{data.auctions} مزاد</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(data.auctions / 250) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Sellers Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">أفضل البائعين</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50 border-b border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    البائع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    عدد المبيعات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    إجمالي الإيرادات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    الأداء
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {topSellers.map((seller, index) => (
                  <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{seller.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {seller.sales} مبيعة
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {seller.revenue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[100px]">
                          <div 
                            className={`h-2 rounded-full ${
                              index === 0 ? 'bg-green-500' : 
                              index === 1 ? 'bg-blue-500' :
                              index === 2 ? 'bg-purple-500' : 'bg-gray-500'
                            }`}
                            style={{ width: `${100 - (index * 15)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return checkAuth(context);
};
