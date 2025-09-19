const express = require('../framework/express');

function calculateAverage(numbers) {
  if (!numbers.length) {
    return 0;
  }
  const total = numbers.reduce((sum, value) => sum + value, 0);
  return Math.round((total / numbers.length) * 100) / 100;
}

function createReportRouter({ riskEngine, auditEngine, feedbackService, coso }) {
  const router = express.Router();

  /**
   * @openapi
   * /reports:
   *   get:
   *     summary: Governance analytics summary
   */
  router.get('/', async (req, res) => {
    try {
      const risks = await riskEngine.listRisks();
      const audits = await auditEngine.listAudits();
      const residualScores = risks.map((risk) => coso.calculateResidualScore(risk));
      const readinessScores = audits.map((audit) => audit.readinessScore || 0);

      const data = {
        totalRisks: risks.length,
        totalAudits: audits.length,
        averageResidualScore: calculateAverage(residualScores),
        averageAuditReadiness: calculateAverage(readinessScores),
        openRisks: risks.filter((risk) => risk.status === 'open').length,
        completedAudits: audits.filter((audit) => audit.status === 'completed').length,
        feedback: feedbackService.getFeedback('report') || [],
      };

      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @openapi
   * /reports/feedback:
   *   post:
   *     summary: Submit feedback on reports
   */
  router.post('/feedback', (req, res) => {
    try {
      const entry = feedbackService.captureFeedback('report', req.body);
      res.status(201).json({ data: entry });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  /**
   * @openapi
   * /reports/feedback:
   *   get:
   *     summary: List report feedback entries
   */
  router.get('/feedback', (req, res) => {
    const entries = feedbackService.getFeedback('report');
    res.json({ data: entries });
  });

  return router;
}

module.exports = createReportRouter;
