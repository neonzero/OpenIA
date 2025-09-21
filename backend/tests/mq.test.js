const { describe, it, expect, beforeEach } = require('./jest-lite');
const AuditEngine = require('../services/auditEngine');
const EventBus = require('../mq/eventBus');
const IIAService = require('../services/iia');

function createAuditRepository() {
  const store = new Map();
  return {
    async getAllAudits() {
      return Array.from(store.values());
    },
    async getAuditById(id) {
      return store.get(id) || null;
    },
    async createAudit(audit) {
      store.set(audit.id, audit);
      return audit;
    },
    async updateAudit(audit) {
      store.set(audit.id, audit);
      return audit;
    },
  };
}

describe('Message queue publishing', () => {
  let eventBus;
  let auditEngine;

  beforeEach(() => {
    const riskId = '11111111-1111-1111-1111-111111111111';
    eventBus = new EventBus();
    const auditRepository = createAuditRepository();
    const riskEngine = { listRisks: async () => [{ id: riskId }, { id: '22222222-2222-2222-2222-222222222222' }] };
    const coreIntegration = { notifyAudit: async () => ({}) };
    auditEngine = new AuditEngine({
      auditRepository,
      riskEngine,
      eventBus,
      coreIntegration,
      iia: new IIAService(),
    });
    auditEngine.__testRiskId = riskId;
  });

  it('publishes audit_planned events', async () => {
    let receivedPayload = null;
    eventBus.subscribe('audit_planned', (payload) => {
      receivedPayload = payload;
    });

    const audit = await auditEngine.planAudit({
      title: 'Annual SOX Review',
      objective: 'Evaluate key controls',
      leadAuditor: 'Lead',
      riskIds: [auditEngine.__testRiskId],
    });

    expect(audit.coverage).toBeGreaterThan(0);
    const published = eventBus.published.filter((event) => event.event === 'audit_planned');
    expect(published.length).toBeGreaterThan(0);
    expect(receivedPayload.id).toBe(audit.id);
  });
});
