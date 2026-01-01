import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface WalletChartsProps {
  period: 'week' | 'month' | 'year';
}

const WalletCharts: React.FC<WalletChartsProps> = ({ period }) => {
  // بيانات تجريبية للرسوم البيانية
  const getTransactionData = () => {
    if (period === 'week') {
      return [
        { name: 'السبت', deposits: 400, balance: 2400 },
        { name: 'الأحد', deposits: 300, balance: 2700 },
        { name: 'الاثنين', deposits: 200, balance: 2900 },
        { name: 'الثلاثاء', deposits: 278, balance: 3178 },
        { name: 'الأربعاء', deposits: 189, balance: 3367 },
        { name: 'الخميس', deposits: 239, balance: 3606 },
        { name: 'الجمعة', deposits: 349, balance: 3955 },
      ];
    } else if (period === 'month') {
      return [
        { name: 'الأسبوع 1', deposits: 2400, balance: 12400 },
        { name: 'الأسبوع 2', deposits: 1398, balance: 13798 },
        { name: 'الأسبوع 3', deposits: 9800, balance: 23598 },
        { name: 'الأسبوع 4', deposits: 3908, balance: 27506 },
      ];
    } else {
      return [
        { name: 'يناير', deposits: 12000, balance: 45000 },
        { name: 'فبراير', deposits: 15000, balance: 60000 },
        { name: 'مارس', deposits: 18000, balance: 78000 },
        { name: 'أبريل', deposits: 22000, balance: 100000 },
        { name: 'مايو', deposits: 25000, balance: 125000 },
        { name: 'يونيو', deposits: 28000, balance: 153000 },
      ];
    }
  };

  const getMethodsData = () => [
    { name: 'ليبيانا', value: 35, color: '#8B5CF6' },
    { name: 'المدار', value: 25, color: '#F59E0B' },
    { name: 'تحويل بنكي', value: 20, color: '#10B981' },
    { name: 'USDT', value: 15, color: '#3B82F6' },
    { name: 'أخرى', value: 5, color: '#6B7280' },
  ];

  const transactionData = getTransactionData();
  const methodsData = getMethodsData();

  // تخصيص Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <p className="mb-2 font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'deposits' ? 'الإيداعات' : 'الرصيد'}: {entry.value.toLocaleString()}{' '}
              د.ل
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* رسم بياني للرصيد عبر الوقت */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="mb-6 text-lg font-bold text-gray-900">تطور الرصيد</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transactionData}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#balanceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* رسم بياني للإيداعات والسحوبات */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="mb-6 text-lg font-bold text-gray-900">الإيداعات والسحوبات</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transactionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => (value === 'deposits' ? 'الإيداعات' : 'السحوبات')} />
              <Bar dataKey="deposits" fill="#10B981" radius={[4, 4, 0, 0]} name="deposits" />
              <Bar dataKey="withdrawals" fill="#EF4444" radius={[4, 4, 0, 0]} name="withdrawals" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* رسم دائري لطرق الدفع */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="mb-6 text-lg font-bold text-gray-900">توزيع طرق الدفع</h3>
        <div className="flex flex-col items-center gap-8 lg:flex-row">
          <div className="h-80 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {methodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}%`, 'النسبة']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* مفتاح الألوان */}
          <div className="space-y-3">
            {methodsData.map((method, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: method.color }}
                ></div>
                <span className="text-sm text-gray-700">{method.name}</span>
                <span className="text-sm font-medium text-gray-900">{method.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* رسم خطي للاتجاهات */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="mb-6 text-lg font-bold text-gray-900">اتجاهات المعاملات</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transactionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => (value === 'deposits' ? 'الإيداعات' : 'السحوبات')} />
              <Line
                type="monotone"
                dataKey="deposits"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
                name="deposits"
              />
              <Line
                type="monotone"
                dataKey="withdrawals"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
                name="withdrawals"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WalletCharts;
