# إعداد PostgreSQL لمشروع مزاد السيارات

## 📋 متطلبات التثبيت

### 1. تثبيت PostgreSQL

#### على Windows:

```bash
# تحميل من الموقع الرسمي
https://www.postgresql.org/download/windows/

# أو باستخدام Chocolatey
choco install postgresql

# أو باستخدام Scoop
scoop install postgresql
```

#### على macOS:

```bash
# باستخدام Homebrew
brew install postgresql
brew services start postgresql

# أو تحميل PostgreSQL.app
https://postgresapp.com/
```

#### على Linux (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. إعداد قاعدة البيانات

```sql
-- الاتصال كمستخدم postgres
sudo -u postgres psql

-- إنشاء قاعدة البيانات
CREATE DATABASE car_auction_db
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- إنشاء مستخدم مخصص للتطبيق
CREATE USER car_auction_user WITH PASSWORD 'strong_password_here';

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON DATABASE car_auction_db TO car_auction_user;
GRANT ALL ON SCHEMA public TO car_auction_user;

-- إنشاء امتدادات مفيدة
\c car_auction_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- الخروج
\q
```

### 3. تحديث متغيرات البيئة

```env
# قاعدة البيانات - PostgreSQL للإنتاج
DATABASE_URL="postgresql://car_auction_user:strong_password_here@localhost:5432/car_auction_db?schema=public"

# للتطوير المحلي
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/car_auction_db?schema=public"
```

## 🔧 إعدادات الأداء

### postgresql.conf

```conf
# إعدادات الذاكرة
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# إعدادات الاتصالات
max_connections = 200
superuser_reserved_connections = 3

# إعدادات WAL
wal_buffers = 16MB
checkpoint_completion_target = 0.9
wal_writer_delay = 200ms

# إعدادات الاستعلامات
random_page_cost = 1.1
effective_io_concurrency = 200
```

## 🚀 إعداد المشروع

### 1. إعداد Prisma مع PostgreSQL

```bash
# تحديث Prisma Client
npx prisma generate

# إنشاء الجداول
npx prisma db push
```

### 2. تطبيق Schema الجديد

```bash
# تحديث Prisma Client
npx prisma generate

# تطبيق الهجرات
npx prisma db push

# أو إنشاء هجرة جديدة
npx prisma migrate dev --name init_postgresql
```

## 🔧 حل مشاكل قاعدة البيانات الشائعة

### مشكلة: Cannot find module '.prisma/client/default'

**الأعراض:**

```
Error: Cannot find module '.prisma/client/default'
```

**السبب:**

- Prisma Client لم يتم توليده بشكل صحيح
- ملف `default.js` مفقود من مجلد `.prisma/client`

**الحل:**

```bash
# إعادة توليد Prisma Client
npx prisma generate

# تطبيق Schema
npx prisma db push

# اختبار الاتصال
npm run db:test-postgresql
```

**الحل التلقائي:** استخدم ملفات التشغيل التلقائي:

```bash
# Windows Batch
scripts/startup.bat

# PowerShell
scripts/startup.ps1
```

### 3. التحقق من النجاح

```bash
# اختبار الاتصال
node scripts/test-postgresql-connection.js

# فتح Prisma Studio
npx prisma studio
```

## 🔒 الأمان

### 1. إعدادات pg_hba.conf

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

### 2. كلمات مرور قوية

```bash
# تغيير كلمة مرور postgres
sudo -u postgres psql
\password postgres

# تغيير كلمة مرور المستخدم المخصص
\password car_auction_user
```

## 📊 المراقبة والصيانة

### 1. سكريبت النسخ الاحتياطي

```bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/car_auction"
DB_NAME="car_auction_db"
DB_USER="car_auction_user"

mkdir -p $BACKUP_DIR

# نسخة احتياطية كاملة
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# ضغط النسخة
gzip $BACKUP_DIR/backup_$DATE.sql

# حذف النسخ القديمة (أكثر من 30 يوم)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### 2. مراقبة الأداء

```sql
-- فحص الاتصالات النشطة
SELECT count(*) FROM pg_stat_activity;

-- فحص حجم قاعدة البيانات
SELECT pg_size_pretty(pg_database_size('car_auction_db'));

-- فحص الاستعلامات البطيئة
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## ✅ قائمة التحقق

- [ ] تثبيت PostgreSQL
- [ ] إنشاء قاعدة البيانات والمستخدم
- [ ] تحديث متغيرات البيئة
- [ ] تطبيق Schema الجديد
- [ ] إعداد البيانات الأولية
- [ ] اختبار الاتصال والوظائف
- [ ] إعداد النسخ الاحتياطية
- [ ] تكوين إعدادات الأمان
- [ ] مراقبة الأداء

## 🆘 استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ الاتصال**: تحقق من تشغيل PostgreSQL
2. **خطأ المصادقة**: تحقق من كلمة المرور والصلاحيات
3. **خطأ الترميز**: تأكد من UTF-8 encoding
4. **بطء الأداء**: راجع إعدادات postgresql.conf
