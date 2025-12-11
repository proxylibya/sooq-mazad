import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';
import UnifiedActionsColumn, {
  ActionPresets,
} from '../../../../components/tables/UnifiedActionsColumn';
import {
  SimpleToast,
  UnifiedSearch,
  UnifiedStats,
  UnifiedTable,
  formatDate,
  getStatusClasses,
  getStatusConfig,
  useSearchFilter,
  type TableColumn,
} from '../../../../components/unified';

interface Campaign {
  id: string;
  name: string;
  status: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'REJECTED';
  startDate: string;
  endDate: string;
  user?: {
    name: string;
    email: string;
  };
  package?: {
    name: string;
  };
  ads?: any[];
  createdAt: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search and Filter Hook
  const { searchValue, setSearchValue, filters, setFilter, filteredData } = useSearchFilter({
    data: campaigns,
    searchFields: ['name', 'user.name', 'user.email'],
    initialFilters: { status: 'all' },
  });

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ads/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setMessage({ type: 'error', text: 'فشل تحميل الحملات' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ads/campaigns/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'تم حذف الحملة بنجاح' });
        fetchCampaigns();
      } else {
        setMessage({ type: 'error', text: data.message || 'فشل حذف الحملة' });
      }
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحذف' });
    } finally {
      setDeleteConfirm(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    // Toggle logic: ACTIVE -> PAUSED, PAUSED -> ACTIVE
    // For other statuses, we might want to just set to ACTIVE or PAUSED depending on context,
    // but usually toggle is for pause/resume.
    let newStatus = '';
    if (currentStatus === 'ACTIVE') newStatus = 'PAUSED';
    else if (currentStatus === 'PAUSED') newStatus = 'ACTIVE';
    else if (currentStatus === 'PENDING')
      newStatus = 'ACTIVE'; // Approve
    else return; // Can't toggle other statuses easily without a modal

    try {
      const res = await fetch(`/api/admin/ads/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          type: 'success',
          text: `تم تغيير حالة الحملة إلى ${newStatus === 'ACTIVE' ? 'نشط' : 'متوقف'}`,
        });
        fetchCampaigns();
      }
    } catch (err) {
      console.error('Failed to update campaign:', err);
      setMessage({ type: 'error', text: 'فشل تحديث الحالة' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  // Stats
  const stats = [
    {
      id: 'total',
      label: 'إجمالي الحملات',
      value: campaigns.length,
      color: 'blue' as const,
      icon: 'total',
    },
    {
      id: 'active',
      label: 'نشط',
      value: campaigns.filter((c) => c.status === 'ACTIVE').length,
      color: 'emerald' as const,
      icon: 'active',
    },
    {
      id: 'pending',
      label: 'معلق',
      value: campaigns.filter((c) => c.status === 'PENDING').length,
      color: 'amber' as const,
      icon: 'pending',
    },
    {
      id: 'expired',
      label: 'منتهية',
      value: campaigns.filter((c) => c.status === 'EXPIRED').length,
      color: 'red' as const,
      icon: 'warning',
    },
  ];

  const columns: TableColumn<Campaign>[] = [
    {
      id: 'campaign',
      header: 'الحملة',
      accessor: 'name',
      type: 'custom',
      render: (_, row) => (
        <div>
          <div className="font-bold text-white">{row.name}</div>
          <div className="text-xs text-slate-500">تم الإنشاء: {formatDate(row.createdAt)}</div>
        </div>
      ),
    },
    {
      id: 'advertiser',
      header: 'المعلن',
      accessor: 'user',
      type: 'custom',
      render: (_, row) => (
        <div>
          <div className="text-slate-300">{row.user?.name || 'غير معروف'}</div>
          <div className="text-xs text-slate-500">{row.user?.email}</div>
        </div>
      ),
    },
    {
      id: 'package',
      header: 'الباقة',
      accessor: 'package',
      type: 'custom',
      render: (_, row) => (
        <span className="rounded-lg bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-400">
          {row.package?.name || 'مخصص'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'الحالة',
      accessor: 'status',
      type: 'custom',
      render: (value) => {
        const status = String(value || '');
        const config = getStatusConfig(status);
        return (
          <span className={`rounded-full border px-2.5 py-1 text-xs ${getStatusClasses(status)}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      id: 'duration',
      header: 'المدة',
      accessor: 'startDate',
      type: 'custom',
      render: (_, row) => (
        <div className="text-slate-300">
          <div>من: {formatDate(row.startDate)}</div>
          <div className="text-xs text-slate-500">إلى: {formatDate(row.endDate)}</div>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      accessor: 'id',
      type: 'custom',
      sortable: false,
      render: (_, row) => (
        <UnifiedActionsColumn
          row={row}
          actions={ActionPresets.general({
            viewHref: (r) => `/admin/ads/campaigns/${r.id}`,
            editHref: (r) => `/admin/ads/campaigns/${r.id}/edit`,
            onDelete: (r) => setDeleteConfirm(r.id),
            extraActions: [
              {
                label: row.status === 'ACTIVE' ? 'إيقاف مؤقت' : 'تنشيط',
                onClick: () => handleStatusChange(row.id, row.status),
                icon:
                  row.status === 'ACTIVE' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                      />
                    </svg>
                  ),
                color: row.status === 'ACTIVE' ? 'text-yellow-500' : 'text-green-500',
              },
            ],
          })}
          onActionComplete={fetchCampaigns}
        />
      ),
    },
  ];

  return (
    <AdminLayout title="إدارة الحملات الإعلانية">
      {/* Toast Message */}
      <SimpleToast
        message={message?.text || null}
        type={message?.type}
        onClose={() => setMessage(null)}
      />

      {/* Stats */}
      <UnifiedStats stats={stats} columns={4} className="mb-6" />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">الحملات الإعلانية</h1>
          <p className="text-slate-400">إدارة ومتابعة جميع الحملات الإعلانية في المنصة</p>
        </div>
        <Link
          href="/admin/ads/campaigns/create"
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-white transition-colors hover:bg-amber-600"
        >
          <PlusIcon className="h-5 w-5" />
          حملة جديدة
        </Link>
      </div>

      {/* Search & Filter */}
      <UnifiedSearch
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="بحث باسم الحملة أو المعلن..."
        filters={[
          {
            id: 'status',
            label: 'الحالة',
            value: filters.status || 'all',
            onChange: (v) => setFilter('status', v),
            options: [
              { value: 'all', label: 'جميع الحالات' },
              { value: 'ACTIVE', label: 'نشط' },
              { value: 'PENDING', label: 'معلق' },
              { value: 'PAUSED', label: 'متوقف' },
              { value: 'EXPIRED', label: 'منتهي' },
              { value: 'REJECTED', label: 'مرفوض' },
            ],
          },
        ]}
        onRefresh={fetchCampaigns}
        className="mb-6"
      />

      {/* Table */}
      <UnifiedTable
        columns={columns}
        data={filteredData}
        loading={loading}
        emptyMessage="لا توجد حملات إعلانية حالياً"
        sortable={true}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h3 className="mb-4 text-lg font-bold text-white">تأكيد الحذف</h3>
            <p className="mb-6 text-slate-300">
              هل أنت متأكد من حذف هذه الحملة؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg bg-slate-700 px-4 py-2 text-white transition-colors hover:bg-slate-600"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
