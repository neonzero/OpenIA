import React, { useState } from 'react';
import type { LoginRequest } from '../api/auth';

interface LoginFormProps {
  onSubmit: (payload: LoginRequest) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false, errorMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} aria-describedby={errorMessage ? 'login-error' : undefined}>
      <div className="form-grid">
        <div className="form-control">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="form-control">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
      </div>
      {errorMessage ? (
        <p id="login-error" role="alert" style={{ color: '#b91c1c' }}>
          {errorMessage}
        </p>
      ) : null}
      <button type="submit" disabled={isLoading} style={{ marginTop: '1rem' }}>
        {isLoading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
};
