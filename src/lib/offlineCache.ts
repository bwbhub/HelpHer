import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache de lecture (mirror JSON des dernières données de cycle chargées) + file
// d'attente des logs de règles faits hors-ligne. Volontairement minimal : pas de
// moteur de sync générique, juste ce dont l'app a besoin pour marcher offline.

const CACHE_PREFIX = 'cache:appdata:';
const QUEUE_PREFIX = 'queue:periodlogs:';

export async function loadCache<T>(userId: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + userId);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function saveCache(userId: string, data: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + userId, JSON.stringify(data));
  } catch {
    // cache best-effort
  }
}

export async function clearCache(userId: string): Promise<void> {
  try {
    await AsyncStorage.multiRemove([CACHE_PREFIX + userId, QUEUE_PREFIX + userId]);
  } catch {
    // ignore
  }
}

export async function getQueuedPeriodLogs(userId: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_PREFIX + userId);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function queuePeriodLog(userId: string, startDate: string): Promise<void> {
  const queue = await getQueuedPeriodLogs(userId);
  if (queue.includes(startDate)) return;
  queue.push(startDate);
  try {
    await AsyncStorage.setItem(QUEUE_PREFIX + userId, JSON.stringify(queue));
  } catch {
    // ignore
  }
}

export async function clearQueuedPeriodLogs(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(QUEUE_PREFIX + userId);
  } catch {
    // ignore
  }
}
