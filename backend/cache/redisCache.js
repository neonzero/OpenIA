class RedisCache {
  constructor(client) {
    this.client = client;
  }

  async get(key) {
    const value = await this.client.get(key);
    if (value === null || value === undefined) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch (err) {
      return value;
    }
  }

  async set(key, value, ttlSeconds) {
    const payload = typeof value === 'string' ? value : JSON.stringify(value);
    if (typeof this.client.set === 'function') {
      await this.client.set(key, payload, ttlSeconds);
    }
  }

  async invalidate(keys) {
    const list = Array.isArray(keys) ? keys : [keys];
    for (const key of list) {
      if (typeof this.client.del === 'function') {
        await this.client.del(key);
      }
    }
  }
}

module.exports = RedisCache;
