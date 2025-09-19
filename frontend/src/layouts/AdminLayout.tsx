import React from 'react';
import { LayoutShell, type NavItem } from './LayoutShell';
import type { AuthenticatedUser } from '../types';

interface AdminLayoutProps {
  user: AuthenticatedUser;
  onLogout: () => void;
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Risk Dashboard', description: 'Real-time risk overview', to: '/risks/dashboard' },
  { label: 'Risk Identification', description: 'Questionnaire intake', to: '/risks/questionnaire' },
  { label: 'Risk Matrix', description: 'Visualise likelihood & impact', to: '/risks/matrix' },
  { label: 'Audit Planning', description: 'Engagement roadmap', to: '/audits/planning' },
  { label: 'Timesheets', description: 'Track auditor utilisation', to: '/audits/timesheets' },
  { label: 'Working Papers', description: 'Document fieldwork', to: '/audits/working-papers' },
  { label: 'Follow-up Tracker', description: 'Monitor remediation progress', to: '/risks/follow-up' },
  { label: 'Reporting', description: 'Publish executive insights', to: '/reports' }
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ user, onLogout, children }) => (
  <LayoutShell
    title="Enterprise Risk Control Center"
    subtitle="Administrator workspace"
    navItems={navItems}
    userName={user.name}
    role={user.role}
    onLogout={onLogout}
  >
    {children}
  </LayoutShell>
);
