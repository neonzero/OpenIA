import { act, renderHook, waitFor } from '@testing-library/react';
import { useAuthApi } from '../api/auth';
import { getToken } from '../api/client';
import { useRisks } from '../api/risks';

const createResponse = (body: unknown, init?: ResponseInit) =>
  Promise.resolve(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      ...init
    })
  );

describe('API hooks', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    window.localStorage.clear();
  });

  it('logs in and stores the JWT token', async () => {
    jest.spyOn(global, 'fetch').mockImplementation((input) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.endsWith('/auth/login')) {
        return createResponse({
          token: 'jwt-token',
          user: { id: '1', name: 'Tester', email: 't@example.com', role: 'admin' }
        });
      }
      return createResponse({});
    });

    const { result } = renderHook(() => useAuthApi());

    await act(async () => {
      const user = await result.current.login({ email: 't@example.com', password: 'secret' });
      expect(user.email).toBe('t@example.com');
    });

    expect(getToken()).toBe('jwt-token');

    act(() => {
      result.current.logout();
    });

    expect(getToken()).toBeNull();
  });

  it('fetches risks with status filters', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation((input) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/risks?status=open')) {
        return createResponse([
          { id: 'risk-1', title: 'Risk 1', category: 'Operational', inherentRisk: 3, residualRisk: 2, owner: 'Owner', status: 'open' }
        ]);
      }
      return createResponse([]);
    });

    const { result } = renderHook(() => useRisks({ status: 'open' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.risks).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/risks?status=open'), expect.anything());
  });
});
