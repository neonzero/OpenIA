const AuditEngine = require('../services/AuditEngine');
const eventBus = require('../mq/eventBus');

describe('AuditEngine', () => {
  let repository;
  let auditEngine;

  beforeEach(() => {
    repository = {
      findAll: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation(async (audit) => ({ id: 'A1', ...audit })),
      update: jest.fn().mockImplementation(async (id, audit) => ({ id, ...audit }))
    };
    auditEngine = new AuditEngine({ auditRepository: repository });
    eventBus.emitter.removeAllListeners();
  });

  test('planAudit publishes audit_planned event', async () => {
    const payload = { name: 'IT Audit', scope: 'Infrastructure' };

    const eventPromise = new Promise((resolve) => {
      eventBus.subscribe('audit_planned', resolve);
    });

    const created = await auditEngine.planAudit(payload);
    expect(created.status).toBe('planned');
    const event = await eventPromise;
    expect(event.id).toBe('A1');
    expect(repository.create).toHaveBeenCalled();
  });
});
