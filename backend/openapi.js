const riskSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    description: { type: 'string' },
    category: { type: 'string' },
    severity: { type: 'string', enum: ['low', 'medium', 'high'] },
    controls: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          owner: { type: 'string' }
        },
        required: ['name', 'description', 'owner']
      }
    }
  },
  required: ['title', 'description', 'category', 'severity']
};

const auditSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    scope: { type: 'string' },
    status: { type: 'string', enum: ['draft', 'planned', 'in_progress', 'completed'] },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          remediation: { type: 'string' },
          status: { type: 'string', enum: ['open', 'in_progress', 'closed'] }
        },
        required: ['title', 'description', 'severity']
      }
    }
  },
  required: ['name', 'scope']
};

const reportSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    content: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' }
  }
};

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'OpenIA GRC Platform',
    version: '1.0.0'
  },
  paths: {
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
                  password: { type: 'string' }
                },
                required: ['username', 'password']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'JWT token',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { token: { type: 'string' } }
                }
              }
            }
          }
        }
      }
    },
    '/auth/refresh': {
      post: {
        summary: 'Refresh a token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { token: { type: 'string' } },
                required: ['token']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Refreshed token',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { token: { type: 'string' } }
                }
              }
            }
          }
        }
      }
    },
    '/risks': {
      get: {
        summary: 'List risks',
        responses: {
          200: {
            description: 'List of risks',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: riskSchema
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a risk',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: riskSchema }
          }
        },
        responses: {
          201: {
            description: 'Risk created',
            content: {
              'application/json': { schema: riskSchema }
            }
          }
        }
      }
    },
    '/risks/{id}': {
      put: {
        summary: 'Update a risk',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { ...riskSchema, required: [] } }
          }
        },
        responses: {
          200: {
            description: 'Risk updated',
            content: {
              'application/json': { schema: riskSchema }
            }
          }
        }
      }
    },
    '/audits': {
      get: {
        summary: 'List audits',
        responses: {
          200: {
            description: 'List of audits',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: auditSchema
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Plan an audit',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: auditSchema }
          }
        },
        responses: {
          201: {
            description: 'Audit created',
            content: {
              'application/json': { schema: auditSchema }
            }
          }
        }
      }
    },
    '/audits/{id}': {
      put: {
        summary: 'Update an audit',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { ...auditSchema, required: [] } }
          }
        },
        responses: {
          200: {
            description: 'Audit updated',
            content: {
              'application/json': { schema: auditSchema }
            }
          }
        }
      }
    },
    '/audits/{id}/feedback': {
      post: {
        summary: 'Submit audit feedback',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  comment: { type: 'string' }
                },
                required: ['rating']
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Feedback captured',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    engagementId: { type: 'string' },
                    rating: { type: 'integer' },
                    comment: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/reports': {
      get: {
        summary: 'List reports',
        responses: {
          200: {
            description: 'List of reports',
            content: {
              'application/json': {
                schema: { type: 'array', items: reportSchema }
              }
            }
          }
        }
      },
      post: {
        summary: 'Generate a summary report',
        responses: {
          201: {
            description: 'Report generated',
            content: {
              'application/json': { schema: reportSchema }
            }
          }
        }
      }
    },
    '/reports/summary': {
      get: {
        summary: 'Get aggregated risk/audit summary',
        responses: {
          200: {
            description: 'Summary snapshot',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalRisks: { type: 'integer' },
                    highSeverityRisks: { type: 'integer' },
                    plannedAudits: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

module.exports = swaggerDefinition;
