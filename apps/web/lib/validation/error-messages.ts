/**
 * 🌍 Unified Error Messages System
 * نظام رسائل الخطأ الموحد
 * Centralized error messages for the entire application
 */

// ============================================
// 1. Error Message Categories
// ============================================

export const ErrorMessages = {
  // ========== Validation Errors ==========
  validation: {
    required: 'هذا الحقل مطلوب',
    requiredField: (field: string) => `${field} مطلوب`,
    invalidFormat: 'التنسيق غير صحيح',
    invalidEmail: 'البريد الإلكتروني غير صحيح',
    invalidPhone: 'رقم الهاتف غير صحيح',
    invalidLibyanPhone: 'رقم الهاتف الليبي غير صحيح (يجب أن يبدأ بـ 09)',
    invalidUrl: 'الرابط غير صحيح',
    invalidDate: 'التاريخ غير صحيح',
    invalidTime: 'الوقت غير صحيح',
    invalidNumber: 'يجب أن يكون رقم',
    invalidInteger: 'يجب أن يكون رقم صحيح',
    invalidDecimal: 'يجب أن يكون رقم عشري',
    invalidBoolean: 'القيمة غير صحيحة',
    invalidOption: 'الخيار غير صحيح',
    invalidJson: 'تنسيق JSON غير صحيح',
    
    // Length validations
    minLength: (min: number) => `يجب أن يكون ${min} أحرف على الأقل`,
    maxLength: (max: number) => `يجب ألا يتجاوز ${max} حرف`,
    exactLength: (length: number) => `يجب أن يكون ${length} أحرف بالضبط`,
    
    // Range validations
    minValue: (min: number) => `يجب أن يكون ${min} على الأقل`,
    maxValue: (max: number) => `يجب ألا يتجاوز ${max}`,
    between: (min: number, max: number) => `يجب أن يكون بين ${min} و ${max}`,
    
    // Password validations
    passwordTooShort: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    passwordTooWeak: 'كلمة المرور ضعيفة جداً',
    passwordNoUppercase: 'كلمة المرور يجب أن تحتوي على حرف كبير',
    passwordNoLowercase: 'كلمة المرور يجب أن تحتوي على حرف صغير',
    passwordNoNumber: 'كلمة المرور يجب أن تحتوي على رقم',
    passwordNoSpecial: 'كلمة المرور يجب أن تحتوي على رمز خاص',
    passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
    
    // File validations
    fileTooLarge: (maxSize: string) => `حجم الملف يجب ألا يتجاوز ${maxSize}`,
    fileTypeNotAllowed: 'نوع الملف غير مسموح',
    noFileSelected: 'لم يتم اختيار ملف',
    tooManyFiles: (max: number) => `يمكنك رفع ${max} ملفات كحد أقصى`,
    
    // Array validations
    arrayEmpty: 'يجب اختيار عنصر واحد على الأقل',
    arrayMinItems: (min: number) => `يجب اختيار ${min} عناصر على الأقل`,
    arrayMaxItems: (max: number) => `يمكنك اختيار ${max} عناصر كحد أقصى`,
    
    // Date validations
    dateTooEarly: (date: string) => `التاريخ يجب أن يكون بعد ${date}`,
    dateTooLate: (date: string) => `التاريخ يجب أن يكون قبل ${date}`,
    dateInPast: 'التاريخ يجب أن يكون في المستقبل',
    dateInFuture: 'التاريخ يجب أن يكون في الماضي',
    invalidAge: 'العمر غير صحيح',
    underAge: (age: number) => `يجب أن يكون العمر ${age} سنة على الأقل`,
    
    // Custom validations
    duplicateValue: 'هذه القيمة موجودة مسبقاً',
    invalidCaptcha: 'رمز التحقق غير صحيح',
    termsNotAccepted: 'يجب الموافقة على الشروط والأحكام'
  },

  // ========== Authentication Errors ==========
  auth: {
    invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة',
    userNotFound: 'المستخدم غير موجود',
    emailNotFound: 'البريد الإلكتروني غير مسجل',
    phoneNotFound: 'رقم الهاتف غير مسجل',
    accountBlocked: 'الحساب محظور',
    accountSuspended: 'الحساب معلق مؤقتاً',
    accountNotActive: 'الحساب غير مفعل',
    accountDeleted: 'الحساب محذوف',
    sessionExpired: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
    unauthorized: 'غير مصرح لك بالوصول',
    insufficientPermissions: 'ليس لديك الصلاحيات الكافية',
    invalidToken: 'رمز التحقق غير صالح',
    tokenExpired: 'انتهت صلاحية رمز التحقق',
    tooManyAttempts: 'محاولات كثيرة جداً، حاول مرة أخرى بعد قليل',
    emailAlreadyExists: 'البريد الإلكتروني مستخدم مسبقاً',
    phoneAlreadyExists: 'رقم الهاتف مستخدم مسبقاً',
    usernameAlreadyExists: 'اسم المستخدم موجود مسبقاً',
    weakPassword: 'كلمة المرور ضعيفة',
    oldPasswordIncorrect: 'كلمة المرور القديمة غير صحيحة',
    loginRequired: 'يجب تسجيل الدخول أولاً',
    verificationRequired: 'يجب تأكيد الحساب أولاً',
    twoFactorRequired: 'يجب إدخال رمز التحقق الثنائي',
    invalidOtp: 'رمز التحقق غير صحيح'
  },

  // ========== Database Errors ==========
  database: {
    connectionFailed: 'فشل الاتصال بقاعدة البيانات',
    queryFailed: 'فشل تنفيذ الاستعلام',
    transactionFailed: 'فشلت العملية',
    recordNotFound: 'السجل غير موجود',
    duplicateRecord: 'السجل موجود مسبقاً',
    foreignKeyViolation: 'لا يمكن الحذف بسبب وجود بيانات مرتبطة',
    constraintViolation: 'انتهاك قيد قاعدة البيانات',
    dataIntegrityError: 'خطأ في سلامة البيانات',
    migrationFailed: 'فشل تحديث قاعدة البيانات'
  },

  // ========== API Errors ==========
  api: {
    notFound: 'المورد المطلوب غير موجود',
    methodNotAllowed: 'الطريقة غير مسموحة',
    badRequest: 'طلب غير صحيح',
    serverError: 'خطأ في السيرفر',
    serviceUnavailable: 'الخدمة غير متاحة حالياً',
    timeout: 'انتهت مهلة الطلب',
    rateLimitExceeded: 'تجاوزت الحد المسموح من الطلبات',
    invalidApiKey: 'مفتاح API غير صالح',
    missingParameter: (param: string) => `المعامل ${param} مطلوب`,
    invalidParameter: (param: string) => `المعامل ${param} غير صحيح`,
    invalidRequestBody: 'محتوى الطلب غير صحيح',
    invalidResponseFormat: 'تنسيق الاستجابة غير صحيح',
    apiVersionNotSupported: 'إصدار API غير مدعوم',
    maintenanceMode: 'النظام تحت الصيانة، نعتذر عن الإزعاج'
  },

  // ========== Business Logic Errors ==========
  business: {
    // Auction errors
    auctionEnded: 'المزاد انتهى',
    auctionNotStarted: 'المزاد لم يبدأ بعد',
    auctionCancelled: 'المزاد ملغي',
    bidTooLow: 'المزايدة أقل من الحد المطلوب',
    cannotBidOnOwnAuction: 'لا يمكنك المزايدة على مزادك',
    alreadyHighestBidder: 'أنت صاحب أعلى مزايدة بالفعل',
    insufficientBalance: 'الرصيد غير كافي',
    
    // Car errors
    carNotAvailable: 'السيارة غير متاحة',
    carAlreadySold: 'السيارة مباعة بالفعل',
    carUnderAuction: 'السيارة في مزاد حالياً',
    
    // Order errors
    orderNotFound: 'الطلب غير موجود',
    orderCancelled: 'الطلب ملغي',
    orderCompleted: 'الطلب مكتمل بالفعل',
    cannotCancelOrder: 'لا يمكن إلغاء الطلب',
    
    // Payment errors
    paymentFailed: 'فشلت عملية الدفع',
    paymentPending: 'الدفع قيد المعالجة',
    paymentExpired: 'انتهت صلاحية الدفع',
    refundFailed: 'فشل إرجاع المبلغ',
    
    // Transport errors
    serviceNotAvailable: 'الخدمة غير متاحة في منطقتك',
    driverNotAvailable: 'لا يوجد سائق متاح حالياً',
    invalidRoute: 'المسار غير صحيح',
    
    // General
    operationNotAllowed: 'العملية غير مسموحة',
    limitExceeded: 'تجاوزت الحد المسموح',
    quotaExhausted: 'انتهت الحصة المسموحة',
    featureDisabled: 'هذه الميزة معطلة حالياً',
    underReview: 'تحت المراجعة',
    pendingApproval: 'في انتظار الموافقة'
  },

  // ========== Network Errors ==========
  network: {
    offline: 'لا يوجد اتصال بالإنترنت',
    connectionLost: 'فقد الاتصال',
    slowConnection: 'الاتصال بطيء',
    requestFailed: 'فشل الطلب',
    cannotReachServer: 'لا يمكن الوصول للسيرفر',
    corsError: 'خطأ في صلاحيات CORS',
    sslError: 'خطأ في شهادة الأمان'
  },

  // ========== UI/UX Messages ==========
  ui: {
    loading: 'جاري التحميل...',
    saving: 'جاري الحفظ...',
    deleting: 'جاري الحذف...',
    processing: 'جاري المعالجة...',
    pleaseWait: 'يرجى الانتظار...',
    noData: 'لا توجد بيانات',
    noResults: 'لا توجد نتائج',
    tryAgain: 'حاول مرة أخرى',
    somethingWentWrong: 'حدث خطأ ما',
    unknownError: 'خطأ غير معروف',
    pageNotFound: 'الصفحة غير موجودة',
    accessDenied: 'الوصول مرفوض',
    confirmAction: 'هل أنت متأكد؟',
    cannotUndo: 'لا يمكن التراجع عن هذا الإجراء',
    changesSaved: 'تم حفظ التغييرات',
    changesNotSaved: 'لم يتم حفظ التغييرات',
    dataLost: 'قد تفقد البيانات غير المحفوظة'
  }
};

