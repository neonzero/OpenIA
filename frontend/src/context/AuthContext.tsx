import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthenticatedUser, UserRole } from '../types';
import { useAuthApi, type LoginRequest } from '../api/auth';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { login: loginApi, logout: logoutApi, fetchCurrentUser } = useAuthApi();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const current = await fetchCurrentUser();
        if (isMounted) {
          setUser(current);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [fetchCurrentUser]);

  const login = useCallback(async (payload: LoginRequest) => {
    const nextUser = await loginApi(payload);
    setUser(nextUser);
  }, [loginApi]);

  const logout = useCallback(() => {
    logoutApi();
    setUser(null);
  }, [logoutApi]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    login,
    logout,
    hasRole: (role: UserRole | UserRole[]) => {
      const roles = Array.isArray(role) ? role : [role];
      return user ? roles.includes(user.role) : false;
    }
  }), [user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useRole = () => {
  const { user } = useAuth();
  return user?.role ?? null;
};
