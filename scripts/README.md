# سكريبت إزالة التأثيرات البصرية

## الوصف

سكريبت آلي لإزالة كل التأثيرات البصرية من ملفات المشروع (TSX, TS, JSX, JS).

## ما يتم إزالته

### Animations

- `animate-pulse`
- `animate-spin`
- `animate-bounce`
- `animate-ping`

### Hover Effects

- `hover:scale-*`
- `hover:shadow-*`
- `hover:bg-*`
- `hover:from-*`
- `hover:to-*`
- `hover:translate-*`
- `hover:rotate-*`

### Transitions

- `transition-all`
- `transition-colors`
- `transition-opacity`
- `transition-transform`
- `transition-shadow`
- `duration-*`
- `ease-*`

### Group Hover

- `group-hover:scale-*`
- `group-hover:opacity-*`
- `group-hover:visible`
- `group-hover:rotate-*`

## الاستخدام

### تشغيل السكريبت

```bash
node scripts/remove-animations.js
```

### المتطلبات

يجب تثبيت حزمة `glob`:

```bash
npm install glob
```

## الملفات المستثناة

- `node_modules/`
- `.next/`
- `dist/`
- `build/`
- `.git/`
- `scripts/`

## النتيجة

السكريبت سيقوم بـ:

1. فحص كل ملفات TSX/TS/JSX/JS في المشروع
2. إزالة كل الكلاسات المتعلقة بالتأثيرات البصرية
3. تنظيف المسافات الزائدة في `className`
4. إزالة `className=""` الفارغة
5. عرض تقرير مفصل بعدد الملفات المعدلة والتأثيرات المزالة

## ملاحظات مهمة

- السكريبت يعدل الملفات مباشرة - تأكد من عمل backup قبل التشغيل
- استخدم Git لمراجعة التغييرات بعد التشغيل
- `no-animations.css` سيطبق على كل العناصر تلقائياً بدون الحاجة لهذا السكريبت
- هذا السكريبت اختياري لتنظيف الكود فقط

## البديل الأسهل

بدلاً من تشغيل السكريبت، يمكنك الاعتماد على:

1. `no-animations.css` - يلغي كل التأثيرات على مستوى CSS
2. `tailwind.config.js` - تعطيل Core Plugins
3. الحل الحالي كافي ويطبق على كل الملفات تلقائياً
