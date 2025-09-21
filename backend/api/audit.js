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

  router.get('/timesheets', async (req, res, next) => {
    try {
      const { auditor } = req.query;
      const entries = await auditEngine.listTimesheets({ auditor });
      res.json(entries);
    } catch (error) {
      next(error);
    }
  });

  router.post('/timesheets', async (req, res, next) => {
    try {
      const entry = await auditEngine.recordTimesheet(req.body);
      res.status(201).json(entry);
    } catch (error) {
      next(error);
    }
  });

  router.get('/working-papers', async (req, res, next) => {
    try {
      const { auditId } = req.query;
      const papers = await auditEngine.listWorkingPapers({ auditId });
      res.json(papers);
    } catch (error) {
      next(error);
    }
  });

  router.patch('/working-papers/:id', async (req, res, next) => {
    try {
      const updated = await auditEngine.updateWorkingPaper(req.params.id, req.body);
      res.json(updated);
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

  router.patch('/:id', async (req, res, next) => {
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
