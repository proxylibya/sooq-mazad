// قائمة البنوك الليبية الشاملة
// Comprehensive List of Libyan Banks

export interface LibyanBank {
  id: string;
  nameAr: string;
  nameEn: string;
  type: 'government' | 'commercial' | 'islamic' | 'investment' | 'development';
  code: string;
  swiftCode?: string;
  established?: number;
  headquarters: string;
  isActive: boolean;
  logo?: string;
  website?: string;
  description?: string;
  features?: string[];
  rating?: number;
  minFinancingRate?: string;
}

export const libyanBanks: LibyanBank[] = [
  {
    id: 'libyan-islamic-bank',
    nameAr: 'المصرف الإسلامي الليبي',
    nameEn: 'Libyan Islamic Bank',
    type: 'islamic',
    code: 'LIB',
    swiftCode: 'LIBYLYTX',
    established: 2007,
    headquarters: 'طرابلس',
    isActive: true,
    logo: '/images/banks/libyan-islamic-bank.png',
    website: 'https://lib.ly',
    description: 'أول مصرف إسلامي في ليبيا يقدم خدمات مصرفية متوافقة مع أحكام الشريعة الإسلامية',
    features: ['تمويل إسلامي', 'بدون فوائد', 'أحكام شرعية', 'خدمات رقمية'],
    rating: 4.6,
    minFinancingRate: '6%',
  },
  {
    id: 'tadhamun-bank',
    nameAr: 'المصرف التضامن',
    nameEn: 'Tadhamun Bank',
    type: 'commercial',
    code: 'TAD',
    swiftCode: 'TADLYTX',
    established: 2010,
    headquarters: 'طرابلس',
    isActive: true,
    logo: '/images/banks/tadhamun-bank.png',
    description: 'مصرف تجاري يقدم خدمات مصرفية شاملة للأفراد والشركات',
    features: ['خدمات شاملة', 'تمويل الأفراد', 'خدمات الشركات', 'حلول رقمية'],
    rating: 4.3,
    minFinancingRate: '8%',
  },
  {
    id: 'aman-bank',
    nameAr: 'مصرف الأمان',
    nameEn: 'Aman Bank',
    type: 'commercial',
    code: 'AMA',
    swiftCode: 'AMALYTX',
    established: 2009,
    headquarters: 'طرابلس',
    isActive: true,
    logo: '/images/banks/aman-bank.png',
    description: 'مصرف تجاري متخصص في تقديم حلول مالية مبتكرة',
    features: ['حلول مبتكرة', 'خدمة عملاء ممتازة', 'تمويل سريع', 'أمان عالي'],
    rating: 4.4,
    minFinancingRate: '7.5%',
  },
  {
    id: 'andalus-bank',
    nameAr: 'مصرف الأندلس',
    nameEn: 'Andalus Bank',
    type: 'commercial',
    code: 'AND',
    swiftCode: 'ANDLYTX',
    established: 2008,
    headquarters: 'بنغازي',
    isActive: true,
    logo: '/images/banks/andalus-bank.png',
    description: 'مصرف تجاري يخدم المنطقة الشرقية بخدمات مصرفية متطورة',
    features: ['خدمات متطورة', 'تغطية شرقية', 'تمويل متنوع', 'دعم فني'],
    rating: 4.2,
    minFinancingRate: '8.5%',
  },
  {
    id: 'arab-islamic-investment-bank',
    nameAr: 'مصرف الإستثمار العربي الإسلامي',
    nameEn: 'Arab Islamic Investment Bank',
    type: 'investment',
    code: 'AIB',
    swiftCode: 'AIBLYTX',
    established: 2011,
    headquarters: 'طرابلس',
    isActive: true,
    logo: '/images/banks/arab-islamic-investment-bank.png',
    description: 'مصرف استثماري إسلامي متخصص في التمويل والاستثمار',
    features: ['استثمار إسلامي', 'تمويل المشاريع', 'إدارة الأصول', 'استشارات مالية'],
    rating: 4.1,
    minFinancingRate: '9%',
  },
  {
    id: 'national-union-bank',
    nameAr: 'مصرف الاتحاد الوطني',
    nameEn: 'National Union Bank',
    type: 'commercial',
    code: 'NUB',
    swiftCode: 'NUBLYTX',
    established: 2012,
    headquarters: 'طرابلس',
    isActive: true,
    logo: '/images/banks/national-union-bank.png',
    description: 'مصرف وطني يهدف لدعم الاقتصاد الليبي',
    features: ['دعم وطني', 'تمويل محلي', 'خدمات متكاملة', 'شراكات قوية'],
    rating: 4.0,
    minFinancingRate: '8.8%',
  },
  {
    id: 'commerce-development-bank',
    nameAr: 'مصرف التجارة والتنمية',
    nameEn: 'Bank of Commerce & Development',
    type: 'commercial',
    code: 'BCD',
    swiftCode: 'BCDLYTX',
    established: 2006,
    headquarters: 'طرابلس',
    isActive: true,
    logo: '/images/banks/commerce-development-bank.png',
    description: 'مصرف متخصص في تمويل التجارة والتنمية الاقتصادية',
    features: ['تمويل التجارة', 'دعم التنمية', 'حلول تجارية', 'خدمات دولية'],
    rating: 4.3,
    minFinancingRate: '8.2%',
  },
  {
    id: 'national-commercial-bank',
    nameAr: 'مصرف التجاري الوطني',
    nameEn: 'National Commercial Bank',
    type: 'commercial',
    code: 'NCB',
    swiftCode: 'NCBLYTX',
    established: 1970,
    headquarters: 'طرابلس',
    isActive: true,
    logo: '/images/banks/national-commercial-bank.png',
    description: 'أحد أعرق المصارف التجارية في ليبيا',
    features: ['خبرة عريقة', 'شبكة واسعة', 'خدمات شاملة', 'ثقة عالية'],
    rating: 4.5,
    minFinancingRate: '7.8%',
  },
  {
    id: 'development-bank',
    nameAr: 'مصرف التنمية',
    nameEn: 'Development Bank',
    type: 'development',
    code: 'DEV',
    swiftCode: 'DEVLYTX',
    established: 1981,
    headquarters: 'طرابلس',
    isActive: true,
    logo: '/images/banks/development-bank.png',
    description: 'مصرف متخصص في تمويل مشاريع التنمية',
    features: ['تمويل التنمية', 'دعم المشاريع', 'قروض ميسرة', 'استشارات فنية'],
    rating: 4.2,
    minFinancingRate: '6.5%',
  },
  {
    id: 'jumhouria-bank',
    nameAr: 'مصرف الجمهورية',
    nameEn: 'Jumhouria Bank',
    type: 'government',
    code: 'JUM',
    swiftCode: 'JUMLYTX',
    established: 1969,
    headquarters: 'طرابلس',
    isActive: true,
    logo: '/images/banks/jumhouria-bank.png',
    description: 'المصرف المركزي التجاري الرئيسي في ليبيا',
    features: ['مصرف حكومي', 'شبكة واسعة', 'خدمات أساسية', 'استقرار مالي'],
    rating: 4.4,
    minFinancingRate: '7%',
  },
  {
    id: 'first-gulf-libyan-bank',
    nameAr: 'مصرف الخليج الأول',
    nameEn: 'First Gulf Libyan Bank',
    type: 'commercial',
    code: 'FGL',
    swiftCode: 'FGLLYTX',
    established: 2008,
    headquarters: 'طرابلس',
    isActive: true,
    logo: '/images/banks/first-gulf-libyan-bank.png',
    description: 'مصرف تجاري بشراكة خليجية',
    features: ['شراكة خليجية', 'خدمات دولية', 'تقنيات حديثة', 'خبرة متقدمة'],
    rating: 4.3,
    minFinancingRate: '8.3%',
  },
  {
    id: 'assaray-bank',
    nameAr: 'مصرف السراي',
    nameEn: 'Assaray Bank',
    type: 'commercial',
    code: 'ASR',
    swiftCode: 'ASRLYTX',
    established: 2009,
    headquarters: 'طرابلس',
    isActive: true,
    logo: '/images/banks/assaray-bank.png',
    description: 'مصرف تجاري حديث يقدم خدمات مصرفية متطورة',
    features: ['خدمات حديثة', 'تقنيات متطورة', 'خدمة سريعة', 'حلول مرنة'],
    rating: 4.1,
    minFinancingRate: '8.7%',
  },
  {
    id: 'sahara-bank',
    nameAr: 'مصرف الصحارى',
    nameEn: 'Sahara Bank',
    type: 'commercial',
    code: 'SAH',
    swiftCode: 'SAHLYTX',
    established: 2007,
    headquarters: 'سبها',
    isActive: true,
    logo: '/images/banks/sahara-bank.png',
    description: 'مصرف يخدم المنطقة الجنوبية من ليبيا',
    features: ['خدمة جنوبية', 'تمويل محلي', 'دعم المجتمع', 'حلول بسيطة'],
    rating: 3.9,
    minFinancingRate: '9.2%',
  },
  {
    id: 'ubci-bank',
    nameAr: 'مصرف المتحد',
    nameEn: 'UBCI Bank',
    type: 'commercial',
    code: 'UBC',
    swiftCode: 'UBCLYTX',
    established: 2010,
    headquarters: 'طرابلس',
    isActive: true,
    logo: '/images/banks/ubci-bank.png',
    description: 'مصرف تجاري متحد يقدم خدمات متنوعة',
    features: ['خدمات متنوعة', 'شراكات متعددة', 'حلول مالية', 'دعم تقني'],
    rating: 4.0,
    minFinancingRate: '8.6%',
  },
  {
    id: 'meditbank-bank',
    nameAr: 'مصرف المتوسط',
    nameEn: 'Meditbank Bank',
    type: 'commercial',
    code: 'MED',
    swiftCode: 'MEDLYTX',
    established: 2008,
    headquarters: 'طرابلس',
    isActive: true,
    logo: '/images/banks/meditbank-bank.png',
    description: 'مصرف متوسطي يربط ليبيا بالأسواق الدولية',
    features: ['اتصال دولي', 'خدمات متوسطية', 'تجارة خارجية', 'حوالات دولية'],
    rating: 4.2,
    minFinancingRate: '8.4%',
  },
  {
    id: 'nuran-bank',
    nameAr: 'مصرف النوران',
    nameEn: 'Nuran Bank',
    type: 'islamic',
    code: 'NUR',
    swiftCode: 'NURLYTX',
    established: 2011,
    headquarters: 'بنغازي',
    isActive: true,
    logo: '/images/banks/nuran-bank.png',
    description: 'مصرف إسلامي يقدم خدمات متوافقة مع الشريعة',
    features: ['تمويل إسلامي', 'أحكام شرعية', 'خدمات شرقية', 'استثمار حلال'],
    rating: 4.1,
    minFinancingRate: '7.2%',
  },
  {
    id: 'waha-bank',
    nameAr: 'مصرف الواحة',
    nameEn: 'Waha Bank',
    type: 'commercial',
    code: 'WAH',
    swiftCode: 'WAHLYTX',
    established: 2009,
    headquarters: 'بنغازي',
    isActive: true,
    logo: '/images/banks/waha-bank.png',
    description: 'مصرف تجاري يخدم المناطق النفطية',
    features: ['خدمة نفطية', 'تمويل الطاقة', 'خدمات صناعية', 'دعم قطاعي'],
    rating: 4.0,
    minFinancingRate: '8.9%',
  },
  {
    id: 'wehda-bank',
    nameAr: 'مصرف الوحدة',
    nameEn: 'Wehda Bank',
    type: 'commercial',
    code: 'WEH',
    swiftCode: 'WEHLYTX',
    established: 1970,
    headquarters: 'بنغازي',
    isActive: true,
    logo: '/images/banks/wehda-bank.png',
    description: 'مصرف عريق يخدم المنطقة الشرقية',
    features: ['تاريخ عريق', 'خدمة شرقية', 'ثقة عالية', 'استقرار مالي'],
    rating: 4.3,
    minFinancingRate: '7.9%',
  },
  {
    id: 'alwafa-bank',
    nameAr: 'مصرف الوفاء',
    nameEn: 'Alwafa Bank',
    type: 'islamic',
    code: 'WAF',
    swiftCode: 'WAFLYTX',
    established: 2012,
    headquarters: 'مصراتة',
    isActive: true,
    logo: '/images/banks/alwafa-bank.png',
    description: 'مصرف إسلامي يقدم خدمات متوافقة مع الشريعة',
    features: ['تمويل إسلامي', 'خدمات شرعية', 'استثمار حلال', 'أمانة عالية'],
    rating: 4.0,
    minFinancingRate: '7.5%',
  },
  {
    id: 'yaqeen-bank',
    nameAr: 'مصرف اليقين',
    nameEn: 'Yaqeen Bank',
    type: 'commercial',
    code: 'YAQ',
    swiftCode: 'YAQLYTX',
    established: 2013,
    headquarters: 'طرابلس',
    isActive: true,
    logo: '/images/banks/yaqeen-bank.png',
    description: 'مصرف حديث يقدم خدمات مصرفية مبتكرة',
    features: ['خدمات مبتكرة', 'تقنيات حديثة', 'يقين وثقة', 'حلول ذكية'],
    rating: 3.8,
    minFinancingRate: '9.1%',
  },
  {
    id: 'north-africa-bank',
    nameAr: 'مصرف شمال أفريقيا',
    nameEn: 'North Africa Bank',
    type: 'commercial',
    code: 'NAB',
    swiftCode: 'NABLYTX',
    established: 2014,
    headquarters: 'طرابلس',
    isActive: true,
    logo: '/images/banks/north-africa-bank.png',
    description: 'مصرف إقليمي يربط ليبيا بشمال أفريقيا',
    features: ['اتصال إقليمي', 'خدمات أفريقية', 'تجارة إقليمية', 'شراكات دولية'],
    rating: 3.9,
    minFinancingRate: '8.8%',
  },
];

