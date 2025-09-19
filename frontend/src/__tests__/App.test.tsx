import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

const createResponse = (body: unknown, init?: ResponseInit) =>
  Promise.resolve(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      ...init
    })
  );

describe('App', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    window.localStorage.clear();
  });

  it('shows the sign-in form when unauthenticated', async () => {
    jest.spyOn(global, 'fetch').mockImplementation((input) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(new Response('Unauthorized', { status: 401 }));
      }
      return createResponse({});
    });

    render(
      <MemoryRouter initialEntries={['/risks/dashboard']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /sign in to the openia assurance suite/i })).toBeInTheDocument();
  });

  it('authenticates and renders the risk dashboard', async () => {
    jest.spyOn(global, 'fetch').mockImplementation((input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(new Response('Unauthorized', { status: 401 }));
      }
      if (url.endsWith('/auth/login')) {
        return createResponse({
          token: 'test-token',
          user: {
            id: 'user-1',
            name: 'Test Admin',
            email: 'admin@example.com',
            role: 'admin'
          }
        });
      }
      if (url.includes('/risks/summary')) {
        return createResponse({
          totalRisks: 3,
          highRisks: 1,
          mediumRisks: 1,
          lowRisks: 1,
          trend: [
            { month: 'Jan', high: 1, medium: 1, low: 1 }
          ]
        });
      }
      if (url.includes('/risks?')) {
        return createResponse([
          { id: 'r1', title: 'Risk 1', category: 'Financial', inherentRisk: 4, residualRisk: 3, owner: 'Owner', status: 'open' }
        ]);
      }
      return createResponse([]);
    });

    render(
      <MemoryRouter initialEntries={['/risks/dashboard']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /risk dashboard/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/total risks/i)).toBeInTheDocument();
    expect(window.localStorage.getItem('openia.jwt')).toBe('test-token');
  });
});
