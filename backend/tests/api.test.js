const { describe, it, expect, beforeEach, afterEach } = require('./jest-lite');
const { createApp } = require('../app');

let server;
let baseUrl;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();
  return { response, body };
}

describe('API integration', () => {
  beforeEach(() => {
    const { app } = createApp();
    server = app.listen(0);
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('serves an OpenAPI document', async () => {
    const { response, body } = await request('/openapi.json');
    expect(response.status).toBe(200);
    expect(body.openapi).toBe('3.0.0');
    expect(!!body.paths['/risks']).toBeTruthy();
  });

  it('creates, updates, and lists risks', async () => {
    const riskPayload = {
      title: 'Data Privacy',
      description: 'Potential breach of personal data',
      owner: 'CISO',
      inherentImpact: 5,
      inherentLikelihood: 4,
      controls: [
        { name: 'Access Control', owner: 'Security', status: 'effective' },
      ],
    };

    const creation = await request('/risks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(riskPayload),
    });
    expect(creation.response.status).toBe(201);
    const createdRisk = creation.body.data;
    expect(createdRisk.title).toBe('Data Privacy');

    const update = await request(`/risks/${createdRisk.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'mitigated' }),
    });
    expect(update.response.status).toBe(200);
    expect(update.body.data.status).toBe('mitigated');

    const list = await request('/risks');
    expect(list.response.status).toBe(200);
    expect(Array.isArray(list.body.data)).toBeTruthy();
    expect(list.body.data.length).toBeGreaterThan(0);
  });

  it('plans audits and exposes aggregated reports with feedback', async () => {
    const riskPayload = {
      title: 'Regulatory Compliance',
      description: 'Monitor compliance with new regulation',
      owner: 'Compliance Lead',
    };
    const { body: riskBody } = await request('/risks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(riskPayload),
    });
    const riskId = riskBody.data.id;

    const auditPayload = {
      title: 'Compliance Readiness',
      objective: 'Assess regulatory controls',
      leadAuditor: 'Jane Auditor',
      riskIds: [riskId],
    };
    const auditResult = await request('/audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auditPayload),
    });
    expect(auditResult.response.status).toBe(201);
    const auditId = auditResult.body.data.id;

    const findingResult = await request(`/audits/${auditId}/findings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Policy Gap',
        description: 'Documented policy missing approval.',
        severity: 'medium',
      }),
    });
    expect(findingResult.response.status).toBe(200);

    const feedbackResult = await request('/reports/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Report looks good' }),
    });
    expect(feedbackResult.response.status).toBe(201);

    const report = await request('/reports');
    expect(report.response.status).toBe(200);
    expect(report.body.data.totalRisks).toBeGreaterThan(0);
    expect(report.body.data.totalAudits).toBeGreaterThan(0);
    expect(report.body.data.feedback.length).toBeGreaterThan(0);
  });

  it('authenticates users', async () => {
    const login = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'analyst', password: 'secret' }),
    });
    expect(login.response.status).toBe(200);
    expect(typeof login.body.token).toBe('string');
    expect(login.body.token.length).toBeGreaterThan(5);

  });
});
