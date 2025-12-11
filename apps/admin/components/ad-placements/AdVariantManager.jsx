import { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  TrophyIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function AdVariantManager({ placementAdId }) {
  const [variants, setVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    variantName: '',
    title: '',
    description: '',
    imageUrl: '',
    weight: 50,
  });

  useEffect(() => {
    if (placementAdId) {
      fetchVariants();
    }
  }, [placementAdId]);

  const fetchVariants = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/ad-variants?placementAdId=${placementAdId}`);
      if (res.ok) {
        const data = await res.json();
        setVariants(data.variants || []);
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVariant = async () => {
    try {
      const res = await fetch('/api/admin/ad-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placementAdId,
          ...newVariant,
        }),
      });

      if (res.ok) {
        fetchVariants();
        setShowAddForm(false);
        setNewVariant({
          variantName: '',
          title: '',
          description: '',
          imageUrl: '',
          weight: 50,
        });
      } else {
        const err = await res.json();
        alert(err.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error adding variant:', error);
      alert('حدث خطأ');
    }
  };

  const handleDeleteVariant = async (id) => {
    if (!confirm('هل تريد حذف هذا المتغير؟')) return;

    try {
      const res = await fetch(`/api/admin/ad-variants/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchVariants();
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
    }
  };

  const handleSetWinner = async (id) => {
    try {
      const res = await fetch(`/api/admin/ad-variants/${id}/set-winner`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchVariants();
      }
    } catch (error) {
      console.error('Error setting winner:', error);
    }
  };

  const calculateCTR = (variant) => {
    if (variant.impressions === 0) return 0;
    return ((variant.clicks / variant.impressions) * 100).toFixed(2);
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-amber-500" />
          <h3 className="font-bold text-white">اختبار A/B</h3>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-bold text-white hover:bg-amber-600"
        >
          <PlusIcon className="h-4 w-4" />
          إضافة متغير
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 rounded-lg border border-slate-700 bg-slate-700/50 p-4">
          <h4 className="mb-3 text-sm font-bold text-white">متغير جديد</h4>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-400">اسم المتغير</label>
                <input
                  type="text"
                  placeholder="مثال: A, B, C"
                  value={newVariant.variantName}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, variantName: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">الوزن (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newVariant.weight}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, weight: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">العنوان</label>
              <input
                type="text"
                value={newVariant.title}
                onChange={(e) => setNewVariant({ ...newVariant, title: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddVariant}
                disabled={!newVariant.variantName}
                className="flex-1 rounded-lg bg-green-500 py-2 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-50"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 rounded-lg bg-slate-600 py-2 text-sm font-bold text-white hover:bg-slate-500"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      ) : variants.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-700/30 p-6 text-center">
          <p className="text-sm text-slate-400">لا توجد متغيرات. أضف متغيرات لبدء اختبار A/B</p>
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className={`rounded-lg border p-3 ${
                variant.isWinner
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-700 bg-slate-700/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white">{variant.variantName}</h4>
                    {variant.isWinner && (
                      <span className="flex items-center gap-1 rounded bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                        <TrophyIcon className="h-3 w-3" />
                        الفائز
                      </span>
                    )}
                    <span className="rounded bg-slate-600 px-2 py-0.5 text-xs text-white">
                      {variant.weight}%
                    </span>
                  </div>
                  {variant.title && (
                    <p className="mt-1 text-sm text-slate-300">{variant.title}</p>
                  )}
                  <div className="mt-2 flex gap-4 text-xs text-slate-400">
                    <span>ظهور: {variant.impressions.toLocaleString()}</span>
                    <span>نقرات: {variant.clicks.toLocaleString()}</span>
                    <span className="font-bold text-amber-500">
                      CTR: {calculateCTR(variant)}%
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!variant.isWinner && (
                    <button
                      type="button"
                      onClick={() => handleSetWinner(variant.id)}
                      className="rounded bg-green-500/20 p-1 text-green-400 hover:bg-green-500/30"
                      title="تحديد كفائز"
                    >
                      <TrophyIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteVariant(variant.id)}
                    className="rounded bg-red-500/20 p-1 text-red-400 hover:bg-red-500/30"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
