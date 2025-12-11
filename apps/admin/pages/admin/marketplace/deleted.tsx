/**
 * صفحة الإعلانات المحذوفة - السوق الفوري
 * Deleted Marketplace Listings Page
 */
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import {
  SimpleToast,
  UnifiedImage,
  UnifiedSearch,
  UnifiedStats,
  UnifiedTable,
  formatPrice,
  parseImages,
  useSearchFilter,
  type TableColumn,
} from '../../../components/unified';

interface DeletedListing {
  id: string;
  title: string;
  seller: string;
  sellerId?: string;
  price: number;
  category: string;
  status: string;
  featured: boolean;
  views: number;
  createdAt: string;
  deletedAt?: string;
  images?: string[];
}

export default function DeletedMarketplacePage() {
  const [listings, setListings] = useState<DeletedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal states
  const [restoreModal, setRestoreModal] = useState<{
    open: boolean;
    listing: DeletedListing | null;
  }>({
    open: false,
    listing: null,
  });
  const [permanentDeleteModal, setPermanentDeleteModal] = useState<{
    open: boolean;
    listing: DeletedListing | null;
  }>({
    open: false,
    listing: null,
  });

  // استخدام hook البحث والفلترة الموحد
  const { searchValue, setSearchValue, filteredData } = useSearchFilter({
    data: listings,
    searchFields: ['title', 'seller'],
    initialFilters: {},
  });

  // جلب الإعلانات المحذوفة
  const fetchDeletedListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/marketplace?deleted=true');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.listings) {
          setListings(
            data.listings.map(
              (item: {
                id: string;
                title: string;
                seller: string;
                price: number;
                category: string;
                status: string;
                featured: boolean;
                views: number;
                createdAt: string;
                deletedAt?: string;
                images?: string | string[];
              }) => ({
                id: item.id,
                title: item.title || 'بدون عنوان',
                seller: item.seller || 'غير معروف',
                price: item.price || 0,
                category: item.category || 'سيارات',
                status: item.status,
                featured: item.featured || false,
                views: item.views || 0,
                images: parseImages(item.images),
                createdAt: item.createdAt
                  ? new Date(item.createdAt).toISOString().split('T')[0]
                  : '-',
                deletedAt: item.deletedAt
                  ? new Date(item.deletedAt).toLocaleDateString('ar-LY', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '-',
              }),
            ),
          );
        }
      }
    } catch (err) {
      console.error('Failed to fetch deleted listings:', err);
      setToast({ text: 'فشل تحميل الإعلانات المحذوفة', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeletedListings();
  }, [fetchDeletedListings]);

  // استعادة إعلان
  const handleRestore = async () => {
    if (!restoreModal.listing) return;

    setActionLoading(restoreModal.listing.id);
    try {
      const res = await fetch(
        `/api/admin/marketplace?id=${restoreModal.listing.id}&action=restore`,
        {
          method: 'PATCH',
        },
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setListings((prev) => prev.filter((l) => l.id !== restoreModal.listing?.id));
        setToast({ text: 'تم استعادة الإعلان بنجاح', type: 'success' });
      } else {
        setToast({ text: data.message || 'فشل في استعادة الإعلان', type: 'error' });
      }
    } catch (error) {
      console.error('Restore error:', error);
      setToast({ text: 'حدث خطأ أثناء الاستعادة', type: 'error' });
    } finally {
      setActionLoading(null);
      setRestoreModal({ open: false, listing: null });
    }
  };

  // حذف نهائي
  const handlePermanentDelete = async () => {
    if (!permanentDeleteModal.listing) return;

    setActionLoading(permanentDeleteModal.listing.id);
    try {
      const res = await fetch(
        `/api/admin/marketplace?id=${permanentDeleteModal.listing.id}&permanent=true`,
        {
          method: 'DELETE',
        },
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setListings((prev) => prev.filter((l) => l.id !== permanentDeleteModal.listing?.id));
        setToast({ text: 'تم حذف الإعلان نهائياً', type: 'success' });
      } else {
        setToast({ text: data.message || 'فشل في الحذف النهائي', type: 'error' });
      }
    } catch (error) {
      console.error('Permanent delete error:', error);
      setToast({ text: 'حدث خطأ أثناء الحذف', type: 'error' });
    } finally {
      setActionLoading(null);
      setPermanentDeleteModal({ open: false, listing: null });
    }
  };

  // عرض الإعلان
  const handleView = (listing: DeletedListing) => {
    window.open(`http://localhost:3021/marketplace/${listing.id}`, '_blank');
  };

  // إحصائيات المحذوفات
  const stats = [
    {
      id: 'total-deleted',
      label: 'إجمالي المحذوفات',
      value: listings.length,
      icon: 'warning',
      color: 'red' as const,
    },
    {
      id: 'restorable',
      label: 'قابلة للاستعادة',
      value: listings.length,
      icon: 'active',
      color: 'emerald' as const,
    },
  ];

  // تعريف أعمدة الجدول
  const columns: TableColumn<DeletedListing>[] = [
    {
      id: 'product',
      header: 'الإعلان',
      accessor: 'title',
      type: 'custom',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <UnifiedImage
            src={row.images?.[0] || null}
            alt={row.title}
            config={{ size: 'sm', rounded: 'lg', fallbackIcon: 'car' }}
            showExtraCount={row.images && row.images.length > 1 ? row.images.length - 1 : undefined}
          />
          <div>
            <p className="font-medium text-white">{row.title}</p>
            <p className="text-xs text-slate-400">{row.category}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'seller',
      header: 'البائع',
      accessor: 'seller',
      type: 'text',
    },
    {
      id: 'price',
      header: 'السعر',
      accessor: 'price',
      type: 'custom',
      render: (value) => (
        <span className="font-medium text-emerald-400">{formatPrice(Number(value))}</span>
      ),
    },
    {
      id: 'deletedAt',
      header: 'تاريخ الحذف',
      accessor: 'deletedAt',
      type: 'custom',
      render: (value) => <span className="text-red-400">{String(value || '-')}</span>,
    },
    {
      id: 'createdAt',
      header: 'تاريخ الإنشاء',
      accessor: 'createdAt',
      type: 'date',
    },
    {
      id: 'actions',
      header: 'إجراءات',
      accessor: 'id',
      type: 'custom',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleView(row)}
            title="عرض الإعلان"
            className="rounded p-1.5 text-slate-400 transition-colors hover:bg-blue-500/20 hover:text-blue-400"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setRestoreModal({ open: true, listing: row })}
            disabled={actionLoading === row.id}
            title="استعادة الإعلان"
            className="rounded p-1.5 text-slate-400 transition-colors hover:bg-green-500/20 hover:text-green-400"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setPermanentDeleteModal({ open: true, listing: row })}
            disabled={actionLoading === row.id}
            title="حذف نهائي"
            className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="الإعلانات المحذوفة">
      {/* Toast */}
      <SimpleToast
        message={toast?.text || null}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Stats */}
      <UnifiedStats stats={stats} columns={2} className="mb-6" />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">الإعلانات المحذوفة</h2>
          <p className="text-sm text-slate-400">يمكنك استعادة الإعلانات أو حذفها نهائياً</p>
        </div>
        <Link
          href="/admin/marketplace"
          className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-white transition-colors hover:bg-slate-600"
        >
          العودة للإعلانات
        </Link>
      </div>

      {/* Search */}
      <UnifiedSearch
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="البحث في المحذوفات..."
        filters={[]}
        onRefresh={fetchDeletedListings}
        className="mb-6"
      />

      {/* Table */}
      <UnifiedTable
        columns={columns}
        data={filteredData}
        loading={loading}
        emptyMessage="لا توجد إعلانات محذوفة"
        sortable={true}
      />

      {/* Restore Confirmation Modal */}
      {restoreModal.open && restoreModal.listing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-green-500/20 p-3">
                <ArrowPathIcon className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">تأكيد الاستعادة</h3>
            </div>

            <p className="mb-2 text-slate-300">هل تريد استعادة هذا الإعلان؟</p>
            <p className="mb-6 rounded-lg bg-slate-700/50 p-3 text-sm text-white">
              {restoreModal.listing.title}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setRestoreModal({ open: false, listing: null })}
                className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white transition-colors hover:bg-slate-600"
              >
                إلغاء
              </button>
              <button
                onClick={handleRestore}
                disabled={actionLoading === restoreModal.listing.id}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading === restoreModal.listing.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    جاري الاستعادة...
                  </span>
                ) : (
                  'استعادة'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {permanentDeleteModal.open && permanentDeleteModal.listing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-red-500/20 p-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">تأكيد الحذف النهائي</h3>
            </div>

            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه!</p>
            </div>

            <p className="mb-2 text-slate-300">هل أنت متأكد من الحذف النهائي لهذا الإعلان؟</p>
            <p className="mb-6 rounded-lg bg-slate-700/50 p-3 text-sm text-white">
              {permanentDeleteModal.listing.title}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setPermanentDeleteModal({ open: false, listing: null })}
                className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white transition-colors hover:bg-slate-600"
              >
                إلغاء
              </button>
              <button
                onClick={handlePermanentDelete}
                disabled={actionLoading === permanentDeleteModal.listing.id}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === permanentDeleteModal.listing.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    جاري الحذف...
                  </span>
                ) : (
                  'حذف نهائي'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
