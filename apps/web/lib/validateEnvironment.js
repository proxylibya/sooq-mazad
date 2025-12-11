// Environment Variables Validator
const requiredEnvVars = {
  development: ['DATABASE_URL', 'NEXTAUTH_SECRET', 'JWT_SECRET'],
  production: ['DATABASE_URL', 'NEXTAUTH_SECRET', 'JWT_SECRET', 'ENCRYPTION_KEY', 'APP_URL'],
};

function validateEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[env] || requiredEnvVars.development;

  const missing = required.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ متغيرات البيئة المفقودة:', missing);
    console.error('   تأكد من وجود ملف .env وأنه يحتوي على جميع المتغيرات المطلوبة');

    if (env === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️ تحذير: قد تحدث أخطاء بسبب المتغيرات المفقودة');
    }
  } else {
    console.log('✅ جميع متغيرات البيئة صحيحة');
  }

  // تحذيرات أمنية للإنتاج
  if (env === 'production') {
    const warnings = [];

    if (process.env.JWT_SECRET?.length < 32) {
      warnings.push('JWT_SECRET قصير جداً (يجب أن يكون 32 حرف على الأقل)');
    }

    if (process.env.KEYDB_PASSWORD === 'keydb123') {
      warnings.push('كلمة مرور KeyDB افتراضية - غير آمنة للإنتاج');
    }

    if (warnings.length > 0) {
      console.warn('⚠️ تحذيرات أمنية:');
      warnings.forEach((warning) => console.warn('  -', warning));
    }
  }
}

module.exports = { validateEnvironment };

// تشغيل التحقق عند تحميل الملف
if (require.main === module) {
  validateEnvironment();
}
