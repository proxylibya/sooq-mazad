/**
 * 🚚 نظام ترجمة خدمات النقل الموحد
 * ============================================
 * يحتوي على جميع الترجمات المطلوبة لأنواع المركبات وخدمات النقل
 * استخدم هذا الملف كمصدر واحد للحقيقة لجميع الترجمات
 * 
 * @author Sooq Mazad Team
 * @version 1.0.0
 */

// ============================================
// === أنواع المركبات (Vehicle Types) ===
// ============================================

/**
 * قاموس ترجمة أنواع المركبات من الإنجليزية إلى العربية
 * يشمل جميع الأنواع المستخدمة في النظام
 */
export const VEHICLE_TYPE_TRANSLATIONS: Record<string, string> = {
    // الأنواع الأساسية
    flatbed: 'سطحة مسطحة',
    enclosed: 'سطحة مغلقة',
    lowbed: 'سطحة منخفضة',
    crane: 'رافعة',
    multi_car: 'ناقلة متعددة',

    // أنواع إضافية
    'car-carrier': 'ناقلة سيارات',
    'heavy-duty': 'ساحبة ثقيلة',
    refrigerated: 'مبردة',
    tanker: 'صهريج',
    container: 'حاوية',
    pickup: 'بيك أب',
    van: 'فان',
    winch: 'ونش',
    tow_truck: 'ونش سحب',
    recovery: 'استرداد',
    heavy: 'نقل ثقيل',

    // أنواع بأحرف كبيرة (قادمة من قاعدة البيانات)
    FLATBED: 'سطحة مسطحة',
    ENCLOSED: 'سطحة مغلقة',
    LOWBED: 'سطحة منخفضة',
    CRANE: 'رافعة',
    MULTI_CAR: 'ناقلة متعددة',
    CAR_CARRIER: 'ناقلة سيارات',
    HEAVY_DUTY: 'ساحبة ثقيلة',
    REFRIGERATED: 'مبردة',
    TANKER: 'صهريج',
    CONTAINER: 'حاوية',
    PICKUP: 'بيك أب',
    VAN: 'فان',
    WINCH: 'ونش',
    TOW_TRUCK: 'ونش سحب',
    RECOVERY: 'استرداد',
    HEAVY: 'نقل ثقيل',

    // القيمة الافتراضية
    other: 'أخرى',
    OTHER: 'أخرى',
};

/**
 * قائمة أنواع المركبات مع التفاصيل الكاملة
 */
export const VEHICLE_TYPES_LIST = [
    { id: 'flatbed', value: 'flatbed', label: 'سطحة مسطحة', description: 'مناسبة لنقل السيارات العادية' },
    { id: 'enclosed', value: 'enclosed', label: 'سطحة مغلقة', description: 'حماية كاملة من العوامل الجوية' },
    { id: 'lowbed', value: 'lowbed', label: 'سطحة منخفضة', description: 'للسيارات المنخفضة والرياضية' },
    { id: 'crane', value: 'crane', label: 'رافعة', description: 'لنقل السيارات المعطلة' },
    { id: 'multi_car', value: 'multi_car', label: 'ناقلة متعددة', description: 'لنقل أكثر من سيارة' },
    { id: 'car-carrier', value: 'car-carrier', label: 'ناقلة سيارات', description: 'متخصصة في نقل السيارات' },
    { id: 'heavy-duty', value: 'heavy-duty', label: 'ساحبة ثقيلة', description: 'للمركبات الثقيلة والكبيرة' },
    { id: 'refrigerated', value: 'refrigerated', label: 'مبردة', description: 'للنقل المبرد' },
    { id: 'tanker', value: 'tanker', label: 'صهريج', description: 'لنقل السوائل' },
    { id: 'container', value: 'container', label: 'حاوية', description: 'للشحن بالحاويات' },
    { id: 'pickup', value: 'pickup', label: 'بيك أب', description: 'للنقل الخفيف' },
    { id: 'van', value: 'van', label: 'فان', description: 'للنقل الصغير والمتوسط' },
    { id: 'winch', value: 'winch', label: 'ونش', description: 'للسحب والرفع' },
    { id: 'other', value: 'other', label: 'أخرى', description: 'أنواع أخرى' },
];

// ============================================
// === أنواع خدمات النقل (Service Types) ===
// ============================================

/**
 * قاموس ترجمة أنواع خدمات النقل
 */
export const SERVICE_TYPE_TRANSLATIONS: Record<string, string> = {
    // بالإنجليزية
    'car_transport': 'نقل سيارات',
    'furniture_transport': 'نقل أثاث',
    'goods_transport': 'نقل بضائع',
    'people_transport': 'نقل أشخاص',
    'local_shipping': 'شحن محلي',
    'international_shipping': 'شحن دولي',
    'internal_transport': 'نقل داخلي',

    // بأحرف كبيرة
    CAR_TRANSPORT: 'نقل سيارات',
    FURNITURE_TRANSPORT: 'نقل أثاث',
    GOODS_TRANSPORT: 'نقل بضائع',
    PEOPLE_TRANSPORT: 'نقل أشخاص',
    LOCAL_SHIPPING: 'شحن محلي',
    INTERNATIONAL_SHIPPING: 'شحن دولي',
    INTERNAL_TRANSPORT: 'نقل داخلي',

    // بالعربية (للتوافق)
    'نقل سيارات': 'نقل سيارات',
    'نقل أثاث': 'نقل أثاث',
    'نقل بضائع': 'نقل بضائع',
    'نقل أشخاص': 'نقل أشخاص',
    'شحن محلي': 'شحن محلي',
    'شحن دولي': 'شحن دولي',
    'نقل داخلي': 'نقل داخلي',
    'سطحة': 'سطحة',
    'ونش': 'ونش',
};

