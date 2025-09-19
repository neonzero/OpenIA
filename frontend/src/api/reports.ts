import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from './client';
import type { ReportSummary } from '../types';

interface ReportFilters {
  status?: ReportSummary['status'];
  owner?: string;
}

export const useReports = (filters?: ReportFilters) => {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.owner) params.set('owner', filters.owner);
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await apiClient.get<ReportSummary[]>(`/reports${query}`);
      setReports(response);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.owner, filters?.status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const generateReport = useCallback(async (reportId: string) => {
    const response = await apiClient.post<ReportSummary>(`/reports/${reportId}/generate`);
    await refresh();
    return response;
  }, [refresh]);

  return useMemo(
    () => ({ reports, isLoading, error, refresh, generateReport }),
    [reports, isLoading, error, refresh, generateReport]
  );
};

export const useReportDetails = (reportId?: string) => {
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(reportId));
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!reportId) {
      setReport(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.get<ReportSummary>(`/reports/${reportId}`);
      setReport(response);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo(
    () => ({ report, isLoading, error, refresh }),
    [report, isLoading, error, refresh]
  );
};
