/**
 * صفحة إدارة كروت الشحن - ليبيانا ومدار
 * Recharge Cards Management Page
 */
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

type CardProvider = 'ALL' | 'LIBYANA' | 'MADAR';
type CardStatus = 'ALL' | 'AVAILABLE' | 'USED' | 'EXPIRED' | 'DISABLED';

interface RechargeCard {
  id: string;
  cardNumberMasked: string;
  provider: 'LIBYANA' | 'MADAR';
  denomination: number;
  value: number;
  status: 'AVAILABLE' | 'USED' | 'RESERVED' | 'EXPIRED' | 'DISABLED';
  batchId: string | null;
  serialNumber: string | null;
  usedBy: string | null;
  usedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface CardStats {
  LIBYANA: { available: number; used: number; totalValue: number; usedValue: number };
  MADAR: { available: number; used: number; totalValue: number; usedValue: number };
}

interface NewCard {
  cardNumber: string;
  denomination: number;
  value: number;
  serialNumber?: string;
  expiresAt?: string;
}

export default function RechargeCardsPage() {
  const [cards, setCards] = useState<RechargeCard[]>([]);
  const [stats, setStats] = useState<CardStats>({
    LIBYANA: { available: 0, used: 0, totalValue: 0, usedValue: 0 },
    MADAR: { available: 0, used: 0, totalValue: 0, usedValue: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState<CardProvider>('ALL');
  const [statusFilter, setStatusFilter] = useState<CardStatus>('ALL');

  // Modal إضافة كروت
  const [showAddModal, setShowAddModal] = useState(false);
  const [addProvider, setAddProvider] = useState<'LIBYANA' | 'MADAR'>('LIBYANA');
  const [batchNumber, setBatchNumber] = useState('');
  const [batchNotes, setBatchNotes] = useState('');
  const [newCards, setNewCards] = useState<NewCard[]>([
    { cardNumber: '', denomination: 10, value: 10 },
  ]);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkDenomination, setBulkDenomination] = useState(10);
  const [addLoading, setAddLoading] = useState(false);
  const [addResult, setAddResult] = useState<{
    success: boolean;
    message: string;
    errors?: any[];
  } | null>(null);

  useEffect(() => {
    fetchCards();
  }, [providerFilter, statusFilter]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(providerFilter !== 'ALL' && { provider: providerFilter }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      });

      const res = await fetch(`/api/admin/wallets/recharge-cards?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCards(data.cards || []);
          if (data.stats) setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCards = async () => {
    let cardsToAdd: NewCard[] = [];

    if (bulkMode) {
      // تحليل النص المجمع
      const lines = bulkText.split('\n').filter((line) => line.trim());
      cardsToAdd = lines.map((line) => ({
        cardNumber: line.trim(),
        denomination: bulkDenomination,
        value: bulkDenomination,
      }));
    } else {
      cardsToAdd = newCards.filter((c) => c.cardNumber.trim());
    }

    if (cardsToAdd.length === 0) {
      setAddResult({ success: false, message: 'يجب إضافة كرت واحد على الأقل' });
      return;
    }

    setAddLoading(true);
    setAddResult(null);

    try {
      const res = await fetch('/api/admin/wallets/recharge-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cards: cardsToAdd,
          provider: addProvider,
          batchNumber: batchNumber || undefined,
          notes: batchNotes || undefined,
        }),
      });

      const data = await res.json();
      setAddResult({
        success: data.success,
        message: data.message,
        errors: data.errors,
      });

      if (data.success) {
        fetchCards();
        // إعادة تعيين النموذج
        setNewCards([{ cardNumber: '', denomination: 10, value: 10 }]);
        setBulkText('');
        setBatchNumber('');
        setBatchNotes('');
      }
    } catch (err) {
      setAddResult({ success: false, message: 'حدث خطأ في الاتصال' });
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكرت؟')) return;

    try {
      const res = await fetch(`/api/admin/wallets/recharge-cards?id=${cardId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCards((prev) => prev.filter((c) => c.id !== cardId));
      }
    } catch (err) {
      alert('فشل في حذف الكرت');
    }
  };

  const addNewCardRow = () => {
    setNewCards([...newCards, { cardNumber: '', denomination: 10, value: 10 }]);
  };

  const updateCardRow = (index: number, field: keyof NewCard, value: string | number) => {
    const updated = [...newCards];
    updated[index] = { ...updated[index], [field]: value };
    // تحديث القيمة تلقائياً إذا تم تغيير الفئة
    if (field === 'denomination') {
      updated[index].value = value as number;
    }
    setNewCards(updated);
  };

  const removeCardRow = (index: number) => {
    if (newCards.length > 1) {
      setNewCards(newCards.filter((_, i) => i !== index));
    }
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      AVAILABLE: {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        label: 'متاح',
        icon: CheckCircleIcon,
      },
      USED: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'مستخدم', icon: CheckCircleIcon },
      RESERVED: {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-400',
        label: 'محجوز',
        icon: ExclamationCircleIcon,
      },
      EXPIRED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'منتهي', icon: XCircleIcon },
      DISABLED: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'معطل', icon: XCircleIcon },
    };
    const s = statuses[status] || statuses.AVAILABLE;
    const Icon = s.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${s.bg} ${s.text}`}
      >
        <Icon className="h-3 w-3" />
        {s.label}
      </span>
    );
  };

  const getProviderBadge = (provider: string) => {
    if (provider === 'LIBYANA') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">
          📱 ليبيانا
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-1 text-xs font-medium text-orange-400">
        📱 مدار
      </span>
    );
  };

  const filteredCards = cards.filter(
    (card) => card.cardNumberMasked.includes(searchTerm) || card.serialNumber?.includes(searchTerm),
  );

  const totalAvailable = stats.LIBYANA.available + stats.MADAR.available;
  const totalUsed = stats.LIBYANA.used + stats.MADAR.used;
  const totalValue = stats.LIBYANA.totalValue + stats.MADAR.totalValue;

  return (
    <AdminLayout title="إدارة كروت الشحن">
      {/* إحصائيات */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* ليبيانا - متاح */}
        <div className="rounded-xl border border-red-500/30 bg-gradient-to-br from-red-900/20 to-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/20 p-2">
              <CreditCardIcon className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stats.LIBYANA.available}</p>
              <p className="text-xs text-slate-400">ليبيانا - متاح</p>
            </div>
          </div>
        </div>

        {/* ليبيانا - مستخدم */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2">
              <CheckCircleIcon className="h-5 w-5 text-red-300" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stats.LIBYANA.used}</p>
              <p className="text-xs text-slate-400">ليبيانا - مستخدم</p>
            </div>
          </div>
        </div>

        {/* مدار - متاح */}
        <div className="rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/20 p-2">
              <CreditCardIcon className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stats.MADAR.available}</p>
              <p className="text-xs text-slate-400">مدار - متاح</p>
            </div>
          </div>
        </div>

        {/* مدار - مستخدم */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/10 p-2">
              <CheckCircleIcon className="h-5 w-5 text-orange-300" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stats.MADAR.used}</p>
              <p className="text-xs text-slate-400">مدار - مستخدم</p>
            </div>
          </div>
        </div>

        {/* إجمالي متاح */}
        <div className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-900/20 to-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <CreditCardIcon className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{totalAvailable}</p>
              <p className="text-xs text-slate-400">إجمالي متاح</p>
            </div>
          </div>
        </div>

        {/* القيمة الإجمالية */}
        <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <CreditCardIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{totalValue.toLocaleString()} د.ل</p>
              <p className="text-xs text-slate-400">القيمة المتاحة</p>
            </div>
          </div>
        </div>
      </div>

      {/* شريط الأدوات */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* البحث */}
          <div className="relative min-w-[200px]">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="البحث برقم الكرت..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 py-2 pl-4 pr-10 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* الفلاتر */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-slate-400" />
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value as CardProvider)}
              className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white"
            >
              <option value="ALL">جميع المزودين</option>
              <option value="LIBYANA">ليبيانا</option>
              <option value="MADAR">مدار</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CardStatus)}
              className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white"
            >
              <option value="ALL">جميع الحالات</option>
              <option value="AVAILABLE">متاح</option>
              <option value="USED">مستخدم</option>
              <option value="EXPIRED">منتهي</option>
              <option value="DISABLED">معطل</option>
            </select>
          </div>

          {/* تحديث */}
          <button
            onClick={fetchCards}
            className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600"
          >
            <ArrowPathIcon className="h-4 w-4" />
            تحديث
          </button>
        </div>

        {/* زر إضافة */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <PlusIcon className="h-5 w-5" />
          إضافة كروت
        </button>
      </div>

      {/* جدول الكروت */}
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="py-12 text-center">
            <CreditCardIcon className="mx-auto h-12 w-12 text-slate-500" />
            <p className="mt-2 text-slate-400">لا توجد كروت</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
            >
              <PlusIcon className="h-4 w-4" />
              إضافة كروت جديدة
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="border-b border-slate-700 bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    رقم الكرت
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    المزود
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">الفئة</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    القيمة
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    الحالة
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    تاريخ الإضافة
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredCards.map((card) => (
                  <tr key={card.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <span className="font-mono text-white">{card.cardNumberMasked}</span>
                      {card.serialNumber && (
                        <p className="text-xs text-slate-500">SN: {card.serialNumber}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">{getProviderBadge(card.provider)}</td>
                    <td className="px-4 py-3 text-white">{card.denomination} د.ل</td>
                    <td className="px-4 py-3 font-medium text-green-400">{card.value} د.ل</td>
                    <td className="px-4 py-3">{getStatusBadge(card.status)}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(card.createdAt).toLocaleDateString('ar-LY')}
                    </td>
                    <td className="px-4 py-3">
                      {card.status === 'AVAILABLE' && (
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="rounded bg-red-600/20 p-1.5 text-red-400 hover:bg-red-600/40"
                          title="حذف"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                      {card.status === 'USED' && card.usedAt && (
                        <span className="text-xs text-slate-500">
                          {new Date(card.usedAt).toLocaleDateString('ar-LY')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal إضافة كروت */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-800">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-slate-800 p-4">
              <h3 className="text-lg font-semibold text-white">إضافة كروت شحن</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddResult(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4 p-4">
              {/* اختيار المزود */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">مزود الخدمة</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setAddProvider('LIBYANA')}
                    className={`flex-1 rounded-lg border-2 p-4 text-center transition-all ${
                      addProvider === 'LIBYANA'
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-2xl">📱</span>
                    <p
                      className={`mt-1 font-medium ${addProvider === 'LIBYANA' ? 'text-red-400' : 'text-white'}`}
                    >
                      ليبيانا
                    </p>
                  </button>
                  <button
                    onClick={() => setAddProvider('MADAR')}
                    className={`flex-1 rounded-lg border-2 p-4 text-center transition-all ${
                      addProvider === 'MADAR'
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-2xl">📱</span>
                    <p
                      className={`mt-1 font-medium ${addProvider === 'MADAR' ? 'text-orange-400' : 'text-white'}`}
                    >
                      مدار
                    </p>
                  </button>
                </div>
              </div>

              {/* معلومات الدفعة */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">رقم الدفعة (اختياري)</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="مثال: BATCH-001"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">ملاحظات (اختياري)</label>
                  <input
                    type="text"
                    value={batchNotes}
                    onChange={(e) => setBatchNotes(e.target.value)}
                    placeholder="ملاحظات عن الدفعة"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* طريقة الإدخال */}
              <div className="flex gap-4 rounded-lg bg-slate-700/50 p-2">
                <button
                  onClick={() => setBulkMode(false)}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    !bulkMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  إدخال فردي
                </button>
                <button
                  onClick={() => setBulkMode(true)}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    bulkMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  إدخال مجمع
                </button>
              </div>

              {bulkMode ? (
                /* الإدخال المجمع */
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">فئة الكروت (د.ل)</label>
                    <select
                      value={bulkDenomination}
                      onChange={(e) => setBulkDenomination(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                    >
                      <option value={5}>5 د.ل</option>
                      <option value={10}>10 د.ل</option>
                      <option value={15}>15 د.ل</option>
                      <option value={20}>20 د.ل</option>
                      <option value={30}>30 د.ل</option>
                      <option value={50}>50 د.ل</option>
                      <option value={100}>100 د.ل</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">
                      أرقام الكروت (كل رقم في سطر)
                    </label>
                    <textarea
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder={`123456789012\n234567890123\n345678901234`}
                      rows={8}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 font-mono text-white"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      {bulkText.split('\n').filter((l) => l.trim()).length} كرت
                    </p>
                  </div>
                </div>
              ) : (
                /* الإدخال الفردي */
                <div className="space-y-3">
                  <label className="block text-sm text-slate-400">الكروت</label>
                  {newCards.map((card, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={card.cardNumber}
                        onChange={(e) => updateCardRow(index, 'cardNumber', e.target.value)}
                        placeholder="رقم الكرت"
                        className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 font-mono text-white"
                      />
                      <select
                        value={card.denomination}
                        onChange={(e) =>
                          updateCardRow(index, 'denomination', Number(e.target.value))
                        }
                        className="w-24 rounded-lg border border-slate-600 bg-slate-700 px-2 py-2 text-white"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      {newCards.length > 1 && (
                        <button
                          onClick={() => removeCardRow(index)}
                          className="rounded-lg bg-red-600/20 px-2 text-red-400 hover:bg-red-600/40"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addNewCardRow}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-600 py-2 text-sm text-slate-400 hover:border-slate-500 hover:text-white"
                  >
                    <PlusIcon className="h-4 w-4" />
                    إضافة كرت آخر
                  </button>
                </div>
              )}

              {/* نتيجة الإضافة */}
              {addResult && (
                <div
                  className={`rounded-lg p-4 ${
                    addResult.success
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  <p className="font-medium">{addResult.message}</p>
                  {addResult.errors && addResult.errors.length > 0 && (
                    <ul className="mt-2 text-sm">
                      {addResult.errors.map((err, i) => (
                        <li key={i}>
                          • {err.cardNumber}: {err.error}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-700 bg-slate-800 p-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddResult(null);
                }}
                className="rounded-lg border border-slate-600 px-4 py-2 text-white hover:bg-slate-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddCards}
                disabled={addLoading}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {addLoading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4" />
                    إضافة الكروت
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
