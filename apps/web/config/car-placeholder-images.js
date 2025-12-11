// تكوين صور السيارات البديلة - بدون صور نساء
// جميع الصور من مصادر مناسبة للسيارات فقط

const LOCAL_FALLBACKS = [
  '/images/cars/default-car.svg',
  '/images/placeholder-car.svg',
  '/images/cars/camry1.svg',
  '/images/cars/elantra1.svg',
  '/images/cars/altima1.svg',
];

const CAR_PLACEHOLDER_IMAGES = {
  // الصور الافتراضية للسيارات
  default: '/images/cars/default-car.svg',
  placeholder: '/images/placeholder-car.svg',

  // صور السيارات حسب النوع (محلية فقط)
  sedan: LOCAL_FALLBACKS,
  suv: LOCAL_FALLBACKS,
  hatchback: LOCAL_FALLBACKS,

  // صور حسب العلامة التجارية (محلية فقط)
  brands: {
    تويوتا: '/images/cars/camry1.svg',
    نيسان: '/images/cars/altima1.svg',
    هوندا: '/images/cars/elantra1.svg',
    مرسيدس: '/images/cars/default-car.svg',
    'بي إم دبليو': '/images/cars/default-car.svg',
    أودي: '/images/cars/default-car.svg',
    'فولكس واجن': '/images/cars/default-car.svg',
    فورد: '/images/cars/default-car.svg',
    شيفروليه: '/images/cars/default-car.svg',
  },

  // صور للمعارض (محلية فقط)
  showrooms: ['/images/placeholder-car.svg', '/images/cars/default-car.svg'],

  // صور صغيرة للبطاقات (محلية فقط)
  thumbnails: {
    small: '/images/placeholder-car.svg',
    medium: '/images/placeholder-car.svg',
    large: '/images/placeholder-car.svg',
  },
};

// دالة للحصول على صورة عشوائية حسب النوع
export const getRandomCarImage = (type = 'sedan') => {
  const images = CAR_PLACEHOLDER_IMAGES[type] || CAR_PLACEHOLDER_IMAGES.sedan;
  // اختيار ثابت آمن لتجنب الاعتماد على الشبكات الخارجية أو الصور العشوائية من Unsplash
  return images[0] || CAR_PLACEHOLDER_IMAGES.default;
};

// دالة للحصول على صورة حسب العلامة التجارية
export const getCarImageByBrand = (brand) => {
  return CAR_PLACEHOLDER_IMAGES.brands[brand] || CAR_PLACEHOLDER_IMAGES.default;
};

// دالة للحصول على صورة بديلة آمنة
export const getSafeCarImage = (originalSrc, fallbackType = 'sedan') => {
  // إذا كانت الصورة الأصلية موجودة ومن مصدر آمن، استخدمها
  if (originalSrc && !originalSrc.includes('placeholder') && originalSrc.startsWith('/images/')) {
    return originalSrc;
  }

  // وإلا استخدم صورة بديلة آمنة محلية
  return getRandomCarImage(fallbackType);
};

// دالة للتحقق من أن الصورة مناسبة (لا تحتوي على نساء)
export const isImageAppropriate = (imageSrc) => {
  // قائمة بالكلمات المفتاحية التي قد تشير لصور غير مناسبة
  const inappropriateKeywords = [
    'woman',
    'women',
    'girl',
    'female',
    'lady',
    'model',
    'person',
    'people',
    'human',
    'face',
    'portrait',
  ];

  const lowerSrc = imageSrc.toLowerCase();
  return !inappropriateKeywords.some((keyword) => lowerSrc.includes(keyword));
};

// دالة شاملة للحصول على صورة سيارة آمنة
export const getAppropriatCarImage = (originalSrc, carBrand, carType = 'sedan') => {
  // أولاً: تحقق من الصورة الأصلية
  if (
    originalSrc &&
    !originalSrc.includes('blob:') && // استبعاد blob URLs
    isImageAppropriate(originalSrc)
  ) {
    return originalSrc;
  }

  // إذا كانت الصورة الأصلية blob URL، سجل تحذير
  if (originalSrc && originalSrc.includes('blob:')) {
    console.warn('تم تجاهل blob URL في getAppropriatCarImage:', originalSrc);
  }

  // ثانياً: جرب الحصول على صورة حسب العلامة التجارية
  if (carBrand && CAR_PLACEHOLDER_IMAGES.brands[carBrand]) {
    return CAR_PLACEHOLDER_IMAGES.brands[carBrand];
  }

  // ثالثاً: احصل على صورة عشوائية حسب النوع
  return getRandomCarImage(carType);
};

export default CAR_PLACEHOLDER_IMAGES;
