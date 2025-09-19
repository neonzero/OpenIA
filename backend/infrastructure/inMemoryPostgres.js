class InMemoryPostgresClient {
  constructor() {
    this.tables = {
      risks: new Map(),
      audits: new Map(),
    };
  }

  async query(sql, params = []) {
    const normalized = sql.trim().toLowerCase();

    if (normalized.startsWith('select') && normalized.includes('from risks')) {
      if (normalized.includes('where id')) {
        const id = params[0];
        const row = this.tables.risks.get(id);
        return { rows: row ? [row] : [] };
      }
      const rows = Array.from(this.tables.risks.values()).sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      return { rows };
    }

    if (normalized.startsWith('insert into risks')) {
      const [id, payload] = params;
      const record = {
        ...payload,
        id,
        createdAt: payload.createdAt || new Date().toISOString(),
        updatedAt: payload.updatedAt || payload.createdAt || new Date().toISOString(),
      };
      this.tables.risks.set(id, record);
      return { rows: [record] };
    }

    if (normalized.startsWith('update risks')) {
      const [payload, id] = params;
      if (!this.tables.risks.has(id)) {
        return { rows: [] };
      }
      const existing = this.tables.risks.get(id);
      const record = {
        ...existing,
        ...payload,
        id,
        updatedAt: payload.updatedAt || new Date().toISOString(),
      };
      this.tables.risks.set(id, record);
      return { rows: [record] };
    }

    if (normalized.startsWith('select') && normalized.includes('from audits')) {
      if (normalized.includes('where id')) {
        const id = params[0];
        const row = this.tables.audits.get(id);
        return { rows: row ? [row] : [] };
      }
      const rows = Array.from(this.tables.audits.values()).sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      return { rows };
    }

    if (normalized.startsWith('insert into audits')) {
      const [id, payload] = params;
      const record = {
        ...payload,
        id,
        createdAt: payload.createdAt || new Date().toISOString(),
        updatedAt: payload.updatedAt || payload.createdAt || new Date().toISOString(),
      };
      this.tables.audits.set(id, record);
      return { rows: [record] };
    }

    if (normalized.startsWith('update audits')) {
      const [payload, id] = params;
      if (!this.tables.audits.has(id)) {
        return { rows: [] };
      }
      const existing = this.tables.audits.get(id);
      const record = {
        ...existing,
        ...payload,
        id,
        updatedAt: payload.updatedAt || new Date().toISOString(),
      };
      this.tables.audits.set(id, record);
      return { rows: [record] };
    }

    throw new Error(`Unsupported query: ${sql}`);
  }
}

module.exports = InMemoryPostgresClient;
