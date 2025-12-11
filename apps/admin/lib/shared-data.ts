/**
 * البيانات المشتركة الموحدة للوحة التحكم
 * Unified Shared Data for Admin Panel
 * 
 * هذا الملف يوفر نقطة واحدة لجميع البيانات المشتركة في لوحة التحكم
 * لضمان التوحيد والاتساق في جميع الصفحات
 */

// ============================================
// === استيراد البيانات من المكتبة المشتركة ===
// ============================================

import {
    bodyTypes,
    carBrands,
    carYears,
    conditions,
    exteriorColors,
    fuelTypes,
    getAllBrandNames,
    getAllRegions,
    getCitiesByRegion,
    getCityNames,
    getMainCities,
    getModelsByBrand,
    interiorColors,
    libyanCities,
    regionalSpecs,
    seatCounts,
    transmissionTypes,
    type CarBrand,
    type LibyanCity,
} from '@sooq-mazad/utils';

// ============================================
// === إعادة تصدير البيانات الأساسية ===
// ============================================

export {
    bodyTypes, carBrands,
    carYears, conditions, exteriorColors, fuelTypes, getAllBrandNames, getAllRegions, getCitiesByRegion, getCityNames, getMainCities, getModelsByBrand, interiorColors, libyanCities, regionalSpecs, seatCounts,
    transmissionTypes, type CarBrand,
    type LibyanCity
};

// ============================================
// === قائمة المدن الليبية الكاملة ===
// ============================================

/**
 * جميع أسماء المدن الليبية (72 مدينة)
 * استخدم هذه القائمة في جميع القوائم المنسدلة
 */
export const LIBYAN_CITIES = getCityNames();

/**
 * المدن الرئيسية فقط (للقوائم المختصرة)
 */
export const MAIN_CITIES = getMainCities().map(city => city.name);

/**
 * المدن مجمعة حسب المنطقة
 */
export const CITIES_BY_REGION = {
    'المنطقة الغربية': getCitiesByRegion('المنطقة الغربية').map(c => c.name),
    'المنطقة الوسطى': getCitiesByRegion('المنطقة الوسطى').map(c => c.name),
    'المنطقة الشرقية': getCitiesByRegion('المنطقة الشرقية').map(c => c.name),
    'المنطقة الجنوبية': getCitiesByRegion('المنطقة الجنوبية').map(c => c.name),
};

// ============================================
// === أيام الأسبوع ===
// ============================================

export const WEEKDAYS = [
    { value: 'SAT', label: 'السبت', shortLabel: 'س' },
    { value: 'SUN', label: 'الأحد', shortLabel: 'ح' },
    { value: 'MON', label: 'الاثنين', shortLabel: 'ن' },
    { value: 'TUE', label: 'الثلاثاء', shortLabel: 'ث' },
    { value: 'WED', label: 'الأربعاء', shortLabel: 'ر' },
    { value: 'THU', label: 'الخميس', shortLabel: 'خ' },
    { value: 'FRI', label: 'الجمعة', shortLabel: 'ج' },
];

/**
 * تسميات أيام الأسبوع (للاستخدام كـ object)
 */
export const DAY_LABELS: Record<string, string> = {
    SAT: 'السبت',
    SUN: 'الأحد',
    MON: 'الاثنين',
    TUE: 'الثلاثاء',
    WED: 'الأربعاء',
    THU: 'الخميس',
    FRI: 'الجمعة',
};

// ============================================
// === أنواع المركبات ===
// ============================================

export const VEHICLE_TYPES = [
    { id: 'CARS', value: 'CARS', label: 'سيارات', icon: '🚗' },
    { id: 'TRUCKS', value: 'TRUCKS', label: 'شاحنات', icon: '🚛' },
    { id: 'MOTORCYCLES', value: 'MOTORCYCLES', label: 'دراجات نارية', icon: '🏍️' },
    { id: 'BOATS', value: 'BOATS', label: 'قوارب', icon: '🚤' },
    { id: 'HEAVY_EQUIPMENT', value: 'HEAVY_EQUIPMENT', label: 'معدات ثقيلة', icon: '🚜' },
    { id: 'OTHER', value: 'OTHER', label: 'أخرى', icon: '🚙' },
];

