const express = require('express');

function createReportRouter({ reportService, coreIntegration }) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const { status, owner } = req.query;
      const reports = await reportService.listReports({ status, owner });
      res.json(reports);
    } catch (error) {
      next(error);
    }
  });

  router.get('/summary', async (req, res, next) => {
    try {
      const summary = await coreIntegration.generateRiskReport();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const report = await reportService.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      res.json(report);
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/generate', async (req, res, next) => {
    try {
      const result = await reportService.generateReport(req.params.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createReportRouter;
