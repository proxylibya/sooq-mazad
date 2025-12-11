/**
 * شارة الإشعارات في شريط التنقل
 */

import { BellIcon } from '@heroicons/react/24/outline';

export interface NavbarNotificationBadgeProps {
  count?: number;
  onClick?: () => void;
  className?: string;
}

export function NavbarNotificationBadge({
  count = 0,
  onClick,
  className = '',
}: NavbarNotificationBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-full p-2 transition-colors hover:bg-gray-100 ${className}`}
      aria-label={`الإشعارات ${count > 0 ? `(${count})` : ''}`}
    >
      <BellIcon className="h-6 w-6 text-gray-600" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}

export default NavbarNotificationBadge;
