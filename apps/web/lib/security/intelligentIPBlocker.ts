// Intelligent IP Blocker
import logger from '../logger';
import keydbClient from '../keydb';

export const getBlocklist = async () => {
  try {
    const keys = await keydbClient.keys('blocked:ip:*');
    const blocklist = keys.map((key) => key.replace('blocked:ip:', ''));
    return { success: true, blocklist };
  } catch (error) {
    logger.error('Error getting blocklist', { error });
    return { success: false, blocklist: [] };
  }
};

export const addToBlocklist = async (ip: string, reason?: string) => {
  try {
    await keydbClient.set(`blocked:ip:${ip}`, JSON.stringify({ reason, timestamp: Date.now() }), 0);
    logger.info(`IP added to blocklist: ${ip}`, { ip, reason });
    return { success: true };
  } catch (error) {
    logger.error('Error adding to blocklist', { error });
    return { success: false };
  }
};

export const removeFromBlocklist = async (ip: string) => {
  try {
    await keydbClient.del(`blocked:ip:${ip}`);
    logger.info(`IP removed from blocklist: ${ip}`, { ip });
    return { success: true };
  } catch (error) {
    logger.error('Error removing from blocklist', { error });
    return { success: false };
  }
};

const intelligentIPBlocker = {
  getBlocklist,
  addToBlocklist,
  removeFromBlocklist,
};
export { intelligentIPBlocker };
export default intelligentIPBlocker;
