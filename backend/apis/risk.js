const express = require('../framework/express');
const { RiskSchema } = require('../domain/risk');

function createRiskRouter({ riskEngine }) {
  const router = express.Router();

  /**
   * @openapi
   * /risks:
   *   get:
   *     summary: List risks
   *     responses:
   *       200:
   *         description: A list of risks
   */
  router.get('/', async (req, res) => {
    try {
      const risks = await riskEngine.listRisks();
      res.json({ data: risks });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @openapi
   * /risks:
   *   post:
   *     summary: Create a risk
   */
  router.post('/', async (req, res) => {
    try {
      const payload = RiskSchema.parse(req.body);
      const risk = await riskEngine.createRisk(payload);
      res.status(201).json({ data: risk });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  /**
   * @openapi
   * /risks/{id}:
   *   put:
   *     summary: Update a risk
   */
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const payload = { ...req.body, id };
      const risk = await riskEngine.updateRisk(id, payload);
      res.json({ data: risk });
    } catch (err) {
      const status = err.message === 'Risk not found' ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createRiskRouter;
