const riskSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    category: { type: 'string' },
    inherentRisk: { type: 'number' },
    residualRisk: { type: 'number' },
    owner: { type: 'string' },
    status: { type: 'string', enum: ['open', 'mitigated', 'closed'] }
  },
  required: ['title', 'category', 'inherentRisk', 'residualRisk', 'owner', 'status']
};

const followUpSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    riskId: { type: 'string' },
    action: { type: 'string' },
    owner: { type: 'string' },
    dueDate: { type: 'string', format: 'date' },
    status: { type: 'string', enum: ['pending', 'in-progress', 'complete'] }
  },
  required: ['riskId', 'action', 'owner', 'dueDate', 'status']
};

const auditSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    owner: { type: 'string' },
    startDate: { type: 'string', format: 'date' },
    endDate: { type: 'string', format: 'date' },
    status: { type: 'string', enum: ['planned', 'in-progress', 'complete'] },
    scope: { type: 'string' }
  },
  required: ['title', 'owner', 'startDate', 'endDate', 'status']
};

const timesheetSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    auditor: { type: 'string' },
    date: { type: 'string', format: 'date' },
    hours: { type: 'number' },
    engagement: { type: 'string' }
  },
  required: ['auditor', 'date', 'hours', 'engagement']
};

const workingPaperSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    auditId: { type: 'string' },
    name: { type: 'string' },
    owner: { type: 'string' },
    status: { type: 'string', enum: ['draft', 'review', 'approved'] },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['auditId', 'name', 'owner', 'status']
};

const reportSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    owner: { type: 'string' },
    status: { type: 'string', enum: ['draft', 'issued'] },
    issuedDate: { type: 'string', format: 'date' }
  },
  required: ['title', 'owner', 'status']
};

