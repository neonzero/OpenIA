import React from 'react';
import { LayoutShell, type NavItem } from './LayoutShell';
import type { AuthenticatedUser } from '../types';

interface AuditorLayoutProps {
  user: AuthenticatedUser;
  onLogout: () => void;
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Risk Dashboard', description: 'Portfolio trends', to: '/risks/dashboard' },
  { label: 'Audit Planning', description: 'Engagement roadmap', to: '/audits/planning' },
  { label: 'Timesheets', description: 'Capture effort', to: '/audits/timesheets' },
  { label: 'Working Papers', description: 'Evidence repository', to: '/audits/working-papers' },
  { label: 'Follow-up Tracker', description: 'Remediation visibility', to: '/risks/follow-up' }
];

export const AuditorLayout: React.FC<AuditorLayoutProps> = ({ user, onLogout, children }) => (
  <LayoutShell
    title="Audit Delivery Center"
    subtitle="Auditor toolkit"
    navItems={navItems}
    userName={user.name}
    role={user.role}
    onLogout={onLogout}
  >
    {children}
  </LayoutShell>
);
