const { describe, it, expect, beforeEach } = require('./jest-lite');
const RiskEngine = require('../services/riskEngine');
const COSOService = require('../services/coso');
const EventBus = require('../mq/eventBus');

function createRepository() {
  const store = new Map();
  return {
    async getAllRisks() {
      return Array.from(store.values());
    },
    async getRiskById(id) {
      return store.get(id) || null;
    },
    async createRisk(risk) {
      store.set(risk.id, risk);
      return risk;
    },
    async updateRisk(risk) {
      store.set(risk.id, risk);
      return risk;
    },
  };
}

describe('RiskEngine', () => {
  let repository;
  let eventBus;
  let riskEngine;

  beforeEach(() => {
    repository = createRepository();
    eventBus = new EventBus();
    const coso = new COSOService();
    const coreIntegration = { syncRisk: async () => ({}) };
    riskEngine = new RiskEngine({ riskRepository: repository, eventBus, coreIntegration, coso });
  });

  it('calculates residual score when creating risks', async () => {
    const risk = await riskEngine.createRisk({
      title: 'Vendor Reliability',
      description: 'Assess third-party uptime risk',
      owner: 'Risk Manager',
      inherentImpact: 4,
      inherentLikelihood: 4,
      controls: [
        { name: 'Vendor assessment', owner: 'Procurement', status: 'effective' },
      ],
    });

    expect(risk.residualScore).toBe(15);
  });

  it('publishes an event when updating a risk', async () => {
    const risk = await riskEngine.createRisk({
      title: 'Cybersecurity',
      description: 'Threat of ransomware attack',
      owner: 'CISO',
    });

    await riskEngine.updateRisk(risk.id, { status: 'mitigated' });

    const updates = eventBus.published.filter((event) => event.event === 'risk_updated');
    expect(updates.length).toBeGreaterThan(0);
    expect(updates[0].payload.id).toBe(risk.id);
  });
});
