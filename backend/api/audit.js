const express = require('express');

function createAuditRouter({ auditEngine, feedbackService }) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const audits = await auditEngine.listAudits();
      res.json(audits);
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const created = await auditEngine.planAudit(req.body);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const updated = await auditEngine.updateAudit(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/feedback', async (req, res, next) => {
    try {
      const payload = { ...req.body, engagementId: req.params.id };
      const feedback = await feedbackService.submitFeedback(payload);
      res.status(201).json(feedback);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createAuditRouter;
