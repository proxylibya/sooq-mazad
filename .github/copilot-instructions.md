# تعليمات الذكاء الاصطناعي لمشروع مزاد السيارات

## نظرة عامة

- المشروع عبارة عن منصة مزادات سيارات تعتمد على Next.js (App Router) مع
  PostgreSQL وPrisma.
- جميع الأكواد البرمجية والتعليقات باللغة الإنجليزية، أما التوثيق والمحادثة مع
  المطورين بالعربية.
- يمنع استخدام الإيموجي أو رموز Unicode في الواجهات أو الأكواد.

## الهيكلية الأساسية

- `app/` : تطبيق Next.js (App Router)
- `components/` : مكونات React قابلة لإعادة الاستخدام (انظر README في كل مجلد)
- `lib/` : مكتبات وأدوات مساعدة
- `prisma/` : مخطط قاعدة البيانات Prisma
- `scripts/` : سكريبتات مساعدة للإدارة والاختبار
- `docs/` : توثيق شامل ومعايير المشروع

## قواعد التطوير

- لغة البرمجة: JavaScript فقط (TypeScript ممنوع)
- إدارة الحزم: npm فقط (yarn/pnpm ممنوع)
- التصميم: Tailwind CSS مع Heroicons أو Lucide React فقط للأيقونات
- جميع الأرقام في الواجهات إنجليزية فقط (0-9)
- جميع الأكواد البرمجية يجب أن تكون واضحة وقابلة للصيانة

## قواعد قاعدة البيانات

- PostgreSQL فقط (لا تستخدم SQLite/MySQL/MongoDB)
- استخدم Prisma ORM مع الأوامر:
  - `npx prisma db push`
  - `npx prisma generate`
  - `npx prisma migrate dev`
  - `npx prisma studio`
- الترميز UTF8، إعدادات LC_COLLATE وLC_CTYPE = C

## المصادقة والأمان

- NextAuth.js للمصادقة
- JWT للجلسات
- bcrypt لتشفير كلمات المرور
- متغيرات البيئة الأساسية:
  - NEXTAUTH_SECRET
  - NEXTAUTH_URL
  - JWT_SECRET
  - ENCRYPTION_KEY

## الاختبار

- استخدم Jest لاختبارات الوحدة
- اختبارات يدوية للواجهات
- سكريبتات اختبار مخصصة لقاعدة البيانات (انظر `scripts/`)

## أنماط المكونات

- كل مكون React له README يوضح طريقة الاستخدام والخصائص
- أمثلة الاستخدام متوفرة في ملفات README داخل `components/`
- اتبع نمط الفصل بين مكونات العرض والمنطق

## نصائح الإنتاجية

- راجع `docs/PROJECT-STANDARDS.md` لأي قرار تقني أو نمط غير واضح
- استخدم السكريبتات الجاهزة في `scripts/` لتسهيل المهام المتكررة
- لا تبتكر أنماطاً جديدة بدون مراجعة التوثيق أولاً

## أمثلة على ملفات مهمة

- `components/auction-progress/README.md` : شرح أنظمة شريط التقدم
- `components/seller-info/README.md` : أنماط عرض بيانات البائع
- `components/service-provider-cards/README.md` : بطاقات مقدمي الخدمة
- `docs/PROJECT-STANDARDS.md` : جميع المعايير التقنية والتصميمية

## ممنوع تماماً

- TypeScript، Yarn، pnpm، أيقونات خارج Heroicons/Lucide، خطوط مخصصة، أي إيموجي
  أو Unicode، أي قاعدة بيانات غير PostgreSQL، أي إطار عمل غير Next.js

---

يرجى تحديث هذه التعليمات عند أي تغيير جوهري في بنية المشروع أو معاييره.
