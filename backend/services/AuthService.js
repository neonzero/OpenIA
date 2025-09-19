const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

class AuthService {
  constructor() {
    this.tokens = new Map();
  }

  async login(credentials) {
    const { username } = await loginSchema.validateAsync(credentials);
    const token = `token-${Buffer.from(username).toString('base64')}`;
    this.tokens.set(token, { username, issuedAt: Date.now() });
    return { token };
  }

  async refresh(token) {
    if (!this.tokens.has(token)) {
      throw new Error('Invalid token');
    }
    const payload = this.tokens.get(token);
    const newToken = `token-${Date.now()}`;
    this.tokens.delete(token);
    this.tokens.set(newToken, { ...payload, refreshedAt: Date.now() });
    return { token: newToken };
  }
}

module.exports = AuthService;
