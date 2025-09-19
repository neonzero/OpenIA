const RiskEngine = require('../services/RiskEngine');
const eventBus = require('../mq/eventBus');

describe('RiskEngine', () => {
  let repository;
  let riskEngine;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(),
      create: jest.fn().mockImplementation(async (risk) => ({ id: '123', ...risk })),
      update: jest.fn().mockImplementation(async (id, risk) => ({ id, ...risk }))
    };
    riskEngine = new RiskEngine({ riskRepository: repository });
    eventBus.emitter.removeAllListeners();
  });

  test('createRisk persists risk and emits risk_created', async () => {
    const payload = {
      title: 'Data breach',
      description: 'Potential data leak',
      category: 'Cyber',
      severity: 'high',
      controls: []
    };

    const eventPromise = new Promise((resolve) => {
      eventBus.subscribe('risk_created', resolve);
    });

    const created = await riskEngine.createRisk(payload);
    expect(created.id).toBe('123');
    const event = await eventPromise;
    expect(event.id).toBe('123');
    expect(repository.create).toHaveBeenCalled();
  });

  test('updateRisk emits risk_updated message', async () => {
    const eventPromise = new Promise((resolve) => {
      eventBus.subscribe('risk_updated', resolve);
    });

    await riskEngine.updateRisk('123', { severity: 'medium' });
    const event = await eventPromise;
    expect(event.id).toBe('123');
    expect(repository.update).toHaveBeenCalledWith('123', { severity: 'medium' });
  });
});
