const express = require('express');

function createAuthRouter({ authService }) {
  const router = express.Router();

  router.post('/login', async (req, res, next) => {
    try {
      const token = await authService.login(req.body);
      res.status(200).json(token);
    } catch (error) {
      next(error);
    }
  });

  router.post('/refresh', async (req, res, next) => {
    try {
      const { token } = req.body;
      const refreshed = await authService.refresh(token);
      res.status(200).json(refreshed);
    } catch (error) {
      error.status = 401;
      next(error);
    }
  });

  return router;
}

module.exports = createAuthRouter;
