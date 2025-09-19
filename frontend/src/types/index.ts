export type UserRole = 'admin' | 'auditor' | 'manager';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Risk {
  id: string;
  title: string;
  category: string;
  inherentRisk: number;
  residualRisk: number;
  owner: string;
  status: 'open' | 'mitigated' | 'closed';
}

export interface RiskSummary {
  totalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  trend: Array<{ month: string; high: number; medium: number; low: number }>;
}

export interface QuestionnaireResponse {
  riskId?: string;
  responses: Record<string, string>;
}

export interface AuditPlan {
  id: string;
  title: string;
  owner: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in-progress' | 'complete';
}

export interface TimesheetEntry {
  id: string;
  auditor: string;
  date: string;
  hours: number;
  engagement: string;
}

export interface WorkingPaper {
  id: string;
  name: string;
  owner: string;
  status: 'draft' | 'review' | 'approved';
  updatedAt: string;
}

export interface FollowUpItem {
  id: string;
  riskId: string;
  action: string;
  owner: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'complete';
}

export interface ReportSummary {
  id: string;
  title: string;
  issuedDate: string;
  owner: string;
  status: 'draft' | 'issued';
}