// دوال مساعدة للبحث والفلترة
export const getBankById = (id: string): LibyanBank | undefined => {
  return libyanBanks.find((bank) => bank.id === id);
};

export const getBanksByType = (type: LibyanBank['type']): LibyanBank[] => {
  return libyanBanks.filter((bank) => bank.type === type && bank.isActive);
};

export const getActiveBanks = (): LibyanBank[] => {
  return libyanBanks.filter((bank) => bank.isActive);
};

export const getBankNames = (language: 'ar' | 'en' = 'ar'): string[] => {
  return getActiveBanks().map((bank) => (language === 'ar' ? bank.nameAr : bank.nameEn));
};

export const searchBanks = (query: string): LibyanBank[] => {
  const lowerQuery = query.toLowerCase();
  return libyanBanks.filter(
    (bank) =>
      bank.isActive &&
      (bank.nameAr.toLowerCase().includes(lowerQuery) ||
        bank.nameEn.toLowerCase().includes(lowerQuery) ||
        bank.code.toLowerCase().includes(lowerQuery)),
  );
};

// ترتيب البنوك حسب الشهرة والأهمية
export const getBanksByPopularity = (): LibyanBank[] => {
  // البنوك الأكثر شهرة في ليبيا (مرتبة حسب الأهمية)
  const popularBankIds = [
    'jumhouria-bank', // مصرف الجمهورية
    'aman-bank', // مصرف الأمان
    'wehda-bank', // مصرف الوحدة
    'libyan-islamic-bank', // المصرف الإسلامي الليبي
    'national-commercial-bank', // مصرف التجاري الوطني
    'tadhamun-bank', // المصرف التضامن
    'first-gulf-libyan-bank', // مصرف الخليج الأول
    'waha-bank', // مصرف الواحة
    'andalus-bank', // مصرف الأندلس
  ];

  const activeBanks = getActiveBanks();
  const popularBanks: LibyanBank[] = [];
  const otherBanks: LibyanBank[] = [];

  // فصل البنوك الشهيرة عن الباقي
  activeBanks.forEach((bank) => {
    if (popularBankIds.includes(bank.id)) {
      popularBanks.push(bank);
    } else {
      otherBanks.push(bank);
    }
  });

  // ترتيب البنوك الشهيرة حسب الترتيب المحدد
  const sortedPopularBanks = popularBankIds
    .map((id) => popularBanks.find((bank) => bank.id === id))
    .filter((bank) => bank !== undefined) as LibyanBank[];

  // ترتيب البنوك الأخرى حسب التقييم
  const sortedOtherBanks = otherBanks.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return [...sortedPopularBanks, ...sortedOtherBanks];
};

// الحصول على أسماء البنوك مرتبة حسب الشهرة
export const getBankNamesByPopularity = (language: 'ar' | 'en' = 'ar'): string[] => {
  return getBanksByPopularity().map((bank) => (language === 'ar' ? bank.nameAr : bank.nameEn));
};

// إحصائيات البنوك
export const bankStats = {
  total: libyanBanks.length,
  active: getActiveBanks().length,
  byType: {
    government: getBanksByType('government').length,
    commercial: getBanksByType('commercial').length,
    islamic: getBanksByType('islamic').length,
    investment: getBanksByType('investment').length,
    development: getBanksByType('development').length,
  },
};

export default libyanBanks;
