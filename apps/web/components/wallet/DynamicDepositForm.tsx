import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface PaymentMethodData {
  id: string;
  name: string;
  nameAr: string;
  type: string;
  category: string;
  description: string | null;
  minAmount: number;
  maxAmount: number | null;
  processingTime: string | null;
  percentageFee: number;
  fixedFee: number;
  requiredFields: any;
  metadata: any;
}

interface DynamicDepositFormProps {
  paymentMethod: PaymentMethodData;
}

const DynamicDepositForm: React.FC<DynamicDepositFormProps> = ({ paymentMethod }) => {
  const [amount, setAmount] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // حساب الرسوم
  const calculateFees = (amt: number) => {
    const percentageFeeAmount = (amt * paymentMethod.percentageFee) / 100;
    const totalFee = percentageFeeAmount + paymentMethod.fixedFee;
    return totalFee;
  };

  // حساب المبلغ النهائي
  const calculateTotal = (amt: number) => {
    return amt + calculateFees(amt);
  };

  // التحقق من صحة البيانات
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const amt = parseFloat(amount);

    if (!amount || isNaN(amt) || amt <= 0) {
      newErrors.amount = 'يرجى إدخال مبلغ صحيح';
    } else if (amt < paymentMethod.minAmount) {
      newErrors.amount = `الحد الأدنى ${paymentMethod.minAmount}`;
    } else if (paymentMethod.maxAmount && amt > paymentMethod.maxAmount) {
      newErrors.amount = `الحد الأقصى ${paymentMethod.maxAmount}`;
    }

    // التحقق من الحقول المطلوبة
    if (paymentMethod.requiredFields) {
      const required = paymentMethod.requiredFields as string[];
      required.forEach((field: string) => {
        if (!formData[field] || formData[field].trim() === '') {
          newErrors[field] = `حقل ${field} مطلوب`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setSubmitted(true);
      // هنا يمكن إرسال البيانات إلى API
      console.log('إرسال بيانات الإيداع:', {
        paymentMethodId: paymentMethod.id,
        amount: parseFloat(amount),
        formData,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // إزالة الخطأ عند الكتابة
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* معلومات وسيلة الدفع */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="h-6 w-6 text-blue-600" />
          <div>
            <h4 className="font-semibold text-blue-900">{paymentMethod.nameAr}</h4>
            {paymentMethod.description && (
              <p className="mt-1 text-sm text-blue-800">{paymentMethod.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* نموذج الإيداع */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">تفاصيل الإيداع</h3>

        <div className="space-y-4">
          {/* حقل المبلغ */}
          <div>
            <label className="block text-sm font-medium text-gray-700">المبلغ</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.amount;
                    return newErrors;
                  });
                }
              }}
              className={`mt-1 w-full rounded-lg border ${
                errors.amount ? 'border-red-300' : 'border-gray-300'
              } px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder={`الحد الأدنى: ${paymentMethod.minAmount}`}
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
            {amount && !errors.amount && (
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>المبلغ:</span>
                  <span className="font-medium">{parseFloat(amount).toFixed(2)}</span>
                </div>
                {(paymentMethod.percentageFee > 0 || paymentMethod.fixedFee > 0) && (
                  <div className="flex justify-between">
                    <span>الرسوم:</span>
                    <span className="font-medium">
                      {calculateFees(parseFloat(amount)).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold text-gray-900">
                  <span>المجموع:</span>
                  <span>{calculateTotal(parseFloat(amount)).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* الحقول الديناميكية المطلوبة */}
          {paymentMethod.requiredFields &&
            Array.isArray(paymentMethod.requiredFields) &&
            paymentMethod.requiredFields.map((field: string) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700">{field}</label>
                <input
                  type="text"
                  value={formData[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className={`mt-1 w-full rounded-lg border ${
                    errors[field] ? 'border-red-300' : 'border-gray-300'
                  } px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder={`أدخل ${field}`}
                />
                {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
              </div>
            ))}
        </div>

        {/* الأزرار */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitted}
            className={`rounded-lg px-6 py-3 font-semibold text-white transition-colors ${
              submitted ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitted ? 'تم الإرسال' : 'إتمام الإيداع'}
          </button>
          <Link
            href="/wallet"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            إلغاء
          </Link>
        </div>

        {/* رسالة النجاح */}
        {submitted && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-900">تم إرسال الطلب بنجاح</h4>
              <p className="mt-1 text-sm text-green-800">
                سيتم مراجعة طلبك ومعالجته خلال {paymentMethod.processingTime || 'وقت قصير'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* التعليمات والنصائح */}
      {paymentMethod.metadata && paymentMethod.metadata.instructions && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon className="h-6 w-6 text-yellow-600" />
            <div>
              <h4 className="font-semibold text-yellow-900">تعليمات مهمة</h4>
              <ul className="mt-2 list-disc space-y-1 pr-5 text-sm text-yellow-800">
                {paymentMethod.metadata.instructions.map((instruction: string, index: number) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicDepositForm;
