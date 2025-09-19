import React from 'react';
import { LayoutShell, type NavItem } from './LayoutShell';
import type { AuthenticatedUser } from '../types';

interface ManagerLayoutProps {
  user: AuthenticatedUser;
  onLogout: () => void;
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Risk Dashboard', description: 'Risk posture at a glance', to: '/risks/dashboard' },
  { label: 'Risk Matrix', description: 'Likelihood vs impact', to: '/risks/matrix' },
  { label: 'Follow-up Tracker', description: 'Remediation accountability', to: '/risks/follow-up' },
  { label: 'Reporting', description: 'Distribute insights', to: '/reports' }
];

export const ManagerLayout: React.FC<ManagerLayoutProps> = ({ user, onLogout, children }) => (
  <LayoutShell
    title="Risk Governance Studio"
    subtitle="Manager overview"
    navItems={navItems}
    userName={user.name}
    role={user.role}
    onLogout={onLogout}
  >
    {children}
  </LayoutShell>
);
