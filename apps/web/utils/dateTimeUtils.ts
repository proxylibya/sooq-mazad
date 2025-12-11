/**
 * ===================================================================
 * 🕐 نظام تنسيق الوقت والتاريخ الموحد - Date Time Utilities
 * ===================================================================
 * 
 * ملف مساعد يوفر دوال موحدة لتنسيق الوقت والتاريخ بشكل نظيف
 * مصمم خصيصاً للدردشة ونظام الرسائل
 * 
 * الخصائص:
 * - دعم اللغة العربية
 * - صيغة 12 ساعة مع ص/م
 * - فواصل التاريخ (اليوم، أمس، التاريخ الكامل)
 * - دعم المنطقة الزمنية المحلية
 */

// =========================================
// الوقت الدقيق للرسائل
// =========================================

/**
 * تنسيق الوقت بصيغة 12 ساعة (مثال: 12:30 م)
 */
export const formatMessageTime = (dateInput: string | Date): string => {
    try {
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
        if (isNaN(date.getTime())) return '';

        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? 'م' : 'ص';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');

        return `${displayHours}:${displayMinutes} ${period}`;
    } catch {
        return '';
    }
};

// =========================================
// تنسيق التاريخ
// =========================================

/**
 * التحقق من كون التاريخين في نفس اليوم
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

/**
 * التحقق من كون التاريخ هو اليوم
 */
export const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date());
};

/**
 * التحقق من كون التاريخ هو الأمس
 */
export const isYesterday = (date: Date): boolean => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(date, yesterday);
};

/**
 * تنسيق التاريخ الكامل (مثال: 15/12/2024)
 */
export const formatFullDate = (dateInput: string | Date): string => {
    try {
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
        if (isNaN(date.getTime())) return '';

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    } catch {
        return '';
    }
};

/**
 * تنسيق التاريخ النسبي للمحادثات (اليوم، أمس، أو التاريخ)
 */
export const formatRelativeDate = (dateInput: string | Date): string => {
    try {
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
        if (isNaN(date.getTime())) return '';

        if (isToday(date)) return 'اليوم';
        if (isYesterday(date)) return 'أمس';
        return formatFullDate(date);
    } catch {
        return '';
    }
};

// =========================================
// تنسيق الوقت والتاريخ معاً
// =========================================

/**
 * تنسيق الوقت الذكي للرسائل (يظهر الوقت فقط لليوم، أو التاريخ + الوقت للأقدم)
 */
export const formatSmartTime = (dateInput: string | Date): string => {
    try {
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
        if (isNaN(date.getTime())) return '';

        const time = formatMessageTime(date);

        if (isToday(date)) {
            return time;
        }

        if (isYesterday(date)) {
            return `أمس ${time}`;
        }

        return `${formatFullDate(date)} ${time}`;
    } catch {
        return '';
    }
};

/**
 * تنسيق الوقت لقائمة المحادثات (مختصر وذكي)
 */
export const formatConversationTime = (dateInput: string | Date): string => {
    try {
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
        if (isNaN(date.getTime())) return '';

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        // أقل من دقيقة
        if (diffMinutes < 1) return 'الآن';

        // أقل من ساعة - نظهر الدقائق
        if (diffMinutes < 60) return `منذ ${diffMinutes} د`;

        // اليوم - نظهر الوقت
        if (isToday(date)) return formatMessageTime(date);

        // الأمس
        if (isYesterday(date)) return 'أمس';

        // أقل من أسبوع - نظهر اسم اليوم
        if (diffHours < 24 * 7) {
            const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
            return days[date.getDay()];
        }

        // أقدم من أسبوع - نظهر التاريخ المختصر
        const day = date.getDate();
        const month = date.getMonth() + 1;
        return `${day}/${month}`;
    } catch {
        return '';
    }
};

// =========================================
// فواصل التاريخ بين الرسائل
// =========================================

/**
 * الحصول على نص فاصل التاريخ بين مجموعات الرسائل
 */
export const getDateSeparatorLabel = (dateInput: string | Date): string => {
    try {
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
        if (isNaN(date.getTime())) return '';

        if (isToday(date)) return 'اليوم';
        if (isYesterday(date)) return 'أمس';

        // باقي الأيام - نظهر اليوم + التاريخ
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const dayName = days[date.getDay()];
        const fullDate = formatFullDate(date);

        return `${dayName}، ${fullDate}`;
    } catch {
        return '';
    }
};

/**
 * التحقق مما إذا كان يجب إظهار فاصل التاريخ بين رسالتين
 */
export const shouldShowDateSeparator = (
    currentDate: string | Date,
    previousDate: string | Date | null,
): boolean => {
    if (!previousDate) return true; // أول رسالة تحتاج فاصل

    try {
        const current = currentDate instanceof Date ? currentDate : new Date(currentDate);
        const previous = previousDate instanceof Date ? previousDate : new Date(previousDate);

        if (isNaN(current.getTime()) || isNaN(previous.getTime())) return false;

        return !isSameDay(current, previous);
    } catch {
        return false;
    }
};

// =========================================
// دوال مساعدة إضافية
// =========================================

/**
 * تنسيق الوقت المنقضي منذ تاريخ معين (للتوافق مع الكود القديم)
 */
export const formatRelativeTime = (dateInput: string | Date): string => {
    try {
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
        if (isNaN(date.getTime())) return '';

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return 'الآن';
        if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        if (diffDays < 7) return `منذ ${diffDays} يوم`;

        return formatFullDate(date);
    } catch {
        return '';
    }
};