// ============================================
// === أنواع سيارات النقل (السطحات) ===
// ============================================

export const TRANSPORT_VEHICLE_TYPES = [
    { id: 'flatbed', value: 'flatbed', label: 'سطحة مسطحة', description: 'مناسبة لنقل السيارات العادية' },
    { id: 'enclosed', value: 'enclosed', label: 'سطحة مغلقة', description: 'حماية كاملة من العوامل الجوية' },
    { id: 'lowbed', value: 'lowbed', label: 'سطحة منخفضة', description: 'للسيارات المنخفضة والرياضية' },
    { id: 'crane', value: 'crane', label: 'رافعة', description: 'لنقل السيارات المعطلة' },
    { id: 'multi_car', value: 'multi_car', label: 'ناقلة متعددة', description: 'لنقل أكثر من سيارة' },
];

// ============================================
// === خدمات الساحات ===
// ============================================

export const YARD_SERVICES = [
    { id: 'security', label: 'حراسة أمنية', icon: '🔒' },
    { id: 'entry_management', label: 'تنظيم دخول', icon: '🚧' },
    { id: 'lighting', label: 'إنارة', icon: '💡' },
    { id: 'parking', label: 'مواقف', icon: '🅿️' },
    { id: 'maintenance', label: 'خدمات صيانة', icon: '🔧' },
    { id: 'inspection', label: 'فحص فني', icon: '📋' },
    { id: 'washing', label: 'غسيل سيارات', icon: '🚿' },
    { id: 'towing', label: 'سحب سيارات', icon: '🚛' },
    { id: 'wifi', label: 'واي فاي', icon: '📶' },
    { id: 'cafe', label: 'مقهى/استراحة', icon: '☕' },
];

// ============================================
// === حالات المستخدمين ===
// ============================================

export const USER_STATUSES = [
    { value: 'ACTIVE', label: 'نشط', color: 'green' },
    { value: 'BLOCKED', label: 'محظور', color: 'red' },
    { value: 'SUSPENDED', label: 'موقوف', color: 'yellow' },
    { value: 'PENDING', label: 'معلق', color: 'gray' },
];

// ============================================
// === أنواع الحسابات ===
// ============================================

export const ACCOUNT_TYPES = [
    { value: 'REGULAR_USER', label: 'مستخدم عادي', description: 'حساب شخصي للبيع والشراء' },
    { value: 'TRANSPORT_OWNER', label: 'صاحب خدمة نقل', description: 'مالك سطحة أو شركة نقل' },
    { value: 'COMPANY', label: 'شركة', description: 'حساب شركة أو وكالة' },
    { value: 'SHOWROOM', label: 'معرض', description: 'معرض سيارات' },
];

// ============================================
// === أدوار المستخدمين ===
// ============================================

export const USER_ROLES = [
    { value: 'USER', label: 'مستخدم', permissions: ['read'] },
    { value: 'MODERATOR', label: 'مشرف', permissions: ['read', 'moderate'] },
    { value: 'ADMIN', label: 'مدير', permissions: ['read', 'write', 'moderate'] },
    { value: 'SUPER_ADMIN', label: 'مدير عام', permissions: ['read', 'write', 'moderate', 'admin'] },
];

// ============================================
// === حالات المزادات ===
// ============================================

export const AUCTION_STATUSES = [
    { value: 'PENDING', label: 'قيد المراجعة', color: 'gray', icon: '⏳' },
    { value: 'ACTIVE', label: 'نشط', color: 'green', icon: '✅' },
    { value: 'ENDED', label: 'منتهي', color: 'blue', icon: '🏁' },
    { value: 'CANCELLED', label: 'ملغي', color: 'red', icon: '❌' },
    { value: 'SOLD', label: 'مباع', color: 'purple', icon: '💰' },
];

// ============================================
// === حالات السيارات ===
// ============================================

export const CAR_STATUSES = [
    { value: 'PENDING', label: 'قيد المراجعة', color: 'gray' },
    { value: 'AVAILABLE', label: 'متاح', color: 'green' },
    { value: 'SOLD', label: 'مباع', color: 'blue' },
    { value: 'REJECTED', label: 'مرفوض', color: 'red' },
    { value: 'RESERVED', label: 'محجوز', color: 'yellow' },
];

