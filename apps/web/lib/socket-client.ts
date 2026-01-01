/**
 * ⚠️ DEPRECATED - تم استبدال هذا الملف بالنظام الموحد الجديد
 * 
 * الرجاء استخدام: @/lib/realtime
 * 
 * @deprecated Use @/lib/realtime instead
 */

import { realtime } from '@/lib/realtime';

// تصدير دوال التوافق القديمة
export const socketClient = {
  initialize: () => console.warn('[DEPRECATED] Use realtime.connect() from @/lib/realtime'),
  disconnect: () => realtime.disconnect(),
  getSocket: () => null,
  isConnected: () => realtime.isConnected(),
  joinAuction: (id: string) => realtime.joinAuction(id),
  leaveAuction: (id: string) => realtime.leaveAuction(id),
  placeBid: (auctionId: string, amount: number) => realtime.placeBid(auctionId, amount),
  joinConversation: (id: string) => realtime.joinConversation(id),
  leaveConversation: (id: string) => realtime.leaveConversation(id),
  on: (event: string, callback: Function) => realtime.on(event, callback as any),
  off: (event: string, callback?: Function) => realtime.off(event, callback as any),
  subscribeToNotifications: () => console.warn('[DEPRECATED] Notifications are automatic now'),
  sendMessage: () => console.warn('[DEPRECATED] Use realtime.sendMessage() from @/lib/realtime'),
};

export const initializeSocket = () => {
  console.warn('[DEPRECATED] Use realtime.connect() from @/lib/realtime');
  return null;
};

export const getSocket = () => null;

export const joinAuctionRoom = (auctionId: string | number) => {
  realtime.joinAuction(String(auctionId));
};

export const leaveAuctionRoom = (auctionId: string | number) => {
  realtime.leaveAuction(String(auctionId));
};

export const placeBid = (auctionId: string | number, amount: number) => {
  return realtime.placeBid(String(auctionId), amount);
};

export const subscribeToNotifications = () => {
  console.warn('[DEPRECATED] Notifications are automatic in the new system');
};

export default socketClient;