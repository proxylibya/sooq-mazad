/**
 * API لجلب إعدادات المزادات
 * يقرأ الإعدادات المحفوظة من لوحة التحكم ويوفرها للمستخدمين
 */

import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

// أنواع البيانات
interface DurationPreset {
    id: string;
    label: string;
    description: string;
    value: number; // بالدقائق
}

// خيار وقت بداية المزاد
interface StartTimeOption {
    id: string;
    label: string;
    description: string;
    value: string;
    enabled: boolean;
    order: number;
}

interface AuctionSettingsResponse {
    success: boolean;
    data?: {
        minDurationMinutes: number;
        maxDurationMinutes: number;
        defaultDurationMinutes: number;
        minStartingPrice: number;
        minBidIncrement: number;
        autoExtendTime: number;
        maxImagesPerAuction: number;
        allowedPresets: DurationPreset[];
        // خيارات وقت البداية
        startTimeOptions: StartTimeOption[];
        defaultStartTimeOption: string;
        allowCustomStartTime: boolean;
    };
    error?: string;
}

// مسار ملف الإعدادات المحفوظة من لوحة التحكم
// يحاول عدة مسارات للتوافق مع بيئات مختلفة
function getSettingsFilePath(): string {
    // محاولة المسار من apps/web (عند تشغيل web منفرداً)
    const pathFromWeb = path.join(process.cwd(), 'data', 'auction-settings.json');
    // محاولة المسار من الجذر (عند تشغيل من المشروع الرئيسي)
    const pathFromRoot = path.join(process.cwd(), 'apps', 'web', 'data', 'auction-settings.json');

    // إرجاع المسار الموجود
    if (fs.existsSync(pathFromWeb)) return pathFromWeb;
    if (fs.existsSync(pathFromRoot)) return pathFromRoot;
    if (fs.existsSync(path.dirname(pathFromWeb))) return pathFromWeb;
    if (fs.existsSync(path.dirname(pathFromRoot))) return pathFromRoot;

    return pathFromWeb; // الافتراضي
}

const SETTINGS_FILE = getSettingsFilePath();

// الخيارات الجاهزة الافتراضية
const ALL_DURATION_PRESETS: DurationPreset[] = [
    { id: '1_hour', label: '1 ساعة', description: '60 دقيقة', value: 60 },
    { id: '3_hours', label: '3 ساعات', description: '180 دقيقة', value: 180 },
    { id: '6_hours', label: '6 ساعات', description: '360 دقيقة', value: 360 },
    { id: '12_hours', label: '12 ساعة', description: 'نصف يوم', value: 720 },
    { id: '1_day', label: '1 يوم', description: '24 ساعة', value: 1440 },
    { id: '3_days', label: '3 أيام', description: '72 ساعة', value: 4320 },
    { id: '7_days', label: '7 أيام', description: 'أسبوع', value: 10080 },
    { id: '14_days', label: '14 يوم', description: 'أسبوعان', value: 20160 },
    { id: '30_days', label: '30 يوم', description: 'شهر', value: 43200 },
];

// خيارات وقت البداية الافتراضية
const DEFAULT_START_TIME_OPTIONS: StartTimeOption[] = [
    { id: 'now', label: 'مزاد مباشر', description: 'يبدأ المزاد فوراً', value: 'now', enabled: true, order: 1 },
    { id: 'after_30_seconds', label: 'بعد 30 ثانية', description: 'يبدأ المزاد بعد 30 ثانية من النشر', value: 'after_30_seconds', enabled: true, order: 2 },
    { id: 'after_1_hour', label: 'بعد ساعة', description: 'يبدأ المزاد بعد ساعة واحدة', value: 'after_1_hour', enabled: true, order: 3 },
    { id: 'after_24_hours', label: 'بعد 24 ساعة', description: 'يبدأ المزاد بعد يوم كامل', value: 'after_24_hours', enabled: true, order: 4 },
    { id: 'after_3_days', label: 'بعد 3 أيام', description: 'يبدأ المزاد بعد 3 أيام', value: 'after_3_days', enabled: false, order: 5 },
    { id: 'after_7_days', label: 'بعد أسبوع', description: 'يبدأ المزاد بعد أسبوع كامل', value: 'after_7_days', enabled: false, order: 6 },
    { id: 'custom', label: 'مخصص', description: 'حدد وقت بداية المزاد بنفسك', value: 'custom', enabled: true, order: 99 },
];

