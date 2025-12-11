/**
 * روابط التنقل الديناميكية
 * تستخدم نظام التحكم بالأقسام لإظهار/إخفاء الروابط
 */

import {
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  MapPinIcon,
  ScaleIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSiteSections } from '../../../../contexts/SiteSectionsContext';

// خريطة الأيقونات
const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  ScaleIcon,
  ShoppingBagIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  SparklesIcon,
};

interface DynamicNavLinksProps {
  className?: string;
  linkClassName?: string;
  activeLinkClassName?: string;
  showIcons?: boolean;
}

export default function DynamicNavLinks({
  className = 'hidden items-center gap-1 lg:flex',
  linkClassName = 'rounded-lg px-4 py-2 font-medium transition-colors text-gray-700 hover:bg-gray-50 hover:text-blue-600',
  activeLinkClassName = 'bg-blue-50 text-blue-600',
  showIcons = false,
}: DynamicNavLinksProps) {
  const router = useRouter();
  const { getNavbarSections, getSectionStatus, getSectionMessage } = useSiteSections();

  const navSections = getNavbarSections();

  const isActivePath = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  const handleClick = (e: React.MouseEvent, section: any) => {
    const status = getSectionStatus(section.slug);

    if (status === 'MAINTENANCE') {
      e.preventDefault();
      const message = getSectionMessage(section.slug) || `قسم ${section.name} قيد الصيانة حالياً`;
      alert(message);
      return;
    }

    if (status === 'COMING_SOON') {
      e.preventDefault();
      const message = getSectionMessage(section.slug) || `قسم ${section.name} قريباً`;
      alert(message);
      return;
    }
  };

  return (
    <div className={className}>
      {navSections.map((section) => {
        const IconComponent = iconMap[section.icon || ''] || null;
        const isActive = isActivePath(section.pageUrl);
        const status = getSectionStatus(section.slug);

        // لا نعرض الروابط المعطلة
        if (status === 'DISABLED') return null;

        return (
          <Link
            key={section.id}
            href={section.pageUrl}
            onClick={(e) => handleClick(e, section)}
            className={`${linkClassName} ${isActive ? activeLinkClassName : ''} ${
              status === 'MAINTENANCE' || status === 'COMING_SOON' ? 'opacity-70' : ''
            }`}
          >
            <span className="flex items-center gap-2">
              {showIcons && IconComponent && <IconComponent className="h-5 w-5" />}
              <span>{section.name}</span>
              {status === 'COMING_SOON' && (
                <ClockIcon className="h-4 w-4 text-blue-500" title="قريباً" />
              )}
              {status === 'MAINTENANCE' && (
                <WrenchScrewdriverIcon className="h-4 w-4 text-yellow-500" title="صيانة" />
              )}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

// مكون للقائمة المنسدلة في الموبايل
export function DynamicMobileNavLinks({
  onClose,
  className = 'space-y-1',
}: {
  onClose?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const { getMobileSections, getSectionStatus, getSectionMessage } = useSiteSections();

  const mobileSections = getMobileSections();

  const isActivePath = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  const handleClick = (e: React.MouseEvent, section: any) => {
    const status = getSectionStatus(section.slug);

    if (status === 'MAINTENANCE' || status === 'COMING_SOON') {
      e.preventDefault();
      const message =
        getSectionMessage(section.slug) ||
        (status === 'MAINTENANCE'
          ? `قسم ${section.name} قيد الصيانة`
          : `قسم ${section.name} قريباً`);
      alert(message);
      return;
    }

    if (onClose) onClose();
  };

  return (
    <div className={className}>
      {mobileSections.map((section) => {
        const IconComponent = iconMap[section.icon || ''] || null;
        const isActive = isActivePath(section.pageUrl);
        const status = getSectionStatus(section.slug);

        if (status === 'DISABLED') return null;

        return (
          <Link
            key={section.id}
            href={section.pageUrl}
            onClick={(e) => handleClick(e, section)}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
              isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            } ${status !== 'ACTIVE' ? 'opacity-70' : ''}`}
          >
            {IconComponent && (
              <IconComponent className="h-5 w-5" style={{ color: section.primaryColor }} />
            )}
            <span className="font-medium">{section.name}</span>
            {status === 'COMING_SOON' && (
              <span className="mr-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                قريباً
              </span>
            )}
            {status === 'MAINTENANCE' && (
              <span className="mr-auto rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-600">
                صيانة
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

// مكون لروابط الفوتر
export function DynamicFooterLinks({ className = 'space-y-3' }: { className?: string }) {
  const { getFooterSections, getSectionStatus } = useSiteSections();
  const footerSections = getFooterSections();

  return (
    <ul className={className}>
      {footerSections.map((section) => {
        const IconComponent = iconMap[section.icon || ''] || null;
        const status = getSectionStatus(section.slug);

        if (status === 'DISABLED') return null;

        return (
          <li key={section.id}>
            <Link
              href={section.pageUrl}
              className={`flex items-center gap-2 text-gray-400 transition-colors hover:text-white ${
                status !== 'ACTIVE' ? 'opacity-60' : ''
              }`}
            >
              {IconComponent && <IconComponent className="h-4 w-4" />}
              <span>{section.name}</span>
              {status === 'COMING_SOON' && <span className="text-xs text-blue-400">(قريباً)</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
