# دليل النشر السريع - 10 دقائق

---

## الخطوة 1: جمع المعلومات من Neon (قاعدة البيانات)

1. افتح الرابط في Chrome: https://console.neon.tech/app/org-raspy-lake-57775722/projects

2. إذا كان هناك مشروع موجود:
   - اضغط على المشروع
   - اذهب إلى "Connection Details"
   - انسخ النص الطويل الذي يبدأ بـ "postgresql://"

3. إذا لم يكن هناك مشروع:
   - اضغط زر "New Project"
   - اكتب اسم المشروع: sooq-mazad
   - اختر Region قريب منك
   - اضغط "Create Project"
   - انسخ النص الطويل (Connection string)

4. احفظ النص المنسوخ في ملف نصي مؤقت

---

## الخطوة 2: جمع المعلومات من Supabase (الصور)

1. افتح الرابط في Chrome: https://supabase.com/dashboard/org/pukiiegqgukqseagcphm

2. إذا كان هناك مشروع موجود:
   - اضغط على المشروع

3. إذا لم يكن هناك مشروع:
   - اضغط "New Project"
   - اكتب اسم المشروع: sooq-mazad
   - اكتب كلمة مرور قوية (احفظها!)
   - اختر Region قريب منك
   - اضغط "Create new project"
   - انتظر 2-3 دقائق حتى يكتمل الإنشاء