// ============================================
// === باقات الترويج ===
// ============================================



// ============================================
// === دوال مساعدة ===
// ============================================

/**
 * تحويل قائمة إلى خيارات للقائمة المنسدلة
 */
export const toSelectOptions = (items: string[]): { value: string; label: string; }[] => {
    return items.map(item => ({ value: item, label: item }));
};

/**
 * الحصول على الموديلات حسب الماركة
 */
export const getModelsForBrand = (brandName: string): { value: string; label: string; }[] => {
    const models = getModelsByBrand(brandName);
    return models.map(model => ({ value: model, label: model }));
};

/**
 * الحصول على جميع الماركات كخيارات
 */
export const getBrandOptions = (): { value: string; label: string; }[] => {
    return carBrands.map(brand => ({ value: brand.name, label: brand.name }));
};

/**
 * الحصول على جميع المدن كخيارات
 */
export const getCityOptions = (): { value: string; label: string; }[] => {
    return toSelectOptions(LIBYAN_CITIES);
};

/**
 * الحصول على السنوات كخيارات
 */
export const getYearOptions = (): { value: string; label: string; }[] => {
    return carYears.map(year => ({ value: year.toString(), label: year.toString() }));
};

/**
 * الحصول على الألوان الخارجية كخيارات
 */
export const getExteriorColorOptions = (): { value: string; label: string; }[] => {
    return toSelectOptions(exteriorColors);
};

/**
 * الحصول على الألوان الداخلية كخيارات
 */
export const getInteriorColorOptions = (): { value: string; label: string; }[] => {
    return toSelectOptions(interiorColors);
};

/**
 * الحصول على أنواع الوقود كخيارات
 */
export const getFuelTypeOptions = (): { value: string; label: string; }[] => {
    return toSelectOptions(fuelTypes);
};

/**
 * الحصول على أنواع ناقل الحركة كخيارات
 */
export const getTransmissionOptions = (): { value: string; label: string; }[] => {
    return toSelectOptions(transmissionTypes);
};

/**
 * الحصول على أنواع الهيكل كخيارات
 */
export const getBodyTypeOptions = (): { value: string; label: string; }[] => {
    return toSelectOptions(bodyTypes);
};

/**
 * الحصول على المواصفات الإقليمية كخيارات
 */
export const getRegionalSpecOptions = (): { value: string; label: string; }[] => {
    return toSelectOptions(regionalSpecs);
};

/**
 * الحصول على حالات السيارة كخيارات
 */
export const getConditionOptions = (): { value: string; label: string; }[] => {
    return toSelectOptions(conditions);
};

// ============================================
// === التصدير الافتراضي ===
// ============================================

const sharedData = {
    // البيانات الأساسية
    carBrands,
    carYears,
    bodyTypes,
    fuelTypes,
    conditions,
    regionalSpecs,
    exteriorColors,
    interiorColors,
    seatCounts,
    transmissionTypes,
    libyanCities,

    // المدن
    LIBYAN_CITIES,
    MAIN_CITIES,
    CITIES_BY_REGION,

    // البيانات الإضافية
    WEEKDAYS,
    VEHICLE_TYPES,
    TRANSPORT_VEHICLE_TYPES,
    YARD_SERVICES,
    USER_STATUSES,
    ACCOUNT_TYPES,
    USER_ROLES,
    AUCTION_STATUSES,
    CAR_STATUSES,


    // الدوال المساعدة
    toSelectOptions,
    getModelsForBrand,
    getBrandOptions,
    getCityOptions,
    getYearOptions,
    getExteriorColorOptions,
    getInteriorColorOptions,
    getFuelTypeOptions,
    getTransmissionOptions,
    getBodyTypeOptions,
    getRegionalSpecOptions,
    getConditionOptions,
    getModelsByBrand,
    getAllBrandNames,
    getMainCities,
    getCitiesByRegion,
    getAllRegions,
    getCityNames,
};

export default sharedData;
