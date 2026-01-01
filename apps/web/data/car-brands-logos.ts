// بيانات ماركات السيارات مع الشعارات - نظام موحد محسن
export interface CarBrand {
  /** اسم الماركة بالعربية */
  name: string;
  /** اسم الماركة بالإنجليزية */
  nameEn?: string;
  /** مسار الشعار الأساسي */
  logo?: string;
  /** مسار الشعار عالي الجودة */
  logoHd?: string;
  /** لون الماركة الأساسي */
  brandColor?: string;
  /** هل الماركة شائعة في ليبيا */
  popular?: boolean;
  /** فئة الماركة */
  category?: 'economy' | 'luxury' | 'sport' | 'commercial' | 'electric';
  /** بلد المنشأ */
  origin?: string;
  /** ترتيب العرض */
  sortOrder?: number;
}

// مسار الشعارات الموحد
const LOGOS_PATH = '/images/car-brands/real-logos';
const DEFAULT_LOGO = '/images/car-brands/default.svg';

export const carBrands: CarBrand[] = [
  // الماركات الشائعة في ليبيا
  {
    name: 'تويوتا',
    nameEn: 'Toyota',
    logo: `${LOGOS_PATH}/toyota.svg`,
    brandColor: '#eb0a1e',
    popular: true,
    category: 'economy',
    origin: 'اليابان',
    sortOrder: 1,
  },
  {
    name: 'نيسان',
    nameEn: 'Nissan',
    logo: `${LOGOS_PATH}/nissan.svg`,
    brandColor: '#c3002f',
    popular: true,
    category: 'economy',
    origin: 'اليابان',
    sortOrder: 2,
  },
  {
    name: 'هوندا',
    nameEn: 'Honda',
    logo: `${LOGOS_PATH}/honda.svg`,
    brandColor: '#cc0000',
    popular: true,
    category: 'economy',
    origin: 'اليابان',
    sortOrder: 3,
  },
  {
    name: 'هيونداي',
    nameEn: 'Hyundai',
    logo: `${LOGOS_PATH}/hyundai.svg`,
    brandColor: '#002c5f',
    popular: true,
    category: 'economy',
    origin: 'كوريا الجنوبية',
    sortOrder: 4,
  },
  {
    name: 'كيا',
    nameEn: 'Kia',
    logo: `${LOGOS_PATH}/kia.svg`,
    brandColor: '#05141f',
    popular: true,
    category: 'economy',
    origin: 'كوريا الجنوبية',
    sortOrder: 5,
  },
  {
    name: 'مازدا',
    nameEn: 'Mazda',
    logo: `${LOGOS_PATH}/mazda.svg`,
    brandColor: '#0066cc',
    popular: true,
    category: 'economy',
    origin: 'اليابان',
    sortOrder: 6,
  },
  {
    name: 'ميتسوبيشي',
    nameEn: 'Mitsubishi',
    logo: `${LOGOS_PATH}/mitsubishi.svg`,
    brandColor: '#e60012',
    popular: true,
    category: 'economy',
    origin: 'اليابان',
    sortOrder: 7,
  },
  {
    name: 'سوزوكي',
    nameEn: 'Suzuki',
    logo: `${LOGOS_PATH}/suzuki.svg`,
    brandColor: '#e10e24',
    popular: true,
    category: 'economy',
    origin: 'اليابان',
    sortOrder: 8,
  },
  {
    name: 'فولكس واجن',
    nameEn: 'Volkswagen',
    logo: `${LOGOS_PATH}/volkswagen.svg`,
    brandColor: '#001e50',
    popular: true,
    category: 'economy',
    origin: 'ألمانيا',
    sortOrder: 9,
  },
  {
    name: 'فورد',
    nameEn: 'Ford',
    logo: `${LOGOS_PATH}/ford.svg`,
    brandColor: '#003478',
    popular: true,
    category: 'economy',
    origin: 'أمريكا',
    sortOrder: 10,
  },

  // الماركات الفاخرة
  {
    name: 'مرسيدس',
    nameEn: 'Mercedes-Benz',
    logo: `${LOGOS_PATH}/mercedes.svg`,
    brandColor: '#00adef',
    category: 'luxury',
    origin: 'ألمانيا',
    sortOrder: 11,
  },
  {
    name: 'BMW',
    nameEn: 'BMW',
    logo: `${LOGOS_PATH}/bmw.svg`,
    brandColor: '#0066b2',
    category: 'luxury',
    origin: 'ألمانيا',
    sortOrder: 12,
  },
  {
    name: 'أودي',
    nameEn: 'Audi',
    logo: `${LOGOS_PATH}/audi.svg`,
    brandColor: '#bb0a30',
    category: 'luxury',
    origin: 'ألمانيا',
    sortOrder: 13,
  },
  {
    name: 'لكزس',
    nameEn: 'Lexus',
    logo: `${LOGOS_PATH}/lexus.svg`,
    brandColor: '#00205b',
    category: 'luxury',
    origin: 'اليابان',
    sortOrder: 14,
  },
  {
    name: 'إنفينيتي',
    nameEn: 'Infiniti',
    logo: `${LOGOS_PATH}/infiniti.svg`,
    brandColor: '#000000',
    category: 'luxury',
    origin: 'اليابان',
    sortOrder: 15,
  },

  // ماركات أخرى بدون شعارات حالياً
  {
    name: 'أكورا',
    nameEn: 'Acura',
    category: 'luxury',
    origin: 'اليابان',
    sortOrder: 16,
  },
  {
    name: 'كاديلاك',
    nameEn: 'Cadillac',
    category: 'luxury',
    origin: 'أمريكا',
    sortOrder: 17,
  },
  {
    name: 'لينكولن',
    nameEn: 'Lincoln',
    category: 'luxury',
    origin: 'أمريكا',
    sortOrder: 18,
  },
  {
    name: 'جاكوار',
    nameEn: 'Jaguar',
    category: 'luxury',
    origin: 'بريطانيا',
    sortOrder: 19,
  },
  {
    name: 'لاند روفر',
    nameEn: 'Land Rover',
    category: 'luxury',
    origin: 'بريطانيا',
    sortOrder: 20,
  },
  {
    name: 'بورش',
    nameEn: 'Porsche',
    category: 'sport',
    origin: 'ألمانيا',
    sortOrder: 21,
  },
  {
    name: 'فولفو',
    nameEn: 'Volvo',
    category: 'luxury',
    origin: 'السويد',
    sortOrder: 22,
  },

  // الماركات الأمريكية
  {
    name: 'شيفروليه',
    nameEn: 'Chevrolet',
    logo: `${LOGOS_PATH}/chevrolet.svg`,
    brandColor: '#ffc72c',
    category: 'economy',
    origin: 'أمريكا',
    sortOrder: 23,
  },
  {
    name: 'جي إم سي',
    nameEn: 'GMC',
    category: 'commercial',
    origin: 'أمريكا',
    sortOrder: 24,
  },
  {
    name: 'دودج',
    nameEn: 'Dodge',
    category: 'economy',
    origin: 'أمريكا',
    sortOrder: 25,
  },
  {
    name: 'كرايسلر',
    nameEn: 'Chrysler',
    category: 'economy',
    origin: 'أمريكا',
    sortOrder: 26,
  },
  {
    name: 'جيب',
    nameEn: 'Jeep',
    category: 'economy',
    origin: 'أمريكا',
    sortOrder: 27,
  },
  {
    name: 'بويك',
    nameEn: 'Buick',
    category: 'luxury',
    origin: 'أمريكا',
    sortOrder: 28,
  },

  // الماركات الفرنسية
  {
    name: 'رينو',
    nameEn: 'Renault',
    logo: `${LOGOS_PATH}/renault.svg`,
    brandColor: '#ffcc00',
    category: 'economy',
    origin: 'فرنسا',
    sortOrder: 29,
  },
  {
    name: 'بيجو',
    nameEn: 'Peugeot',
    logo: `${LOGOS_PATH}/peugeot.svg`,
    brandColor: '#0066cc',
    category: 'economy',
    origin: 'فرنسا',
    sortOrder: 30,
  },
  {
    name: 'سيتروين',
    nameEn: 'Citroen',
    category: 'economy',
    origin: 'فرنسا',
    sortOrder: 31,
  },

  // الماركات الإيطالية
  {
    name: 'فيات',
    nameEn: 'Fiat',
    category: 'economy',
    origin: 'إيطاليا',
    sortOrder: 32,
  },
  {
    name: 'ألفا روميو',
    nameEn: 'Alfa Romeo',
    category: 'sport',
    origin: 'إيطاليا',
    sortOrder: 33,
  },
  {
    name: 'لانشيا',
    nameEn: 'Lancia',
    category: 'luxury',
    origin: 'إيطاليا',
    sortOrder: 34,
  },

  // الماركات الصينية
  {
    name: 'شيري',
    nameEn: 'Chery',
    category: 'economy',
    origin: 'الصين',
    sortOrder: 35,
  },
  {
    name: 'جيلي',
    nameEn: 'Geely',
    category: 'economy',
    origin: 'الصين',
    sortOrder: 36,
  },
  {
    name: 'بي واي دي',
    nameEn: 'BYD',
    category: 'electric',
    origin: 'الصين',
    sortOrder: 37,
  },
  {
    name: 'جريت وول',
    nameEn: 'Great Wall',
    category: 'economy',
    origin: 'الصين',
    sortOrder: 38,
  },
  {
    name: 'هافال',
    nameEn: 'Haval',
    category: 'economy',
    origin: 'الصين',
    sortOrder: 39,
  },

  // ماركات أخرى
  {
    name: 'سكودا',
    nameEn: 'Skoda',
    category: 'economy',
    origin: 'التشيك',
    sortOrder: 40,
  },
  {
    name: 'سيات',
    nameEn: 'Seat',
    category: 'economy',
    origin: 'إسبانيا',
    sortOrder: 41,
  },
  {
    name: 'سوبارو',
    nameEn: 'Subaru',
    logo: `${LOGOS_PATH}/subaru.svg`,
    brandColor: '#0052cc',
    category: 'economy',
    origin: 'اليابان',
    sortOrder: 42,
  },
  {
    name: 'إيسوزو',
    nameEn: 'Isuzu',
    category: 'commercial',
    origin: 'اليابان',
    sortOrder: 43,
  },
  {
    name: 'داتسون',
    nameEn: 'Datsun',
    category: 'economy',
    origin: 'اليابان',
    sortOrder: 44,
  },
  {
    name: 'سانج يونج',
    nameEn: 'SsangYong',
    category: 'economy',
    origin: 'كوريا الجنوبية',
    sortOrder: 45,
  },
  {
    name: 'تاتا',
    nameEn: 'Tata',
    category: 'economy',
    origin: 'الهند',
    sortOrder: 46,
  },
  {
    name: 'ماهيندرا',
    nameEn: 'Mahindra',
    category: 'economy',
    origin: 'الهند',
    sortOrder: 47,
  },

  // ماركات أخرى بدون شعارات
  {
    name: 'أخرى',
    nameEn: 'Other',
    category: 'economy',
    sortOrder: 999,
  },
];

