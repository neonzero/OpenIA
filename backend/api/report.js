const express = require('express');

function createReportRouter({ reportService, coreIntegration }) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const reports = await reportService.listReports();
      res.json(reports);
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const stored = await reportService.generateAndStoreReport();
      res.status(201).json(stored);
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

  return router;
}

module.exports = createReportRouter;
