const BaseRepository = require('./BaseRepository');

class AuditRepository extends BaseRepository {
  constructor({ pool, cache }) {
    super({ pool, cache, table: 'audits' });
  }

  async findPlannedAudits() {
    const cacheKey = 'audits:planned';
    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const { rows } = await this.pool.query('SELECT * FROM audits WHERE status = $1', ['planned']);
    if (this.cache) {
      await this.cache.set(cacheKey, JSON.stringify(rows), 'EX', 60);
    }
    return rows;
  }
}

module.exports = AuditRepository;