// الماركات الشائعة فقط (مرتبة حسب sortOrder)
export const popularBrands = carBrands
  .filter((brand) => brand.popular)
  .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));

// الماركات مرتبة حسب الفئة
export const brandsByCategory = {
  economy: carBrands.filter((brand) => brand.category === 'economy'),
  luxury: carBrands.filter((brand) => brand.category === 'luxury'),
  sport: carBrands.filter((brand) => brand.category === 'sport'),
  commercial: carBrands.filter((brand) => brand.category === 'commercial'),
  electric: carBrands.filter((brand) => brand.category === 'electric'),
};

// الماركات التي لديها شعارات
export const brandsWithLogos = carBrands.filter((brand) => brand.logo);

// دالة للبحث عن ماركة (محسنة)
export const findBrand = (name: string): CarBrand | undefined => {
  if (!name) return undefined;

  return carBrands.find(
    (brand) =>
      brand.name.toLowerCase() === name.toLowerCase() ||
      brand.name === name ||
      brand.nameEn?.toLowerCase() === name.toLowerCase(),
  );
};

// دالة للحصول على شعار الماركة مع fallback
export const getBrandLogo = (brandName: string): string => {
  const brand = findBrand(brandName);
  return brand?.logo || DEFAULT_LOGO;
};

// دالة للحصول على لون الماركة
export const getBrandColor = (brandName: string): string | undefined => {
  const brand = findBrand(brandName);
  return brand?.brandColor;
};

