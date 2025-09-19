class InMemoryRedisClient {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    if (!this.store.has(key)) {
      return null;
    }
    const entry = this.store.get(key);
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key, value, ttlSeconds) {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(key) {
    this.store.delete(key);
    return 1;
  }

  async flushAll() {
    this.store.clear();
  }
}

module.exports = InMemoryRedisClient;
