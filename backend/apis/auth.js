const express = require('../framework/express');

function createAuthRouter({ eventBus }) {
  const router = express.Router();

  /**
   * @openapi
   * /auth/health:
   *   get:
   *     summary: Health check for the auth service
   */
  router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  /**
   * @openapi
   * /auth/login:
   *   post:
   *     summary: Authenticate a user and return a token
   */
  router.post('/login', (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      res.status(400).json({ error: 'username and password are required' });
      return;
    }
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    eventBus.publish('auth_login', { username });
    res.json({ token, expiresIn: 3600 });
  });

  return router;
}

module.exports = createAuthRouter;
