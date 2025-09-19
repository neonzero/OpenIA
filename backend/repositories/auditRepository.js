class AuditRepository {
  constructor(dbClient, cache) {
    this.dbClient = dbClient;
    this.cache = cache;
  }

  async getAllAudits() {
    const cacheKey = 'audits:all';
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const result = await this.dbClient.query('SELECT * FROM audits ORDER BY created_at DESC');
    await this.cache.set(cacheKey, result.rows);
    return result.rows;
  }

  async getAuditById(id) {
    const cacheKey = `audit:${id}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const result = await this.dbClient.query('SELECT * FROM audits WHERE id = $1', [id]);
    const audit = result.rows[0] || null;
    if (audit) {
      await this.cache.set(cacheKey, audit);
    }
    return audit;
  }

  async createAudit(audit) {
    await this.dbClient.query('INSERT INTO audits(id, data) VALUES($1, $2)', [audit.id, audit]);
    await this.cache.invalidate(['audits:all']);
    await this.cache.set(`audit:${audit.id}`, audit);
    return audit;
  }

  async updateAudit(audit) {
    await this.dbClient.query('UPDATE audits SET data = $1 WHERE id = $2', [audit, audit.id]);
    await this.cache.invalidate(['audits:all']);
    await this.cache.set(`audit:${audit.id}`, audit);
    return audit;
  }
}

module.exports = AuditRepository;
