/**
 * قائمة دول العالم الشاملة
 * World Countries Database
 * 
 * تشمل: الاسم بالعربي والإنجليزي، رمز الدولة، مفتاح الهاتف، كود ISO
 */

export interface WorldCountry {
    /** رمز الهاتف الدولي مثل +218 */
    dialCode: string;
    /** كود ISO المكون من حرفين مثل LY */
    iso2: string;
    /** كود ISO المكون من 3 حروف مثل LBY */
    iso3: string;
    /** اسم الدولة بالعربية */
    nameAr: string;
    /** اسم الدولة بالإنجليزية */
    nameEn: string;
    /** رمز العلم (emoji) */
    flag: string;
    /** طول رقم الهاتف المحلي (بدون المفتاح) */
    phoneLength?: number[];
    /** أمثلة على أرقام الهاتف */
    example?: string;
    /** المنطقة الجغرافية */
    region?: 'africa' | 'americas' | 'asia' | 'europe' | 'oceania' | 'middle_east';
    /** هل الدولة عربية */
    isArab?: boolean;
    /** الأولوية في العرض (للدول الشائعة) */
    priority?: number;
}

// الدول العربية (أولوية عالية)
const arabCountries: WorldCountry[] = [
    { dialCode: '+218', iso2: 'LY', iso3: 'LBY', nameAr: 'ليبيا', nameEn: 'Libya', flag: '🇱🇾', phoneLength: [9], example: '912345678', region: 'africa', isArab: true, priority: 1 },
    { dialCode: '+20', iso2: 'EG', iso3: 'EGY', nameAr: 'مصر', nameEn: 'Egypt', flag: '🇪🇬', phoneLength: [10], example: '1001234567', region: 'africa', isArab: true, priority: 2 },
    { dialCode: '+966', iso2: 'SA', iso3: 'SAU', nameAr: 'السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦', phoneLength: [9], example: '501234567', region: 'middle_east', isArab: true, priority: 3 },
    { dialCode: '+971', iso2: 'AE', iso3: 'ARE', nameAr: 'الإمارات', nameEn: 'UAE', flag: '🇦🇪', phoneLength: [9], example: '501234567', region: 'middle_east', isArab: true, priority: 4 },
    { dialCode: '+974', iso2: 'QA', iso3: 'QAT', nameAr: 'قطر', nameEn: 'Qatar', flag: '🇶🇦', phoneLength: [8], example: '33123456', region: 'middle_east', isArab: true, priority: 5 },
    { dialCode: '+965', iso2: 'KW', iso3: 'KWT', nameAr: 'الكويت', nameEn: 'Kuwait', flag: '🇰🇼', phoneLength: [8], example: '50012345', region: 'middle_east', isArab: true, priority: 6 },
    { dialCode: '+973', iso2: 'BH', iso3: 'BHR', nameAr: 'البحرين', nameEn: 'Bahrain', flag: '🇧🇭', phoneLength: [8], example: '36001234', region: 'middle_east', isArab: true, priority: 7 },
    { dialCode: '+968', iso2: 'OM', iso3: 'OMN', nameAr: 'عُمان', nameEn: 'Oman', flag: '🇴🇲', phoneLength: [8], example: '92123456', region: 'middle_east', isArab: true, priority: 8 },
    { dialCode: '+962', iso2: 'JO', iso3: 'JOR', nameAr: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴', phoneLength: [9], example: '790123456', region: 'middle_east', isArab: true, priority: 9 },
    { dialCode: '+961', iso2: 'LB', iso3: 'LBN', nameAr: 'لبنان', nameEn: 'Lebanon', flag: '🇱🇧', phoneLength: [7, 8], example: '71123456', region: 'middle_east', isArab: true, priority: 10 },
    { dialCode: '+963', iso2: 'SY', iso3: 'SYR', nameAr: 'سوريا', nameEn: 'Syria', flag: '🇸🇾', phoneLength: [9], example: '944567890', region: 'middle_east', isArab: true, priority: 11 },
    { dialCode: '+964', iso2: 'IQ', iso3: 'IRQ', nameAr: 'العراق', nameEn: 'Iraq', flag: '🇮🇶', phoneLength: [10], example: '7901234567', region: 'middle_east', isArab: true, priority: 12 },
    { dialCode: '+212', iso2: 'MA', iso3: 'MAR', nameAr: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦', phoneLength: [9], example: '612345678', region: 'africa', isArab: true, priority: 13 },
    { dialCode: '+213', iso2: 'DZ', iso3: 'DZA', nameAr: 'الجزائر', nameEn: 'Algeria', flag: '🇩🇿', phoneLength: [9], example: '551234567', region: 'africa', isArab: true, priority: 14 },
    { dialCode: '+216', iso2: 'TN', iso3: 'TUN', nameAr: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳', phoneLength: [8], example: '20123456', region: 'africa', isArab: true, priority: 15 },
    { dialCode: '+249', iso2: 'SD', iso3: 'SDN', nameAr: 'السودان', nameEn: 'Sudan', flag: '🇸🇩', phoneLength: [9], example: '911231234', region: 'africa', isArab: true, priority: 16 },
    { dialCode: '+967', iso2: 'YE', iso3: 'YEM', nameAr: 'اليمن', nameEn: 'Yemen', flag: '🇾🇪', phoneLength: [9], example: '712345678', region: 'middle_east', isArab: true, priority: 17 },
    { dialCode: '+970', iso2: 'PS', iso3: 'PSE', nameAr: 'فلسطين', nameEn: 'Palestine', flag: '🇵🇸', phoneLength: [9], example: '599123456', region: 'middle_east', isArab: true, priority: 18 },
    { dialCode: '+222', iso2: 'MR', iso3: 'MRT', nameAr: 'موريتانيا', nameEn: 'Mauritania', flag: '🇲🇷', phoneLength: [8], example: '22123456', region: 'africa', isArab: true, priority: 19 },
    { dialCode: '+252', iso2: 'SO', iso3: 'SOM', nameAr: 'الصومال', nameEn: 'Somalia', flag: '🇸🇴', phoneLength: [7, 8], example: '9012345', region: 'africa', isArab: true, priority: 20 },
    { dialCode: '+253', iso2: 'DJ', iso3: 'DJI', nameAr: 'جيبوتي', nameEn: 'Djibouti', flag: '🇩🇯', phoneLength: [8], example: '77831234', region: 'africa', isArab: true, priority: 21 },
    { dialCode: '+269', iso2: 'KM', iso3: 'COM', nameAr: 'جزر القمر', nameEn: 'Comoros', flag: '🇰🇲', phoneLength: [7], example: '3212345', region: 'africa', isArab: true, priority: 22 },
];

// باقي دول العالم
const worldCountries: WorldCountry[] = [
    // أوروبا
    { dialCode: '+44', iso2: 'GB', iso3: 'GBR', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', flag: '🇬🇧', phoneLength: [10], region: 'europe', priority: 30 },
    { dialCode: '+49', iso2: 'DE', iso3: 'DEU', nameAr: 'ألمانيا', nameEn: 'Germany', flag: '🇩🇪', phoneLength: [10, 11], region: 'europe', priority: 31 },
    { dialCode: '+33', iso2: 'FR', iso3: 'FRA', nameAr: 'فرنسا', nameEn: 'France', flag: '🇫🇷', phoneLength: [9], region: 'europe', priority: 32 },
    { dialCode: '+39', iso2: 'IT', iso3: 'ITA', nameAr: 'إيطاليا', nameEn: 'Italy', flag: '🇮🇹', phoneLength: [9, 10], region: 'europe', priority: 33 },
    { dialCode: '+34', iso2: 'ES', iso3: 'ESP', nameAr: 'إسبانيا', nameEn: 'Spain', flag: '🇪🇸', phoneLength: [9], region: 'europe', priority: 34 },
    { dialCode: '+31', iso2: 'NL', iso3: 'NLD', nameAr: 'هولندا', nameEn: 'Netherlands', flag: '🇳🇱', phoneLength: [9], region: 'europe', priority: 35 },
    { dialCode: '+32', iso2: 'BE', iso3: 'BEL', nameAr: 'بلجيكا', nameEn: 'Belgium', flag: '🇧🇪', phoneLength: [9], region: 'europe' },
    { dialCode: '+41', iso2: 'CH', iso3: 'CHE', nameAr: 'سويسرا', nameEn: 'Switzerland', flag: '🇨🇭', phoneLength: [9], region: 'europe' },
    { dialCode: '+43', iso2: 'AT', iso3: 'AUT', nameAr: 'النمسا', nameEn: 'Austria', flag: '🇦🇹', phoneLength: [10], region: 'europe' },
    { dialCode: '+46', iso2: 'SE', iso3: 'SWE', nameAr: 'السويد', nameEn: 'Sweden', flag: '🇸🇪', phoneLength: [9], region: 'europe' },
    { dialCode: '+47', iso2: 'NO', iso3: 'NOR', nameAr: 'النرويج', nameEn: 'Norway', flag: '🇳🇴', phoneLength: [8], region: 'europe' },
    { dialCode: '+45', iso2: 'DK', iso3: 'DNK', nameAr: 'الدنمارك', nameEn: 'Denmark', flag: '🇩🇰', phoneLength: [8], region: 'europe' },
    { dialCode: '+358', iso2: 'FI', iso3: 'FIN', nameAr: 'فنلندا', nameEn: 'Finland', flag: '🇫🇮', phoneLength: [9, 10], region: 'europe' },
    { dialCode: '+48', iso2: 'PL', iso3: 'POL', nameAr: 'بولندا', nameEn: 'Poland', flag: '🇵🇱', phoneLength: [9], region: 'europe' },
    { dialCode: '+30', iso2: 'GR', iso3: 'GRC', nameAr: 'اليونان', nameEn: 'Greece', flag: '🇬🇷', phoneLength: [10], region: 'europe' },
    { dialCode: '+351', iso2: 'PT', iso3: 'PRT', nameAr: 'البرتغال', nameEn: 'Portugal', flag: '🇵🇹', phoneLength: [9], region: 'europe' },
    { dialCode: '+353', iso2: 'IE', iso3: 'IRL', nameAr: 'أيرلندا', nameEn: 'Ireland', flag: '🇮🇪', phoneLength: [9], region: 'europe' },
    { dialCode: '+7', iso2: 'RU', iso3: 'RUS', nameAr: 'روسيا', nameEn: 'Russia', flag: '🇷🇺', phoneLength: [10], region: 'europe' },
    { dialCode: '+380', iso2: 'UA', iso3: 'UKR', nameAr: 'أوكرانيا', nameEn: 'Ukraine', flag: '🇺🇦', phoneLength: [9], region: 'europe' },
    { dialCode: '+90', iso2: 'TR', iso3: 'TUR', nameAr: 'تركيا', nameEn: 'Turkey', flag: '🇹🇷', phoneLength: [10], region: 'europe', priority: 25 },
    { dialCode: '+420', iso2: 'CZ', iso3: 'CZE', nameAr: 'التشيك', nameEn: 'Czech Republic', flag: '🇨🇿', phoneLength: [9], region: 'europe' },
    { dialCode: '+36', iso2: 'HU', iso3: 'HUN', nameAr: 'المجر', nameEn: 'Hungary', flag: '🇭🇺', phoneLength: [9], region: 'europe' },
    { dialCode: '+40', iso2: 'RO', iso3: 'ROU', nameAr: 'رومانيا', nameEn: 'Romania', flag: '🇷🇴', phoneLength: [9], region: 'europe' },

    // أمريكا الشمالية
    { dialCode: '+1', iso2: 'US', iso3: 'USA', nameAr: 'الولايات المتحدة', nameEn: 'United States', flag: '🇺🇸', phoneLength: [10], region: 'americas', priority: 26 },
    { dialCode: '+1', iso2: 'CA', iso3: 'CAN', nameAr: 'كندا', nameEn: 'Canada', flag: '🇨🇦', phoneLength: [10], region: 'americas', priority: 27 },
    { dialCode: '+52', iso2: 'MX', iso3: 'MEX', nameAr: 'المكسيك', nameEn: 'Mexico', flag: '🇲🇽', phoneLength: [10], region: 'americas' },

    // أمريكا الجنوبية
    { dialCode: '+55', iso2: 'BR', iso3: 'BRA', nameAr: 'البرازيل', nameEn: 'Brazil', flag: '🇧🇷', phoneLength: [10, 11], region: 'americas' },
    { dialCode: '+54', iso2: 'AR', iso3: 'ARG', nameAr: 'الأرجنتين', nameEn: 'Argentina', flag: '🇦🇷', phoneLength: [10], region: 'americas' },
    { dialCode: '+56', iso2: 'CL', iso3: 'CHL', nameAr: 'تشيلي', nameEn: 'Chile', flag: '🇨🇱', phoneLength: [9], region: 'americas' },
    { dialCode: '+57', iso2: 'CO', iso3: 'COL', nameAr: 'كولومبيا', nameEn: 'Colombia', flag: '🇨🇴', phoneLength: [10], region: 'americas' },
    { dialCode: '+51', iso2: 'PE', iso3: 'PER', nameAr: 'بيرو', nameEn: 'Peru', flag: '🇵🇪', phoneLength: [9], region: 'americas' },
    { dialCode: '+58', iso2: 'VE', iso3: 'VEN', nameAr: 'فنزويلا', nameEn: 'Venezuela', flag: '🇻🇪', phoneLength: [10], region: 'americas' },

    // آسيا
    { dialCode: '+86', iso2: 'CN', iso3: 'CHN', nameAr: 'الصين', nameEn: 'China', flag: '🇨🇳', phoneLength: [11], region: 'asia', priority: 28 },
    { dialCode: '+81', iso2: 'JP', iso3: 'JPN', nameAr: 'اليابان', nameEn: 'Japan', flag: '🇯🇵', phoneLength: [10], region: 'asia', priority: 29 },
    { dialCode: '+82', iso2: 'KR', iso3: 'KOR', nameAr: 'كوريا الجنوبية', nameEn: 'South Korea', flag: '🇰🇷', phoneLength: [10], region: 'asia' },
    { dialCode: '+91', iso2: 'IN', iso3: 'IND', nameAr: 'الهند', nameEn: 'India', flag: '🇮🇳', phoneLength: [10], region: 'asia' },
    { dialCode: '+92', iso2: 'PK', iso3: 'PAK', nameAr: 'باكستان', nameEn: 'Pakistan', flag: '🇵🇰', phoneLength: [10], region: 'asia' },
    { dialCode: '+880', iso2: 'BD', iso3: 'BGD', nameAr: 'بنغلاديش', nameEn: 'Bangladesh', flag: '🇧🇩', phoneLength: [10], region: 'asia' },
    { dialCode: '+62', iso2: 'ID', iso3: 'IDN', nameAr: 'إندونيسيا', nameEn: 'Indonesia', flag: '🇮🇩', phoneLength: [10, 11], region: 'asia' },
    { dialCode: '+60', iso2: 'MY', iso3: 'MYS', nameAr: 'ماليزيا', nameEn: 'Malaysia', flag: '🇲🇾', phoneLength: [9, 10], region: 'asia' },
    { dialCode: '+65', iso2: 'SG', iso3: 'SGP', nameAr: 'سنغافورة', nameEn: 'Singapore', flag: '🇸🇬', phoneLength: [8], region: 'asia' },
    { dialCode: '+66', iso2: 'TH', iso3: 'THA', nameAr: 'تايلاند', nameEn: 'Thailand', flag: '🇹🇭', phoneLength: [9], region: 'asia' },
    { dialCode: '+84', iso2: 'VN', iso3: 'VNM', nameAr: 'فيتنام', nameEn: 'Vietnam', flag: '🇻🇳', phoneLength: [9, 10], region: 'asia' },
    { dialCode: '+63', iso2: 'PH', iso3: 'PHL', nameAr: 'الفلبين', nameEn: 'Philippines', flag: '🇵🇭', phoneLength: [10], region: 'asia' },
    { dialCode: '+98', iso2: 'IR', iso3: 'IRN', nameAr: 'إيران', nameEn: 'Iran', flag: '🇮🇷', phoneLength: [10], region: 'asia' },
    { dialCode: '+93', iso2: 'AF', iso3: 'AFG', nameAr: 'أفغانستان', nameEn: 'Afghanistan', flag: '🇦🇫', phoneLength: [9], region: 'asia' },

    // أفريقيا
    { dialCode: '+27', iso2: 'ZA', iso3: 'ZAF', nameAr: 'جنوب أفريقيا', nameEn: 'South Africa', flag: '🇿🇦', phoneLength: [9], region: 'africa' },
    { dialCode: '+234', iso2: 'NG', iso3: 'NGA', nameAr: 'نيجيريا', nameEn: 'Nigeria', flag: '🇳🇬', phoneLength: [10], region: 'africa' },
    { dialCode: '+254', iso2: 'KE', iso3: 'KEN', nameAr: 'كينيا', nameEn: 'Kenya', flag: '🇰🇪', phoneLength: [9], region: 'africa' },
    { dialCode: '+233', iso2: 'GH', iso3: 'GHA', nameAr: 'غانا', nameEn: 'Ghana', flag: '🇬🇭', phoneLength: [9], region: 'africa' },
    { dialCode: '+251', iso2: 'ET', iso3: 'ETH', nameAr: 'إثيوبيا', nameEn: 'Ethiopia', flag: '🇪🇹', phoneLength: [9], region: 'africa' },
    { dialCode: '+255', iso2: 'TZ', iso3: 'TZA', nameAr: 'تنزانيا', nameEn: 'Tanzania', flag: '🇹🇿', phoneLength: [9], region: 'africa' },
    { dialCode: '+256', iso2: 'UG', iso3: 'UGA', nameAr: 'أوغندا', nameEn: 'Uganda', flag: '🇺🇬', phoneLength: [9], region: 'africa' },

    // أوقيانوسيا
    { dialCode: '+61', iso2: 'AU', iso3: 'AUS', nameAr: 'أستراليا', nameEn: 'Australia', flag: '🇦🇺', phoneLength: [9], region: 'oceania' },
    { dialCode: '+64', iso2: 'NZ', iso3: 'NZL', nameAr: 'نيوزيلندا', nameEn: 'New Zealand', flag: '🇳🇿', phoneLength: [9], region: 'oceania' },
];

// دمج جميع الدول وترتيبها حسب الأولوية
export const allCountries: WorldCountry[] = [
    ...arabCountries,
    ...worldCountries,
].sort((a, b) => {
    // الأولوية أولاً (الأقل = أهم)
    const priorityA = a.priority ?? 1000;
    const priorityB = b.priority ?? 1000;
    if (priorityA !== priorityB) return priorityA - priorityB;
    // ثم أبجدياً بالعربية
    return a.nameAr.localeCompare(b.nameAr, 'ar');
});

// دوال مساعدة
export const getCountryByCode = (iso2: string): WorldCountry | undefined =>
    allCountries.find(c => c.iso2 === iso2);

export const getCountryByDialCode = (dialCode: string): WorldCountry | undefined =>
    allCountries.find(c => c.dialCode === dialCode);

export const searchCountries = (query: string): WorldCountry[] => {
    const q = query.trim().toLowerCase();
    if (!q) return allCountries;
    return allCountries.filter(c =>
        c.nameAr.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.iso2.toLowerCase() === q ||
        c.iso3.toLowerCase() === q
    );
};

export const getArabCountries = (): WorldCountry[] =>
    allCountries.filter(c => c.isArab);

export const getCountriesByRegion = (region: WorldCountry['region']): WorldCountry[] =>
    allCountries.filter(c => c.region === region);

// تصدير للتوافق مع الكود القديم
export const arabCountries_legacy = arabCountries.map(c => ({
    code: c.dialCode,
    name: c.nameAr,
    nameEn: c.nameEn,
    countryCode: c.iso2,
}));
