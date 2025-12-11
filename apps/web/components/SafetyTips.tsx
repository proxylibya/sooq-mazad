import React from 'react';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';

interface SafetyTipsProps {
  className?: string;
}

const SafetyTips: React.FC<SafetyTipsProps> = ({ className = '' }) => {
  const tips = [
    'تأكد من فحص السيارة قبل الشراء',
    'لا تدفع أي مبالغ قبل رؤية السيارة',
    'تأكد من صحة الأوراق والوثائق',
    'قم بالتعامل في أماكن عامة وآمنة',
    'احرص على إحضار خبير معك عند الفحص',
    'تحقق من تاريخ الحوادث والصيانة',
    'لا تتردد في طلب تجربة القيادة',
    'احذر من العروض المشكوك فيها',
  ];

  return (
    <div className={`rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm ${className}`}>
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
        <div>
          <h4 className="mb-3 text-lg font-semibold text-amber-800">نصائح للأمان</h4>
          <ul className="space-y-2 text-sm text-amber-700">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500"></span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SafetyTips;
