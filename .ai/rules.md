# القواعد الصارمة للمشروع - لا استثناءات

## 🚫 ممنوعات مطلقة

### 1. **الإيموجي في الكود**
```javascript
// ❌ خطأ
const message = "مرحبا 👋";
const icon = "🚗";

// ✅ صحيح
import { HandRaisedIcon, TruckIcon } from '@heroicons/react/24/outline';
```

### 2. **Redis**
```javascript
// ❌ خطأ
import redis from 'redis';
const client = redis.createClient();

// ✅ صحيح
import Redis from 'ioredis'; // للاتصال بـ KeyDB
const client = new Redis({
  host: process.env.KEYDB_HOST
});
```

### 3. **SQLite**
```javascript
// ❌ خطأ
datasource db {
  provider = "sqlite"
}

// ✅ صحيح
datasource db {
  provider = "postgresql"
}
```

### 4. **الأرقام الهندية/العربية**
```javascript
// ❌ خطأ
const price = "١٢٣٤٥";

// ✅ صحيح
const price = "12345";
```

## ✅ إلزاميات

### 1. **RTL دائماً**
```html
<!-- في كل صفحة -->
<html dir="rtl" lang="ar">
```

### 2. **Cairo Font**
```css
font-family: 'Cairo', sans-serif;
```

### 3. **Heroicons فقط**
```jsx
import { 
  HomeIcon,
  UsersIcon,
  CogIcon 
} from '@heroicons/react/24/outline';
```

### 4. **Dark Theme للوحة التحكم**
```css
/* Admin Panel Colors */
--background: #0F172A;
--card: #1E293B;
--border: #334155;
```

### 5. **المنافذ الثابتة**
- Web: 3021
- Admin: 3022
- API: 3023
- Realtime: 3024

## 📝 معايير الكود

### التسمية
- **الملفات:** kebab-case (`user-profile.tsx`)
- **المكونات:** PascalCase (`UserProfile`)
- **المتغيرات:** camelCase (`userProfile`)
- **الثوابت:** UPPER_SNAKE_CASE (`MAX_USERS`)

### TypeScript
- تجنب `any` قدر الإمكان
- استخدام interfaces للـ props
- تعريف types للـ API responses

### التعليقات
- بالعربية للمنطق المعقد
- بالإنجليزية للـ JSDoc

## 🔒 الأمان

### كلمات المرور
- 8 أحرف minimum
- حرف كبير وصغير
- رقم واحد على الأقل

### JWT
- مدة الصلاحية: 7 أيام
- Refresh Token: 30 يوم

### CORS
- السماح فقط لـ localhost في التطوير
- domains محددة في الإنتاج

## 📱 التوافق

### المتصفحات
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### الشاشات
- Mobile First
- Breakpoints: 640, 768, 1024, 1280px

## 🚀 الأداء

### الصور
- WebP أو AVIF عند الإمكان
- Lazy Loading للصور
- حجم أقصى: 500KB

### Bundle Size
- استخدام dynamic imports
- Tree shaking
- Code splitting

## ⚠️ تحذيرات مهمة

1. **لا تغيير البنية** بدون نقاش
2. **لا حذف للبيانات** من الإنتاج
3. **لا push مباشر** لـ main branch
4. **لا hardcoded credentials** في الكود
5. **لا console.log** في الإنتاج
