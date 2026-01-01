# استخدام Node.js 18 Alpine لحجم أصغر
FROM node:18-alpine AS base

# إضافة المكتبات المطلوبة لـ Sharp وPrisma
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# نسخ ملفات Package
COPY package*.json ./
COPY prisma ./prisma/

# تثبيت التبعيات (مع devDependencies حتى تعمل prisma في postinstall)
RUN npm ci --legacy-peer-deps && npm cache clean --force

# إنشاء Prisma Client
RUN npx prisma generate

# مرحلة البناء
FROM node:18-alpine AS builder

WORKDIR /app

# نسخ التبعيات من المرحلة السابقة
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/prisma ./prisma

# نسخ ملفات المشروع
COPY . .

# بناء المشروع
RUN npm run build

# المرحلة النهائية للإنتاج
FROM node:18-alpine AS production

# إضافة المكتبات المطلوبة
RUN apk add --no-cache libc6-compat

# إنشاء مستخدم غير root للأمان
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# نسخ الملفات المطلوبة فقط
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma/

# نسخ ملفات البناء
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# إنشاء مجلدات التخزين
RUN mkdir -p /app/uploads /app/temp /app/optimized-images
RUN chown -R nextjs:nodejs /app/uploads /app/temp /app/optimized-images

# متغيرات البيئة
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# التعرض للمنفذ
EXPOSE 3000

# التبديل للمستخدم غير root
USER nextjs

# صحة الحاوية
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# تشغيل التطبيق
CMD ["node", "server.js"]
