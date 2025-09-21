const BaseRepository = require('./BaseRepository');

class ReportRepository extends BaseRepository {
  constructor({ pool, cache }) {
    super({ pool, cache, table: 'reports' });
  }

  async findAll(filters = {}) {
    const conditions = [];
    const values = [];
    if (filters.status) {
      values.push(filters.status);
      conditions.push(`status = $${values.length}`);
    }
    if (filters.owner) {
      values.push(filters.owner);
      conditions.push(`owner ILIKE $${values.length}`);
      values[values.length - 1] = `%${values[values.length - 1]}%`;
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT id, title, owner, status, issued_date, content, created_at, updated_at
      FROM reports
      ${whereClause}
      ORDER BY created_at DESC
    `;
    const { rows } = await this.pool.query(sql, values);
    return rows;
  }

  async findById(id) {
    const { rows } = await this.pool.query(
      'SELECT id, title, owner, status, issued_date, content, created_at, updated_at FROM reports WHERE id = $1',
      [id]
    );
    return rows[0] ?? null;
  }

  async markAsGenerated(id, content) {
    const sql = `
      UPDATE reports
      SET status = 'issued', issued_date = COALESCE(issued_date, CURRENT_DATE), content = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, title, owner, status, issued_date, content, created_at, updated_at
    `;
    const payload = typeof content === 'string' ? content : JSON.stringify(content);
    const { rows } = await this.pool.query(sql, [payload, id]);
    if (this.cache) {
      await this.cache.del(`${this.table}:all`);
      await this.cache.del(`${this.table}:${id}`);
    }
    return rows[0];
  }

  async createTemplate(report) {
    const sql = `
      INSERT INTO reports (title, owner, status, issued_date, content, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, title, owner, status, issued_date, content, created_at, updated_at
    `;
    const payload = typeof report.content === 'string' ? report.content : JSON.stringify(report.content ?? {});
    const params = [report.title, report.owner, report.status ?? 'draft', report.issuedDate ?? null, payload];
    const { rows } = await this.pool.query(sql, params);
    if (this.cache) {
      await this.cache.del(`${this.table}:all`);
    }
    return rows[0];
  }
}

module.exports = ReportRepository;
