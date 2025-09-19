const { randomUUID } = require('crypto');
const { RiskSchema } = require('../domain/risk');

class RiskEngine {
  constructor({ riskRepository, eventBus, coreIntegration, coso }) {
    this.riskRepository = riskRepository;
    this.eventBus = eventBus;
    this.coreIntegration = coreIntegration;
    this.coso = coso;
  }

  async listRisks() {
    return this.riskRepository.getAllRisks();
  }

  async createRisk(payload) {
    const parsed = RiskSchema.parse(payload);
    const timestamp = new Date().toISOString();
    const risk = {
      ...parsed,
      id: parsed.id || randomUUID(),
      createdAt: parsed.createdAt || timestamp,
      updatedAt: parsed.updatedAt || timestamp,
    };
    risk.residualScore = this.coso.calculateResidualScore(risk);
    await this.riskRepository.createRisk(risk);
    await this.coreIntegration.syncRisk(risk);
    this.eventBus.publish('risk_created', { id: risk.id, residualScore: risk.residualScore });
    return risk;
  }

  async updateRisk(id, updates) {
    const existing = await this.riskRepository.getRiskById(id);
    if (!existing) {
      throw new Error('Risk not found');
    }
    const merged = { ...existing, ...updates, id, updatedAt: new Date().toISOString() };
    const parsed = RiskSchema.parse(merged);
    parsed.residualScore = this.coso.calculateResidualScore(parsed);
    await this.riskRepository.updateRisk(parsed);
    await this.coreIntegration.syncRisk(parsed);
    this.eventBus.publish('risk_updated', { id: parsed.id, residualScore: parsed.residualScore });
    return parsed;
  }
}

module.exports = RiskEngine;
