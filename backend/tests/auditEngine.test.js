const AuditEngine = require('../services/AuditEngine');
const eventBus = require('../mq/eventBus');

describe('AuditEngine', () => {
  let auditRepository;
  let timesheetRepository;
  let workingPaperRepository;
  let auditEngine;

  beforeEach(() => {
    auditRepository = {
      findAll: jest.fn().mockResolvedValue([]),
      createPlan: jest.fn().mockImplementation(async (plan) => ({
        id: 1,
        title: plan.title,
        owner: plan.owner,
        start_date: new Date(plan.startDate),
        end_date: new Date(plan.endDate),
        status: plan.status,
        scope: plan.scope
      })),
      updatePlan: jest.fn().mockImplementation(async (id, updates) => ({
        id,
        title: updates.title || 'Audit',
        owner: updates.owner || 'Owner',
        start_date: new Date(updates.startDate || '2024-01-01'),
        end_date: new Date(updates.endDate || '2024-01-15'),
        status: updates.status || 'planned',
        scope: updates.scope || null
      })),
      findByTitle: jest.fn().mockResolvedValue(null)
    };
    timesheetRepository = {
      list: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation(async (entry) => ({
        id: 5,
        auditor_name: entry.auditor,
        entry_date: new Date(entry.date),
        hours_worked: entry.hours,
        engagement: entry.engagement
      }))
    };
    workingPaperRepository = {
      list: jest.fn().mockResolvedValue([]),
      updateStatus: jest.fn().mockResolvedValue({
        id: 7,
        audit_id: 3,
        name: 'Testing',
        owner: 'Jane',
        status: 'review',
        updated_at: new Date('2024-01-05T00:00:00Z')
      })
    };
    auditEngine = new AuditEngine({ auditRepository, timesheetRepository, workingPaperRepository });
    eventBus.emitter.removeAllListeners();
  });

  test('planAudit publishes audit_planned event', async () => {
    const payload = {
      title: 'IT Audit',
      owner: 'James',
      startDate: '2024-02-01',
      endDate: '2024-02-14',
      status: 'planned'
    };

    const eventPromise = new Promise((resolve) => {
      eventBus.subscribe('audit_planned', resolve);
    });

    const created = await auditEngine.planAudit(payload);
    expect(created.status).toBe('planned');
    const event = await eventPromise;
    expect(event.title).toBe('IT Audit');
  });

  test('recordTimesheet persists entry and emits event', async () => {
    const payload = { auditor: 'Alex', date: '2024-03-01', hours: 4, engagement: 'ENG-1' };
    const eventPromise = new Promise((resolve) => {
      eventBus.subscribe('timesheet_recorded', resolve);
    });

    const created = await auditEngine.recordTimesheet(payload);
    expect(timesheetRepository.create).toHaveBeenCalledWith(payload);
    expect(created.auditor).toBe('Alex');
    const event = await eventPromise;
    expect(event.engagement).toBe('ENG-1');
  });
});
