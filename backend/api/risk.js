const express = require('express');

function createRiskRouter({ riskEngine }) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const { status, owner } = req.query;
      const risks = await riskEngine.listRisks({ status, owner });
      res.json(risks);
    } catch (error) {
      next(error);
    }
  });

  router.get('/summary', async (req, res, next) => {
    try {
      const summary = await riskEngine.getSummary();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  });

  router.get('/follow-ups', async (req, res, next) => {
    try {
      const { riskId } = req.query;
      const followUps = await riskEngine.listFollowUps({ riskId });
      res.json(followUps);
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const created = await riskEngine.createRisk(req.body);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const updated = await riskEngine.updateRisk(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:id', async (req, res, next) => {
    try {
      const updated = await riskEngine.updateRisk(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/questionnaire', async (req, res, next) => {
    try {
      const result = await riskEngine.submitQuestionnaire(req.params.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createRiskRouter;
