// ترجمة قيم السيارات إلى العربية

// ترجمة أنواع ناقل الحركة
export const transmissionTranslations: { [key: string]: string; } = {
  automatic: 'أوتوماتيك',
  manual: 'عادية',
  أوتوماتيك: 'أوتوماتيك',
  عادية: 'عادية',
  عادي: 'عادية',
  يدوي: 'عادية',
  مانيوال: 'عادية',
};

// ترجمة أنواع الوقود
export const fuelTypeTranslations: { [key: string]: string; } = {
  gasoline: 'بنزين',
  diesel: 'ديزل',
  hybrid: 'هايبرد',
  electric: 'كهربائي',
  lpg: 'غاز طبيعي',
  بنزين: 'بنزين',
  ديزل: 'ديزل',
  هايبرد: 'هايبرد',
  كهربائي: 'كهربائي',
  'غاز طبيعي': 'غاز طبيعي',
};

// ترجمة أنواع الهيكل
export const bodyTypeTranslations: { [key: string]: string; } = {
  sedan: 'سيدان',
  hatchback: 'هاتشباك',
  suv: 'دفع رباعي',
  pickup: 'بيك أب',
  coupe: 'كوبيه',
  convertible: 'مكشوفة',
  wagon: 'ستيشن واجن',
  van: 'فان',
  minivan: 'ميني فان',
  سيدان: 'سيدان',
  هاتشباك: 'هاتشباك',
  'دفع رباعي': 'دفع رباعي',
  SUV: 'دفع رباعي',
  'بيك أب': 'بيك أب',
  كوبيه: 'كوبيه',
};

// ترجمة حالة السيارة - موحد: خياران فقط (جديد/مستعمل)
export const conditionTranslations: { [key: string]: string; } = {
  // القيم الإنجليزية
  new: 'جديد',
  used: 'مستعمل',
  NEW: 'جديد',
  USED: 'مستعمل',
  // القيم العربية
  جديد: 'جديد',
  مستعمل: 'مستعمل',
  // القيم القديمة - تحويل للنظام الجديد
  جديدة: 'جديد',
  مستعملة: 'مستعمل',
  ممتازة: 'مستعمل',
  'جيدة جداً': 'مستعمل',
  جيدة: 'مستعمل',
  مقبولة: 'مستعمل',
  'تحتاج صيانة': 'مستعمل',
  'تحتاج إصلاح': 'مستعمل',
  needs_repair: 'مستعمل',
  NEEDS_REPAIR: 'مستعمل',
  excellent: 'مستعمل',
  good: 'مستعمل',
  fair: 'مستعمل',
  EXCELLENT: 'مستعمل',
  GOOD: 'مستعمل',
  FAIR: 'مستعمل',
};

// دالة لترجمة ناقل الحركة
export const translateTransmission = (transmission: string | undefined): string => {
  if (!transmission) return 'غير محدد';
  return transmissionTranslations[transmission.toLowerCase()] || transmission;
};

// دالة لترجمة نوع الوقود
export const translateFuelType = (fuelType: string | undefined): string => {
  if (!fuelType) return 'بنزين';
  return fuelTypeTranslations[fuelType.toLowerCase()] || fuelType;
};

// دالة لترجمة نوع الهيكل
export const translateBodyType = (bodyType: string | undefined): string => {
  if (!bodyType) return 'سيدان';
  return bodyTypeTranslations[bodyType.toLowerCase()] || bodyType;
};

// دالة لترجمة حالة السيارة - موحد: خياران فقط
export const translateCondition = (condition: string | undefined): string => {
  if (!condition) return 'مستعمل';
  // نحاول أولاً بالقيمة الأصلية، ثم بالحروف الصغيرة
  return conditionTranslations[condition] || conditionTranslations[condition.toLowerCase()] || 'مستعمل';
};

// دالة لتنسيق المسافة المقطوعة
export const formatMileage = (mileage: string | number | undefined): string => {
  if (!mileage || mileage === 'غير محدد') return 'غير محدد';

  const numMileage = typeof mileage === 'string' ? parseInt(mileage) : mileage;
  if (isNaN(numMileage)) return 'غير محدد';

  // تنسيق الرقم بالفواصل
  return numMileage.toLocaleString('ar-EG') + ' كم';
};

// دالة لتنسيق السنة
export const formatYear = (year: string | number | undefined): string => {
  if (!year) return 'غير محدد';
  return year.toString();
};
