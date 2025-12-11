/**
 * Smart Nav Links - روابط النافبار الذكية
 * ========================================
 *
 * مكون محسن يعرض الروابط بناءً على إعدادات المحتوى
 *
 * ✅ لا يظهر أي شيء حتى تكون البيانات جاهزة (يمنع الوميض/FOUC)
 * ✅ يستخدم localStorage للتحميل السريع
 * ✅ يعرض skeleton أثناء التحميل
 *
 * @version 2.0.0 - FOUC Prevention Edition
 */

'use client';

import {
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  HomeIcon,
  MapPinIcon,
  ScaleIcon,
  ShoppingBagIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import type { SiteSection } from '../../../../lib/content-visibility';
import {
  useContentVisibility,
  useNavbarSections,
} from '../../../../lib/content-visibility/ContentVisibilityContext';

// خريطة الأيقونات
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  HomeIcon,
  ScaleIcon,
  ShoppingBagIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  BuildingOfficeIcon,
};

// الحصول على الأيقونة من الاسم
function getIcon(iconName?: string): React.ComponentType<{ className?: string }> | null {
  if (!iconName) return null;
  return iconMap[iconName] || null;
}

// ============================================
// Desktop Nav Links
// ============================================

interface NavLinkProps {
  section: SiteSection;
  isActive: boolean;
}

function NavLink({ section, isActive }: NavLinkProps) {
  const Icon = getIcon(section.icon);

  return (
    <Link
      href={section.pageUrl}
      className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
        isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
      } `}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{section.name}</span>

      {/* حالة الصيانة أو قريباً */}
      {section.status === 'MAINTENANCE' && (
        <span className="ml-1 rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-bold text-yellow-700">
          صيانة
        </span>
      )}
      {section.status === 'COMING_SOON' && (
        <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
          قريباً
        </span>
      )}
    </Link>
  );
}

export function DesktopNavLinks() {
  const sections = useNavbarSections();
  const { isReady, isLoading } = useContentVisibility();
  const pathname = usePathname();

  // ⚠️ مهم جداً: لا تعرض أي شيء حتى تكون البيانات جاهزة - لمنع الوميض!
  if (!isReady || isLoading) {
    return (
      <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
        {/* Skeleton loading - يحافظ على المساحة ويمنع القفز */}
        <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-100/50" />
        <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-100/50" />
        <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-100/50" />
        <div className="w-22 h-8 animate-pulse rounded-lg bg-gray-100/50" />
        <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-100/50" />
      </nav>
    );
  }

  return (
    <nav
      className="content-visibility-ready hidden items-center gap-1 lg:flex"
      aria-label="التنقل الرئيسي"
    >
      {/* رابط الرئيسية */}
      <Link
        href="/"
        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
          pathname === '/'
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
        } `}
      >
        <HomeIcon className="h-4 w-4" />
        <span>الرئيسية</span>
      </Link>

      {/* روابط الأقسام الديناميكية */}
      {sections.map((section) => (
        <NavLink
          key={section.id}
          section={section}
          isActive={pathname === section.pageUrl || pathname?.startsWith(section.pageUrl + '/')}
        />
      ))}
    </nav>
  );
}

// ============================================
// Mobile Nav Links
// ============================================

interface MobileNavLinksProps {
  onClose?: () => void;
}

export function MobileNavLinks({ onClose }: MobileNavLinksProps) {
  const sections = useNavbarSections();
  const { isReady, isLoading } = useContentVisibility();
  const pathname = usePathname();

  // ⚠️ مهم جداً: لا تعرض أي شيء حتى تكون البيانات جاهزة - لمنع الوميض!
  if (!isReady || isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100/50" />
        ))}
      </div>
    );
  }

  return (
    <nav className="space-y-1 p-4">
      {/* رابط الرئيسية */}
      <Link
        href="/"
        onClick={onClose}
        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 ${
          pathname === '/' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
        } `}
      >
        <HomeIcon className="h-5 w-5" />
        <span>الرئيسية</span>
      </Link>

      {/* روابط الأقسام */}
      {sections.map((section) => {
        const Icon = getIcon(section.icon);
        const isActive =
          pathname === section.pageUrl || pathname?.startsWith(section.pageUrl + '/');

        return (
          <Link
            key={section.id}
            href={section.pageUrl}
            onClick={onClose}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 ${
              isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            } `}
          >
            {Icon && <Icon className="h-5 w-5" />}
            <span className="flex-1">{section.name}</span>

            {/* حالات خاصة */}
            {section.status === 'MAINTENANCE' && (
              <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700">
                صيانة
              </span>
            )}
            {section.status === 'COMING_SOON' && (
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                قريباً
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

// ============================================
// Footer Links
// ============================================

export function FooterNavLinks() {
  const { getFooterSections, isReady, isLoading } = useContentVisibility();
  const sections = useMemo(
    () => (isReady && !isLoading ? getFooterSections() : []),
    [getFooterSections, isReady, isLoading],
  );

  // ⚠️ لا تعرض أي شيء حتى تكون البيانات جاهزة
  if (!isReady || isLoading || sections.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {sections.map((section) => {
        const Icon = getIcon(section.icon);

        return (
          <Link
            key={section.id}
            href={section.pageUrl}
            className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{section.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default DesktopNavLinks;
