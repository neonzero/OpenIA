class FollowUpRepository {
  constructor({ pool }) {
    this.pool = pool;
  }

  async list(filters = {}) {
    const conditions = [];
    const values = [];
    if (filters.riskId) {
      values.push(filters.riskId);
      conditions.push(`risk_id = $${values.length}`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT id, risk_id, action, owner, due_date, status
      FROM risk_follow_ups
      ${whereClause}
      ORDER BY due_date ASC
    `;
    const { rows } = await this.pool.query(sql, values);
    return rows;
  }
}

module.exports = FollowUpRepository;
