class WorkingPaperRepository {
  constructor({ pool }) {
    this.pool = pool;
  }

  async list(filters = {}) {
    const conditions = [];
    const values = [];
    if (filters.auditId) {
      values.push(filters.auditId);
      conditions.push(`audit_id = $${values.length}`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT id, audit_id, name, owner, status, updated_at
      FROM working_papers
      ${whereClause}
      ORDER BY updated_at DESC
    `;
    const { rows } = await this.pool.query(sql, values);
    return rows;
  }

  async updateStatus(id, status) {
    const sql = `
      UPDATE working_papers
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, audit_id, name, owner, status, updated_at
    `;
    const { rows } = await this.pool.query(sql, [status, id]);
    return rows[0];
  }
}

module.exports = WorkingPaperRepository;
