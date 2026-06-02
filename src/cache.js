export function createCache(ttlMs) {
  const store = new Map();

  return {
    get(key) {
      const entry = store.get(key);
      if (!entry) return null;
      if (Date.now() - entry.timestamp > ttlMs) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },
    set(key, value) {
      store.set(key, { value, timestamp: Date.now() });
    },
  };
}
