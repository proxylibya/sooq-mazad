/**
 * بيانات الاختبار الثابتة
 * Test Data for Sooq Mazad E2E Tests
 */

// بيانات المستخدمين للاختبار
export const TEST_USERS = {
    // مستخدم عادي جديد
    newUser: {
        phone: `+21892${Date.now().toString().slice(-7)}`,
        password: 'Test@123456',
        name: 'مستخدم اختبار آلي',
        city: 'طرابلس',
    },

    // مستخدم موجود للاختبار
    existingUser: {
        phone: '+218924444444',
        password: '123456',
        name: 'مستخدم موجود',
    },

    // مدير النظام
    admin: {
        username: 'admin',
        password: '123456',
    },

    // مدير اختبار
    testAdmin: {
        phone: '+218901234567',
        password: '123456',
        name: 'مدير اختبار',
    },
};

// بيانات السيارات للاختبار
export const TEST_CARS = {
    newCar: {
        brand: 'تويوتا',
        model: 'كامري',
        year: 2023,
        price: 85000,
        mileage: 15000,
        color: 'أبيض',
        transmission: 'أوتوماتيك',
        fuelType: 'بنزين',
        city: 'طرابلس',
        description: 'سيارة اختبار آلي - تويوتا كامري 2023 بحالة ممتازة',
        features: ['تكييف', 'نظام ملاحة', 'كاميرا خلفية'],
    },

    auction: {
        brand: 'مرسيدس',
        model: 'C200',
        year: 2022,
        startPrice: 120000,
        minIncrement: 1000,
        duration: 24, // ساعات
        description: 'مزاد اختبار آلي - مرسيدس C200',
    },
};

// بيانات خدمات النقل
export const TEST_TRANSPORT = {
    newService: {
        companyName: 'شركة نقل اختبار',
        contactPerson: 'أحمد الاختبار',
        phone: '+218925555555',
        serviceRegions: ['طرابلس', 'بنغازي'],
        vehicleTypes: ['شاحنة صغيرة', 'شاحنة كبيرة'],
        pricePerKm: 5,
        description: 'خدمة نقل اختبار آلي',
    },
};

// URLs للصفحات
export const PAGES = {
    // الصفحات العامة
    home: '/',
    login: '/login',
    register: '/register',
    marketplace: '/marketplace',
    auctions: '/auctions',
    transport: '/transport',

    // صفحات المستخدم
    profile: '/profile',
    myAds: '/profile/ads',
    myAuctions: '/profile/auctions',
    wallet: '/profile/wallet',

    // لوحة التحكم
    adminLogin: '/admin/login',
    adminDashboard: '/admin',
    adminUsers: '/admin/users',
    adminAddUser: '/admin/users/add',
    adminCars: '/admin/marketplace',
    adminAuctions: '/admin/auctions',
    adminTransport: '/admin/transport',
    adminAddTransport: '/admin/transport/add',
};

// رسائل النجاح المتوقعة
export const SUCCESS_MESSAGES = {
    login: 'تم تسجيل الدخول بنجاح',
    register: 'تم إنشاء الحساب بنجاح',
    carAdded: 'تم إضافة السيارة بنجاح',
    auctionCreated: 'تم إنشاء المزاد بنجاح',
    userCreated: 'تم إنشاء المستخدم بنجاح',
};

// رسائل الخطأ المتوقعة
export const ERROR_MESSAGES = {
    invalidCredentials: 'بيانات الدخول غير صحيحة',
    phoneExists: 'رقم الهاتف مسجل مسبقاً',
    requiredField: 'هذا الحقل مطلوب',
};

// فترات الانتظار
export const TIMEOUTS = {
    short: 2000,
    medium: 5000,
    long: 10000,
    veryLong: 30000,
};
