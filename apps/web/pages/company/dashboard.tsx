import Head from 'next/head';
import { OpensooqNavbar } from '../../components/common';
import BuildingOfficeIcon from '@heroicons/react/24/outline/BuildingOfficeIcon';
import ArrowUpRightIcon from '@heroicons/react/24/outline/ArrowUpRightIcon';
import UsersIcon from '@heroicons/react/24/outline/UsersIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import CheckBadgeIcon from '@heroicons/react/24/outline/CheckBadgeIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import PauseIcon from '@heroicons/react/24/outline/PauseIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Company {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  phone?: string;
  email?: string;
  website?: string;
  city: string;
  area?: string;
  address?: string;
  verified: boolean;
  featured: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  businessType: string[];
  specialties: string[];
  openingHours?: string;
  establishedYear?: number;
  licenseNumber?: string;
  taxNumber?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    verified: boolean;
    accountType: string;
  };
}

const CompanyDashboardPage = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/companies/my-company', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.hasCompany) {
        setCompany(data.company);
      } else if (!data.hasCompany) {
        setError('لم يتم العثور على شركة مرتبطة بحسابك. يمكنك إنشاء شركة جديدة.');
      } else {
        setError(data.error || 'فشل في جلب بيانات الشركة');
      }
    } catch (error: any) {
      console.error('خطأ في جلب الشركة:', error);
      setError('خطأ في الشبكة');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // توجيه إلى صفحة تعديل الشركة
    window.location.href = '/company/create';
  };

  const handleDelete = async () => {
    if (!company) return;

    try {
      setActionLoading('delete');

      const response = await fetch('/api/companies/my-company/manage', {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        // إعادة توجيه إلى الصفحة الرئيسية
        window.location.href = '/';
      } else {
        setError(data.error || 'فشل في حذف الشركة');
      }
    } catch (error: any) {
      console.error('خطأ في حذف الشركة:', error);
      setError('خطأ في الشبكة');
    } finally {
      setActionLoading(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleSuspend = async () => {
    if (!company) return;

    try {
      setActionLoading('suspend');

      const response = await fetch('/api/companies/my-company/manage', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setCompany(data.company);
        alert('تم تعليق الشركة مؤقتاً');
      } else {
        setError(data.error || 'فشل في تعليق الشركة');
      }
    } catch (error: any) {
      console.error('خطأ في تعليق الشركة:', error);
      setError('خطأ في الشبكة');
    } finally {
      setActionLoading(null);
      setShowSuspendConfirm(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            موافق عليها
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
            في الانتظار
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
            مرفوضة
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
            معلقة
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
            غير محدد
          </span>
        );
    }
  };
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Head>
        <title>لوحة الشركة | موقع مزاد السيارات</title>
      </Head>

      <OpensooqNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 p-4 shadow-md lg:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 shadow-lg lg:h-14 lg:w-14">
                <BuildingOfficeIcon className="h-6 w-6 text-white lg:h-7 lg:w-7" />
              </div>
              <div>
                <h1 className="mb-1 text-2xl font-bold text-gray-900 lg:mb-1 lg:text-3xl">
                  لوحة الشركة
                </h1>
                <p className="text-sm leading-relaxed text-gray-600 lg:text-base">
                  إدارة صفحة الشركة
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!company && !loading && (
                <Link
                  href="/company/create"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
                >
                  إنشاء شركة جديدة
                </Link>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="border-3 h-8 w-8 animate-spin rounded-full border-emerald-600 border-t-transparent"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="ml-2 h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
            {error.includes('لم يتم العثور على شركة') && (
              <div className="mt-3">
                <Link
                  href="/company/create"
                  className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  إنشاء شركة جديدة
                </Link>
              </div>
            )}
          </div>
        )}

        {company && (
          <>
            {/* مؤشرات مختصرة */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">تاريخ الإنشاء</div>
                    <div className="text-lg font-bold text-gray-900">
                      {company.establishedYear || new Date(company.createdAt).getFullYear()}
                    </div>
                  </div>
                  <ArrowUpRightIcon className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">الحالة</div>
                    <div className="text-lg font-bold text-gray-900">
                      {company.status === 'APPROVED'
                        ? 'نشط'
                        : company.status === 'SUSPENDED'
                          ? 'معلق'
                          : 'في الانتظار'}
                    </div>
                  </div>
                  <StarIcon className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">أنواع الأعمال</div>
                    <div className="text-lg font-bold text-gray-900">
                      {company.businessType.length}
                    </div>
                  </div>
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">توثيق</div>
                    <div className="flex items-center gap-1">
                      <CheckBadgeIcon
                        className={`h-5 w-5 ${company.verified ? 'text-green-500' : 'text-gray-400'}`}
                      />
                      <span className="text-sm font-medium text-gray-800">
                        {company.verified ? 'موثق' : 'غير موثق'}
                      </span>
                    </div>
                  </div>
                  <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* بطاقة معلومات الشركة */}
            <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-sm">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="h-16 w-16 flex-shrink-0">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                          <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="mr-4">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
                        {company.verified && (
                          <CheckBadgeIcon className="h-5 w-5 text-green-500" title="شركة موثقة" />
                        )}
                        {company.featured && (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                            مميزة
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {getStatusBadge(company.status)}
                      </div>
                      {company.description && (
                        <p className="mt-2 text-sm text-gray-600">{company.description}</p>
                      )}
                    </div>
                  </div>

                  {/* أزرار الإدارة */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleEdit}
                      disabled={actionLoading === 'edit'}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                      <PencilIcon className="h-4 w-4" />
                      تعديل
                    </button>

                    {company.status === 'APPROVED' && (
                      <button
                        onClick={() => setShowSuspendConfirm(true)}
                        disabled={actionLoading === 'suspend'}
                        className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
                      >
                        <PauseIcon className="h-4 w-4" />
                        إيقاف مؤقت
                      </button>
                    )}

                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={actionLoading === 'delete'}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* تفاصيل الشركة */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* معلومات الاتصال */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">معلومات الاتصال</h3>
                <div className="space-y-3">
                  {company.phone && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600" dir="ltr">{company.phone}</span>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">{company.email}</span>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-3">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                      <a
                        href={
                          company.website.startsWith('http')
                            ? company.website
                            : `https://${company.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* الموقع */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">الموقع</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{company.city}</span>
                  </div>
                  {company.area && (
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5"></div>
                      <span className="text-sm text-gray-600">المنطقة: {company.area}</span>
                    </div>
                  )}
                  {company.address && (
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5"></div>
                      <span className="text-sm text-gray-600">العنوان: {company.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* أنواع الأعمال */}
              {company.businessType.length > 0 && (
                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">أنواع الأعمال</h3>
                  <div className="flex flex-wrap gap-2">
                    {company.businessType.map((type, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* التخصصات */}
              {company.specialties.length > 0 && (
                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">التخصصات</h3>
                  <div className="flex flex-wrap gap-2">
                    {company.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* نافذة تأكيد الحذف */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-w-md rounded-lg bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">تأكيد حذف الشركة</h3>
              <p className="mb-6 text-sm text-gray-600">
                هل أنت متأكد من حذف شركة &quot;{company?.name}&quot;؟ هذا الإجراء لا يمكن التراجع
                عنه.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading === 'delete'}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading === 'delete' ? 'جاري الحذف...' : 'حذف'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* نافذة تأكيد التعليق */}
        {showSuspendConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-w-md rounded-lg bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">تأكيد تعليق الشركة</h3>
              <p className="mb-6 text-sm text-gray-600">
                هل أنت متأكد من تعليق شركة &quot;{company?.name}&quot; مؤقتاً؟ يمكنك إعادة تفعيلها
                لاحقاً.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSuspendConfirm(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSuspend}
                  disabled={actionLoading === 'suspend'}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  {actionLoading === 'suspend' ? 'جاري التعليق...' : 'تعليق'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyDashboardPage;
