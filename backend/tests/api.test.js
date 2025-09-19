const request = require('supertest');
const { createApp } = require('../app');

describe('API contract tests', () => {
  let app;
  let container;

  beforeEach(() => {
    container = {
      authService: { login: jest.fn().mockResolvedValue({ token: 'abc' }), refresh: jest.fn() },
      riskEngine: {
        listRisks: jest.fn().mockResolvedValue([{ id: '1', title: 'Risk', description: 'Desc', category: 'IT', severity: 'high' }]),
        createRisk: jest.fn().mockResolvedValue({ id: '2' }),
        updateRisk: jest.fn().mockResolvedValue({ id: '2' })
      },
      auditEngine: {
        listAudits: jest.fn().mockResolvedValue([{ id: '1', name: 'Audit', scope: 'SOX', status: 'planned' }]),
        planAudit: jest.fn().mockResolvedValue({ id: '2', status: 'planned' }),
        updateAudit: jest.fn().mockResolvedValue({ id: '2', status: 'in_progress' })
      },
      feedbackService: {
        submitFeedback: jest.fn().mockResolvedValue({ engagementId: '1', rating: 5, comment: 'Great' })
      },
      reportService: {
        listReports: jest.fn().mockResolvedValue([{ id: '1', content: '{}', created_at: new Date().toISOString() }]),
        generateAndStoreReport: jest.fn().mockResolvedValue({ id: '2', content: '{}', created_at: new Date().toISOString() })
      },
      coreIntegration: {
        generateRiskReport: jest.fn().mockResolvedValue({ totalRisks: 1, highSeverityRisks: 1, plannedAudits: 1 })
      }
    };

    app = createApp(container);
  });

  test('POST /auth/login returns token', async () => {
    const response = await request(app).post('/auth/login').send({ username: 'john', password: 'secret' });
    expect(response.status).toBe(200);
    expect(response.body.token).toBe('abc');
    expect(container.authService.login).toHaveBeenCalledWith({ username: 'john', password: 'secret' });
  });

  test('GET /risks returns list of risks', async () => {
    const response = await request(app).get('/risks');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].title).toBe('Risk');
  });

  test('POST /audits plans audit and returns 201', async () => {
    const response = await request(app).post('/audits').send({ name: 'New Audit', scope: 'ISO' });
    expect(response.status).toBe(201);
    expect(container.auditEngine.planAudit).toHaveBeenCalled();
  });

  test('POST /audits/:id/feedback delegates to feedback service', async () => {
    const response = await request(app).post('/audits/1/feedback').send({ rating: 5, comment: 'Great' });
    expect(response.status).toBe(201);
    expect(container.feedbackService.submitFeedback).toHaveBeenCalledWith({ engagementId: '1', rating: 5, comment: 'Great' });
  });

  test('GET /reports/summary returns aggregated metrics', async () => {
    const response = await request(app).get('/reports/summary');
    expect(response.status).toBe(200);
    expect(response.body.totalRisks).toBe(1);
  });
});
