const express = require('../framework/express');
const { AuditEngagementSchema } = require('../domain/auditEngagement');
const { FindingSchema } = require('../domain/finding');

function createAuditRouter({ auditEngine }) {
  const router = express.Router();

  /**
   * @openapi
   * /audits:
   *   get:
   *     summary: List audits
   */
  router.get('/', async (req, res) => {
    try {
      const audits = await auditEngine.listAudits();
      res.json({ data: audits });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @openapi
   * /audits:
   *   post:
   *     summary: Plan an audit
   */
  router.post('/', async (req, res) => {
    try {
      const payload = AuditEngagementSchema.parse(req.body);
      const audit = await auditEngine.planAudit(payload);
      res.status(201).json({ data: audit });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  /**
   * @openapi
   * /audits/{id}/findings:
   *   post:
   *     summary: Attach a finding to an audit
   */
  router.post('/:id/findings', async (req, res) => {
    try {
      const { id } = req.params;
      const payload = FindingSchema.parse(req.body);
      const audit = await auditEngine.addFinding(id, payload);
      res.json({ data: audit });
    } catch (err) {
      const status = err.message === 'Audit not found' ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createAuditRouter;
