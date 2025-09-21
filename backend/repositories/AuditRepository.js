const BaseRepository = require('./BaseRepository');

class AuditRepository extends BaseRepository {
  constructor({ pool, cache }) {
    super({ pool, cache, table: 'audits' });
  }

  async findAll(filters = {}) {
    const conditions = [];
    const values = [];
    if (filters.status) {
      values.push(filters.status);
      conditions.push(`status = $${values.length}`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT id, code, title, owner, start_date, end_date, status, scope
      FROM audits
      ${whereClause}
      ORDER BY start_date NULLS LAST, created_at DESC
    `;
    const { rows } = await this.pool.query(sql, values);
    return rows;
  }

  async createPlan(plan) {
    const now = new Date();
    const code = plan.code || `AUD-${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}-${Date.now()}`;
    const sql = `
      INSERT INTO audits (code, title, description, owner, start_date, end_date, status, scope, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id, code, title, owner, start_date, end_date, status, scope
    `;
    const params = [
      code,
      plan.title,
      plan.description ?? '',
      plan.owner,
      plan.startDate,
      plan.endDate,
      plan.status,
      plan.scope ?? null
    ];
    const { rows } = await this.pool.query(sql, params);
    if (this.cache) {
      await this.cache.del(`${this.table}:all`);
    }
    return rows[0];
  }

  async updatePlan(id, updates) {
    const fields = [];
    const values = [];
    let index = 1;
    const mapping = {
      title: updates.title,
      owner: updates.owner,
      start_date: updates.startDate,
      end_date: updates.endDate,
      status: updates.status,
      scope: updates.scope,
      description: updates.description,
      updated_at: new Date()
    };

    for (const [column, value] of Object.entries(mapping)) {
      if (value === undefined) {
        continue;
      }
      fields.push(`${column} = $${index}`);
      values.push(value);
      index += 1;
    }

    if (!fields.length) {
      const { rows } = await this.pool.query(
        'SELECT id, code, title, owner, start_date, end_date, status, scope FROM audits WHERE id = $1',
        [id]
      );
      return rows[0];
    }

    values.push(id);
    const sql = `
      UPDATE audits
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING id, code, title, owner, start_date, end_date, status, scope
    `;
    const { rows } = await this.pool.query(sql, values);
    if (this.cache) {
      await this.cache.del(`${this.table}:all`);
      await this.cache.del(`${this.table}:${id}`);
    }
    return rows[0];
  }

  async findByTitle(title) {
    const { rows } = await this.pool.query(
      'SELECT id, code, title, owner, start_date, end_date, status, scope FROM audits WHERE title = $1 LIMIT 1',
      [title]
    );
    return rows[0] ?? null;
  }
}

module.exports = AuditRepository;
