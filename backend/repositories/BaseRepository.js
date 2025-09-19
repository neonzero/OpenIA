class BaseRepository {
  constructor({ pool, cache, table }) {
    if (!pool) {
      throw new Error('Pool is required');
    }
    this.pool = pool;
    this.cache = cache;
    this.table = table;
  }

  async findAll(cacheKey = `${this.table}:all`) {
    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const { rows } = await this.pool.query(`SELECT * FROM ${this.table}`);
    if (this.cache) {
      await this.cache.set(cacheKey, JSON.stringify(rows), 'EX', 60);
    }
    return rows;
  }

  async findById(id) {
    const cacheKey = `${this.table}:${id}`;
    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const { rows } = await this.pool.query(`SELECT * FROM ${this.table} WHERE id = $1`, [id]);
    const entity = rows[0] || null;
    if (entity && this.cache) {
      await this.cache.set(cacheKey, JSON.stringify(entity), 'EX', 60);
    }
    return entity;
  }

  async create(data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map((_, idx) => `$${idx + 1}`).join(', ');
    const sql = `INSERT INTO ${this.table} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const { rows } = await this.pool.query(sql, values);
    if (this.cache) {
      await this.cache.del(`${this.table}:all`);
    }
    return rows[0];
  }

  async update(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const assignments = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const sql = `UPDATE ${this.table} SET ${assignments} WHERE id = $${fields.length + 1} RETURNING *`;
    const { rows } = await this.pool.query(sql, [...values, id]);
    if (this.cache) {
      await this.cache.del(`${this.table}:all`);
      await this.cache.del(`${this.table}:${id}`);
    }
    return rows[0];
  }
}

module.exports = BaseRepository;
