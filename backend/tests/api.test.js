const request = require('supertest');
const { createApp } = require('../app');

describe('API contract tests', () => {
  let app;
  let container;

  beforeEach(() => {
    const user = { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' };
    container = {
      authService: {
        login: jest.fn().mockResolvedValue({ token: 'abc', user }),
        refresh: jest.fn(),
        getCurrentUser: jest.fn().mockResolvedValue(user)
      },
      riskEngine: {
        listRisks: jest
          .fn()
          .mockResolvedValue([{ id: '1', title: 'Risk', category: 'IT', inherentRisk: 16, residualRisk: 12, owner: 'Owner', status: 'open' }]),
        createRisk: jest.fn().mockResolvedValue({ id: '2', title: 'New risk' }),
        updateRisk: jest.fn().mockResolvedValue({ id: '2', status: 'mitigated' }),
        getSummary: jest.fn().mockResolvedValue({
          totalRisks: 1,
          highRisks: 1,
          mediumRisks: 0,
          lowRisks: 0,
          trend: []
        }),
        listFollowUps: jest.fn().mockResolvedValue([]),
        submitQuestionnaire: jest.fn().mockResolvedValue({ id: '3', title: 'Questionnaire risk' })
      },
      auditEngine: {
        listAudits: jest.fn().mockResolvedValue([{ id: '1', title: 'Audit', owner: 'Lead', startDate: '2024-01-01', endDate: '2024-01-31', status: 'planned' }]),
        planAudit: jest.fn().mockResolvedValue({ id: '2', status: 'planned' }),
        updateAudit: jest.fn().mockResolvedValue({ id: '2', status: 'in-progress' }),
        listTimesheets: jest.fn().mockResolvedValue([{ id: '1', auditor: 'Alex', date: '2024-03-01', hours: 4, engagement: 'ENG-1' }]),
        recordTimesheet: jest.fn().mockResolvedValue({ id: '2', auditor: 'Alex', date: '2024-03-01', hours: 4, engagement: 'ENG-1' }),
        listWorkingPapers: jest.fn().mockResolvedValue([]),
        updateWorkingPaper: jest.fn().mockResolvedValue({ id: '5', status: 'review' })
      },
      feedbackService: {
        submitFeedback: jest.fn().mockResolvedValue({ engagementId: '1', rating: 5, comment: 'Great' })
      },
      reportService: {
        listReports: jest
          .fn()
          .mockResolvedValue([{ id: '1', title: 'Summary', owner: 'Owner', issuedDate: '2024-01-01', status: 'draft' }]),
        getReport: jest.fn().mockResolvedValue({ id: '1', title: 'Summary', owner: 'Owner', issuedDate: '2024-01-01', status: 'draft' }),
        generateReport: jest.fn().mockResolvedValue({ id: '1', title: 'Summary', owner: 'Owner', issuedDate: '2024-01-01', status: 'issued' })
      },
      coreIntegration: {
        generateRiskReport: jest.fn().mockResolvedValue({
          generatedAt: new Date().toISOString(),
          riskSummary: { totalRisks: 1, highRisks: 1, mediumRisks: 0, lowRisks: 0 },
          auditOverview: { total: 1, byStatus: { planned: 1 } }
        })
      }
    };

    app = createApp(container);
  });

  test('POST /auth/login returns token and user', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });
    expect(response.status).toBe(200);
    expect(response.body.token).toBe('abc');
    expect(response.body.user.email).toBe('admin@example.com');
    expect(container.authService.login).toHaveBeenCalledWith({ email: 'admin@example.com', password: 'password123' });
  });

  test('GET /auth/me returns current user', async () => {
    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer abc');
    expect(response.status).toBe(200);
    expect(response.body.email).toBe('admin@example.com');
    expect(container.authService.getCurrentUser).toHaveBeenCalledWith('abc');
  });

  test('GET /risks returns list of risks', async () => {
    const response = await request(app).get('/risks');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].title).toBe('Risk');
  });

  test('GET /risks/summary returns aggregated metrics', async () => {
    const response = await request(app).get('/risks/summary');
    expect(response.status).toBe(200);
    expect(response.body.totalRisks).toBe(1);
  });

  test('POST /audits plans audit and returns 201', async () => {
    const response = await request(app)
      .post('/audits')
      .send({ title: 'New Audit', owner: 'Owner', startDate: '2024-05-01', endDate: '2024-05-15', status: 'planned' });
    expect(response.status).toBe(201);
    expect(container.auditEngine.planAudit).toHaveBeenCalled();
  });

  test('GET /audits/timesheets retrieves entries', async () => {
    const response = await request(app).get('/audits/timesheets');
    expect(response.status).toBe(200);
    expect(container.auditEngine.listTimesheets).toHaveBeenCalled();
  });

  test('POST /audits/:id/feedback delegates to feedback service', async () => {
    const response = await request(app).post('/audits/1/feedback').send({ rating: 5, comment: 'Great' });
    expect(response.status).toBe(201);
    expect(container.feedbackService.submitFeedback).toHaveBeenCalledWith({ engagementId: '1', rating: 5, comment: 'Great' });
  });

  test('GET /reports/summary returns aggregated metrics', async () => {
    const response = await request(app).get('/reports/summary');
    expect(response.status).toBe(200);
    expect(response.body.riskSummary.totalRisks).toBe(1);
  });

  test('POST /reports/:id/generate triggers report service', async () => {
    const response = await request(app).post('/reports/1/generate');
    expect(response.status).toBe(201);
    expect(container.reportService.generateReport).toHaveBeenCalledWith('1');
  });
});