4. بعد فتح المشروع:
   - من القائمة اليسرى، اضغط "Project Settings" (الترس)
   - اضغط "API"
   - ستجد معلومتين مهمتين:
     - Project URL (مثل: https://abcdefgh.supabase.co)
     - anon public (نص طويل يبدأ بـ eyJ...)
   - انسخهم في ملف نصي مؤقت

5. إنشاء مكان للصور:
   - من القائمة اليسرى، اضغط "Storage"
   - اضغط "Create a new bucket"
   - اكتب: cars-images
   - فعّل "Public bucket" ✓
   - اضغط "Create bucket"

---

## الخطوة 3: رفع المشروع على GitHub

1. اذهب إلى: https://github.com
2. اضغط زر "+" في الأعلى → "New repository"
3. اكتب اسم: sooq-mazad
4. اختر "Public"
5. اضغط "Create repository"

6. افتح PowerShell وانسخ هذه الأوامر واحد تلو الآخر:

```
cd c:\sooq-mazad
git init
git add .
git commit -m "Ready for deployment"
```

7. استبدل YOUR_USERNAME باسم حسابك في GitHub ثم شغل الأمر:

```
git remote add origin https://github.com/YOUR_USERNAME/sooq-mazad.git
git branch -M main
git push -u origin main
```

---

## الخطوة 4: النشر على Vercel

1. افتح الرابط في Chrome: https://vercel.com/ahmedsaeidalisarabeet-gmailcoms-projects

2. اضغط زر "Add New..." → اختر "Project"

3. ستظهر قائمة repositories، اختر "sooq-mazad"

4. اضغط "Import"

5. في صفحة الإعدادات:
   - Framework Preset: سيختار Next.js تلقائياً ✓
   - Root Directory: اتركه كما هو
   - Build Command: اكتب:
     ```
     prisma generate && next build
     ```

6. قسم Environment Variables - هنا ستضيف المعلومات:

---

### المتغيرات المطلوبة (انسخها واحدة واحدة):

#### أولاً: معلومات قاعدة البيانات من Neon

اكتب في الخانة الأولى:

```
DATABASE_URL
```

وفي الخانة الثانية الصق النص من Neon (الذي يبدأ بـ postgresql://)

اضغط "Add" ثم كرر نفس الشيء:

```
DIRECT_DATABASE_URL
```

والصق نفس النص

---

#### ثانياً: معلومات Supabase

اكتب:

```
NEXT_PUBLIC_SUPABASE_URL
```

والصق الـ Project URL من Supabase

ثم:

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

والصق الـ anon public من Supabase

---

#### ثالثاً: المفاتيح الأمنية (انسخها كما هي بالضبط)

```
JWT_SECRET
```

القيمة:

```
43b7e258e0ea5a8e3e69c9fda817e7cbb8a71569a0581fbc6a6425d6aaec7844a1abee8c58084012537bf5dac07a37056ff7e0a1cc8f5e8410a75f3ed93e1b8f
```

---

```
NEXTAUTH_SECRET
```

القيمة:

```
6e3ab33ac59a588ac8890aa04569e0b1e265fd251e6c5e5f032c8f770403f0714335ab3a3c959d873989fd5b1786b084385113aa6c0d6cdb878caffa9aa470b5
```

---

```
ADMIN_JWT_SECRET
```

القيمة:

```
371a87f61ebc4654f83b06fcd6c8b92dadd07b746dfbf2e941a830f8d0c2753720574fd2ea51fb3def63e83dce79c2a0058cf1fd53c07ebc53175c3707887d8e
```

---

```
CSRF_SECRET
```

القيمة:

```
371a87f61ebc4654f83b06fcd6c8b92dadd07b746dfbf2e941a830f8d0c2753720574fd2ea51fb3def63e83dce79c2a0058cf1fd53c07ebc53175c3707887d8e
```

---

```
SESSION_SECRET
```

القيمة:

```
6e3ab33ac59a588ac8890aa04569e0b1e265fd251e6c5e5f032c8f770403f0714335ab3a3c959d873989fd5b1786b084385113aa6c0d6cdb878caffa9aa470b5
```

---

```
ADMIN_SESSION_SECRET
```

القيمة:

```
S4LDPOY3J9YayZ9U1gkb12BBHukTFG402yRw9znCHyc=
```

---

```
MASTER_ENCRYPTION_KEY
```

القيمة:

```
S4LDPOY3J9YayZ9U1gkb12BBHukTFG402yRw9znCHyc=
```

---

#### رابعاً: إعدادات عامة

```
NODE_ENV
```

القيمة: production

---

```
NEXT_TELEMETRY_DISABLED
```

القيمة: 1

---

```
TZ
```

القيمة: Africa/Tripoli

---

```
DEFAULT_LOCALE
```

القيمة: ar

---

```
DEFAULT_CURRENCY
```

القيمة: LYD

---

```
KEYDB_ENABLED
```

القيمة: false

---

```
CACHE_TYPE
```

القيمة: memory

---

```
ENABLE_SECURITY_HEADERS
```

القيمة: true

---

```
ENABLE_CSRF_PROTECTION
```

القيمة: true

---

```
ENABLE_RATE_LIMITING
```

القيمة: true

---

#### خامساً: روابط الموقع (اتركها فارغة الآن، سنحدثها لاحقاً)

```
NEXTAUTH_URL
```

القيمة: اتركها فارغة

```
NEXT_PUBLIC_API_URL
```

القيمة: اتركها فارغة

```
NEXT_PUBLIC_APP_URL
```

القيمة: اتركها فارغة

```
NEXT_PUBLIC_ADMIN_URL
```

القيمة: اتركها فارغة

---

7. بعد إضافة كل المتغيرات، اضغط الزر الكبير "Deploy"

8. انتظر 5-10 دقائق حتى يكتمل النشر

---

## الخطوة 5: تحديث الروابط

1. بعد نجاح النشر، ستجد رابط الموقع مثل:

   ```
   https://sooq-mazad-xxxxx.vercel.app
   ```

   انسخ هذا الرابط

2. في Vercel، اذهب إلى "Settings" → "Environment Variables"

3. ابحث عن المتغيرات الأربعة الفارغة وحدثها:

```
NEXTAUTH_URL = https://sooq-mazad-xxxxx.vercel.app
NEXT_PUBLIC_API_URL = https://sooq-mazad-xxxxx.vercel.app/api
NEXT_PUBLIC_APP_URL = https://sooq-mazad-xxxxx.vercel.app
NEXT_PUBLIC_ADMIN_URL = https://sooq-mazad-xxxxx.vercel.app/admin
```

4. اذهب إلى "Deployments" واضغط "Redeploy"

---

## الخطوة 6: إعداد قاعدة البيانات

1. افتح PowerShell

2. انسخ DATABASE_URL من Neon ثم شغل:

```
cd c:\sooq-mazad
```

ثم (استبدل ... بالـ URL من Neon):

```
$env:DATABASE_URL="postgresql://..."
```

ثم:

```
npx prisma migrate deploy
```

إذا ظهرت أخطاء، جرب:

```
npx prisma db push
```

---

## الخطوة 7: اختبار الموقع

1. افتح الرابط في المتصفح:

   ```
   https://sooq-mazad-xxxxx.vercel.app
   ```

2. جرب:
   - الصفحة الرئيسية
   - تسجيل حساب جديد
   - تسجيل دخول
   - إضافة سيارة
   - رفع صورة
   - لوحة الإدارة: /admin

---

## � تم النشر بنجاح!

موقعك الآن منشور ويعمل على:

- الموقع: https://sooq-mazad-xxxxx.vercel.app
- قاعدة البيانات: Neon.tech
- الصور: Supabase Storage
- الاستضافة: Vercel

**كل شيء مجاني 100%!**

---

## إذا واجهت مشكلة:

### البناء فشل (Build Failed):

- اذهب إلى Vercel → Deployments → اضغط على الـ deployment الفاشل
- اضغط "View Build Logs"
- ابحث عن السطر الأحمر وأخبرني بالخطأ

### قاعدة البيانات لا تعمل:

- تأكد أن DATABASE_URL صحيح
- تأكد أنه ينتهي بـ ?sslmode=require

### الصور لا ترفع:

- تأكد أن Supabase bucket اسمه: cars-images
- تأكد أنه Public

---

**انتهى!** ✅
