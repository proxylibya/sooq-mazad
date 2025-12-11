// بيانات المدن الليبية والمناطق
export interface LibyanCity {
  name: string;
  region: string;
  isMainCity?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const libyanCities: LibyanCity[] = [
  // المنطقة الغربية
  {
    name: 'طرابلس',
    region: 'المنطقة الغربية',
    isMainCity: true,
    coordinates: { lat: 32.8872, lng: 13.1913 },
  },
  {
    name: 'الزاوية',
    region: 'المنطقة الغربية',
    isMainCity: true,
    coordinates: { lat: 32.7569, lng: 12.7277 },
  },
  {
    name: 'صبراتة',
    region: 'المنطقة الغربية',
    coordinates: { lat: 32.7931, lng: 12.4889 },
  },
  {
    name: 'زوارة',
    region: 'المنطقة الغربية',
    coordinates: { lat: 32.9312, lng: 12.0831 },
  },
  {
    name: 'العجيلات',
    region: 'المنطقة الغربية',
    coordinates: { lat: 32.8756, lng: 12.3644 },
  },
  { name: 'رقدالين', region: 'المنطقة الغربية' },
  { name: 'الجميل', region: 'المنطقة الغربية' },
  { name: 'صرمان', region: 'المنطقة الغربية' },
  { name: 'تاجوراء', region: 'المنطقة الغربية' },
  { name: 'قصر بن غشير', region: 'المنطقة الغربية' },
  { name: 'عين زارة', region: 'المنطقة الغربية' },
  { name: 'الأندلس', region: 'المنطقة الغربية' },
  { name: 'الدهماني', region: 'المنطقة الغربية' },
  { name: 'أبو سليم', region: 'المنطقة الغربية' },
  { name: 'السراج', region: 'المنطقة الغربية' },
  {
    name: 'غريان',
    region: 'المنطقة الغربية',
    isMainCity: true,
    coordinates: { lat: 32.1667, lng: 13.0167 },
  },
  {
    name: 'يفرن',
    region: 'المنطقة الغربية',
    coordinates: { lat: 32.0631, lng: 12.5289 },
  },
  {
    name: 'نالوت',
    region: 'المنطقة الغربية',
    coordinates: { lat: 31.8731, lng: 10.9831 },
  },
  {
    name: 'غدامس',
    region: 'المنطقة الغربية',
    coordinates: { lat: 30.1319, lng: 9.5031 },
  },

  // المنطقة الوسطى
  {
    name: 'مصراتة',
    region: 'المنطقة الوسطى',
    isMainCity: true,
    coordinates: { lat: 32.3744, lng: 15.0919 },
  },
  {
    name: 'سرت',
    region: 'المنطقة الوسطى',
    isMainCity: true,
    coordinates: { lat: 31.2089, lng: 16.5887 },
  },
  {
    name: 'الخمس',
    region: 'المنطقة الوسطى',
    coordinates: { lat: 32.6489, lng: 14.2619 },
  },
  {
    name: 'زليتن',
    region: 'المنطقة الوسطى',
    isMainCity: true,
    coordinates: { lat: 32.4675, lng: 14.5689 },
  },
  {
    name: 'بني وليد',
    region: 'المنطقة الوسطى',
    coordinates: { lat: 31.7594, lng: 13.9831 },
  },
  {
    name: 'ترهونة',
    region: 'المنطقة الوسطى',
    coordinates: { lat: 32.4356, lng: 13.6331 },
  },
  {
    name: 'الجفرة',
    region: 'المنطقة الوسطى',
    coordinates: { lat: 29.2031, lng: 16.1331 },
  },
  {
    name: 'هون',
    region: 'المنطقة الوسطى',
    coordinates: { lat: 29.1256, lng: 15.9531 },
  },
  {
    name: 'سوكنة',
    region: 'المنطقة الوسطى',
    coordinates: { lat: 29.1331, lng: 15.9031 },
  },
  {
    name: 'ودان',
    region: 'المنطقة الوسطى',
    coordinates: { lat: 29.1831, lng: 16.1331 },
  },

  // المنطقة الشرقية
  {
    name: 'بنغازي',
    region: 'المنطقة الشرقية',
    isMainCity: true,
    coordinates: { lat: 32.1167, lng: 20.0667 },
  },
  {
    name: 'طبرق',
    region: 'المنطقة الشرقية',
    isMainCity: true,
    coordinates: { lat: 32.0769, lng: 23.9589 },
  },
  {
    name: 'درنة',
    region: 'المنطقة الشرقية',
    isMainCity: true,
    coordinates: { lat: 32.7569, lng: 22.6369 },
  },
  {
    name: 'البيضاء',
    region: 'المنطقة الشرقية',
    isMainCity: true,
    coordinates: { lat: 32.7619, lng: 21.7531 },
  },
  {
    name: 'المرج',
    region: 'المنطقة الشرقية',
    coordinates: { lat: 32.4919, lng: 20.8331 },
  },
  {
    name: 'شحات',
    region: 'المنطقة الشرقية',
    coordinates: { lat: 32.8269, lng: 21.8531 },
  },
  {
    name: 'سوسة',
    region: 'المنطقة الشرقية',
    coordinates: { lat: 32.9019, lng: 21.9531 },
  },
  {
    name: 'رأس لانوف',
    region: 'المنطقة الشرقية',
    coordinates: { lat: 30.5019, lng: 18.5531 },
  },
  {
    name: 'أجدابيا',
    region: 'المنطقة الشرقية',
    isMainCity: true,
    coordinates: { lat: 30.7556, lng: 20.2269 },
  },
  {
    name: 'بريقة',
    region: 'المنطقة الشرقية',
    coordinates: { lat: 30.4019, lng: 19.5531 },
  },
  {
    name: 'الكفرة',
    region: 'المنطقة الشرقية',
    coordinates: { lat: 24.1331, lng: 23.3131 },
  },
  {
    name: 'الجغبوب',
    region: 'المنطقة الشرقية',
    coordinates: { lat: 29.7531, lng: 24.5331 },
  },
  {
    name: 'امساعد',
    region: 'المنطقة الشرقية',
    coordinates: { lat: 31.9019, lng: 24.2031 },
  },
  { name: 'الفويهات', region: 'المنطقة الشرقية' },
  { name: 'المجوري', region: 'المنطقة الشرقية' },
  { name: 'الصابري', region: 'المنطقة الشرقية' },
  { name: 'الليثي', region: 'المنطقة الشرقية' },
  { name: 'الهواري', region: 'المنطقة الشرقية' },

  // المنطقة الجنوبية
  {
    name: 'سبها',
    region: 'المنطقة الجنوبية',
    isMainCity: true,
    coordinates: { lat: 27.0377, lng: 14.4283 },
  },
  {
    name: 'مرزق',
    region: 'المنطقة الجنوبية',
    coordinates: { lat: 25.9131, lng: 13.9131 },
  },
  {
    name: 'أوباري',
    region: 'المنطقة الجنوبية',
    coordinates: { lat: 26.5881, lng: 12.7731 },
  },
  {
    name: 'غات',
    region: 'المنطقة الجنوبية',
    coordinates: { lat: 25.0431, lng: 10.1731 },
  },
  {
    name: 'الشاطئ',
    region: 'المنطقة الجنوبية',
    coordinates: { lat: 27.0331, lng: 14.2531 },
  },
  {
    name: 'تراغن',
    region: 'المنطقة الجنوبية',
    coordinates: { lat: 26.5531, lng: 13.7531 },
  },
  {
    name: 'القطرون',
    region: 'المنطقة الجنوبية',
    coordinates: { lat: 24.9331, lng: 15.5531 },
  },
  {
    name: 'تمنهنت',
    region: 'المنطقة الجنوبية',
    coordinates: { lat: 26.2531, lng: 13.1531 },
  },
];

// دالة للحصول على المنطقة من اسم المدينة
export function getCityRegion(cityName: string): string {
  const city = libyanCities.find(
    (c) => c.name === cityName || cityName.includes(c.name) || c.name.includes(cityName),
  );
  return city ? city.region : 'غير محدد';
}

// دالة للحصول على المدن حسب المنطقة
export function getCitiesByRegion(region: string): LibyanCity[] {
  return libyanCities.filter((city) => city.region === region);
}

// دالة للحصول على جميع المناطق
export function getAllRegions(): string[] {
  const regions = [...new Set(libyanCities.map((city) => city.region))];
  return regions;
}

// دالة للبحث عن المدن
export function searchCities(query: string): LibyanCity[] {
  const searchTerm = query.toLowerCase();
  return libyanCities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchTerm) ||
      city.region.toLowerCase().includes(searchTerm),
  );
}

// دالة للحصول على إحداثيات المدينة
export function getCityCoordinates(cityName: string): { lat: number; lng: number } | null {
  const city = libyanCities.find(
    (c) => c.name === cityName || cityName.includes(c.name) || c.name.includes(cityName),
  );
  return city?.coordinates || null;
}

// مصفوفة أسماء المدن فقط
export const cityNames: string[] = libyanCities.map((city) => city.name);

export default libyanCities;
