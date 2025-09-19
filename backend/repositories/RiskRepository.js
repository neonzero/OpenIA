const BaseRepository = require('./BaseRepository');

class RiskRepository extends BaseRepository {
  constructor({ pool, cache }) {
    super({ pool, cache, table: 'risks' });
  }

  async findByCategory(category) {
    const cacheKey = `risks:category:${category}`;
    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const { rows } = await this.pool.query('SELECT * FROM risks WHERE category = $1', [category]);
    if (this.cache) {
      await this.cache.set(cacheKey, JSON.stringify(rows), 'EX', 60);
    }
    return rows;
  }
}

module.exports = RiskRepository;
