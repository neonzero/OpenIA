const express = require('express');

function createRiskRouter({ riskEngine }) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const risks = await riskEngine.listRisks();
      res.json(risks);
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

  return router;
}

module.exports = createRiskRouter;
