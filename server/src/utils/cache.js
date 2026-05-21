/**
 * In-memory TTL cache. Used to dedupe expensive GitHub + LLM calls within
 * a single Node process. Intentionally a tiny no-deps cache — not Redis —
 * because this app is single-instance for now.
 */
const DEFAULT_TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 200;

const store = new Map();

const evictIfFull = () => {
  if (store.size <= MAX_ENTRIES) return;
  const firstKey = store.keys().next().value;
  if (firstKey !== undefined) store.delete(firstKey);
};

export const cacheGet = (key) => {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.value;
};

export const cacheSet = (key, value, ttlMs = DEFAULT_TTL_MS) => {
  evictIfFull();
  store.set(key, { value, expires: Date.now() + ttlMs });
};

export const withCache = async (key, ttlMs, producer) => {
  const cached = cacheGet(key);
  if (cached !== null) return cached;
  const value = await producer();
  cacheSet(key, value, ttlMs);
  return value;
};
