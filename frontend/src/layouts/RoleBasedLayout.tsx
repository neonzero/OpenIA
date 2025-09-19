import React, { useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminLayout } from './AdminLayout';
import { AuditorLayout } from './AuditorLayout';
import { ManagerLayout } from './ManagerLayout';
import { LoginForm } from '../components/LoginForm';
import type { UserRole } from '../types';

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

const resolveLayout = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return AdminLayout;
    case 'auditor':
      return AuditorLayout;
    case 'manager':
    default:
      return ManagerLayout;
  }
};

export const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({ children }) => {
  const { user, isLoading, login, logout } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = useCallback(async (credentials: { email: string; password: string }) => {
    setIsSubmitting(true);
    try {
      await login(credentials);
      setLoginError(null);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  }, [login]);

  if (isLoading) {
    return (
      <div role="status" aria-live="polite" style={{ padding: '2rem' }}>
        Loading workspace…
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ margin: '4rem auto', maxWidth: '680px', background: '#fff', padding: '3rem', borderRadius: '1rem', boxShadow: '0 40px 80px rgba(15, 23, 42, 0.1)' }}>
        <h1>Sign in to the OpenIA assurance suite</h1>
        <p>Authenticate with your enterprise credentials to access role-specific dashboards and tooling.</p>
        <LoginForm onSubmit={handleLogin} isLoading={isSubmitting} errorMessage={loginError} />
        <p style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '1.5rem' }}>
          Need access? Contact your OpenIA administrator to be provisioned with the appropriate role.
        </p>
      </div>
    );
  }

  const Layout = resolveLayout(user.role);
  return <Layout user={user} onLogout={logout}>{children}</Layout>;
};
