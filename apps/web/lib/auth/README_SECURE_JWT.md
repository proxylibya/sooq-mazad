# 🔐 Secure JWT Manager

**الموقع:** `lib/auth/`  
**الحالة:** ✅ نشط - آمن 100%

---

## الملف الموحد الآمن

### ✅ استخدم فقط

```typescript
import { 
  signAdminJWT, 
  verifyAdminJWT,
  signUserJWT,
  verifyUserJWT,
  jwtHealth
} from '@/lib/auth/secureJwtManager';
```

### ❌ ملف قديم (غير آمن - لا تستخدم)

```typescript
// ❌ غير آمن - محذوف
import { signAdminJWT, verifyAdminJWT } from './adminJwt';
```

---

## ⚠️ مهم جداً: JWT Secrets

### يجب إضافة secrets إلى .env

```bash
# .env.local
JWT_SECRET=your-secret-at-least-32-characters-long
ADMIN_JWT_SECRET=admin-secret-at-least-32-characters
```

### ماذا يحدث إذا لم تضع secrets؟

**في التطوير:** تحذير + استخدام secret افتراضي  
**في الإنتاج:** 🚨 التطبيق يتوقف فوراً!

```
🚨 CRITICAL: JWT_SECRET must be set in production environment!
```

---

## أمثلة سريعة

### Admin JWT

```typescript
import { signAdminJWT, verifyAdminJWT } from '@/lib/auth/secureJwtManager';

// توقيع
const token = signAdminJWT(
  {
    sub: 'admin-001',
    role: 'ADMIN',
    name: 'المدير',
    email: 'admin@example.com'
  },
  { expiresInSeconds: 86400 } // 24 ساعة
);

// التحقق
const payload = verifyAdminJWT(token);
if (payload) {
  console.log('Admin:', payload.name, payload.role);
}
```

### User JWT

```typescript
import { signUserJWT, verifyUserJWT } from '@/lib/auth/secureJwtManager';

// توقيع
const token = signUserJWT(
  {
    userId: 'user-123',
    email: 'user@example.com',
    name: 'أحمد'
  },
  { expiresInSeconds: 86400 }
);

// التحقق
const payload = verifyUserJWT(token);
if (payload) {
  console.log('User:', payload.name);
}
```

### فحص الصحة

```typescript
import { jwtHealth } from '@/lib/auth/secureJwtManager';

const health = jwtHealth();
console.log(health);
// {
//   healthy: true,
//   secrets: { admin: true, user: true },
//   errors: []
// }
```

---

## المزايا الأمنية الجديدة

✅ **منع fallback secrets** في الإنتاج  
✅ **التحقق من طول Secret** (32 حرف minimum)  
✅ **فصل Admin/User secrets**  
✅ **SecretManager موحد**  
✅ **Health check مدمج**  
✅ **تحذيرات واضحة**

---

## توليد Secrets آمنة

```bash
# استخدم OpenSSL
openssl rand -base64 32

# أو في Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## المزيد

راجع: `../../UNIFIED_SYSTEMS_GUIDE.md` للتوثيق الكامل
