import React, { useState } from 'react';

export type PriceStrategy = 'current' | 'starting';

export interface RelistOptions {
  startDelayHours: number;
  durationDays: number;
  priceStrategy: PriceStrategy;
}

interface RelistOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (opts: RelistOptions) => void;
}

const RelistOptionsModal: React.FC<RelistOptionsModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [startDelayHours, setStartDelayHours] = useState<number>(1);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [priceStrategy, setPriceStrategy] = useState<PriceStrategy>('current');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const safeDelay = Number.isFinite(startDelayHours) && startDelayHours >= 0 ? startDelayHours : 1;
    const safeDuration = Number.isFinite(durationDays) && durationDays > 0 ? durationDays : 7;
    onConfirm({ startDelayHours: safeDelay, durationDays: safeDuration, priceStrategy });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
        <h3 className="mb-2 text-sm font-bold text-slate-900">إعادة طرح المزاد</h3>
        <p className="mb-3 text-xs text-slate-600">
          حدّد خيارات إعادة الطرح. يمكنك بدء المزاد بعد مدة محددة وبمدة زمنية جديدة، مع اختيار استراتيجية السعر.
        </p>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">يبدأ بعد</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step={1}
                value={startDelayHours}
                onChange={(e) => setStartDelayHours(parseInt(e.target.value || '0', 10))}
                className="w-24 rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
              />
              <span className="text-xs text-slate-600">ساعة</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">مدة المزاد</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                step={1}
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value || '0', 10))}
                className="w-24 rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
              />
              <span className="text-xs text-slate-600">أيام</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">استراتيجية السعر</label>
            <select
              value={priceStrategy}
              onChange={(e) => setPriceStrategy(e.target.value as PriceStrategy)}
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="current">استخدم السعر الحالي كنقطة بداية</option>
              <option value="starting">استخدم سعر البداية الأصلي</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            تأكيد إعادة الطرح
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-md bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelistOptionsModal;