// ============================================
// 2. Success Messages
// ============================================

export const SuccessMessages = {
  // General
  saved: 'تم الحفظ بنجاح',
  updated: 'تم التحديث بنجاح',
  deleted: 'تم الحذف بنجاح',
  created: 'تم الإنشاء بنجاح',
  sent: 'تم الإرسال بنجاح',
  uploaded: 'تم الرفع بنجاح',
  downloaded: 'تم التحميل بنجاح',
  copied: 'تم النسخ بنجاح',
  
  // Auth
  loginSuccess: 'تم تسجيل الدخول بنجاح',
  logoutSuccess: 'تم تسجيل الخروج بنجاح',
  registerSuccess: 'تم إنشاء الحساب بنجاح',
  passwordChanged: 'تم تغيير كلمة المرور بنجاح',
  passwordReset: 'تم إعادة تعيين كلمة المرور',
  emailVerified: 'تم تأكيد البريد الإلكتروني',
  phoneVerified: 'تم تأكيد رقم الهاتف',
  
  // Business
  bidPlaced: 'تم وضع المزايدة بنجاح',
  auctionCreated: 'تم إنشاء المزاد بنجاح',
  orderPlaced: 'تم تأكيد الطلب بنجاح',
  paymentSuccessful: 'تم الدفع بنجاح',
  itemAddedToCart: 'تم الإضافة للسلة',
  reviewSubmitted: 'تم إرسال التقييم'
};

