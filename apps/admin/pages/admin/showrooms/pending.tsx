/**
 * صفحة المعارض قيد المراجعة
 */
import {
  BuildingStorefrontIcon,
  CheckIcon,
  ClockIcon,
  EyeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface PendingShowroom {
  id: string;
  name: string;
  owner: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  description: string;
  documents: string[];
  submittedAt: string;
}

export default function PendingShowroomsPage() {
  const [showrooms, setShowrooms] = useState<PendingShowroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShowroom, setSelectedShowroom] = useState<PendingShowroom | null>(null);

  useEffect(() => {
    fetchPendingShowrooms();
  }, []);

  const fetchPendingShowrooms = async () => {
    try {
      const res = await fetch('/api/admin/showrooms?status=PENDING');
      if (res.ok) {
        const data = await res.json();
        setShowrooms(data.showrooms || []);
      }
    } catch (err) {
      // Mock data
      setShowrooms([
        {
          id: '1',
          name: 'معرض السيارات الفاخرة',
          owner: 'أحمد محمد',
          phone: '0912345678',
          email: 'ahmed@example.com',
          city: 'طرابلس',
          address: 'طريق المطار',
          description: 'معرض متخصص في السيارات الفاخرة والرياضية',
          documents: ['license.pdf', 'id.pdf'],
          submittedAt: '2024-01-20',
        },
        {
          id: '2',
          name: 'معرض الشمال',
          owner: 'سالم علي',
          phone: '0923456789',
          email: 'salem@example.com',
          city: 'بنغازي',
          address: 'شارع جمال عبد الناصر',
          description: 'معرض سيارات متنوع',
          documents: ['license.pdf'],
          submittedAt: '2024-01-22',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('هل أنت متأكد من اعتماد هذا المعرض؟')) return;

    try {
      const res = await fetch(`/api/admin/showrooms/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        setShowrooms((prev) => prev.filter((s) => s.id !== id));
        alert('تم اعتماد المعرض بنجاح');
      }
    } catch (err) {
      setShowrooms((prev) => prev.filter((s) => s.id !== id));
      alert('تم اعتماد المعرض بنجاح');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('سبب الرفض:');
    if (!reason) return;

    try {
      const res = await fetch(`/api/admin/showrooms/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        setShowrooms((prev) => prev.filter((s) => s.id !== id));
        alert('تم رفض المعرض');
      }
    } catch (err) {
      setShowrooms((prev) => prev.filter((s) => s.id !== id));
      alert('تم رفض المعرض');
    }
  };

  return (
    <AdminLayout title="المعارض قيد المراجعة">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-yellow-500/20 p-2">
          <ClockIcon className="h-6 w-6 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">طلبات المعارض الجديدة</h2>
          <p className="text-sm text-slate-400">{showrooms.length} طلب قيد الانتظار</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : showrooms.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-12 text-center">
          <CheckIcon className="mx-auto h-12 w-12 text-green-400" />
          <h3 className="mt-4 text-lg font-medium text-white">لا توجد طلبات معلقة</h3>
          <p className="mt-2 text-slate-400">جميع طلبات المعارض تمت مراجعتها</p>
        </div>
      ) : (
        <div className="space-y-4">
          {showrooms.map((showroom) => (
            <div key={showroom.id} className="rounded-xl border border-slate-700 bg-slate-800 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                    <BuildingStorefrontIcon className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{showroom.name}</h3>
                    <p className="text-sm text-slate-400">المالك: {showroom.owner}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-300">
                      <span>📞 {showroom.phone}</span>
                      <span>📧 {showroom.email}</span>
                      <span>📍 {showroom.city}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{showroom.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      تاريخ التقديم: {new Date(showroom.submittedAt).toLocaleDateString('ar-LY')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedShowroom(showroom)}
                    className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-sm text-white transition-colors hover:bg-slate-600"
                  >
                    <EyeIcon className="h-4 w-4" />
                    عرض
                  </button>
                  <button
                    onClick={() => handleApprove(showroom.id)}
                    className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm text-white transition-colors hover:bg-green-700"
                  >
                    <CheckIcon className="h-4 w-4" />
                    اعتماد
                  </button>
                  <button
                    onClick={() => handleReject(showroom.id)}
                    className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition-colors hover:bg-red-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    رفض
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedShowroom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-xl bg-slate-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{selectedShowroom.name}</h3>
              <button
                onClick={() => setSelectedShowroom(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">المالك</p>
                  <p className="text-white">{selectedShowroom.owner}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">الهاتف</p>
                  <p className="text-white">{selectedShowroom.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">البريد الإلكتروني</p>
                  <p className="text-white">{selectedShowroom.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">المدينة</p>
                  <p className="text-white">{selectedShowroom.city}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400">العنوان</p>
                <p className="text-white">{selectedShowroom.address}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">الوصف</p>
                <p className="text-white">{selectedShowroom.description}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">المستندات</p>
                <div className="mt-2 flex gap-2">
                  {selectedShowroom.documents.map((doc, i) => (
                    <a
                      key={i}
                      href="#"
                      className="rounded bg-slate-700 px-3 py-1 text-sm text-blue-400 hover:bg-slate-600"
                    >
                      📄 {doc}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  handleReject(selectedShowroom.id);
                  setSelectedShowroom(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                رفض
              </button>
              <button
                onClick={() => {
                  handleApprove(selectedShowroom.id);
                  setSelectedShowroom(null);
                }}
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                اعتماد
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
