import React from 'react';

// مكون للأيقونات الاحترافية المخصصة
export const ProfessionalIcons = {
  // أيقونة المزاد المباشر
  LiveAuction: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),

  // أيقونة المزايدة
  Bidding: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 17L17 7" />
      <path d="M17 17H7V7" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  ),

  // أيقونة السعر
  Price: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 1V23" />
      <path d="M17 5H9.5A3.5 3.5 0 0 0 9.5 12H14.5A3.5 3.5 0 0 1 14.5 19H6" />
    </svg>
  ),

  // أيقونة الفائز
  Winner: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L15.09 8.26L22 9L16 14.74L17.18 21.02L12 18.77L6.82 21.02L8 14.74L2 9L8.91 8.26L12 2Z" />
    </svg>
  ),

  // أيقونة المشاهدات
  Views: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),

  // أيقونة المزايدين
  Bidders: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 21V19A4 4 0 0 0 12 15H6A4 4 0 0 0 2 19V21" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21V19A4 4 0 0 0 18 15.3" />
      <path d="M16 3.13A4 4 0 0 1 16 11.87" />
    </svg>
  ),

  // أيقونة سوق المزاد الاحترافية - متجر مع سيارة
  Store: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3 7V5A2 2 0 0 1 5 3H19A2 2 0 0 1 21 5V7" strokeWidth="2" />
      <path
        d="M3 7H21L20 19A2 2 0 0 1 18 21H6A2 2 0 0 1 4 19L3 7Z"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M3 7H21L20 19A2 2 0 0 1 18 21H6A2 2 0 0 1 4 19L3 7Z" />
      <path d="M8 10V12" strokeLinecap="round" strokeWidth="2" />
      <path d="M12 10V12" strokeLinecap="round" strokeWidth="2" />
      <path d="M16 10V12" strokeLinecap="round" strokeWidth="2" />
      <circle cx="9" cy="16" r="1" fill="currentColor" />
      <circle cx="15" cy="16" r="1" fill="currentColor" />
      <path d="M9 16H15" strokeWidth="1" />
    </svg>
  ),

  // أيقونة المزادات الاحترافية - مطرقة المزاد مع نجمة
  Trophy: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 6V2L8 6L12 6L16 6L12 2" fill="currentColor" />
      <rect x="10" y="6" width="4" height="12" rx="1" fill="currentColor" />
      <circle cx="12" cy="20" r="2" fill="currentColor" />
      <path d="M6 8L4 10L6 12" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 8L20 10L18 12" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="4" r="1" fill="currentColor" />
    </svg>
  ),

  // أيقونة الخريطة الاحترافية مع علامات مواقع
  Map: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M9 2L15 6L21 4V18L15 20L9 16L3 18V4L9 2Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M9 2L15 6L21 4V18L15 20L9 16L3 18V4L9 2Z" strokeWidth="2" />
      <path d="M9 2V16" strokeWidth="2" />
      <path d="M15 6V20" strokeWidth="2" />
      <circle cx="12" cy="8" r="2" fill="currentColor" />
      <circle cx="7" cy="12" r="1" fill="currentColor" />
      <circle cx="17" cy="10" r="1" fill="currentColor" />
    </svg>
  ),

  // أيقونة الساحات الاحترافية - مبنى مع ساحة سيارات
  Building: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="4" y="6" width="16" height="15" rx="2" fill="currentColor" fillOpacity="0.1" />
      <rect x="4" y="6" width="16" height="15" rx="2" strokeWidth="2" />
      <path d="M4 21H20" strokeWidth="2" strokeLinecap="round" />
      <rect x="7" y="9" width="3" height="3" rx="0.5" strokeWidth="1.5" />
      <rect x="14" y="9" width="3" height="3" rx="0.5" strokeWidth="1.5" />
      <rect x="7" y="15" width="3" height="3" rx="0.5" strokeWidth="1.5" />
      <rect x="14" y="15" width="3" height="3" rx="0.5" strokeWidth="1.5" />
      <path d="M4 6L12 2L20 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="4" r="0.5" fill="currentColor" />
    </svg>
  ),

  // أيقونة خدمات النقل الاحترافية - شاحنة مع تفاصيل جميلة
  Truck: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="2" y="4" width="12" height="9" rx="1" fill="currentColor" fillOpacity="0.1" />
      <rect x="2" y="4" width="12" height="9" rx="1" strokeWidth="2" />
      <path d="M14 7H18L21 10V13H14V7Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M14 7H18L21 10V13H14V7Z" strokeWidth="2" />
      <circle cx="6" cy="17" r="2" strokeWidth="2" />
      <circle cx="18" cy="17" r="2" strokeWidth="2" />
      <path d="M14 17H16" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 17H14" strokeWidth="2" strokeLinecap="round" />
      <rect x="4" y="6" width="2" height="1" rx="0.5" fill="currentColor" />
      <rect x="8" y="6" width="2" height="1" rx="0.5" fill="currentColor" />
      <rect x="4" y="9" width="2" height="1" rx="0.5" fill="currentColor" />
      <rect x="8" y="9" width="2" height="1" rx="0.5" fill="currentColor" />
    </svg>
  ),

  // أيقونة الوقت المتبقي
  TimeLeft: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  ),

  // أيقونة التحقق
  Verified: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
      <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" fill="none" />
    </svg>
  ),

  // أيقونة الإحصائيات
  Analytics: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 3V21H21" />
      <path d="M9 9L12 6L16 10L21 5" />
      <circle cx="9" cy="9" r="2" />
      <circle cx="12" cy="6" r="2" />
      <circle cx="16" cy="10" r="2" />
      <circle cx="21" cy="5" r="2" />
    </svg>
  ),

  // أيقونة الإشعارات
  Notifications: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
      <path d="M13.73 21A2 2 0 0 1 10.27 21" />
      <circle cx="18" cy="6" r="3" fill="currentColor" />
    </svg>
  ),

  // أيقونة الأمان
  Security: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22S8 18 8 12V7L12 5L16 7V12C16 18 12 22 12 22Z" />
      <path d="M9 12L11 14L15 10" />
    </svg>
  ),

  // أيقونة المفضلة
  Favorite: ({
    className = 'h-6 w-6',
    filled = false,
  }: {
    className?: string;
    filled?: boolean;
  }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.84 4.61A5.5 5.5 0 0 0 7.5 7.5L12 21L16.5 7.5A5.5 5.5 0 0 0 20.84 4.61Z" />
    </svg>
  ),

  // أيقونة المشاركة
  Share: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51L15.42 17.49" />
      <path d="M15.41 6.51L8.59 10.49" />
    </svg>
  ),

  // أيقونة التقرير
  Report: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8Z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  ),

  // أيقونة الإعدادات المتقدمة
  AdvancedSettings: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15A1.65 1.65 0 0 0 21 13.09A1.65 1.65 0 0 0 19.4 9" />
      <path d="M4.6 9A1.65 1.65 0 0 0 3 10.91A1.65 1.65 0 0 0 4.6 15" />
      <path d="M12 2L15.09 8.26L22 9L16 14.74L17.18 21.02L12 18.77L6.82 21.02L8 14.74L2 9L8.91 8.26L12 2Z" />
    </svg>
  ),

  // أيقونة المزاد الحي - بديل للمزادات
  LiveHammer: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M6 6L18 18" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 6L6 18" strokeWidth="3" strokeLinecap="round" />
      <circle cx="12" cy="12" r="8" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path d="M8.5 8.5L15.5 15.5" strokeWidth="1" stroke="white" />
      <path d="M15.5 8.5L8.5 15.5" strokeWidth="1" stroke="white" />
    </svg>
  ),

  // أيقونة السوق المطور - بديل لسوق المزاد
  MarketPlace: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2 3H5L5.4 5H19L17 12H7L5 3H2" strokeWidth="2" />
      <circle cx="9" cy="20" r="1" strokeWidth="2" />
      <circle cx="20" cy="20" r="1" strokeWidth="2" />
      <path d="M7 12L5.4 5H19L17 12" fill="currentColor" fillOpacity="0.1" />
      <path d="M8 8H16" strokeWidth="1" strokeLinecap="round" />
      <path d="M10 6H14" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),

  // أيقونة الموقع المطور - بديل للخريطة
  LocationPin: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M21 10C21 17 12 23 12 23S3 17 3 10A9 9 0 0 1 21 10Z"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M21 10C21 17 12 23 12 23S3 17 3 10A9 9 0 0 1 21 10Z" strokeWidth="2" />
      <circle cx="12" cy="10" r="3" strokeWidth="2" fill="currentColor" />
      <circle cx="12" cy="10" r="1" fill="white" />
    </svg>
  ),

  // أيقونة المجمع - بديل للساحات
  Complex: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="8" width="18" height="13" rx="2" fill="currentColor" fillOpacity="0.1" />
      <rect x="3" y="8" width="18" height="13" rx="2" strokeWidth="2" />
      <path d="M3 8L12 3L21 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="6" y="11" width="2" height="3" strokeWidth="1.5" />
      <rect x="10" y="11" width="2" height="3" strokeWidth="1.5" />
      <rect x="14" y="11" width="2" height="3" strokeWidth="1.5" />
      <rect x="18" y="11" width="2" height="3" strokeWidth="1.5" />
      <rect x="6" y="16" width="2" height="3" strokeWidth="1.5" />
      <rect x="10" y="16" width="2" height="3" strokeWidth="1.5" />
      <rect x="14" y="16" width="2" height="3" strokeWidth="1.5" />
      <rect x="18" y="16" width="2" height="3" strokeWidth="1.5" />
      <path d="M3 21H21" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  // أيقونة الشحن - بديل لخدمات النقل
  Delivery: ({ className = 'h-6 w-6' }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M16 3H5A2 2 0 0 0 3 5V15A2 2 0 0 0 5 17H16V3Z"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M16 3H5A2 2 0 0 0 3 5V15A2 2 0 0 0 5 17H16V3Z" strokeWidth="2" />
      <path d="M16 8H20L23 11V17H16V8Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M16 8H20L23 11V17H16V8Z" strokeWidth="2" />
      <circle cx="7" cy="19" r="2" strokeWidth="2" />
      <circle cx="19" cy="19" r="2" strokeWidth="2" />
      <path d="M9 19H17" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 7H13" strokeWidth="1" strokeLinecap="round" />
      <path d="M6 10H11" strokeWidth="1" strokeLinecap="round" />
      <path d="M6 13H9" strokeWidth="1" strokeLinecap="round" />
      <path d="M18 10L20 12L18 14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// مكون للشارات الاحترافية
export const ProfessionalBadges = {
  // شارة المزاد المباشر
  Live: ({ className = '' }: { className?: string }) => (
    <div
      className={`inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 ${className}`}
    >
      <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
      مباشر
    </div>
  ),

  // شارة المزاد القادم
  Upcoming: ({ className = '' }: { className?: string }) => (
    <div
      className={`inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 ${className}`}
    >
      <ProfessionalIcons.TimeLeft className="h-3 w-3" />
      قادم
    </div>
  ),

  // شارة المزاد المنتهي
  Ended: ({ className = '' }: { className?: string }) => (
    <div
      className={`inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 ${className}`}
    >
      <ProfessionalIcons.Winner className="h-3 w-3" />
      منتهي
    </div>
  ),

  // شارة المستخدم المتحقق منه
  Verified: ({ className = '' }: { className?: string }) => (
    <div
      className={`inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 ${className}`}
    >
      <ProfessionalIcons.Verified className="h-3 w-3" />
      متحقق
    </div>
  ),

  // شارة المزايد الفائز
  Winner: ({ className = '' }: { className?: string }) => (
    <div
      className={`inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 ${className}`}
    >
      <ProfessionalIcons.Winner className="h-3 w-3" />
      فائز
    </div>
  ),
};

export default ProfessionalIcons;
