const { createPool } = require('./config/db');
const { createRedis } = require('./config/cache');
const RiskRepository = require('./repositories/RiskRepository');
const AuditRepository = require('./repositories/AuditRepository');
const ReportRepository = require('./repositories/ReportRepository');
const TimesheetRepository = require('./repositories/TimesheetRepository');
const WorkingPaperRepository = require('./repositories/WorkingPaperRepository');
const FollowUpRepository = require('./repositories/FollowUpRepository');
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
  const timesheetRepository = overrides.timesheetRepository || new TimesheetRepository({ pool });
  const workingPaperRepository =
    overrides.workingPaperRepository || new WorkingPaperRepository({ pool });
  const followUpRepository = overrides.followUpRepository || new FollowUpRepository({ pool });

  const riskEngine = overrides.riskEngine || new RiskEngine({ riskRepository, followUpRepository });
  const auditEngine =
    overrides.auditEngine ||
    new AuditEngine({ auditRepository, timesheetRepository, workingPaperRepository });
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
    timesheetRepository,
    workingPaperRepository,
    followUpRepository,
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
