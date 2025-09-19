const { createPool } = require('./config/db');
const { createRedis } = require('./config/cache');
const RiskRepository = require('./repositories/RiskRepository');
const AuditRepository = require('./repositories/AuditRepository');
const ReportRepository = require('./repositories/ReportRepository');
const RiskEngine = require('./services/RiskEngine');
const AuditEngine = require('./services/AuditEngine');
const FeedbackService = require('./services/Feedback');
const CoreIntegration = require('./services/CoreIntegration');
const COSOService = require('./services/COSO');
const IIAService = require('./services/IIA');
const ReportService = require('./services/ReportService');
const AuthService = require('./services/AuthService');

function buildContainer(overrides = {}) {
  const pool = overrides.pool || createPool(overrides.dbConfig);
  const cache = overrides.cache || createRedis(overrides.cacheConfig);

  const riskRepository = overrides.riskRepository || new RiskRepository({ pool, cache });
  const auditRepository = overrides.auditRepository || new AuditRepository({ pool, cache });
  const reportRepository = overrides.reportRepository || new ReportRepository({ pool, cache });

  const riskEngine = overrides.riskEngine || new RiskEngine({ riskRepository });
  const auditEngine = overrides.auditEngine || new AuditEngine({ auditRepository });
  const feedbackService = overrides.feedbackService || new FeedbackService({ auditRepository });

  const coreIntegration =
    overrides.coreIntegration || new CoreIntegration({ riskEngine, auditEngine, reportRepository });

  const reportService = overrides.reportService || new ReportService({ reportRepository, coreIntegration });
  const authService = overrides.authService || new AuthService();
  const cosoService = overrides.cosoService || new COSOService();
  const iiaService = overrides.iiaService || new IIAService();

  return {
    pool,
    cache,
    riskRepository,
    auditRepository,
    reportRepository,
    riskEngine,
    auditEngine,
    feedbackService,
    reportService,
    coreIntegration,
    authService,
    cosoService,
    iiaService
  };
}

module.exports = { buildContainer };
