const BaseRepository = require('./BaseRepository');

const toScale = (score) => String(Math.max(1, Math.min(5, Math.round(score / 5))));

const severityFromScore = (score) => {
  if (score >= 20) {
    return 'critical';
  }
  if (score >= 16) {
    return 'high';
  }
  if (score >= 9) {
    return 'medium';
  }
  return 'low';
};

class RiskRepository extends BaseRepository {
  constructor({ pool, cache }) {
    super({ pool, cache, table: 'risks' });
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
      SELECT id, code, title, category, owner, status, inherent_score, residual_score, risk_appetite,
             reported_on, created_at
      FROM risks
      ${whereClause}
      ORDER BY created_at DESC
    `;
    const { rows } = await this.pool.query(sql, values);
    return rows;
  }

  async createRisk(risk) {
    const now = new Date();
    const code = risk.code || `RISK-${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}-${Date.now()}`;
    const sql = `
      INSERT INTO risks (
        code, title, description, category, severity_level, likelihood, impact, status, owner,
        reported_on, mitigation_plan, inherent_score, residual_score, risk_appetite, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, NOW(), NOW()
      )
      RETURNING id, code, title, category, owner, status, inherent_score, residual_score, risk_appetite, reported_on, created_at
    `;

    const residual = risk.residualRisk ?? risk.inherentRisk;
    const params = [
      code,
      risk.title,
      risk.description ?? '',
      risk.category,
      severityFromScore(residual),
      toScale(risk.inherentRisk),
      toScale(residual),
      risk.status,
      risk.owner,
      risk.reportedOn ? new Date(risk.reportedOn) : now,
      '',
      risk.inherentRisk,
      residual,
      risk.appetite ?? null
    ];

    const { rows } = await this.pool.query(sql, params);
    if (this.cache) {
      await this.cache.del(`${this.table}:all`);
    }
    return rows[0];
  }

  async updateRisk(id, updates) {
    const { rows: existingRows } = await this.pool.query(
      'SELECT * FROM risks WHERE id = $1',
      [id]
    );
    const current = existingRows[0];
    if (!current) {
      throw new Error('Risk not found');
    }

    const inherent = updates.inherentRisk ?? Number(current.inherent_score ?? 0);
    const residual = updates.residualRisk ?? Number(current.residual_score ?? inherent);

    const payload = {
      title: updates.title ?? current.title,
      description: updates.description ?? current.description,
      category: updates.category ?? current.category,
      owner: updates.owner ?? current.owner,
      status: updates.status ?? current.status,
      reported_on: updates.reportedOn ? new Date(updates.reportedOn) : current.reported_on,
      mitigation_plan: updates.mitigationPlan ?? current.mitigation_plan ?? '',
      inherent_score: inherent,
      residual_score: residual,
      risk_appetite: updates.appetite ?? current.risk_appetite,
      likelihood: toScale(inherent),
      impact: toScale(residual),
      severity_level: severityFromScore(residual),
      updated_at: new Date()
    };

    const assignments = [];
    const values = [];
    let index = 1;
    for (const [column, value] of Object.entries(payload)) {
      assignments.push(`${column} = $${index}`);
      values.push(value);
      index += 1;
    }
    values.push(id);

    const sql = `
      UPDATE risks
      SET ${assignments.join(', ')}
      WHERE id = $${index}
      RETURNING id, code, title, category, owner, status, inherent_score, residual_score, risk_appetite, reported_on, created_at
    `;

    const { rows } = await this.pool.query(sql, values);
    if (this.cache) {
      await this.cache.del(`${this.table}:all`);
      await this.cache.del(`${this.table}:${id}`);
    }
    return rows[0];
  }
}

module.exports = RiskRepository;
