const RiskEngine = require('../services/RiskEngine');
const eventBus = require('../mq/eventBus');

describe('RiskEngine', () => {
  let riskRepository;
  let followUpRepository;
  let riskEngine;

  beforeEach(() => {
    riskRepository = {
      findAll: jest.fn().mockResolvedValue([]),
      createRisk: jest.fn().mockImplementation(async (risk) => ({
        id: 123,
        title: risk.title,
        category: risk.category,
        owner: risk.owner,
        status: risk.status,
        inherent_score: risk.inherentRisk,
        residual_score: risk.residualRisk
      })),
      updateRisk: jest.fn().mockImplementation(async (id, risk) => ({
        id,
        title: risk.title || 'Existing',
        category: risk.category || 'Technology',
        owner: risk.owner || 'Owner',
        status: risk.status || 'open',
        inherent_score: risk.inherentRisk ?? 12,
        residual_score: risk.residualRisk ?? 10
      }))
    };
    followUpRepository = { list: jest.fn().mockResolvedValue([]) };
    riskEngine = new RiskEngine({ riskRepository, followUpRepository });
    eventBus.emitter.removeAllListeners();
  });

  test('createRisk persists risk and emits risk_created', async () => {
    const payload = {
      title: 'Data breach',
      category: 'Technology',
      owner: 'Alice',
      inherentRisk: 20,
      residualRisk: 15,
      status: 'open'
    };

    const eventPromise = new Promise((resolve) => {
      eventBus.subscribe('risk_created', resolve);
    });

    const created = await riskEngine.createRisk(payload);
    expect(created.id).toBe('123');
    expect(riskRepository.createRisk).toHaveBeenCalledWith({
      ...payload,
      residualRisk: 15
    });
    const event = await eventPromise;
    expect(event.title).toBe('Data breach');
  });

  test('updateRisk emits risk_updated message', async () => {
    const eventPromise = new Promise((resolve) => {
      eventBus.subscribe('risk_updated', resolve);
    });

    await riskEngine.updateRisk('123', { residualRisk: 8, status: 'mitigated' });
    expect(riskRepository.updateRisk).toHaveBeenCalledWith('123', { residualRisk: 8, status: 'mitigated' });
    const event = await eventPromise;
    expect(event.status).toBe('mitigated');
  });

  test('getSummary aggregates metrics from repository data', async () => {
    const now = new Date('2024-05-15T00:00:00Z');
    riskRepository.findAll.mockResolvedValue([
      {
        id: 1,
        title: 'High exposure',
        category: 'Technology',
        owner: 'Alice',
        status: 'open',
        inherent_score: 20,
        residual_score: 18,
        reported_on: now
      },
      {
        id: 2,
        title: 'Medium exposure',
        category: 'Finance',
        owner: 'Bob',
        status: 'open',
        inherent_score: 12,
        residual_score: 10,
        reported_on: new Date('2024-04-01T00:00:00Z')
      },
      {
        id: 3,
        title: 'Low exposure',
        category: 'Operations',
        owner: 'Carol',
        status: 'mitigated',
        inherent_score: 6,
        residual_score: 4,
        reported_on: new Date('2024-03-01T00:00:00Z')
      }
    ]);

    const summary = await riskEngine.getSummary();
    expect(summary.totalRisks).toBe(3);
    expect(summary.highRisks).toBe(1);
    expect(summary.mediumRisks).toBe(1);
    expect(summary.lowRisks).toBe(1);
    expect(summary.trend).toHaveLength(6);
  });
});
