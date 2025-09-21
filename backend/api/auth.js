const express = require('express');

function createAuthRouter({ authService }) {
  const router = express.Router();

  router.post('/login', async (req, res, next) => {
    try {
      const response = await authService.login(req.body);
      res.status(200).json(response);
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

  router.get('/me', async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const user = await authService.getCurrentUser(token);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createAuthRouter;
