function buildOpenApiSpec() {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Governance, Risk and Compliance Platform API',
      version: '1.0.0',
      description: 'Unified API for risk, audit, reporting, and authentication services.',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local development' },
    ],
    paths: {
      '/auth/health': {
        get: {
          summary: 'Health check for authentication service',
          responses: {
            200: {
              description: 'Service is healthy',
              content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' } } } } },
            },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Authenticate a user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string' },
                    password: { type: 'string' },
                  },
                  required: ['username', 'password'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Authentication successful',
              content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, expiresIn: { type: 'integer' } } } } },
            },
            400: { description: 'Invalid request' },
          },
        },
      },
      '/risks': {
        get: {
          summary: 'List all risks',
          responses: {
            200: {
              description: 'Risk collection',
              content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Risk' } } } } } },
            },
          },
        },
        post: {
          summary: 'Create a new risk',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Risk' } } },
          },
          responses: {
            201: { description: 'Risk created', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Risk' } } } } } },
            400: { description: 'Validation error' },
          },
        },
      },
      '/risks/{id}': {
        put: {
          summary: 'Update an existing risk',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Risk' } } },
          },
          responses: {
            200: { description: 'Risk updated', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Risk' } } } } } },
            400: { description: 'Validation error' },
            404: { description: 'Risk not found' },
          },
        },
      },
      '/audits': {
        get: {
          summary: 'List audit engagements',
          responses: {
            200: {
              description: 'Audit collection',
              content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/AuditEngagement' } } } } } },
            },
          },
        },
        post: {
          summary: 'Plan an audit engagement',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuditEngagement' } } },
          },
          responses: {
            201: { description: 'Audit planned', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/AuditEngagement' } } } } } },
            400: { description: 'Validation error' },
          },
        },
      },
      '/audits/{id}/findings': {
        post: {
          summary: 'Attach a finding to an audit',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Finding' } } },
          },
          responses: {
            200: { description: 'Finding added', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/AuditEngagement' } } } } } },
            400: { description: 'Validation error' },
            404: { description: 'Audit not found' },
          },
        },
      },
      '/reports': {
        get: {
          summary: 'Retrieve analytics report',
          responses: {
            200: {
              description: 'Aggregated report data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          totalRisks: { type: 'integer' },
                          totalAudits: { type: 'integer' },
                          averageResidualScore: { type: 'number' },
                          averageAuditReadiness: { type: 'number' },
                          openRisks: { type: 'integer' },
                          completedAudits: { type: 'integer' },
                          feedback: { type: 'array', items: { $ref: '#/components/schemas/Feedback' } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/reports/feedback': {
        get: {
          summary: 'List feedback items for reports',
          responses: {
            200: {
              description: 'Feedback collection',
              content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Feedback' } } } } } },
            },
          },
        },
        post: {
          summary: 'Submit feedback for reports',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          responses: {
            201: {
              description: 'Feedback recorded',
              content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Feedback' } } } } },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Control: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            owner: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['effective', 'needs_improvement', 'ineffective'] },
          },
        },
        Risk: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string', enum: ['strategic', 'financial', 'operational', 'compliance'] },
            inherentImpact: { type: 'number' },
            inherentLikelihood: { type: 'number' },
            residualScore: { type: 'number' },
            owner: { type: 'string' },
            controls: { type: 'array', items: { $ref: '#/components/schemas/Control' } },
            status: { type: 'string', enum: ['open', 'mitigated', 'closed'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['title', 'description', 'owner'],
        },
        Finding: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            remediation: { type: 'string' },
            owner: { type: 'string' },
            dueDate: { type: 'string', format: 'date' },
          },
          required: ['title', 'description', 'severity'],
        },
        AuditEngagement: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            objective: { type: 'string' },
            leadAuditor: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['planned', 'in_progress', 'completed'] },
            riskIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
            findings: { type: 'array', items: { $ref: '#/components/schemas/Finding' } },
            readinessScore: { type: 'number' },
            coverage: { type: 'number' },
          },
          required: ['title', 'objective', 'leadAuditor'],
        },
        Feedback: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string' },
            payload: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  };
}

module.exports = buildOpenApiSpec;
