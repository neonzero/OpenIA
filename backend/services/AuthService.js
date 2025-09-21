const crypto = require('crypto');
const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

class AuthService {
  constructor() {
    this.tokens = new Map();
    this.users = [
      {
        id: '0001',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        password: 'password123'
      },
      {
        id: '0002',
        name: 'Lead Auditor',
        email: 'auditor@example.com',
        role: 'auditor',
        password: 'password123'
      },
      {
        id: '0003',
        name: 'Risk Manager',
        email: 'manager@example.com',
        role: 'manager',
        password: 'password123'
      }
    ];
  }

  #formatUser(user) {
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  #findUserByEmail(email) {
    return this.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async login(credentials) {
    const { email, password } = await loginSchema.validateAsync(credentials);
    const user = this.#findUserByEmail(email);
    if (!user || user.password !== password) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    const token = `token-${crypto.randomUUID()}`;
    this.tokens.set(token, user.id);
    return { token, user: this.#formatUser(user) };
  }

  async refresh(token) {
    if (!this.tokens.has(token)) {
      const error = new Error('Invalid token');
      error.status = 401;
      throw error;
    }
    const userId = this.tokens.get(token);
    const user = this.users.find((item) => item.id === userId);
    if (!user) {
      this.tokens.delete(token);
      const error = new Error('Invalid token');
      error.status = 401;
      throw error;
    }

    const newToken = `token-${Date.now()}-${crypto.randomUUID()}`;
    this.tokens.delete(token);
    this.tokens.set(newToken, userId);
    return { token: newToken, user: this.#formatUser(user) };
  }

  async getCurrentUser(token) {
    if (!token) {
      return null;
    }
    const stored = this.tokens.get(token);
    if (!stored) {
      return null;
    }
    const user = this.users.find((item) => item.id === stored);
    return user ? this.#formatUser(user) : null;
  }
}

module.exports = AuthService;
