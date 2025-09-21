const express = require('./framework/express');
const EventBus = require('./mq/eventBus');
const RedisCache = require('./cache/redisCache');
const InMemoryRedisClient = require('./cache/inMemoryRedisClient');
const InMemoryPostgresClient = require('./infrastructure/inMemoryPostgres');
const RiskRepository = require('./repositories/riskRepository');
const AuditRepository = require('./repositories/auditRepository');
const RiskEngine = require('./services/riskEngine');
const AuditEngine = require('./services/auditEngine');
const FeedbackService = require('./services/feedback');
const CoreIntegrationService = require('./services/coreIntegration');
const COSOService = require('./services/coso');
const IIAService = require('./services/iia');
const createRiskRouter = require('./apis/risk');
const createAuditRouter = require('./apis/audit');
const createReportRouter = require('./apis/report');
const createAuthRouter = require('./apis/auth');
const buildOpenApiSpec = require('./openapi/spec');

function createApp(options = {}) {
  const app = express();
  app.use(express.json());

  const eventBus = options.eventBus || new EventBus();
  const redisClient = options.redisClient || new InMemoryRedisClient();
  const cache = options.cache || new RedisCache(redisClient);
  const dbClient = options.dbClient || new InMemoryPostgresClient();

  const riskRepository = options.riskRepository || new RiskRepository(dbClient, cache);
  const auditRepository = options.auditRepository || new AuditRepository(dbClient, cache);
  const coso = options.coso || new COSOService();
  const iia = options.iia || new IIAService();
  const coreIntegration = options.coreIntegration || new CoreIntegrationService(eventBus);
  const feedbackService = options.feedbackService || new FeedbackService();

  const riskEngine = options.riskEngine || new RiskEngine({
    riskRepository,
    eventBus,
    coreIntegration,
    coso,
  });

  const auditEngine = options.auditEngine || new AuditEngine({
    auditRepository,
    riskEngine,
    eventBus,
    coreIntegration,
    iia,
  });

  app.locals.eventBus = eventBus;
  app.locals.riskEngine = riskEngine;
  app.locals.auditEngine = auditEngine;
  app.locals.feedbackService = feedbackService;
  app.locals.coso = coso;
  app.locals.iia = iia;
  app.locals.repositories = { riskRepository, auditRepository };
  app.locals.cache = cache;
  app.locals.coreIntegration = coreIntegration;

  app.use('/risks', createRiskRouter({ riskEngine }));
  app.use('/audits', createAuditRouter({ auditEngine }));
  app.use('/reports', createReportRouter({ riskEngine, auditEngine, feedbackService, coso }));
  app.use('/auth', createAuthRouter({ eventBus }));

  const openApiDocument = buildOpenApiSpec();
  app.locals.openApiDocument = openApiDocument;
  app.get('/openapi.json', (req, res) => {
    res.json(openApiDocument);
  });

  return {
    app,
    eventBus,
    riskEngine,
    auditEngine,
    feedbackService,
    coreIntegration,
    repositories: {
      riskRepository,
      auditRepository,
    },
    cache,
    openApiDocument,
  };

}

module.exports = { createApp };