// ============================================
// === دوال الترجمة الموحدة ===
// ============================================

/**
 * ترجمة نوع المركبة من الإنجليزية إلى العربية
 * @param vehicleType - نوع المركبة بالإنجليزية
 * @returns الترجمة العربية أو النص الأصلي إذا لم توجد ترجمة
 */
export function translateVehicleType(vehicleType: string | null | undefined): string {
    if (!vehicleType) return 'غير محدد';

    // تنظيف النص
    const cleanedType = vehicleType.trim();

    // البحث في قاموس الترجمة
    const translation = VEHICLE_TYPE_TRANSLATIONS[cleanedType];
    if (translation) return translation;

    // محاولة البحث بأحرف صغيرة
    const lowerCaseType = cleanedType.toLowerCase();
    const lowerTranslation = VEHICLE_TYPE_TRANSLATIONS[lowerCaseType];
    if (lowerTranslation) return lowerTranslation;

    // محاولة البحث بأحرف كبيرة
    const upperCaseType = cleanedType.toUpperCase();
    const upperTranslation = VEHICLE_TYPE_TRANSLATIONS[upperCaseType];
    if (upperTranslation) return upperTranslation;

    // إذا كان النص بالعربية أصلاً، أرجعه كما هو
    if (/[\u0600-\u06FF]/.test(cleanedType)) {
        return cleanedType;
    }

    // إرجاع النص الأصلي مع تسجيل تحذير في console (للتطوير فقط)
    if (process.env.NODE_ENV === 'development') {
        console.warn(`[Transport Translation] نوع مركبة غير معروف: "${vehicleType}"`);
    }

    return cleanedType;
}

/**
 * ترجمة نوع خدمة النقل
 * @param serviceType - نوع الخدمة
 * @returns الترجمة العربية
 */
export function translateServiceType(serviceType: string | null | undefined): string {
    if (!serviceType) return 'خدمة نقل';

    const cleanedType = serviceType.trim();

    // البحث في قاموس الترجمة
    const translation = SERVICE_TYPE_TRANSLATIONS[cleanedType];
    if (translation) return translation;

    // محاولة البحث بأحرف مختلفة
    const lowerTranslation = SERVICE_TYPE_TRANSLATIONS[cleanedType.toLowerCase()];
    if (lowerTranslation) return lowerTranslation;

    const upperTranslation = SERVICE_TYPE_TRANSLATIONS[cleanedType.toUpperCase()];
    if (upperTranslation) return upperTranslation;

    // إذا كان النص بالعربية أصلاً
    if (/[\u0600-\u06FF]/.test(cleanedType)) {
        return cleanedType;
    }

    return cleanedType;
}

/**
 * الحصول على خيارات أنواع المركبات للـ Select
 * @returns قائمة الخيارات مع value و label
 */
export function getVehicleTypeOptions(): Array<{ value: string; label: string; }> {
    return VEHICLE_TYPES_LIST.map(type => ({
        value: type.value,
        label: type.label,
    }));
}

/**
 * الحصول على تفاصيل نوع مركبة معين
 * @param vehicleType - نوع المركبة
 * @returns تفاصيل النوع أو null
 */
export function getVehicleTypeDetails(vehicleType: string): {
    id: string;
    value: string;
    label: string;
    description: string;
} | null {
    const cleanedType = vehicleType?.trim().toLowerCase();
    return VEHICLE_TYPES_LIST.find(
        type => type.id.toLowerCase() === cleanedType || type.value.toLowerCase() === cleanedType
    ) || null;
}

/**
 * التحقق مما إذا كان نوع المركبة صالحاً
 * @param vehicleType - نوع المركبة للتحقق
 * @returns true إذا كان النوع صالحاً
 */
export function isValidVehicleType(vehicleType: string): boolean {
    if (!vehicleType) return false;
    const cleanedType = vehicleType.trim().toLowerCase();
    return VEHICLE_TYPES_LIST.some(
        type => type.id.toLowerCase() === cleanedType || type.value.toLowerCase() === cleanedType
    );
}

// ============================================
// === التصدير الافتراضي ===
// ============================================

const transportTranslations = {
    translateVehicleType,
    translateServiceType,
    getVehicleTypeOptions,
    getVehicleTypeDetails,
    isValidVehicleType,
    VEHICLE_TYPE_TRANSLATIONS,
    SERVICE_TYPE_TRANSLATIONS,
    VEHICLE_TYPES_LIST,
};

export default transportTranslations;
