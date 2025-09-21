const { createRisk, createRiskFromQuestionnaire, RiskFiltersSchema, updateRisk } = require('../domain/risk');
const { FollowUpFilterSchema } = require('../domain/followUp');
const eventBus = require('../mq/eventBus');

const HIGH_THRESHOLD = 16;
const MEDIUM_THRESHOLD = 9;

const toMonthKey = (value) => {
  const date = value ? new Date(value) : new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const classifyScore = (score) => {
  if (score >= HIGH_THRESHOLD) {
    return 'highRisks';
  }
  if (score >= MEDIUM_THRESHOLD) {
    return 'mediumRisks';
  }
  return 'lowRisks';
};

const toRiskModel = (record) => ({
  id: record.id ? record.id.toString() : record.code,
  title: record.title,
  category: record.category,
  inherentRisk: Number(record.inherent_score ?? record.inherentRisk ?? 0),
  residualRisk: Number(record.residual_score ?? record.residualRisk ?? 0),
  owner: record.owner,
  status: record.status
});

const toFollowUpModel = (record) => ({
  id: record.id.toString(),
  riskId: record.risk_id ? record.risk_id.toString() : record.riskId,
  action: record.action,
  owner: record.owner,
  dueDate: record.due_date instanceof Date ? record.due_date.toISOString().slice(0, 10) : record.due_date,
  status: record.status
});

class RiskEngine {
  constructor({ riskRepository, followUpRepository }) {
    this.riskRepository = riskRepository;
    this.followUpRepository = followUpRepository;
  }

  async listRisks(filters = {}) {
    const parsedFilters = RiskFiltersSchema.parse(filters);
    const results = await this.riskRepository.findAll(parsedFilters);
    return results.map(toRiskModel);
  }

  async createRisk(input) {
    const risk = createRisk(input);
    const stored = await this.riskRepository.createRisk(risk);
    const model = toRiskModel(stored);
    eventBus.publish('risk_created', model);
    return model;
  }

  async updateRisk(id, input) {
    const payload = updateRisk(input);
    const updated = await this.riskRepository.updateRisk(id, payload);
    const model = toRiskModel(updated);
    eventBus.publish('risk_updated', model);
    return model;
  }

  async submitQuestionnaire(id, payload) {
    const riskPayload = createRiskFromQuestionnaire(payload);
    if (id && id !== 'new') {
      return this.updateRisk(id, riskPayload);
    }
    const created = await this.createRisk(riskPayload);
    eventBus.publish('risk_questionnaire_submitted', { riskId: created.id });
    return created;
  }

  async getSummary() {
    const risks = await this.riskRepository.findAll();
    const counters = {
      totalRisks: risks.length,
      highRisks: 0,
      mediumRisks: 0,
      lowRisks: 0
    };

    const monthBuckets = new Map();
    for (const record of risks) {
      const residual = Number(record.residual_score ?? record.residualRisk ?? 0);
      const bucket = classifyScore(residual);
      counters[bucket] += 1;
      const monthKey = toMonthKey(record.reported_on ?? record.created_at);
      if (!monthBuckets.has(monthKey)) {
        monthBuckets.set(monthKey, { month: monthKey, high: 0, medium: 0, low: 0 });
      }
      const entry = monthBuckets.get(monthKey);
      if (bucket === 'highRisks') {
        entry.high += 1;
      } else if (bucket === 'mediumRisks') {
        entry.medium += 1;
      } else {
        entry.low += 1;
      }
    }

    const trend = [];
    const now = new Date();
    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1));
      const monthKey = toMonthKey(date);
      const monthData = monthBuckets.get(monthKey) ?? { month: monthKey, high: 0, medium: 0, low: 0 };
      trend.push(monthData);
    }

    return {
      ...counters,
      trend
    };
  }

  async listFollowUps(filters = {}) {
    const parsed = FollowUpFilterSchema.parse(filters);
    const rows = await this.followUpRepository.list(parsed);
    return rows.map(toFollowUpModel);
  }
}

module.exports = RiskEngine;
