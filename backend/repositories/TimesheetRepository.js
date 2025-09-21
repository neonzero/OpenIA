class TimesheetRepository {
  constructor({ pool }) {
    this.pool = pool;
  }

  async list(filters = {}) {
    const conditions = [];
    const values = [];
    if (filters.auditor) {
      values.push(filters.auditor);
      conditions.push(`auditor_name = $${values.length}`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT id, auditor_name, entry_date, hours_worked, engagement
      FROM timesheets
      ${whereClause}
      ORDER BY entry_date DESC
    `;
    const { rows } = await this.pool.query(sql, values);
    return rows;
  }

  async create(entry) {
    const sql = `
      INSERT INTO timesheets (user_id, project_code, entry_date, hours_worked, description, billable, auditor_name, engagement)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, auditor_name, entry_date, hours_worked, engagement
    `;
    const params = [
      '00000000-0000-0000-0000-000000000000',
      entry.engagement,
      entry.date,
      entry.hours,
      entry.description ?? '',
      false,
      entry.auditor,
      entry.engagement
    ];
    const { rows } = await this.pool.query(sql, params);
    return rows[0];
  }
}

module.exports = TimesheetRepository;
