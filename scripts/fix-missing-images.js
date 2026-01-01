/**
 * سكريبت فحص وإصلاح الصور المفقودة
 * يفحص قاعدة البيانات ويقارنها بالملفات الموجودة فعلياً
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// المجلدات المطلوب فحصها
const UPLOAD_DIRS = {
  transport: path.join(process.cwd(), 'public', 'uploads', 'transport'),
  marketplace: path.join(process.cwd(), 'public', 'uploads', 'marketplace'),
  cars: path.join(process.cwd(), 'public', 'uploads', 'cars'),
  adminAuctions: path.join(process.cwd(), 'public', 'uploads', 'admin-auctions'),
  messages: path.join(process.cwd(), 'public', 'uploads', 'messages'),
};

// الصور الافتراضية
const DEFAULT_IMAGES = {
  transport: '/images/transport/default-truck.jpg',
  car: '/images/cars/default-car.svg',
  marketplace: '/images/cars/default-car.svg',
  auction: '/images/cars/default-car.svg',
};

// جمع جميع الملفات الموجودة
function getExistingFiles() {
  const files = new Set();

  for (const [type, dir] of Object.entries(UPLOAD_DIRS)) {
    if (fs.existsSync(dir)) {
      const dirFiles = fs.readdirSync(dir);
      dirFiles.forEach((file) => {
        files.add(`/uploads/${type === 'adminAuctions' ? 'admin-auctions' : type}/${file}`);
      });
      console.log(`📁 ${type}: ${dirFiles.length} ملف موجود`);
    } else {
      console.log(`⚠️ ${type}: المجلد غير موجود`);
    }
  }

  return files;
}

// فحص مسار الصورة
function checkImagePath(imagePath, existingFiles) {
  if (!imagePath) return { exists: false, path: imagePath };

  // تنظيف المسار
  let cleanPath = imagePath.trim();

  // إزالة علامات الاقتباس
  cleanPath = cleanPath.replace(/^["']+|["']+$/g, '');

  // التحقق من وجود الملف
  if (cleanPath.startsWith('/uploads/')) {
    const exists = existingFiles.has(cleanPath);
    return { exists, path: cleanPath };
  }

  // مسار نسبي
  if (!cleanPath.startsWith('/') && !cleanPath.startsWith('http')) {
    cleanPath = '/' + cleanPath;
  }

  return { exists: existingFiles.has(cleanPath), path: cleanPath };
}

// تحليل صور من نص
function parseImages(imagesData) {
  if (!imagesData) return [];

  if (Array.isArray(imagesData)) {
    return imagesData.flat().filter(Boolean);
  }

  if (typeof imagesData === 'string') {
    const trimmed = imagesData.trim();

    // محاولة JSON
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // متابعة
      }
    }

    // CSV
    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    return [trimmed];
  }

  return [];
}

async function main() {
  console.log('🔍 بدء فحص الصور المفقودة...\n');

  const existingFiles = getExistingFiles();
  console.log(`\n📊 إجمالي الملفات الموجودة: ${existingFiles.size}\n`);

  const report = {
    transport: { total: 0, missing: 0, records: [] },
    cars: { total: 0, missing: 0, records: [] },
    auctions: { total: 0, missing: 0, records: [] },
    yards: { total: 0, missing: 0, records: [] },
  };

  // 1. فحص خدمات النقل
  console.log('🚚 فحص خدمات النقل...');
  const transportServices = await prisma.transport_services.findMany({
    select: { id: true, title: true, images: true },
  });

  for (const service of transportServices) {
    const images = parseImages(service.images);
    report.transport.total += images.length;

    for (const img of images) {
      const check = checkImagePath(img, existingFiles);
      if (!check.exists && !img.includes('default') && !img.includes('placeholder')) {
        report.transport.missing++;
        report.transport.records.push({
          id: service.id,
          title: service.title?.substring(0, 50),
          missingImage: check.path,
        });
      }
    }
  }

  // 2. فحص السيارات
  console.log('🚗 فحص السيارات...');
  const cars = await prisma.cars.findMany({
    select: { id: true, brand: true, model: true, images: true },
  });

  for (const car of cars) {
    const images = parseImages(car.images);
    report.cars.total += images.length;

    for (const img of images) {
      const check = checkImagePath(img, existingFiles);
      if (
        !check.exists &&
        !img.includes('default') &&
        !img.includes('placeholder') &&
        !img.includes('unsplash')
      ) {
        report.cars.missing++;
        report.cars.records.push({
          id: car.id,
          name: `${car.brand} ${car.model}`,
          missingImage: check.path,
        });
      }
    }
  }

  // 3. فحص الساحات
  console.log('🏢 فحص الساحات...');
  const yards = await prisma.yards.findMany({
    select: { id: true, name: true, images: true },
  });

  for (const yard of yards) {
    const images = parseImages(yard.images);
    report.yards.total += images.length;

    for (const img of images) {
      const check = checkImagePath(img, existingFiles);
      if (!check.exists && !img.includes('default') && !img.includes('placeholder')) {
        report.yards.missing++;
        report.yards.records.push({
          id: yard.id,
          name: yard.name?.substring(0, 50),
          missingImage: check.path,
        });
      }
    }
  }

  // طباعة التقرير
  console.log('\n' + '='.repeat(60));
  console.log('📊 تقرير الصور المفقودة');
  console.log('='.repeat(60));

  for (const [type, data] of Object.entries(report)) {
    console.log(`\n${type.toUpperCase()}:`);
    console.log(`  إجمالي الصور: ${data.total}`);
    console.log(`  صور مفقودة: ${data.missing}`);
    if (data.records.length > 0 && data.records.length <= 10) {
      console.log('  السجلات المتأثرة:');
      data.records.forEach((r) => {
        console.log(`    - ${r.id}: ${r.name || r.title}`);
        console.log(`      الصورة: ${r.missingImage}`);
      });
    } else if (data.records.length > 10) {
      console.log(`  (${data.records.length} سجل متأثر - عرض أول 5)`);
      data.records.slice(0, 5).forEach((r) => {
        console.log(`    - ${r.id}: ${r.name || r.title}`);
      });
    }
  }

  // حفظ التقرير
  const reportPath = path.join(process.cwd(), 'missing-images-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n✅ تم حفظ التقرير في: ${reportPath}`);

  await prisma.$disconnect();
}

main().catch(console.error);
