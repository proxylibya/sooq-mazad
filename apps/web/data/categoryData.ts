import { libyanCities } from './libyan-cities';

// بيانات وهمية للمعارض
export const mockShowrooms = [
  {
    id: 'showroom-1',
    title: 'معرض الأناقة للسيارات الفاخرة',
    location: 'طرابلس، شارع الجمهورية',
    phone: '+218 91 123 4567',
    rating: 4.9,
    reviewsCount: 245,
    totalCars: 85,
    activeCars: 67,
    images: [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    description: 'معرض متخصص في السيارات الفاخرة والمميزة مع ضمان شامل وخدمة ما بعد البيع',
    openingHours: '9:00 ص - 8:00 م',
    verified: true,
    type: 'معرض فاخر',
    specialties: ['BMW', 'مرسيدس', 'أودي', 'لكزس'],
    establishedYear: 2015,
    services: ['ضمان شامل', 'صيانة', 'تمويل', 'استبدال'],
    features: ['مواقف مجانية', 'صالة انتظار VIP', 'كافيتيريا', 'واي فاي مجاني'],
    featured: true,
    user: {
      id: 'user-1',
      name: 'أحمد محمد',
      phone: '+218 91 123 4567',
      verified: true,
    },
  },
  {
    id: 'showroom-2',
    title: 'معرض النجمة للسيارات اليابانية',
    location: 'بنغازي، شارع جمال عبد الناصر',
    phone: '+218 92 234 5678',
    rating: 4.7,
    reviewsCount: 189,
    totalCars: 120,
    activeCars: 95,
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    description: 'أكبر معرض للسيارات اليابانية في شرق ليبيا مع أفضل الأسعار والجودة',
    openingHours: '8:30 ص - 7:30 م',
    verified: true,
    type: 'معرض عام',
    specialties: ['تويوتا', 'هوندا', 'نيسان', 'مازدا'],
    establishedYear: 2012,
    services: ['فحص شامل', 'ضمان محدود', 'تمويل', 'توصيل'],
    features: ['مواقف واسعة', 'صالة انتظار', 'خدمة عملاء 24/7'],
    user: {
      id: 'user-2',
      name: 'محمد علي',
      phone: '+218 92 234 5678',
      verified: true,
    },
  },
];

// بيانات وهمية لقطع الغيار
export const mockCarParts = [
  {
    id: 'part-1',
    title: 'محرك تويوتا كامري 2018 - 2.5 لتر',
    price: 8500,
    location: 'طرابلس، سوق الجمعة',
    category: 'محركات',
    brand: 'تويوتا',
    model: 'كامري',
    year: 2018,
    condition: 'مستعمل - حالة ممتازة',
    partNumber: 'TOY-ENG-2018-25L',
    warranty: '6 أشهر',
    images: [
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    description: 'محرك أصلي من تويوتا كامري 2018، تم فحصه بالكامل ويعمل بكفاءة عالية',
    featured: true,
    urgent: false,
    user: {
      id: 'user-3',
      name: 'خالد أحمد',
      phone: '+218 93 345 6789',
      verified: true,
    },
  },
  {
    id: 'part-2',
    title: 'علبة فتيس أوتوماتيك نيسان التيما',
    price: 3200,
    location: 'بنغازي، شارع الكورنيش',
    category: 'علب الفتيس',
    brand: 'نيسان',
    model: 'التيما',
    year: 2016,
    condition: 'مستعمل - حالة جيدة',
    partNumber: 'NIS-TRANS-2016-AUTO',
    warranty: '3 أشهر',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    description: 'علبة فتيس أوتوماتيك أصلية من نيسان التيما، تم صيانتها وتجديدها',
    featured: false,
    urgent: true,
    user: {
      id: 'user-4',
      name: 'عمر سالم',
      phone: '+218 94 456 7890',
      verified: false,
    },
  },
];

// بيانات وهمية للدراجات النارية
export const mockMotorcycles = [
  {
    id: 'bike-1',
    title: 'هوندا CBR 600RR - موديل 2020',
    price: 15000,
    location: 'طرابلس، منطقة الدهماني',
    brand: 'هوندا',
    model: 'CBR 600RR',
    year: 2020,
    engineSize: '600cc',
    condition: 'مستعمل - حالة ممتازة',
    mileage: 8500,
    fuelType: 'بنزين',
    type: 'رياضية',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    description: 'دراجة نارية رياضية بحالة ممتازة، تم صيانتها بانتظام',
    features: ['ABS', 'نظام تحكم بالجر', 'شاشة رقمية'],
    featured: true,
    urgent: false,
    user: {
      id: 'user-5',
      name: 'سامي محمد',
      phone: '+218 95 567 8901',
      verified: true,
    },
  },
];

// بيانات وهمية للإطارات والجنطات
export const mockTiresRims = [
  {
    id: 'tire-1',
    title: 'إطارات ميشلان 225/60R16 - طقم كامل',
    price: 1200,
    location: 'مصراتة، السوق المركزي',
    brand: 'ميشلان',
    size: '225/60R16',
    type: 'إطارات',
    condition: 'جديد',
    quantity: 4,
    season: 'صيفي',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    description: 'طقم إطارات ميشلان جديد بالكرتون، مناسب لمعظم السيارات المتوسطة',
    warranty: 'سنتان',
    featured: false,
    urgent: false,
    user: {
      id: 'user-6',
      name: 'يوسف علي',
      phone: '+218 96 678 9012',
      verified: true,
    },
  },
];

// بيانات وهمية للحافلات والشاحنات
export const mockTrucksBuses = [
  {
    id: 'truck-1',
    title: 'شاحنة مرسيدس أكتروس 2019',
    price: 85000,
    location: 'طرابلس، منطقة الصناعية',
    brand: 'مرسيدس',
    model: 'أكتروس',
    year: 2019,
    engineSize: '12.8L',
    condition: 'مستعمل - حالة جيدة جداً',
    mileage: 120000,
    fuelType: 'ديزل',
    type: 'شاحنة ثقيلة',
    loadCapacity: '25 طن',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    description: 'شاحنة مرسيدس أكتروس بحالة ممتازة، مناسبة للنقل الثقيل',
    features: ['مكيف هواء', 'نظام ملاحة', 'كاميرا خلفية'],
    featured: true,
    urgent: false,
    user: {
      id: 'user-7',
      name: 'إبراهيم حسن',
      phone: '+218 97 789 0123',
      verified: true,
    },
  },
];

// بيانات وهمية للآليات الثقيلة
export const mockHeavyMachinery = [
  {
    id: 'machine-1',
    title: 'حفارة كاتربيلر 320D',
    price: 120000,
    location: 'بنغازي، المنطقة الصناعية',
    brand: 'كاتربيلر',
    model: '320D',
    year: 2017,
    condition: 'مستعمل - حالة جيدة',
    workingHours: 8500,
    type: 'حفارة',
    weight: '20 طن',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    description: 'حفارة كاتربيلر بحالة جيدة، مناسبة لأعمال الحفر والبناء',
    features: ['مكيف هواء', 'نظام هيدروليكي متطور', 'كابينة مريحة'],
    featured: false,
    urgent: true,
    user: {
      id: 'user-8',
      name: 'محمود أحمد',
      phone: '+218 98 890 1234',
      verified: true,
    },
  },
];

// بيانات وهمية لإكسسوارات المركبات
export const mockCarAccessories = [
  {
    id: 'accessory-1',
    title: 'نظام صوتي بايونير مع شاشة لمس',
    price: 850,
    location: 'طرابلس، شارع الجمهورية',
    brand: 'بايونير',
    model: 'AVH-X2800BS',
    category: 'أنظمة صوتية',
    condition: 'جديد',
    compatibility: 'جميع السيارات',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    description: 'نظام صوتي متطور مع شاشة لمس وبلوتوث وUSB',
    features: ['بلوتوث', 'USB', 'شاشة لمس 6.2 بوصة', 'راديو FM/AM'],
    warranty: 'سنة واحدة',
    featured: false,
    urgent: false,
    user: {
      id: 'user-9',
      name: 'عبدالله سالم',
      phone: '+218 99 901 2345',
      verified: true,
    },
  },
];

// خيارات الفلاتر لكل فئة
export const categoryFilters = {
  showrooms: {
    types: ['جميع الأنواع', 'معرض فاخر', 'معرض عام', 'معرض متخصص'],
    specialties: ['جميع التخصصات', 'BMW', 'مرسيدس', 'تويوتا', 'هوندا', 'نيسان'],
    ratings: ['جميع التقييمات', '4.5+ نجوم', '4.0+ نجوم', '3.5+ نجوم'],
  },
  carParts: {
    categories: ['جميع الفئات', 'محركات', 'علب الفتيس', 'فرامل', 'تعليق', 'كهرباء', 'تبريد'],
    brands: ['جميع الماركات', 'تويوتا', 'نيسان', 'هوندا', 'هيونداي', 'كيا', 'مازدا'],
    conditions: ['جميع الحالات', 'جديد', 'مستعمل - حالة ممتازة', 'مستعمل - حالة جيدة'],
  },
  motorcycles: {
    types: ['جميع الأنواع', 'رياضية', 'سياحية', 'كروزر', 'أوف رود', 'سكوتر'],
    brands: ['جميع الماركات', 'هوندا', 'ياماها', 'كاواساكي', 'سوزوكي', 'دوكاتي'],
    engineSizes: ['جميع الأحجام', '125cc', '250cc', '400cc', '600cc', '1000cc+'],
  },
  tiresRims: {
    types: ['جميع الأنواع', 'إطارات', 'جنطات', 'طقم كامل'],
    brands: ['جميع الماركات', 'ميشلان', 'بريدجستون', 'كونتيننتال', 'بيريلي', 'هانكوك'],
    sizes: ['جميع الأحجام', '14 بوصة', '15 بوصة', '16 بوصة', '17 بوصة', '18 بوصة+'],
  },
  trucksBuses: {
    types: ['جميع الأنواع', 'شاحنة خفيفة', 'شاحنة متوسطة', 'شاحنة ثقيلة', 'حافلة', 'مقطورة'],
    brands: ['جميع الماركات', 'مرسيدس', 'فولفو', 'سكانيا', 'مان', 'إيفيكو'],
    loadCapacities: ['جميع الأحمال', 'أقل من 5 طن', '5-15 طن', '15-25 طن', 'أكثر من 25 طن'],
  },
  heavyMachinery: {
    types: ['جميع الأنواع', 'حفارة', 'بلدوزر', 'رافعة', 'لودر', 'جريدر', 'أسفلت'],
    brands: ['جميع الماركات', 'كاتربيلر', 'كوماتسو', 'هيتاشي', 'فولفو', 'ليبهر'],
    conditions: ['جميع الحالات', 'جديد', 'مستعمل - حالة ممتازة', 'مستعمل - حالة جيدة'],
  },
  carAccessories: {
    categories: ['جميع الفئات', 'أنظمة صوتية', 'إضاءة', 'أمان', 'راحة', 'تجميل', 'أدوات'],
    brands: ['جميع الماركات', 'بايونير', 'كينوود', 'سوني', 'بوش', 'فيليبس'],
    conditions: ['جميع الحالات', 'جديد', 'مستعمل - حالة ممتازة', 'مستعمل - حالة جيدة'],
  },
};