// دالة للحصول على معلومات الماركة الكاملة
export const getBrandInfo = (brandName: string) => {
  const brand = findBrand(brandName);
  if (!brand) return null;

  return {
    ...brand,
    logo: brand.logo || DEFAULT_LOGO,
    hasLogo: !!brand.logo,
  };
};

// دالة للبحث في الماركات
export const searchBrands = (searchTerm: string): CarBrand[] => {
  if (!searchTerm) return carBrands;

  const term = searchTerm.toLowerCase();
  return carBrands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(term) ||
      brand.nameEn?.toLowerCase().includes(term) ||
      brand.origin?.toLowerCase().includes(term),
  );
};

// دالة لترتيب الماركات (الشائعة أولاً ثم أبجدياً)
export const getSortedBrands = (prioritizePopular = true): CarBrand[] => {
  if (!prioritizePopular) {
    return [...carBrands].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }

  const popular = popularBrands;
  const others = carBrands
    .filter((brand) => !brand.popular)
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'));

  return [...popular, ...others];
};

// إحصائيات الماركات
export const brandStats = {
  total: carBrands.length,
  withLogos: brandsWithLogos.length,
  popular: popularBrands.length,
  byCategory: {
    economy: brandsByCategory.economy.length,
    luxury: brandsByCategory.luxury.length,
    sport: brandsByCategory.sport.length,
    commercial: brandsByCategory.commercial.length,
    electric: brandsByCategory.electric.length,
  },
};

// تصدير المسارات والثوابت
export { LOGOS_PATH, DEFAULT_LOGO };

// تصدير افتراضي
export default carBrands;
