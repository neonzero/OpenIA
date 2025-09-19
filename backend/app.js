const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./openapi');
const { buildContainer } = require('./container');
const createAuthRouter = require('./api/auth');
const createRiskRouter = require('./api/risk');
const createAuditRouter = require('./api/audit');
const createReportRouter = require('./api/report');

function createApp(container = buildContainer()) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/auth', createAuthRouter({ authService: container.authService }));
  app.use('/risks', createRiskRouter({ riskEngine: container.riskEngine }));
  app.use(
    '/audits',
    createAuditRouter({ auditEngine: container.auditEngine, feedbackService: container.feedbackService })
  );
  app.use(
    '/reports',
    createReportRouter({ reportService: container.reportService, coreIntegration: container.coreIntegration })
  );

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use((err, req, res, next) => {
    const status = err.status || 400;
    res.status(status).json({ error: err.message || 'Unhandled error' });
  });

  return app;
}

module.exports = { createApp };
