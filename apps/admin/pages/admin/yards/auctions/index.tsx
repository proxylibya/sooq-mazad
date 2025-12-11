/**
 * صفحة قائمة مزادات الساحات - لوحة التحكم
 * Yard Auctions List - Admin Panel
 */

import {
  BuildingOfficeIcon,
  CalendarIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';

interface YardAuction {
  id: string;
  title: string;
  startPrice: number;
  currentPrice: number;
  status: string;
  startDate: string;
  endDate: string;
  views: number;
  totalBids: number;
  yard?: {
    id: string;
    name: string;
    slug: string;
  };
  cars?: {
    brand: string;
    model: string;
    year: number;
    images: string;
  };
}

export default function YardAuctionsPage() {
  const router = useRouter();
  const [auctions, setAuctions] = useState<YardAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchYardAuctions();
  }, [statusFilter]);

  const fetchYardAuctions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      params.append('yardOnly', 'true'); // جلب مزادات الساحات فقط

      const response = await fetch(`/api/admin/yards/auctions?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setAuctions(data.auctions || []);
      } else {
        // بيانات تجريبية
        setAuctions([
          {
            id: 'yard-auc-1',
            title: 'تويوتا كامري 2020',
            startPrice: 45000,
            currentPrice: 52000,
            status: 'ACTIVE',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            views: 245,
            totalBids: 12,
            yard: { id: 'yard-1', name: 'ساحة طرابلس المركزية', slug: 'tripoli-central' },
            cars: {
              brand: 'Toyota',
              model: 'Camry',
              year: 2020,
              images: '["/uploads/cars/bmw-x5-2021-front.jpg"]',
            },
          },
          {
            id: 'yard-auc-2',
            title: 'هيونداي سوناتا 2019',
            startPrice: 35000,
            currentPrice: 38000,
            status: 'UPCOMING',
            startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
            views: 89,
            totalBids: 0,
            yard: { id: 'yard-2', name: 'ساحة بنغازي', slug: 'benghazi-yard' },
            cars: {
              brand: 'Hyundai',
              model: 'Sonata',
              year: 2019,
              images: '["/uploads/cars/hyundai-tucson-2022-front.jpg"]',
            },
          },
        ]);
      }
    } catch (error) {
      console.error('خطأ في جلب مزادات الساحات:', error);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      ACTIVE: { label: 'نشط', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
      UPCOMING: { label: 'قادم', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      ENDED: { label: 'منتهي', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
      CANCELLED: { label: 'ملغي', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    };
    const { label, color } = statusMap[status] || statusMap.ACTIVE;
    return (
      <span className={`rounded-full border px-2 py-1 text-xs font-medium ${color}`}>{label}</span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ar-LY') + ' د.ل';
  };

  const filteredAuctions = auctions.filter(
    (auction) =>
      auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.yard?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AdminLayout title="مزادات الساحات">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">مزادات الساحات</h1>
              <p className="text-slate-400">
                إدارة المزادات الحضورية المرتبطة بالساحات على أرض الواقع
              </p>
            </div>
            <Link
              href="/admin/yards/auctions/create"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5" />
              إنشاء مزاد ساحة
            </Link>
          </div>
          {/* رسالة توضيحية للتفريق بين الأقسام */}
          <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
            <p className="text-sm text-blue-200">
              هذه المزادات مرتبطة بساحات فعلية وتظهر في صفحات الساحات فقط. للمزادات الأونلاين، انتقل
              إلى قسم المزادات
            </p>
            <Link
              href="/admin/auctions"
              className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline"
            >
              المزادات الأونلاين
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-800 p-4 sm:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="البحث في المزادات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 py-2 pl-4 pr-10 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="all">جميع الحالات</option>
            <option value="ACTIVE">نشط</option>
            <option value="UPCOMING">قادم</option>
            <option value="ENDED">منتهي</option>
            <option value="CANCELLED">ملغي</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-sm text-slate-400">إجمالي المزادات</p>
            <p className="text-2xl font-bold text-white">{auctions.length}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-sm text-slate-400">المزادات النشطة</p>
            <p className="text-2xl font-bold text-green-400">
              {auctions.filter((a) => a.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-sm text-slate-400">المزادات القادمة</p>
            <p className="text-2xl font-bold text-blue-400">
              {auctions.filter((a) => a.status === 'UPCOMING').length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-sm text-slate-400">المنتهية</p>
            <p className="text-2xl font-bold text-slate-400">
              {auctions.filter((a) => a.status === 'ENDED').length}
            </p>
          </div>
        </div>

        {/* Auctions Table */}
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="py-12 text-center">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-slate-500" />
              <p className="mt-4 text-slate-400">لا توجد مزادات ساحات</p>
              <Link
                href="/admin/yards/auctions/create"
                className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                <PlusIcon className="h-5 w-5" />
                إنشاء مزاد جديد
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-slate-700 bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                    الصورة
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                    المزاد
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                    الساحة
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">السعر</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                    التاريخ
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                    الحالة
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredAuctions.map((auction) => {
                  // معالجة صور السيارة
                  let carImages: string[] = [];
                  try {
                    if (auction.cars?.images) {
                      if (typeof auction.cars.images === 'string') {
                        carImages = JSON.parse(auction.cars.images);
                      } else if (Array.isArray(auction.cars.images)) {
                        carImages = auction.cars.images;
                      }
                    }
                  } catch {
                    carImages = [];
                  }
                  const firstImage = carImages[0] || '';

                  return (
                    <tr key={auction.id} className="hover:bg-slate-700/30">
                      {/* عمود الصورة */}
                      <td className="px-4 py-3">
                        <div className="relative h-16 w-20 overflow-hidden rounded-lg bg-slate-700">
                          {firstImage ? (
                            <Image
                              src={firstImage}
                              alt={auction.title}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <PhotoIcon className="h-6 w-6 text-slate-500" />
                            </div>
                          )}
                        </div>
                      </td>
                      {/* عمود المزاد */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{auction.title}</p>
                          <p className="text-sm text-slate-400">
                            {auction.cars?.brand} {auction.cars?.model} {auction.cars?.year}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <BuildingOfficeIcon className="h-4 w-4 text-blue-400" />
                          <span className="text-slate-300">{auction.yard?.name || 'غير محدد'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-green-400">
                            {formatPrice(auction.currentPrice)}
                          </p>
                          <p className="text-xs text-slate-400">
                            بداية: {formatPrice(auction.startPrice)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-300">
                              {formatDate(auction.startDate)}
                            </p>
                            <p className="text-xs text-slate-400">
                              إلى {formatDate(auction.endDate)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(auction.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/yards/auctions/${auction.id}`)}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                            title="عرض التفاصيل"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
