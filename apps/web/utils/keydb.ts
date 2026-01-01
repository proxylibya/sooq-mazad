// توحيد عميل KeyDB: إعادة استخدام الواجهة الموحّدة في lib/keydb
import keydbClient, { type KeyDBLike } from '../lib/keydb';

export type KeyDBClient = KeyDBLike;

const ready = true; // الواجهة المحلية fallback جاهزة دائماً، والبعيد سيرجع PONG عند توفره

export function getKeyDBClient(): KeyDBClient | null {
  return keydbClient as KeyDBClient;
}

export function isKeyDBReady(): boolean {
  return ready;
}
