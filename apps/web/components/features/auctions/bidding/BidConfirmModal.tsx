import React from 'react';
import { ExclamationTriangleIcon, CheckIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface BidConfirmModalProps {
  open: boolean;
  amount: number;
  recommendedMin?: number;
  minIncrement?: number;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const formatNumber = (n: number | string) => {
  const v = typeof n === 'string' ? Number(String(n).replace(/,/g, '')) : n;
  if (!Number.isFinite(v)) return '0';
  return Math.floor(v as number).toLocaleString('en-US');
};

const BidConfirmModal: React.FC<BidConfirmModalProps> = ({
  open,
  amount,
  recommendedMin,
  minIncrement,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  // فحص ما إذا كان المبلغ أقل من الحد الأدنى المقترح
  const isBelowMinimum = typeof recommendedMin === 'number' && recommendedMin > 0 && amount < recommendedMin;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
            <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">تأكيد المزايدة</h3>
            <p className="text-sm text-gray-600">يرجى مراجعة تفاصيل المبلغ قبل المتابعة</p>
          </div>
          <button onClick={onCancel} className="ml-auto rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4 text-sm">
          {message && (
            <div className="rounded-lg bg-blue-50 p-3 text-blue-800">
              <InformationCircleIcon className="ml-1 inline h-4 w-4" /> {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="text-gray-500">المبلغ</div>
              <div className="text-lg font-bold text-gray-900">{formatNumber(amount)} <span className="text-sm">د.ل</span></div>
            </div>
            {typeof recommendedMin === 'number' && recommendedMin > 0 && (
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-gray-500">الحد الأدنى المقترح</div>
                <div className="text-lg font-bold text-gray-900">{formatNumber(recommendedMin)} <span className="text-sm">د.ل</span></div>
              </div>
            )}
          </div>

          {typeof minIncrement === 'number' && minIncrement > 0 && (
            <div className="rounded-lg bg-yellow-50 p-3 text-yellow-800">
              أقل زيادة مسموحة: <span className="font-semibold">{formatNumber(minIncrement)} د.ل</span>
            </div>
          )}

          {isBelowMinimum && (
            <div className="rounded-lg bg-red-50 p-3 text-red-800">
              <ExclamationTriangleIcon className="ml-1 inline h-4 w-4" />
              <strong>تنبيه:</strong> المبلغ أقل من الحد الأدنى المقترح ({formatNumber(recommendedMin || 0)} د.ل)
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-white"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={isBelowMinimum}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors ${
              isBelowMinimum
                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title={isBelowMinimum ? 'لا يمكن تأكيد المزايدة - المبلغ أقل من الحد الأدنى' : ''}
          >
            <CheckIcon className="h-4 w-4" /> تأكيد المزايدة
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidConfirmModal;
