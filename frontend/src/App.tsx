import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RoleBasedLayout } from './layouts/RoleBasedLayout';
import { RiskDashboard } from './pages/RiskDashboard';
import { RiskIdentificationQuestionnaire } from './pages/RiskIdentificationQuestionnaire';
import { RiskMatrix } from './pages/RiskMatrix';
import { AuditPlanning } from './pages/AuditPlanning';
import { Timesheets } from './pages/Timesheets';
import { WorkingPapers } from './pages/WorkingPapers';
import { FollowUpTracker } from './pages/FollowUpTracker';
import { Reporting } from './pages/Reporting';

const NotFound: React.FC = () => (
  <div>
    <h1>Page not found</h1>
    <p>The requested resource could not be located.</p>
  </div>
);

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/risks/dashboard" replace />} />
    <Route path="/risks/dashboard" element={<RiskDashboard />} />
    <Route path="/risks/questionnaire" element={<RiskIdentificationQuestionnaire />} />
    <Route path="/risks/matrix" element={<RiskMatrix />} />
    <Route path="/audits/planning" element={<AuditPlanning />} />
    <Route path="/audits/timesheets" element={<Timesheets />} />
    <Route path="/audits/working-papers" element={<WorkingPapers />} />
    <Route path="/risks/follow-up" element={<FollowUpTracker />} />
    <Route path="/reports" element={<Reporting />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App: React.FC = () => (
  <AuthProvider>
    <RoleBasedLayout>
      <AppRoutes />
    </RoleBasedLayout>
  </AuthProvider>
);

export default App;
