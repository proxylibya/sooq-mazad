/**
 * محمل إعدادات المزادات - يقرأ من ملف الإعدادات
 * Auction Settings Loader
 */

import fs from 'fs';
import path from 'path';

interface AuctionSettings {
  defaultStartTime: 'now' | 'after_30_seconds' | 'after_1_hour' | 'after_24_hours' | 'custom';
  defaultDuration: '1_minute' | '1_day' | '3_days' | '1_week' | '1_month';
  minimumBidIncrement: number;
  minimumStartingPrice: number;
  maxImagesPerAuction: number;
  defaultStartPriceFactor: number;
  startFactorNew: number;
  startFactorUsed: number;
  startFactorNeedsRepair: number;
  startFactorSUV: number;
  startFactorSedan: number;
  startFactorPickup: number;
  startFactorVan: number;
  allowFeaturedAuctions: boolean;
  featuredAuctionDuration: number;
}

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'auction-settings.json');

// القيم الافتراضية (تُستخدم إذا لم يوجد ملف الإعدادات)
const DEFAULT_SETTINGS: AuctionSettings = {
  defaultStartTime: 'now',
  defaultDuration: '1_week',
  minimumBidIncrement: 500,
  minimumStartingPrice: 1000,
  maxImagesPerAuction: 10,
  defaultStartPriceFactor: 0.70,
  startFactorNew: 0.85,
  startFactorUsed: 0.70,
  startFactorNeedsRepair: 0.55,
  startFactorSUV: 0.75,
  startFactorSedan: 0.70,
  startFactorPickup: 0.65,
  startFactorVan: 0.60,
  allowFeaturedAuctions: true,
  featuredAuctionDuration: 7,
};

/**
 * قراءة إعدادات المزادات من الملف
 */
export function loadAuctionSettings(): AuctionSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const settings = JSON.parse(data) as AuctionSettings;
      
      // دمج مع القيم الافتراضية (في حال وجود حقول جديدة)
      return { ...DEFAULT_SETTINGS, ...settings };
    }
  } catch (error) {
    console.error('خطأ في قراءة إعدادات المزادات:', error);
  }
  
  return DEFAULT_SETTINGS;
}

/**
 * الحصول على عامل سعر البداية حسب النوع والحالة
 */
export function getStartPriceFactorFromSettings(
  bodyType?: string,
  condition?: string
): number {
  const settings = loadAuctionSettings();
  
  try {
    const bt = (bodyType || '').toString().trim().toUpperCase();
    const cond = (condition || '').toString().trim().toUpperCase();
    
    // أولوية الحالة
    if (cond === 'NEW') return settings.startFactorNew;
    if (cond === 'USED') return settings.startFactorUsed;
    if (cond === 'NEEDS_REPAIR') return settings.startFactorNeedsRepair;
    
    // أولوية النوع
    if (bt === 'SUV') return settings.startFactorSUV;
    if (bt === 'SEDAN') return settings.startFactorSedan;
    if (bt === 'PICKUP') return settings.startFactorPickup;
    if (bt === 'VAN') return settings.startFactorVan;
    
    // الافتراضي
    return settings.defaultStartPriceFactor;
  } catch (error) {
    console.error('خطأ في حساب عامل السعر:', error);
    return DEFAULT_SETTINGS.defaultStartPriceFactor;
  }
}

/**
 * الحصول على الحد الأدنى للمزايدة من الإعدادات
 */
export function getMinimumBidIncrementFromSettings(): number {
  const settings = loadAuctionSettings();
  return settings.minimumBidIncrement || 500;
}

/**
 * الحصول على الحد الأدنى لسعر البداية من الإعدادات
 */
export function getMinimumStartingPriceFromSettings(): number {
  const settings = loadAuctionSettings();
  return settings.minimumStartingPrice || 1000;
}

/**
 * الحصول على عدد الصور الأقصى من الإعدادات
 */
export function getMaxImagesFromSettings(): number {
  const settings = loadAuctionSettings();
  return settings.maxImagesPerAuction || 10;
}
