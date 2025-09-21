class RiskRepository {
  constructor(dbClient, cache) {
    this.dbClient = dbClient;
    this.cache = cache;
  }

  async getAllRisks() {
    const cacheKey = 'risks:all';
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const result = await this.dbClient.query('SELECT * FROM risks ORDER BY created_at DESC');
    await this.cache.set(cacheKey, result.rows);
    return result.rows;
  }

  async getRiskById(id) {
    const cacheKey = `risk:${id}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const result = await this.dbClient.query('SELECT * FROM risks WHERE id = $1', [id]);
    const risk = result.rows[0] || null;
    if (risk) {
      await this.cache.set(cacheKey, risk);
    }
    return risk;
  }

  async createRisk(risk) {
    await this.dbClient.query('INSERT INTO risks(id, data) VALUES($1, $2)', [risk.id, risk]);
    await this.cache.invalidate(['risks:all']);
    await this.cache.set(`risk:${risk.id}`, risk);
    return risk;
  }

  async updateRisk(risk) {
    await this.dbClient.query('UPDATE risks SET data = $1 WHERE id = $2', [risk, risk.id]);
    await this.cache.invalidate(['risks:all']);
    await this.cache.set(`risk:${risk.id}`, risk);
    return risk;
  }
}

module.exports = RiskRepository;