// القيم الافتراضية
const DEFAULT_SETTINGS = {
    minDurationMinutes: 60,        // ساعة واحدة
    maxDurationMinutes: 43200,     // 30 يوم
    defaultDurationMinutes: 10080, // 7 أيام
    minStartingPrice: 1000,        // الحد الأدنى لسعر البداية
    minBidIncrement: 500,          // الحد الأدنى لزيادة المزايدة
    autoExtendTime: 5,             // دقائق التمديد التلقائي
    maxImagesPerAuction: 10,       // أقصى عدد صور
    // خيارات وقت البداية
    startTimeOptions: DEFAULT_START_TIME_OPTIONS,
    defaultStartTimeOption: 'now',
    allowCustomStartTime: true,
};

// قراءة الإعدادات من الملف
function loadSettings() {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const fileContent = fs.readFileSync(SETTINGS_FILE, 'utf-8');
            const savedSettings = JSON.parse(fileContent);

            // استخراج إعدادات المدة من durationConfig إذا وجدت
            let minDurationMinutes = DEFAULT_SETTINGS.minDurationMinutes;
            let maxDurationMinutes = DEFAULT_SETTINGS.maxDurationMinutes;
            let defaultDurationMinutes = DEFAULT_SETTINGS.defaultDurationMinutes;

            if (savedSettings.durationConfig) {
                minDurationMinutes = savedSettings.durationConfig.minDuration?.totalMinutes || minDurationMinutes;
                maxDurationMinutes = savedSettings.durationConfig.maxDuration?.totalMinutes || maxDurationMinutes;
                defaultDurationMinutes = savedSettings.durationConfig.defaultDuration?.totalMinutes || defaultDurationMinutes;
            }

            // استخراج خيارات وقت البداية
            const startTimeOptions = savedSettings.startTimeOptions || DEFAULT_START_TIME_OPTIONS;
            const defaultStartTimeOption = savedSettings.defaultStartTimeOption || DEFAULT_SETTINGS.defaultStartTimeOption;
            const allowCustomStartTime = savedSettings.allowCustomStartTime ?? DEFAULT_SETTINGS.allowCustomStartTime;

            return {
                minDurationMinutes,
                maxDurationMinutes,
                defaultDurationMinutes,
                minStartingPrice: savedSettings.minStartingPrice || savedSettings.minimumStartingPrice || DEFAULT_SETTINGS.minStartingPrice,
                minBidIncrement: savedSettings.minBidIncrement || savedSettings.minimumBidIncrement || DEFAULT_SETTINGS.minBidIncrement,
                autoExtendTime: savedSettings.autoExtendTime || DEFAULT_SETTINGS.autoExtendTime,
                maxImagesPerAuction: savedSettings.maxImagesPerAuction || DEFAULT_SETTINGS.maxImagesPerAuction,
                startTimeOptions,
                defaultStartTimeOption,
                allowCustomStartTime,
            };
        }
    } catch (error) {
        console.error('خطأ في قراءة إعدادات المزادات:', error);
    }

    return DEFAULT_SETTINGS;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<AuctionSettingsResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        // قراءة الإعدادات المحفوظة من لوحة التحكم
        const settings = loadSettings();

        // تصفية الخيارات حسب الحدود المحددة من الإعدادات
        const allowedPresets = ALL_DURATION_PRESETS.filter(
            (preset) =>
                preset.value >= settings.minDurationMinutes &&
                preset.value <= settings.maxDurationMinutes
        );

        // تصفية خيارات وقت البداية المفعلة فقط وترتيبها
        const enabledStartTimeOptions = (settings.startTimeOptions || DEFAULT_START_TIME_OPTIONS)
            .filter((option: StartTimeOption) => option.enabled)
            .sort((a: StartTimeOption, b: StartTimeOption) => a.order - b.order);

        return res.status(200).json({
            success: true,
            data: {
                minDurationMinutes: settings.minDurationMinutes,
                maxDurationMinutes: settings.maxDurationMinutes,
                defaultDurationMinutes: settings.defaultDurationMinutes,
                minStartingPrice: settings.minStartingPrice,
                minBidIncrement: settings.minBidIncrement,
                autoExtendTime: settings.autoExtendTime,
                maxImagesPerAuction: settings.maxImagesPerAuction,
                allowedPresets,
                // خيارات وقت البداية المفعلة فقط
                startTimeOptions: enabledStartTimeOptions,
                defaultStartTimeOption: settings.defaultStartTimeOption,
                allowCustomStartTime: settings.allowCustomStartTime,
            },
        });
    } catch (error) {
        console.error('Error fetching auction settings:', error);
        return res.status(500).json({
            success: false,
            error: 'حدث خطأ في جلب الإعدادات',
        });
    }
}
