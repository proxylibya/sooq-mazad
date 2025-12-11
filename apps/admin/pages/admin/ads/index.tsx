import {
  Cog6ToothIcon,
  CurrencyDollarIcon,
  MegaphoneIcon,
  PlusIcon,
  PresentationChartLineIcon,
  Square3Stack3DIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout';

export default function AdsDashboard() {
  const stats = [
    {
      title: 'إجمالي الحملات',
      value: '124',
      change: '+12%',
      icon: MegaphoneIcon,
      color: 'blue',
    },
    {
      title: 'الإعلانات النشطة',
      value: '45',
      change: '+5%',
      icon: PresentationChartLineIcon,
      color: 'green',
    },
    {
      title: 'إجمالي الإيرادات',
      value: '45,200 د.ل',
      change: '+18%',
      icon: CurrencyDollarIcon,
      color: 'amber',
    },
    {
      title: 'مرات الظهور',
      value: '1.2M',
      change: '+24%',
      icon: ViewColumnsIcon,
      color: 'purple',
    },
  ];

  const quickActions = [
    {
      title: 'حملة جديدة',
      description: 'إنشاء حملة إعلانية جديدة وتحديد المستهدفين',
      icon: PlusIcon,
      href: '/admin/ads/campaigns/create',
      color: 'bg-blue-500',
    },
    {
      title: 'إدارة الباقات',
      description: 'تعديل أسعار ومميزات باقات الإعلانات',
      icon: Square3Stack3DIcon,
      href: '/admin/ads/packages',
      color: 'bg-amber-500',
    },
    {
      title: 'تخصيص المساحات',
      description: 'تحديد أماكن ظهور الإعلانات في الموقع',
      icon: ViewColumnsIcon,
      href: '/admin/ads/zones',
      color: 'bg-purple-500',
    },
    {
      title: 'الإعدادات العامة',
      description: 'ضبط إعدادات نظام الإعلانات والقيود',
      icon: Cog6ToothIcon,
      href: '/admin/ads/settings',
      color: 'bg-slate-500',
    },
  ];

  return (
    <AdminLayout title="نظام الإعلانات المتقدم">
      <Head>
        <title>لوحة تحكم الإعلانات | سوق مزاد</title>
      </Head>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-slate-400">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
              </div>
              <div className={`rounded-lg p-3 bg-${stat.color}-500/10 text-${stat.color}-500`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="font-medium text-green-400">{stat.change}</span>
              <span className="mr-2 text-slate-500">مقارنة بالشهر الماضي</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="mb-4 text-xl font-bold text-white">الوصول السريع</h2>
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 p-6 transition-all hover:border-slate-600 hover:shadow-lg"
          >
            <div
              className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${action.color} text-white shadow-lg`}
            >
              <action.icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white group-hover:text-amber-400">
              {action.title}
            </h3>
            <p className="text-sm text-slate-400">{action.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent Campaigns Table (Placeholder) */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white">آخر الحملات الإعلانية</h2>
          <Link
            href="/admin/ads/campaigns"
            className="text-sm font-medium text-amber-500 hover:text-amber-400"
          >
            عرض الكل ←
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-700/50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">اسم الحملة</th>
                <th className="px-6 py-4">المعلن</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الميزانية</th>
                <th className="px-6 py-4">النتائج</th>
                <th className="px-6 py-4">تاريخ الانتهاء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-sm">
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-slate-700/30">
                  <td className="px-6 py-4 font-medium text-white">حملة رمضان {item}</td>
                  <td className="px-6 py-4 text-slate-300">شركة ليبيا موتورز</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
                      نشط
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white">1,500 د.ل</td>
                  <td className="px-6 py-4 text-slate-300">15k ظهور</td>
                  <td className="px-6 py-4 text-slate-400">2024-04-15</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
