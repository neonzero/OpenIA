const { createRisk, RiskSchema } = require('../domain/risk');
const eventBus = require('../mq/eventBus');

class RiskEngine {
  constructor({ riskRepository }) {
    this.riskRepository = riskRepository;
  }

  async listRisks() {
    return this.riskRepository.findAll();
  }

  async createRisk(input) {
    const risk = createRisk(input);
    const stored = await this.riskRepository.create(risk);
    eventBus.publish('risk_created', stored);
    return stored;
  }

  async updateRisk(id, input) {
    const risk = RiskSchema.partial().parse(input);
    const updated = await this.riskRepository.update(id, risk);
    eventBus.publish('risk_updated', updated);
    return updated;
  }
}

module.exports = RiskEngine;
