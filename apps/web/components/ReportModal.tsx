import React, { useState } from 'react';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import FlagIcon from '@heroicons/react/24/outline/FlagIcon';
import ShieldExclamationIcon from '@heroicons/react/24/outline/ShieldExclamationIcon';
import UserMinusIcon from '@heroicons/react/24/outline/UserMinusIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'message' | 'user' | 'conversation';
  targetId: string;
  targetName?: string;
  onSubmit: (reportData: ReportData) => void;
}

interface ReportData {
  type: string;
  reason: string;
  description: string;
  evidence?: string;
}

const REPORT_TYPES = {
  message: [
    { id: 'spam', label: 'رسائل مزعجة', icon: FlagIcon },
    { id: 'harassment', label: 'تحرش أو إساءة', icon: ShieldExclamationIcon },
    {
      id: 'inappropriate',
      label: 'محتوى غير مناسب',
      icon: ExclamationTriangleIcon,
    },
    { id: 'scam', label: 'احتيال أو نصب', icon: UserMinusIcon },
    { id: 'fake', label: 'معلومات مضللة', icon: DocumentTextIcon },
  ],
  user: [
    { id: 'fake_profile', label: 'حساب وهمي', icon: UserMinusIcon },
    { id: 'harassment', label: 'تحرش مستمر', icon: ShieldExclamationIcon },
    { id: 'scammer', label: 'محتال', icon: ExclamationTriangleIcon },
    { id: 'spam_user', label: 'مرسل رسائل مزعجة', icon: FlagIcon },
  ],
  conversation: [
    {
      id: 'inappropriate_content',
      label: 'محتوى غير مناسب',
      icon: ExclamationTriangleIcon,
    },
    { id: 'spam_conversation', label: 'محادثة مزعجة', icon: FlagIcon },
    {
      id: 'harassment_conversation',
      label: 'تحرش في المحادثة',
      icon: ShieldExclamationIcon,
    },
  ],
};

const REPORT_REASONS = {
  spam: [
    'رسائل متكررة غير مرغوب فيها',
    'إعلانات غير مصرح بها',
    'رسائل تلقائية',
    'محتوى ترويجي مفرط',
  ],
  harassment: ['تهديدات أو وعيد', 'إساءة لفظية', 'تحرش جنسي', 'تنمر أو مضايقة'],
  inappropriate: ['محتوى جنسي صريح', 'عنف أو محتوى مؤذي', 'خطاب كراهية', 'محتوى غير قانوني'],
  scam: ['محاولة احتيال مالي', 'بيع منتجات وهمية', 'طلب معلومات شخصية', 'عروض مشبوهة'],
  fake: ['معلومات كاذبة عن المنتج', 'هوية مزيفة', 'مراجعات مفبركة', 'ادعاءات كاذبة'],
  fake_profile: ['استخدام صور شخص آخر', 'معلومات شخصية مزيفة', 'حساب مكرر', 'انتحال شخصية'],
  scammer: [
    'محاولات احتيال متكررة',
    'بيع منتجات غير موجودة',
    'طلب دفعات مقدمة مشبوهة',
    'استغلال المشترين',
  ],
  spam_user: [
    'إرسال رسائل مزعجة لعدة مستخدمين',
    'نشر إعلانات غير مصرح بها',
    'سلوك مزعج مستمر',
    'انتهاك قواعد المنصة',
  ],
};

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  onSubmit,
}) => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportTypes = REPORT_TYPES[targetType] || [];
  const reasons = selectedType ? REPORT_REASONS[selectedType] || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType || !selectedReason || !description.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        type: selectedType,
        reason: selectedReason,
        description: description.trim(),
        evidence: evidence.trim() || undefined,
      });

      // إعادة تعيين النموذج
      setSelectedType('');
      setSelectedReason('');
      setDescription('');
      setEvidence('');
      onClose();
    } catch (error) {
      console.error('خطأ في إرسال البلاغ:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* رأس النافذة */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlagIcon className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              إبلاغ عن{' '}
              {targetType === 'message' ? 'رسالة' : targetType === 'user' ? 'مستخدم' : 'محادثة'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {targetName && (
          <div className="mb-4 rounded-lg bg-gray-50 p-3">
            <p className="text-sm text-gray-600">
              الإبلاغ عن: <span className="font-medium text-gray-900">{targetName}</span>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* نوع البلاغ */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">نوع البلاغ</label>
            <div className="space-y-2">
              {reportTypes.map((type) => (
                <label
                  key={type.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    selectedType === type.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={type.id}
                    checked={selectedType === type.id}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setSelectedReason(''); // إعادة تعيين السبب
                    }}
                    className="text-red-600"
                  />
                  <type.icon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* السبب التفصيلي */}
          {selectedType && reasons.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">السبب التفصيلي</label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">اختر السبب...</option>
                {reasons.map((reason, index) => (
                  <option key={index} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* الوصف */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              وصف المشكلة <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اشرح المشكلة بالتفصيل..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* الأدلة الإضافية */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              أدلة إضافية (اختياري)
            </label>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="أي معلومات إضافية أو أدلة تدعم البلاغ..."
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* تحذير */}
          <div className="rounded-lg bg-yellow-50 p-3">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 text-yellow-600" />
              <p className="text-xs text-yellow-800">
                البلاغات الكاذبة قد تؤدي إلى اتخاذ إجراءات ضد حسابك. تأكد من صحة المعلومات المقدمة.
              </p>
            </div>
          </div>

          {/* أزرار الإجراء */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!selectedType || !selectedReason || !description.trim() || isSubmitting}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال البلاغ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
