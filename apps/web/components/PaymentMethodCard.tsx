import React from 'react';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import BoltIcon from '@heroicons/react/24/outline/BoltIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';

interface PaymentMethod {
  id: string;
  name: string;
  nameAr: string;
  icon: React.ReactNode;
  description: string;
  processingTime: string;
  fees: string;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
  logo?: string;
}

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: (methodId: string) => void;
  variant?: 'default' | 'compact' | 'detailed';
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  isSelected,
  onSelect,
  variant = 'default',
}) => {
  const getCardClasses = () => {
    const baseClasses =
      'border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md';

    if (isSelected) {
      return `${baseClasses} ${method.borderColor || 'border-blue-500'} ${method.bgColor || 'bg-blue-50'}`;
    }

    return `${baseClasses} border-gray-200 hover:border-gray-300`;
  };

  const getIconContainerClasses = () => {
    const baseClasses = 'rounded-lg flex items-center justify-center';

    if (variant === 'compact') {
      return `${baseClasses} w-8 h-8 ${isSelected ? method.bgColor || 'bg-blue-100' : 'bg-gray-100'}`;
    }

    return `${baseClasses} w-12 h-12 ${isSelected ? method.bgColor || 'bg-blue-100' : 'bg-gray-100'}`;
  };

  const getTextClasses = () => {
    if (isSelected) {
      return method.textColor || 'text-blue-900';
    }
    return 'text-gray-900';
  };

  const getCheckboxClasses = () => {
    const baseClasses = 'rounded-full border-2 flex items-center justify-center';

    if (isSelected) {
      const bgColor = method.borderColor?.replace('border-', 'bg-') || 'bg-blue-500';
      return `${baseClasses} w-6 h-6 ${bgColor} border-transparent`;
    }

    return `${baseClasses} w-6 h-6 border-gray-300`;
  };

  if (variant === 'compact') {
    return (
      <div
        onClick={() => onSelect(method.id)}
        className={`${getCardClasses()} flex items-center justify-between p-3`}
      >
        <div className="flex items-center">
          <div className={`${getIconContainerClasses()} mr-2`}>{method.icon}</div>
          <span className={`text-sm font-medium ${getTextClasses()}`}>{method.nameAr}</span>
        </div>

        <div className={getCheckboxClasses()}>
          {isSelected && <CheckCircleIcon className="h-4 w-4 text-white" />}
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div onClick={() => onSelect(method.id)} className={`${getCardClasses()} p-6`}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className={`${getIconContainerClasses()} mr-4`}>{method.icon}</div>
            <div>
              <h3 className={`text-lg font-bold ${getTextClasses()}`}>{method.nameAr}</h3>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>
          </div>

          <div className={getCheckboxClasses()}>
            {isSelected && <CheckCircleIcon className="h-4 w-4 text-white" />}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium text-green-600">
              <BoltIcon className="h-3 w-3" />
              {method.processingTime}
            </span>
            <span className="flex items-center gap-1 font-medium text-blue-600">
              <CreditCardIcon className="h-3 w-3" />
              {method.fees}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      onClick={() => onSelect(method.id)}
      className={`${getCardClasses()} flex items-center justify-between p-4`}
    >
      <div className="flex items-center">
        <div className={`${getIconContainerClasses()} mr-3`}>{method.icon}</div>
        <div>
          <span className={`font-semibold ${getTextClasses()}`}>{method.nameAr}</span>
          <p className="text-sm text-gray-600">{method.description}</p>
          <div className="mt-1 flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <BoltIcon className="h-3 w-3" />
              {method.processingTime}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-blue-600">
              <CreditCardIcon className="h-3 w-3" />
              {method.fees}
            </span>
          </div>
        </div>
      </div>

      <div className={getCheckboxClasses()}>
        {isSelected && <CheckCircleIcon className="h-4 w-4 text-white" />}
      </div>
    </div>
  );
};

export default PaymentMethodCard;
export type { PaymentMethod };
