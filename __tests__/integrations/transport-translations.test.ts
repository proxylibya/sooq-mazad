/**
 * 🧪 اختبارات نظام ترجمة أنواع المركبات
 * ============================================
 * للتشغيل: npx jest __tests__/integrations/transport-translations.test.ts
 */

// محاكاة VEHICLE_TYPE_TRANSLATIONS
const VEHICLE_TYPE_TRANSLATIONS: Record<string, string> = {
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

    // أنواع بأحرف كبيرة
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
 * ترجمة نوع المركبة من الإنجليزية إلى العربية
 */
function translateVehicleType(vehicleType: string | null | undefined): string {
    if (!vehicleType) return 'غير محدد';

    const cleanedType = vehicleType.trim();

    const translation = VEHICLE_TYPE_TRANSLATIONS[cleanedType];
    if (translation) return translation;

    const lowerCaseType = cleanedType.toLowerCase();
    const lowerTranslation = VEHICLE_TYPE_TRANSLATIONS[lowerCaseType];
    if (lowerTranslation) return lowerTranslation;

    const upperCaseType = cleanedType.toUpperCase();
    const upperTranslation = VEHICLE_TYPE_TRANSLATIONS[upperCaseType];
    if (upperTranslation) return upperTranslation;

    if (/[\u0600-\u06FF]/.test(cleanedType)) {
        return cleanedType;
    }

    return cleanedType;
}

describe('نظام ترجمة أنواع المركبات', () => {
    describe('translateVehicleType', () => {

        // ==========================================
        // اختبارات الأنواع بالأحرف الصغيرة
        // ==========================================
        describe('الأنواع بالأحرف الصغيرة', () => {
            test('flatbed يترجم إلى "سطحة مسطحة"', () => {
                expect(translateVehicleType('flatbed')).toBe('سطحة مسطحة');
            });

            test('enclosed يترجم إلى "سطحة مغلقة"', () => {
                expect(translateVehicleType('enclosed')).toBe('سطحة مغلقة');
            });

            test('lowbed يترجم إلى "سطحة منخفضة"', () => {
                expect(translateVehicleType('lowbed')).toBe('سطحة منخفضة');
            });

            test('crane يترجم إلى "رافعة"', () => {
                expect(translateVehicleType('crane')).toBe('رافعة');
            });

            test('multi_car يترجم إلى "ناقلة متعددة"', () => {
                expect(translateVehicleType('multi_car')).toBe('ناقلة متعددة');
            });

            test('car-carrier يترجم إلى "ناقلة سيارات"', () => {
                expect(translateVehicleType('car-carrier')).toBe('ناقلة سيارات');
            });

            test('heavy-duty يترجم إلى "ساحبة ثقيلة"', () => {
                expect(translateVehicleType('heavy-duty')).toBe('ساحبة ثقيلة');
            });

            test('winch يترجم إلى "ونش"', () => {
                expect(translateVehicleType('winch')).toBe('ونش');
            });

            test('van يترجم إلى "فان"', () => {
                expect(translateVehicleType('van')).toBe('فان');
            });

            test('pickup يترجم إلى "بيك أب"', () => {
                expect(translateVehicleType('pickup')).toBe('بيك أب');
            });
        });

        // ==========================================
        // اختبارات الأنواع بالأحرف الكبيرة
        // ==========================================
        describe('الأنواع بالأحرف الكبيرة', () => {
            test('FLATBED يترجم إلى "سطحة مسطحة"', () => {
                expect(translateVehicleType('FLATBED')).toBe('سطحة مسطحة');
            });

            test('ENCLOSED يترجم إلى "سطحة مغلقة"', () => {
                expect(translateVehicleType('ENCLOSED')).toBe('سطحة مغلقة');
            });

            test('CRANE يترجم إلى "رافعة"', () => {
                expect(translateVehicleType('CRANE')).toBe('رافعة');
            });

            test('WINCH يترجم إلى "ونش"', () => {
                expect(translateVehicleType('WINCH')).toBe('ونش');
            });
        });

        // ==========================================
        // اختبارات القيم الفارغة والحالات الخاصة
        // ==========================================
        describe('القيم الفارغة والحالات الخاصة', () => {
            test('null يُرجع "غير محدد"', () => {
                expect(translateVehicleType(null)).toBe('غير محدد');
            });

            test('undefined يُرجع "غير محدد"', () => {
                expect(translateVehicleType(undefined)).toBe('غير محدد');
            });

            test('النص الفارغ يُرجع "غير محدد"', () => {
                expect(translateVehicleType('')).toBe('غير محدد');
            });

            test('النص بالعربية يُرجع كما هو', () => {
                expect(translateVehicleType('سطحة مسطحة')).toBe('سطحة مسطحة');
            });

            test('نوع غير معروف يُرجع كما هو', () => {
                expect(translateVehicleType('unknown_type')).toBe('unknown_type');
            });

            test('النص مع مسافات يُنظف ويُترجم', () => {
                expect(translateVehicleType('  flatbed  ')).toBe('سطحة مسطحة');
            });
        });

        // ==========================================
        // اختبارات الحالات المختلطة
        // ==========================================
        describe('الحالات المختلطة', () => {
            test('Flatbed (حالة مختلطة) يترجم بشكل صحيح', () => {
                expect(translateVehicleType('Flatbed')).toBe('سطحة مسطحة');
            });

            test('FLATBED (حالة كبيرة بالكامل) يترجم بشكل صحيح', () => {
                expect(translateVehicleType('FLATBED')).toBe('سطحة مسطحة');
            });
        });
    });

    // ==========================================
    // اختبارات التكامل
    // ==========================================
    describe('اختبارات التكامل', () => {
        test('جميع الأنواع الأساسية لها ترجمات', () => {
            const requiredTypes = ['flatbed', 'enclosed', 'lowbed', 'crane', 'winch', 'van', 'pickup'];

            requiredTypes.forEach(type => {
                const translation = translateVehicleType(type);
                expect(translation).not.toBe(type); // يجب أن يكون مختلفاً عن الأصل
                expect(translation).toMatch(/[\u0600-\u06FF]/); // يجب أن يحتوي على حروف عربية
            });
        });

        test('الترجمات بالأحرف الكبيرة والصغيرة متطابقة', () => {
            const types = ['flatbed', 'enclosed', 'crane', 'winch'];

            types.forEach(type => {
                const lowerTranslation = translateVehicleType(type);
                const upperTranslation = translateVehicleType(type.toUpperCase());
                expect(lowerTranslation).toBe(upperTranslation);
            });
        });
    });
});

// ==========================================
// تشغيل الاختبارات يدوياً
// ==========================================
if (typeof describe === 'undefined') {
    console.log('🧪 تشغيل اختبارات ترجمة أنواع المركبات...\n');

    const tests = [
        { input: 'flatbed', expected: 'سطحة مسطحة' },
        { input: 'enclosed', expected: 'سطحة مغلقة' },
        { input: 'crane', expected: 'رافعة' },
        { input: 'FLATBED', expected: 'سطحة مسطحة' },
        { input: null, expected: 'غير محدد' },
        { input: '', expected: 'غير محدد' },
    ];

    let passed = 0;
    let failed = 0;

    tests.forEach(({ input, expected }) => {
        const result = translateVehicleType(input);
        if (result === expected) {
            console.log(`✅ "${input}" => "${result}"`);
            passed++;
        } else {
            console.log(`❌ "${input}" => "${result}" (متوقع: "${expected}")`);
            failed++;
        }
    });

    console.log(`\n📊 النتائج: ${passed} نجح، ${failed} فشل`);
}
