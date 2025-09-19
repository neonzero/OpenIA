import { useCallback } from 'react';
import { apiClient, clearToken, setToken, withErrorBoundary } from './client';
import type { AuthenticatedUser } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthenticatedUser;
}

export const useAuthApi = () => {
  const login = useCallback(async (payload: LoginRequest) => {
    const response = await apiClient.post<LoginResponse>('/auth/login', payload, { auth: false });
    setToken(response.token);
    return response.user;
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    return withErrorBoundary<AuthenticatedUser | null>(
      apiClient.get<AuthenticatedUser>('/auth/me'),
      null
    );
  }, []);

  const logout = useCallback(() => {
    clearToken();
  }, []);

  return { login, logout, fetchCurrentUser };
};
