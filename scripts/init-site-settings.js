const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initSiteSettings() {
  try {
    console.log('Checking for existing site settings...');
    
    let settings = await prisma.site_settings.findFirst();

    if (settings) {
      console.log('Site settings already exist:', settings);
      return;
    }

    console.log('Creating default site settings...');
    
    settings = await prisma.site_settings.create({
      data: {
        siteName: 'سوق المزاد',
        siteDescription: 'منصة المزادات الأولى في ليبيا',
        siteTitle: 'موقع مزاد السيارات',
        welcomeMessage: 'مرحباً بكم في موقع مزاد السيارات',
      },
    });

    console.log('Site settings created successfully:', settings);
  } catch (error) {
    console.error('Error initializing site settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initSiteSettings();