const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    role: { type: 'string', enum: ['admin', 'auditor', 'manager'] }
  },
  required: ['id', 'name', 'email', 'role']
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
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Authenticated session',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    user: userSchema
                  }
                }
              }
            }
          }
        }
      }
    },
    '/auth/refresh': {
      post: {
        summary: 'Refresh an authentication token',
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
                  properties: {
                    token: { type: 'string' },
                    user: userSchema
                  }
                }
              }
            }
          }
        }
      }
    },
    '/auth/me': {
      get: {
        summary: 'Retrieve the currently authenticated user',
        responses: {
          200: {
            description: 'User information',
            content: {
              'application/json': {
                schema: userSchema
              }
            }
          },
          401: {
            description: 'Not authenticated'
          }
        }
      }
    },
    '/risks': {
      get: {
        summary: 'List risks with optional filters',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'owner', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'List of risks',
            content: { 'application/json': { schema: { type: 'array', items: riskSchema } } }
          }
        }
      },
      post: {
        summary: 'Create a risk entry',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: riskSchema } }
        },
        responses: {
          201: { description: 'Risk created', content: { 'application/json': { schema: riskSchema } } }
        }
      }
    },
    '/risks/summary': {
      get: {
        summary: 'Risk exposure summary',
        responses: {
          200: {
            description: 'Aggregated metrics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalRisks: { type: 'integer' },
                    highRisks: { type: 'integer' },
                    mediumRisks: { type: 'integer' },
                    lowRisks: { type: 'integer' },
                    trend: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          month: { type: 'string' },
                          high: { type: 'integer' },
                          medium: { type: 'integer' },
                          low: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/risks/follow-ups': {
      get: {
        summary: 'List follow-up actions by risk',
        parameters: [{ name: 'riskId', in: 'query', schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Follow-up actions',
            content: { 'application/json': { schema: { type: 'array', items: followUpSchema } } }
          }
        }
      }
    },
    '/risks/{id}': {
      put: {
        summary: 'Update a risk',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: riskSchema } }
        },
        responses: { 200: { description: 'Risk updated', content: { 'application/json': { schema: riskSchema } } } }
      },
      patch: {
        summary: 'Partially update a risk',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { ...riskSchema, required: [] } } }
        },
        responses: { 200: { description: 'Risk updated', content: { 'application/json': { schema: riskSchema } } } }
      }
    },
    '/risks/{id}/questionnaire': {
      post: {
        summary: 'Submit a risk identification questionnaire',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  riskId: { type: 'string' },
                  responses: {
                    type: 'object',
                    properties: {
                      owner: { type: 'string' },
                      riskCategory: { type: 'string' },
                      likelihood: { type: 'string' },
                      impact: { type: 'string' },
                      description: { type: 'string' },
                      controls: { type: 'string' }
                    }
                  }
                },
                required: ['responses']
              }
            }
          }
        },
        responses: {
          201: { description: 'Risk intake recorded', content: { 'application/json': { schema: riskSchema } } }
        }
      }
    },
    '/audits': {
      get: {
        summary: 'List audit engagements',
        responses: {
          200: { description: 'Audits', content: { 'application/json': { schema: { type: 'array', items: auditSchema } } } }
        }
      },
      post: {
        summary: 'Create an audit engagement',
        requestBody: { required: true, content: { 'application/json': { schema: auditSchema } } },
        responses: {
          201: { description: 'Audit created', content: { 'application/json': { schema: auditSchema } } }
        }
      }
    },
    '/audits/{id}': {
      put: {
        summary: 'Update an audit engagement',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { ...auditSchema, required: [] } } } },
        responses: { 200: { description: 'Audit updated', content: { 'application/json': { schema: auditSchema } } } }
      },
      patch: {
        summary: 'Partially update an audit engagement',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { ...auditSchema, required: [] } } } },
        responses: { 200: { description: 'Audit updated', content: { 'application/json': { schema: auditSchema } } } }
      }
    },
    '/audits/timesheets': {
      get: {
        summary: 'List timesheet entries',
        parameters: [{ name: 'auditor', in: 'query', schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Timesheet entries',
            content: { 'application/json': { schema: { type: 'array', items: timesheetSchema } } }
          }
        }
      },
      post: {
        summary: 'Create a timesheet entry',
        requestBody: { required: true, content: { 'application/json': { schema: timesheetSchema } } },
        responses: {
          201: {
            description: 'Timesheet recorded',
            content: { 'application/json': { schema: timesheetSchema } }
          }
        }
      }
    },
    '/audits/working-papers': {
      get: {
        summary: 'List working papers',
        parameters: [{ name: 'auditId', in: 'query', schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Working papers',
            content: { 'application/json': { schema: { type: 'array', items: workingPaperSchema } } }
          }
        }
      }
    },
    '/audits/working-papers/{id}': {
      patch: {
        summary: 'Update working paper status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { status: { type: 'string', enum: ['draft', 'review', 'approved'] } },
                required: ['status']
              }
            }
          }
        },
        responses: {
          200: { description: 'Working paper updated', content: { 'application/json': { schema: workingPaperSchema } } }
        }
      }
    },
    '/audits/{id}/feedback': {
      post: {
        summary: 'Submit audit feedback',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
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
            description: 'Feedback recorded',
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
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'owner', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Reports',
            content: { 'application/json': { schema: { type: 'array', items: reportSchema } } }
          }
        }
      }
    },
    '/reports/{id}': {
      get: {
        summary: 'Get report details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Report details', content: { 'application/json': { schema: reportSchema } } },
          404: { description: 'Report not found' }
        }
      }
    },
    '/reports/{id}/generate': {
      post: {
        summary: 'Generate a report based on current risk and audit data',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          201: {
            description: 'Report generated',
            content: { 'application/json': { schema: reportSchema } }
          }
        }
      }
    },
    '/reports/summary': {
      get: {
        summary: 'Retrieve the latest aggregate summary',
        responses: {
          200: {
            description: 'Aggregated report snapshot',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    generatedAt: { type: 'string', format: 'date-time' },
                    riskSummary: {
                      type: 'object',
                      properties: {
                        totalRisks: { type: 'integer' },
                        highRisks: { type: 'integer' },
                        mediumRisks: { type: 'integer' },
                        lowRisks: { type: 'integer' }
                      }
                    },
                    auditOverview: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        byStatus: {
                          type: 'object',
                          additionalProperties: { type: 'integer' }
                        }
                      }
                    }
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
