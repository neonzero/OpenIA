import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from './client';
import type { AuditPlan, TimesheetEntry, WorkingPaper } from '../types';

export const useAuditPlans = () => {
  const [plans, setPlans] = useState<AuditPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<AuditPlan[]>('/audits');
      setPlans(response);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createPlan = useCallback(async (plan: Partial<AuditPlan>) => {
    const response = await apiClient.post<AuditPlan>('/audits', plan);
    await refresh();
    return response;
  }, [refresh]);

  const updatePlanStatus = useCallback(async (id: string, status: AuditPlan['status']) => {
    const response = await apiClient.patch<AuditPlan>(`/audits/${id}`, { status });
    await refresh();
    return response;
  }, [refresh]);

  return useMemo(
    () => ({ plans, isLoading, error, refresh, createPlan, updatePlanStatus }),
    [plans, isLoading, error, refresh, createPlan, updatePlanStatus]
  );
};

export const useTimesheets = (auditor?: string) => {
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = auditor ? `?auditor=${encodeURIComponent(auditor)}` : '';
      const response = await apiClient.get<TimesheetEntry[]>(`/audits/timesheets${query}`);
      setEntries(response);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [auditor]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submitEntry = useCallback(async (entry: Partial<TimesheetEntry>) => {
    const response = await apiClient.post<TimesheetEntry>('/audits/timesheets', entry);
    await refresh();
    return response;
  }, [refresh]);

  return useMemo(
    () => ({ entries, isLoading, error, refresh, submitEntry }),
    [entries, isLoading, error, refresh, submitEntry]
  );
};

export const useWorkingPapers = (auditId?: string) => {
  const [papers, setPapers] = useState<WorkingPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = auditId ? `?auditId=${encodeURIComponent(auditId)}` : '';
      const response = await apiClient.get<WorkingPaper[]>(`/audits/working-papers${query}`);
      setPapers(response);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [auditId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateStatus = useCallback(async (id: string, status: WorkingPaper['status']) => {
    const response = await apiClient.patch<WorkingPaper>(`/audits/working-papers/${id}`, { status });
    await refresh();
    return response;
  }, [refresh]);

  return useMemo(
    () => ({ papers, isLoading, error, refresh, updateStatus }),
    [papers, isLoading, error, refresh, updateStatus]
  );
};
