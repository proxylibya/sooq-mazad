# سياق مشروع سوق مزاد - Cascade AI Reference

## 🚀 معلومات أساسية
- **النوع:** Monorepo (Turborepo)
- **اللغة:** العربية RTL
- **Node:** v22.15.1

## 📦 البنية والمنافذ
| الخدمة | المنفذ | المجلد | الوصف |
|--------|--------|---------|-------|
| Web | 3021 | apps/web | الموقع الرئيسي |
| Admin | 3022 | apps/admin | لوحة التحكم |
| API | 3023 | apps/api | خدمات Backend |
| Realtime | 3024 | services/realtime | WebSocket |

## 🔑 الأوامر الأساسية
```bash
# تشغيل بدون Redis/Docker (الأفضل حالياً)
.\start-without-redis.ps1

# أو باستخدام Concurrently
npm run dev:concurrent

# إصلاح سريع
npm run fix:quick
```

## ⚠️ القواعد الصارمة
1. **لا إيموجي** - استخدم Heroicons فقط
2. **لا Redis** - استخدم KeyDB فقط
3. **لا SQLite** - PostgreSQL فقط
4. **أرقام عادية** (123) وليس (١٢٣)
5. **العربية RTL** دائماً
6. **Cairo Font** للعربية

## 👤 بيانات الدخول
- **Admin:** admin@sooqmazad.ly / Admin@2024#Secure
- **Test User:** 0912345678 / Test123456

## 📁 الملفات المهمة
- `apps/web/` - الموقع الرئيسي
- `apps/admin/` - لوحة التحكم
- `apps/api/src/` - Backend APIs
- `prisma/schema.prisma` - قاعدة البيانات

## 🔧 التقنيات
- Next.js 14.2.33
- TypeScript 5.3.3
- PostgreSQL + Prisma
- TailwindCSS
- Heroicons

## 💡 نصائح للأداء
- استخدم `npm run dev:concurrent` بدلاً من `turbo`
- المشروع يعمل بدون Docker/Redis
- KeyDB معطل حالياً (KEYDB_ENABLED=false)
