#!/usr/bin/env node

/**
 * إضافة بيانات تجريبية للقاعدة الجديدة
 * Database Seeding Script
 * تاريخ: 24/11/2025
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
;
const prisma = new PrismaClient();
;
console.log('================================================');
console.log('       إضافة بيانات تجريبية');
console.log('================================================\n');

async function seedDatabase() {
  try {
    // 1. إنشاء مستخدمين
    console.log('👥 إنشاء مستخدمين...');
    
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    
    const users = await Promise.all([;
      prisma.user.create({
        data: {
          phone: '0911111111',
          name: 'أحمد محمد',
          email: 'ahmed@test.ly',
          password: hashedPassword,
          phoneVerified: true,
          accountType: 'REGULAR_USER',
          city: 'طرابلس',
          region: 'حي الأندلس',
          localWallet: {
            create: {
              balance: 10000,
              currency: 'LYD',
              bankName: 'مصرف الجمهورية'
            }
          },
          globalWallet: {
            create: {
              balance: 500,
              currency: 'USD'
            }
          },
          cryptoWallet: {
            create: {
              balance: 100,
              currency: 'USDT',
              network: 'TRC20'
            }
          }
        }
      }),
      prisma.user.create({
        data: {
          phone: '0922222222',
          name: 'معرض النجمة',
          email: 'showroom@test.ly',
          password: hashedPassword,
          phoneVerified: true,
          accountType: 'SHOWROOM',
          city: 'بنغازي',
          region: 'شارع جمال',
          isVerified: true,
          localWallet: {
            create: { balance: 50000 }
          },
          globalWallet: {
            create: { balance: 2000 }
          },
          cryptoWallet: {
            create: { balance: 500 }
          },
          showroom: {
            create: {
              name: 'معرض النجمة للسيارات',
              phone: '0922222222',
              email: 'showroom@test.ly',
              address: 'شارع جمال عبد الناصر',
              city: 'بنغازي',
              description: 'أفضل معرض سيارات في بنغازي',
              isVerified: true,
              rating: 4.5
            }
          }
        }
      }),
      prisma.user.create({
        data: {
          phone: '0933333333',
          name: 'شركة النقل السريع',
          email: 'transport@test.ly',
          password: hashedPassword,
          phoneVerified: true,
          accountType: 'TRANSPORT_OWNER',
          city: 'مصراتة',
          localWallet: {
            create: { balance: 15000 }
          },
          globalWallet: {
            create: { balance: 1000 }
          },
          cryptoWallet: {
            create: { balance: 200 }
          },
          transportService: {
            create: {
              companyName: 'النقل السريع',
              phone: '0933333333',
              coverage: ['طرابلس', 'بنغازي', 'مصراتة', 'سبها'],
              vehicleTypes: ['سطحة', 'شاحنة مغلقة'],
              pricePerKm: 5,
              description: 'خدمة نقل سيارات آمنة وسريعة',
              isActive: true,
              rating: 4.8
            }
          }
        }
      })
    ]);
    
    console.log(`   ✅ تم إنشاء ${users.length} مستخدمين`);
    
    // 2. إنشاء سيارات ومزادات
    console.log('🚗 إنشاء سيارات ومزادات...');
    
    const carBrands = [;
      { brand: 'Toyota', models: ['Camry', 'Corolla', 'Land Cruiser', 'Hilux'] },
      { brand: 'Mercedes', models: ['C-Class', 'E-Class', 'S-Class', 'GLE'] },
      { brand: 'BMW', models: ['3 Series', '5 Series', '7 Series', 'X5'] },
      { brand: 'Hyundai', models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe'] }
    ];
    
    const cities = ['طرابلس', 'بنغازي', 'مصراتة', 'الزاوية', 'البيضاء'];
    const colors = ['أبيض', 'أسود', 'رمادي', 'أحمر', 'أزرق', 'فضي'];
    
    let auctionCount = 0;
    let listingCount = 0;
    
    for (const user of users) {
      for (let i = 0; i < 2; i++) {
        const brandData = carBrands[Math.floor(Math.random() * carBrands.length)];
        const model = brandData.models[Math.floor(Math.random() * brandData.models.length)];
        const year = 2015 + Math.floor(Math.random() * 10);
        const city = cities[Math.floor(Math.random() * cities.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const car = await prisma.car.create({
          data: {
            userId: user.id,
            brand: brandData.brand,
            model: model,
            year: year,
            condition: i === 0 ? 'NEW' : 'USED',
            mileage: i === 0 ? 0 : Math.floor(Math.random() * 100000),
            color: color,
            engineSize: '2.0L',
            fuelType: 'بنزين',
            transmission: 'أوتوماتيك',
            drivetrain: 'دفع أمامي',
            bodyType: 'سيدان',
            doors: 4,
            seats: 5,
            city: city,
            description: `${brandData.brand} ${model} ${year} في حالة ممتازة`,
            features: {
              create: [
                { category: 'الأمان', name: 'نظام ABS' },
                { category: 'الأمان', name: 'وسائد هوائية' },
                { category: 'الراحة', name: 'مكيف هواء' },
                { category: 'الراحة', name: 'نظام صوتي' },
                { category: 'التقنية', name: 'شاشة لمس' },
                { category: 'التقنية', name: 'كاميرا خلفية' }
              ]
            },
            images: {
              create: [
                {
                  url: `https://via.placeholder.com/800x600?text=${brandData.brand}+${model}`,
                  isMain: true,
                  order: 0
                },
                {
                  url: `https://via.placeholder.com/800x600?text=Interior`,
                  order: 1
                },
                {
                  url: `https://via.placeholder.com/800x600?text=Engine`,
                  order: 2
                }
              ]
            }
          }
        });
        
        // 50% مزادات، 50% إعلانات فورية
        if (Math.random() > 0.5) {
          // إنشاء مزاد
          const startTime = new Date();
          const endTime = new Date();
          endTime.setDate(endTime.getDate() + Math.floor(Math.random() * 7) + 1);
          
          const auction = await prisma.auction.create({
            data: {
              carId: car.id,
              userId: user.id,
              title: `مزاد ${brandData.brand} ${model} ${year}`,
              startingPrice: 10000 + Math.floor(Math.random() * 50000),
              currentPrice: 10000 + Math.floor(Math.random() * 50000),
              minimumBidIncrement: 500,
              startTime: startTime,
              endTime: endTime,
              status: 'ACTIVE',
              isFeatured: Math.random() > 0.7
            }
          });
          auctionCount++;
          
          // إضافة بعض المزايدات
          if (Math.random() > 0.5) {
            const bidCount = Math.floor(Math.random() * 5) + 1;
            for (let j = 0; j < bidCount; j++) {
              const bidder = users[Math.floor(Math.random() * users.length)];
              if (bidder.id !== user.id) {
                await prisma.bid.create({
                  data: {
                    auctionId: auction.id,
                    userId: bidder.id,
                    amount: auction.currentPrice + (500 * (j + 1)),
                    status: j === bidCount - 1 ? 'ACTIVE' : 'OUTBID'
                  }
                });
              }
            }
          }
        } else {
          // إنشاء إعلان فوري
          await prisma.listing.create({
            data: {
              carId: car.id,
              userId: user.id,
              title: `للبيع ${brandData.brand} ${model} ${year}`,
              price: 15000 + Math.floor(Math.random() * 60000),
              isNegotiable: true,
              description: car.description,
              status: 'ACTIVE',
              isFeatured: Math.random() > 0.8
            }
          });
          listingCount++;
        }
      }
    }
    
    console.log(`   ✅ تم إنشاء ${auctionCount} مزاد و ${listingCount} إعلان فوري`);
    
    // 3. إنشاء مدير
    console.log('👨‍💼 إنشاء حساب مدير...');
    
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@sooqmazad.ly',
        password: await bcrypt.hash('Admin@2024#Secure', 10),
        name: 'المدير العام',
        role: 'SUPER_ADMIN',
        isActive: true,
        permissions: {
          create: [
            { permission: 'ALL' },
            { permission: 'USER_MANAGE' },
            { permission: 'AUCTION_MANAGE' },
            { permission: 'CONTENT_MANAGE' },
            { permission: 'FINANCE_MANAGE' }
          ]
        }
      }
    });
    
    console.log('   ✅ تم إنشاء حساب المدير');
    
    // 4. إضافة بعض الإشعارات
    console.log('🔔 إضافة إشعارات...');
    
    for (const user of users) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'مرحباً بك في سوق مزاد',
          message: 'نتمنى لك تجربة ممتازة في منصتنا',
          type: 'WELCOME'
        }
      });
    }
    
    console.log('   ✅ تم إضافة الإشعارات');
    
    console.log('\n================================================');
    console.log('✅ تم إضافة البيانات التجريبية بنجاح!');
    console.log('================================================\n');
    
    console.log('📊 الإحصائيات:');
    console.log(`- المستخدمين: ${users.length}`);
    console.log(`- المزادات: ${auctionCount}`);
    console.log(`- الإعلانات الفورية: ${listingCount}`);
    console.log(`- السيارات: ${users.length * 2}`);
    console.log(`- المدير: 1`);
    
    console.log('\n🔐 بيانات الدخول:');
    console.log('المستخدمين:');
    console.log('- رقم الهاتف: 0911111111');
    console.log('- كلمة المرور: Test@123');
    console.log('\nالمدير:');
    console.log('- البريد: admin@sooqmazad.ly');
    console.log('- كلمة المرور: Admin@2024#Secure');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
