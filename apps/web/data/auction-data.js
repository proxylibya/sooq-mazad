// ملف البيانات الوهمية للمزادات - تم حذف جميع البيانات الوهمية
// النظام يعتمد الآن على قاعدة البيانات فقط

// تم حذف جميع البيانات الوهمية - النظام يستخدم API فقط
console.warn('⚠️ ملف auction-data.js: تم حذف البيانات الوهمية - استخدم API بدلاً من ذلك');

// دالة مساعدة لتحديد نوع المزاد بناءً على التوقيت
export const getAuctionType = (auction) => {
  if (!auction || !auction.auctionStartTime || !auction.auctionEndTime) {
    return 'live';
  }

  const now = new Date();
  const startTime = new Date(auction.auctionStartTime);
  const endTime = new Date(auction.auctionEndTime);

  if (now < startTime) return 'upcoming';
  if (now > endTime) return 'ended';
  return 'live';
};

// تصدير فارغ للتوافق مع الكود الحالي
export const sampleAuctions = [];

export default {
  getAuctionType,
  sampleAuctions,
};
