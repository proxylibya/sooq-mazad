/**
 * القائمة المنسدلة للموبايل
 * تستخدم نظام التحكم بالأقسام
 */

import {
  ClockIcon,
  HomeIcon,
  PhoneIcon,
  QuestionMarkCircleIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useSiteSections } from '../../../../contexts/SiteSectionsContext';

// خريطة الأيقونات
import {
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  ScaleIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ScaleIcon,
  ShoppingBagIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  BuildingOfficeIcon,
  SparklesIcon,
};

interface NavbarMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NavbarMobileMenu({ isOpen, onClose }: NavbarMobileMenuProps) {
  const router = useRouter();
  const { getMobileSections, getSectionStatus, getSectionMessage } = useSiteSections();

  if (!isOpen) return null;

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

    onClose();
  };

  // الروابط الثابتة (الرئيسية، اتصل بنا، المساعدة)
  const staticLinks = [{ href: '/', icon: HomeIcon, label: 'الرئيسية', isStatic: true }];

  const bottomLinks = [
    { href: '/contact', icon: PhoneIcon, label: 'اتصل بنا', isStatic: true },
    { href: '/help', icon: QuestionMarkCircleIcon, label: 'المساعدة', isStatic: true },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onClose} />

      {/* القائمة */}
      <div className="fixed right-0 top-0 z-50 h-full w-72 overflow-y-auto bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h3 className="text-lg font-bold text-gray-900">القائمة</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4">
          {/* رابط الرئيسية */}
          {staticLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                isActivePath(item.href)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {/* فاصل */}
          <div className="my-3 border-t border-gray-200" />

          {/* الأقسام الديناميكية */}
          <p className="mb-2 px-4 text-xs font-semibold uppercase text-gray-400">الأقسام</p>
          {mobileSections.map((section) => {
            const IconComponent = iconMap[section.icon || ''] || HomeIcon;
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
                <IconComponent
                  className="h-5 w-5"
                  style={{ color: isActive ? undefined : section.primaryColor }}
                />
                <span className="flex-1 font-medium">{section.name}</span>
                {status === 'COMING_SOON' && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                    <ClockIcon className="h-3 w-3" />
                    قريباً
                  </span>
                )}
                {status === 'MAINTENANCE' && (
                  <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-600">
                    <WrenchScrewdriverIcon className="h-3 w-3" />
                    صيانة
                  </span>
                )}
              </Link>
            );
          })}

          {/* فاصل */}
          <div className="my-3 border-t border-gray-200" />

          {/* روابط الدعم */}
          <p className="mb-2 px-4 text-xs font-semibold uppercase text-gray-400">المساعدة</p>
          {bottomLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                isActivePath(item.href)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
