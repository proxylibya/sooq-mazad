# سوق مزاد - دليل المشروع

**آخر تحديث:** 2025-11-27

## نظرة عامة

سوق مزاد هي منصة مزادات سيارات ليبية متكاملة، مبنية على بنية **Monorepo** عالمية.

---

## البنية

```
sooq-mazad/
├── apps/
│   ├── web/          # التطبيق الرئيسي (Next.js) - Port 3021
│   ├── admin/        # لوحة التحكم (Next.js) - Port 3022
│   └── api/          # خدمة API (Express) - Port 3020
├── packages/
│   ├── database/     # Prisma Client مشترك
│   ├── types/        # TypeScript types مشتركة
│   ├── ui/           # مكونات UI مشتركة
│   ├── utils/        # أدوات مساعدة مشتركة
│   └── config/       # إعدادات مشتركة
├── services/
│   └── realtime/     # خدمة Socket.IO
└── prisma/           # Schema قاعدة البيانات
```

---

## البدء السريع

```bash
# تثبيت التبعيات
npm install

# توليد Prisma Client
npm run prisma:generate

# تشغيل بيئة التطوير
npm run dev:web        # التطبيق الرئيسي
npm run dev:admin      # لوحة التحكم
npm run dev:concurrent # جميع التطبيقات

# البناء للإنتاج
npm run build
```

---

## الأوامر الأساسية

| الأمر                     | الوصف                        |
| ------------------------- | ---------------------------- |
| `npm run dev`             | تشغيل جميع التطبيقات (Turbo) |
| `npm run build`           | بناء جميع التطبيقات          |
| `npm run lint`            | فحص الكود                    |
| `npm run type-check`      | فحص TypeScript               |
| `npm run prisma:generate` | توليد Prisma Client          |
| `npm run db:studio`       | فتح Prisma Studio            |

---

## قاعدة البيانات

- **PostgreSQL** كقاعدة بيانات رئيسية
- **Prisma ORM** للتعامل مع البيانات
- **KeyDB/Redis** للتخزين المؤقت (اختياري)

### إعداد قاعدة البيانات

```bash
# إنشاء الجداول
npm run prisma:push

# تشغيل الهجرات
npm run db:migrate

# ملء البيانات الأولية
npm run db:seed
```

---

## المصادقة

- **JWT** للمستخدمين والمديرين
- نظام مصادقة منفصل للوحة التحكم
- دعم أرقام الهواتف الليبية

### بيانات تسجيل الدخول للتطوير

- **لوحة التحكم**: `admin` / `123456`
- **المنفذ**: http://localhost:3022/admin/login

---

## التقنيات

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Next.js API Routes, Prisma
- **Database**: PostgreSQL
- **Cache**: KeyDB/Redis
- **Realtime**: Socket.IO
- **Build**: Turbo (Monorepo)

---

**تم إنشاؤه بواسطة:** فريق سوق مزاد
