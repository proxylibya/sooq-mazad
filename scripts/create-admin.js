/**
 * Create Admin Script - Enterprise Edition
 * سكريبت إنشاء المدير الأول
 *
 * Usage: node scripts/create-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

// Generate unique ID
function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdmin() {
  console.log('\n========================================');
  console.log('   إنشاء مدير جديد - سوق مزاد');
  console.log('   Create New Admin - Sooq Mazad');
  console.log('========================================\n');

  try {
    // Get admin details
    const email = await question('البريد الإلكتروني (Email): ');
    const name = await question('الاسم الكامل (Full Name): ');
    const password = await question('كلمة المرور (Password): ');
    const phone = await question('رقم الهاتف (Phone, optional): ');

    console.log('\nأدوار المديرين المتاحة (Available Roles):');
    console.log('1. SUPER_ADMIN - مدير أعلى (جميع الصلاحيات)');
    console.log('2. ADMIN - مدير (صلاحيات إدارية)');
    console.log('3. MODERATOR - مشرف (صلاحيات محدودة)');
    console.log('4. SUPPORT - دعم فني');
    console.log('5. VIEWER - مشاهد فقط');

    const roleInput = await question('\nاختر الدور (1-5): ');
    const roles = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT', 'VIEWER'];
    const role = roles[parseInt(roleInput) - 1] || 'MODERATOR';

    // Validate input
    if (!email || !name || !password) {
      console.error('\n❌ خطأ: جميع الحقول المطلوبة يجب ملؤها');
      rl.close();
      process.exit(1);
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error('\n❌ خطأ: البريد الإلكتروني غير صالح');
      rl.close();
      process.exit(1);
    }

    // Password validation
    if (password.length < 6) {
      console.error('\n❌ خطأ: كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      rl.close();
      process.exit(1);
    }

    // Check if email exists
    const existing = await prisma.admins.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      console.error('\n❌ خطأ: البريد الإلكتروني مستخدم مسبقاً');
      rl.close();
      process.exit(1);
    }

    // Hash password
    console.log('\n⏳ جاري تشفير كلمة المرور...');
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create admin
    console.log('⏳ جاري إنشاء المدير...');
    const admin = await prisma.admins.create({
      data: {
        id: `adm_${generateId()}`,
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        name: name,
        phone: phone || null,
        role: role,
        is_active: true,
        updated_at: new Date(),
      },
    });

    console.log('\n========================================');
    console.log('✅ تم إنشاء المدير بنجاح!');
    console.log('========================================');
    console.log(`ID: ${admin.id}`);
    console.log(`الاسم: ${admin.name}`);
    console.log(`البريد الإلكتروني: ${admin.email}`);
    console.log(`الدور: ${admin.role}`);
    console.log(`الحالة: نشط`);
    console.log('========================================');
    console.log('\n🔗 يمكنك الآن تسجيل الدخول على:');
    console.log('   http://localhost:3022/admin/login');
    console.log('\n');
  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    if (error.code === 'P2002') {
      console.error('البريد الإلكتروني مستخدم مسبقاً');
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Quick create without prompts (for testing)
async function quickCreate() {
  console.log('\n⚡ Quick Admin Creation Mode\n');

  try {
    const email = 'admin@sooqmazad.com';
    const password = 'Admin@123';

    // Check if exists
    const existing = await prisma.admins.findUnique({
      where: { email },
    });

    if (existing) {
      console.log('✅ المدير موجود مسبقاً:');
      console.log(`   Email: ${email}`);
      console.log(`   Role: ${existing.role}`);
      await prisma.$disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const admin = await prisma.admins.create({
      data: {
        id: `adm_${generateId()}`,
        email: email,
        password_hash: hashedPassword,
        name: 'System Admin',
        role: 'SUPER_ADMIN',
        is_active: true,
        updated_at: new Date(),
      },
    });

    console.log('========================================');
    console.log('✅ تم إنشاء المدير بنجاح!');
    console.log('========================================');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${admin.role}`);
    console.log('========================================');
    console.log('\n🔗 Login at: http://localhost:3022/admin/login\n');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--quick') || args.includes('-q')) {
  quickCreate();
} else {
  createAdmin();
}
