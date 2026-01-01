/**
 * Formatting utilities
 * أدوات التنسيق والتحويل
 */

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-LY', {
    style: 'currency',
    currency: 'LYD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format time remaining
export const formatTimeRemaining = (milliseconds: number): string => {
  if (milliseconds <= 0) {
    return 'انتهى';
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days} يوم و ${hours} ساعة`;
  } else if (hours > 0) {
    return `${hours} ساعة و ${minutes} دقيقة`;
  } else if (minutes > 0) {
    return `${minutes} دقيقة و ${seconds} ثانية`;
  } else {
    return `${seconds} ثانية`;
  }
};

// Format date and time
export const formatDateTime = (timestamp: number): string => {
  return new Intl.DateTimeFormat('ar-LY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(timestamp));
};

// Format time ago
export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `منذ ${years} ${years === 1 ? 'سنة' : 'سنوات'}`;
  } else if (months > 0) {
    return `منذ ${months} ${months === 1 ? 'شهر' : 'أشهر'}`;
  } else if (weeks > 0) {
    return `منذ ${weeks} ${weeks === 1 ? 'أسبوع' : 'أسابيع'}`;
  } else if (days > 0) {
    return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
  } else if (hours > 0) {
    return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
  } else if (minutes > 0) {
    return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
  } else {
    return 'الآن';
  }
};

// Format number with separators
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ar-LY').format(num);
};

// Format percentage
export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  const sizes = ['بايت', 'ك.ب', 'م.ب', 'ج.ب', 'ت.ب'];
  if (bytes === 0) return '0 بايت';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

// Format price (alias for formatCurrency)  
export const formatprice = formatCurrency;
export const formatPrice = formatCurrency;

// Translate English terms to Arabic - ترجمة المصطلحات الإنجليزية للعربية
export const translateToArabic = (term: string): string => {
  if (!term) return 'غير محدد';

  const translations: Record<string, string> = {
    // حالة السيارة - English & Arabic variants
    // خياران فقط - موحد
    'NEW': 'جديد',
    'USED': 'مستعمل',
    'جديد': 'جديد',
    'مستعمل': 'مستعمل',
    // القيم القديمة - تحويل للنظام الجديد
    'جديدة': 'جديد',
    'مستعملة': 'مستعمل',
    'EXCELLENT': 'مستعمل',
    'VERY_GOOD': 'مستعمل',
    'GOOD': 'مستعمل',
    'FAIR': 'مستعمل',
    'POOR': 'مستعمل',
    'DAMAGED': 'مستعمل',
    'ممتازة': 'مستعمل',
    'جيدة جداً': 'مستعمل',
    'جيدة': 'مستعمل',
    'مقبولة': 'مستعمل',
    'تحتاج صيانة': 'مستعمل',

    // نوع الوقود
    'PETROL': 'بنزين',
    'GASOLINE': 'بنزين',
    'DIESEL': 'ديزل',
    'HYBRID': 'هجين',
    'ELECTRIC': 'كهربائي',
    'LPG': 'غاز طبيعي',
    'CNG': 'غاز مضغوط',
    'بنزين': 'بنزين',
    'ديزل': 'ديزل',
    'كهربائي': 'كهربائي',
    'هجين': 'هجين',
    'غاز طبيعي': 'غاز طبيعي',

    // ناقل الحركة
    'MANUAL': 'يدوي',
    'AUTOMATIC': 'أوتوماتيك',
    'CVT': 'متغير مستمر',
    'SEMI_AUTOMATIC': 'نصف أوتوماتيك',
    'يدوي': 'يدوي',
    'أوتوماتيك': 'أوتوماتيك',
    'متغير مستمر': 'متغير مستمر',

    // نوع الهيكل
    'SEDAN': 'سيدان',
    'HATCHBACK': 'هاتشباك',
    'SUV': 'دفع رباعي',
    'COUPE': 'كوبيه',
    'CONVERTIBLE': 'قابل للتحويل',
    'WAGON': 'عربة',
    'PICKUP': 'بيك اب',
    'VAN': 'فان',
    'TRUCK': 'شاحنة',
    'MOTORCYCLE': 'دراجة نارية',
    'سيدان': 'سيدان',
    'هاتشباك': 'هاتشباك',
    'دفع رباعي': 'دفع رباعي',
    'كوبيه': 'كوبيه',
    'كروس أوفر': 'كروس أوفر',
    'بيك أب': 'بيك أب',
    'فان': 'فان',
    'شاحنة': 'شاحنة',

    // المواصفات الإقليمية
    'GCC': 'خليجي',
    'AMERICAN': 'أمريكي',
    'EUROPEAN': 'أوروبي',
    'JAPANESE': 'ياباني',
    'KOREAN': 'كوري',
    'CHINESE': 'صيني',
    'مواصفات أمريكية': 'مواصفات أمريكية',
    'مواصفات أوروبية': 'مواصفات أوروبية',
    'مواصفات خليجية': 'مواصفات خليجية',
    'مواصفات يابانية': 'مواصفات يابانية',
    'مواصفات كورية': 'مواصفات كورية',
    'مواصفات صينية': 'مواصفات صينية',
    'مواصفات كندية': 'مواصفات كندية',

    // الألوان
    'WHITE': 'أبيض',
    'BLACK': 'أسود',
    'SILVER': 'فضي',
    'GRAY': 'رمادي',
    'GREY': 'رمادي',
    'RED': 'أحمر',
    'BLUE': 'أزرق',
    'GREEN': 'أخضر',
    'YELLOW': 'أصفر',
    'BROWN': 'بني',
    'GOLD': 'ذهبي',
    'ORANGE': 'برتقالي',
    'PURPLE': 'بنفسجي',
    'PINK': 'وردي',
    'BEIGE': 'بيج',
    'أبيض': 'أبيض',
    'أسود': 'أسود',
    'فضي': 'فضي',
    'رمادي': 'رمادي',
    'أحمر': 'أحمر',
    'أزرق': 'أزرق',
    'أخضر': 'أخضر',
    'أصفر': 'أصفر',
    'بني': 'بني',
    'ذهبي': 'ذهبي',
    'برتقالي': 'برتقالي',
    'بنفسجي': 'بنفسجي',
    'وردي': 'وردي',
    'بيج': 'بيج',
    'أخرى': 'أخرى',

    // حالة المزاد
    'UPCOMING': 'قادم',
    'LIVE': 'مباشر',
    'ENDED': 'منتهي',
    'CANCELLED': 'ملغي',
    'SUSPENDED': 'معلق',

    // نوع الحساب
    'REGULAR_USER': 'مستخدم عادي',
    'TRANSPORT_OWNER': 'مالك نقل',
    'COMPANY': 'شركة',
    'SHOWROOM': 'معرض',

    // حالة الإعلان
    'AVAILABLE': 'متاح',
    'SOLD': 'مباع',
    'RESERVED': 'محجوز',
    'INACTIVE': 'غير نشط',

    // أخرى
    'YES': 'نعم',
    'NO': 'لا',
    'UNKNOWN': 'غير محدد',
    'N/A': 'غير متوفر',
    'NULL': 'غير محدد',
    'UNDEFINED': 'غير محدد'
  };

  // محاولة المطابقة المباشرة أولاً
  const directMatch = translations[term];
  if (directMatch) return directMatch;

  // تحويل إلى أحرف كبيرة للمطابقة
  const upperTerm = term?.toString().toUpperCase().trim();
  const upperMatch = translations[upperTerm];
  if (upperMatch) return upperMatch;

  // إذا لم تُوجد ترجمة، أرجع النص الأصلي (قد يكون عربياً بالفعل)
  return term;
};

// Format car condition - تنسيق حالة السيارة
export const formatCarCondition = (condition: string): string => {
  return translateToArabic(condition);
};

// Format fuel type - تنسيق نوع الوقود
export const formatFuelType = (fuelType: string): string => {
  return translateToArabic(fuelType);
};

// Format transmission - تنسيق ناقل الحركة
export const formatTransmission = (transmission: string): string => {
  return translateToArabic(transmission);
};

export const formatCityRegion = (location?: string | null): string => {
  const raw = (location ?? '').toString().trim();
  if (!raw) return 'غير محدد';

  // قائمة المناطق الكبرى التي يجب إزالتها (من البيانات القديمة)
  const largeRegionsToRemove = [
    'المنطقة الغربية',
    'المنطقة الشرقية',
    'المنطقة الوسطى',
    'المنطقة الجنوبية'
  ];

  // إذا كان النص يحتوي على فاصلة، معالجة الأجزاء
  if (raw.includes('،') || raw.includes(',')) {
    const parts = raw.includes('،') ? raw.split('،') : raw.split(',');

    // إزالة المناطق الكبرى والأجزاء الفارغة
    const filteredParts = parts
      .map(part => part.trim())
      .filter(part =>
        part.length > 0 &&
        !largeRegionsToRemove.includes(part)
      );

    // إرجاع الأجزاء المفلترة
    if (filteredParts.length > 0) {
      return filteredParts.join('، ');
    }
  }

  // التحقق من وجود منطقة كبرى في النص بدون فاصلة وإزالتها
  for (const region of largeRegionsToRemove) {
    if (raw === region) {
      return 'غير محدد'; // إذا كان النص بالكامل منطقة كبرى
    }
  }

  // إرجاع النص كما هو إذا لم تكن هناك مناطق كبرى
  return raw;
};
