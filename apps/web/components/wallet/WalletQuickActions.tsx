import { ArrowDownTrayIcon, ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  color: string;
  hoverColor: string;
}

// الإجراءات المتاحة: إيداع وسجل المعاملات فقط
// لا يوجد إرسال بين المستخدمين أو تبديل عملات في هذا الموقع
const quickActions: QuickAction[] = [
  {
    id: 'deposit',
    label: 'إيداع',
    icon: ArrowDownTrayIcon,
    href: '/wallet/deposit',
    color: 'from-emerald-500 to-emerald-600',
    hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
  },
  {
    id: 'history',
    label: 'السجل',
    icon: ClockIcon,
    href: '/wallet/transactions',
    color: 'from-amber-500 to-amber-600',
    hoverColor: 'hover:from-amber-600 hover:to-amber-700',
  },
];

interface WalletQuickActionsProps {
  className?: string;
  variant?: 'default' | 'compact' | 'dark';
}

const WalletQuickActions: React.FC<WalletQuickActionsProps> = ({
  className = '',
  variant = 'default',
}) => {
  if (variant === 'dark') {
    return (
      <div className={`mx-auto grid max-w-xs grid-cols-2 gap-4 ${className}`}>
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className="group flex flex-col items-center gap-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent bg-gray-800 shadow-lg backdrop-blur-sm transition-all group-hover:border-blue-500/50 group-active:scale-95">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-white">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center gap-6 ${className}`}>
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className="group flex flex-col items-center gap-1"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} ${action.hoverColor} shadow-md transition-all group-hover:scale-110 group-hover:shadow-lg`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    );
  }

  // Default variant - إيداع وسجل فقط
  return (
    <div className={`mx-auto grid max-w-md grid-cols-2 gap-6 ${className}`}>
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.id}
            href={action.href}
            className="group flex flex-col items-center gap-3"
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${action.color} ${action.hoverColor} shadow-lg transition-all group-hover:scale-110 group-hover:shadow-xl group-active:scale-95`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">
              {action.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default WalletQuickActions;