// ============================================
// 3. Warning Messages
// ============================================

export const WarningMessages = {
  unsavedChanges: 'لديك تغييرات غير محفوظة',
  lowBalance: 'رصيدك منخفض',
  expiringSession: 'ستنتهي جلستك قريباً',
  limitApproaching: 'اقتربت من الحد المسموح',
  deprecatedFeature: 'هذه الميزة قديمة وقد تُزال قريباً',
  betaFeature: 'هذه ميزة تجريبية',
  irreversibleAction: 'هذا الإجراء لا يمكن التراجع عنه'
};

// ============================================
// 4. Info Messages
// ============================================

export const InfoMessages = {
  newFeature: 'ميزة جديدة متاحة',
  maintenance: 'صيانة مجدولة',
  updateAvailable: 'تحديث متاح',
  policyUpdate: 'تم تحديث السياسات',
  welcomeBack: 'مرحباً بعودتك',
  firstTimeUser: 'مرحباً بك في المنصة'
};

// ============================================
// 5. Helper Functions
// ============================================

export class MessageFormatter {
  /**
   * Format error response for API
   */
  static formatApiError(code: string, message: string, details?: any) {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Format success response for API
   */
  static formatApiSuccess(message: string, data?: any) {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get error message by code
   */
  static getErrorByCode(code: string): string {
    const categories = Object.keys(ErrorMessages);
    
    for (const category of categories) {
      const messages = (ErrorMessages as any)[category];
      if (messages[code]) {
        return typeof messages[code] === 'function' 
          ? messages[code]() 
          : messages[code];
      }
    }
    
    return ErrorMessages.ui.unknownError;
  }

  /**
   * Translate error code to Arabic message
   */
  static translateError(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error.message) {
      return error.message;
    }
    
    if (error.code) {
      return this.getErrorByCode(error.code);
    }
    
    return ErrorMessages.ui.somethingWentWrong;
  }
}

export default {
  ErrorMessages,
  SuccessMessages,
  WarningMessages,
  InfoMessages,
  MessageFormatter
};
