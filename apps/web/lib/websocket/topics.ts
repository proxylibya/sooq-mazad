/**
 * نظام Topics للـ WebSocket
 * يوفر دوال مساعدة لإنشاء واستخدام Topics
 */

/**
 * أنواع Topics المتاحة
 */
export const TopicTypes = {
  // المزادات
  AUCTION: 'auction', // مزاد محدد: auction:123
  AUCTIONS_LIST: 'auctions', // قائمة جميع المزادات

  // السيارات
  CAR: 'car', // سيارة محددة: car:456
  CARS_LIST: 'cars', // قائمة جميع السيارات

  // المعارض
  SHOWROOM: 'showroom', // معرض محدد: showroom:789
  SHOWROOMS_LIST: 'showrooms', // قائمة المعارض

  // المستخدمين
  USER: 'user', // مستخدم محدد: user:abc

  // الإشعارات
  NOTIFICATIONS: 'notifications', // إشعارات المستخدم

  // عام
  GLOBAL: 'global', // تحديثات عامة
} as const;

/**
 * بناء Topic للمزاد
 */
export function getAuctionTopic(auctionId: string): string {
  return `${TopicTypes.AUCTION}:${auctionId}`;
}

/**
 * بناء Topic للسيارة
 */
export function getCarTopic(carId: string): string {
  return `${TopicTypes.CAR}:${carId}`;
}

/**
 * بناء Topic للمعرض
 */
export function getShowroomTopic(showroomId: string): string {
  return `${TopicTypes.SHOWROOM}:${showroomId}`;
}

/**
 * بناء Topic للمستخدم
 */
export function getUserTopic(userId: string): string {
  return `${TopicTypes.USER}:${userId}`;
}

/**
 * بناء Topic للإشعارات
 */
export function getUserNotificationsTopic(userId: string): string {
  return `${TopicTypes.NOTIFICATIONS}:${userId}`;
}

/**
 * استخراج ID من Topic
 */
export function extractIdFromTopic(topic: string): string | null {
  const parts = topic.split(':');
  return parts.length === 2 ? parts[1] : null;
}

/**
 * استخراج نوع Topic
 */
export function getTopicType(topic: string): string {
  const parts = topic.split(':');
  return parts[0];
}

/**
 * التحقق من صحة Topic
 */
export function isValidTopic(topic: string): boolean {
  if (!topic || typeof topic !== 'string') return false;

  const parts = topic.split(':');
  if (parts.length === 0) return false;

  const type = parts[0];
  const validTypes = Object.values(TopicTypes);

  return validTypes.includes(type as any);
}

/**
 * Topics متعددة لنفس الكيان
 */
export function getAuctionTopics(auctionId: string, carId?: string): string[] {
  const topics = [getAuctionTopic(auctionId), TopicTypes.AUCTIONS_LIST];

  if (carId) {
    topics.push(getCarTopic(carId));
  }

  return topics;
}

/**
 * Topics للمستخدم
 */
export function getUserTopics(userId: string): string[] {
  return [getUserTopic(userId), getUserNotificationsTopic(userId)];
}

/**
 * تصفية Topics حسب النوع
 */
export function filterTopicsByType(topics: string[], type: string): string[] {
  return topics.filter((topic) => getTopicType(topic) === type);
}

/**
 * دمج Topics فريدة
 */
export function mergeTopics(...topicArrays: string[][]): string[] {
  const allTopics = topicArrays.flat();
  return [...new Set(allTopics)];
}

export default {
  TopicTypes,
  getAuctionTopic,
  getCarTopic,
  getShowroomTopic,
  getUserTopic,
  getUserNotificationsTopic,
  extractIdFromTopic,
  getTopicType,
  isValidTopic,
  getAuctionTopics,
  getUserTopics,
  filterTopicsByType,
  mergeTopics,
};
